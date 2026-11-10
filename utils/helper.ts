export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildTraceId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

