import type { APIResponse } from '@playwright/test';

export type ApiCallRecord = {
  method: string;
  url: string;
  payload: unknown;
  status: number | null;
  durationMs: number;
  contentType: string;
  response: unknown;
  expected: string[];
  error?: string;
};

type ApiRecordingStore = { calls: ApiCallRecord[] };

let activeStore: ApiRecordingStore | undefined;
const responseRecords = new WeakMap<object, ApiCallRecord>();
const sensitiveKey = /password|passwd|token|secret|authorization|cookie|api[-_]?key/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return '[TRUNCATED_DEPTH]';
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redact(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? '[REDACTED]' : redact(item, depth + 1),
      ]),
    );
  }
  if (typeof value === 'string' && value.length > 12_000) return `${value.slice(0, 12_000)}…[TRUNCATED]`;
  return value;
}

export async function runWithApiRecording<T>(callback: () => Promise<T>): Promise<{
  result: T;
  calls: ApiCallRecord[];
}> {
  const store: ApiRecordingStore = { calls: [] };
  const previous = activeStore;
  activeStore = store;
  try {
    const result = await callback();
    return { result, calls: store.calls };
  } finally {
    activeStore = previous;
  }
}

export function createApiRecordingSession(): {
  calls: ApiCallRecord[];
  run: <T>(callback: () => Promise<T>) => Promise<T>;
} {
  const store: ApiRecordingStore = { calls: [] };
  return {
    calls: store.calls,
    run: async <T>(callback: () => Promise<T>) => {
      const previous = activeStore;
      activeStore = store;
      try {
        return await callback();
      } finally {
        activeStore = previous;
      }
    },
  };
}

export function startApiCall(method: string, url: string, payload?: unknown): ApiCallRecord {
  const record: ApiCallRecord = {
    method,
    url,
    payload: payload === undefined ? null : redact(payload),
    status: null,
    durationMs: 0,
    contentType: '',
    response: null,
    expected: [],
  };
  activeStore?.calls.push(record);
  return record;
}

export async function finishApiCall(
  record: ApiCallRecord,
  response: APIResponse,
  startedAt: number,
): Promise<void> {
  record.status = response.status();
  record.durationMs = Date.now() - startedAt;
  record.contentType = response.headers()['content-type'] || '';
  try {
    const buffer = await response.body();
    if (/json/i.test(record.contentType)) {
      record.response = redact(JSON.parse(buffer.toString('utf8')));
    } else if (/^text\//i.test(record.contentType)) {
      record.response = redact(buffer.toString('utf8'));
    } else {
      record.response = `<binary ${buffer.length} bytes; ${record.contentType || 'unknown content-type'}>`;
    }
  } catch (error) {
    record.response = `<response body unavailable: ${error instanceof Error ? error.message : String(error)}>`;
  }
  responseRecords.set(response, record);
}

export function failApiCall(record: ApiCallRecord, error: unknown, startedAt: number): void {
  record.durationMs = Date.now() - startedAt;
  record.error = error instanceof Error ? error.message : String(error);
}

export function addApiExpectation(response: APIResponse, expectation: string): void {
  const record = responseRecords.get(response);
  if (record && !record.expected.includes(expectation)) record.expected.push(expectation);
}
