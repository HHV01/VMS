import type { APIRequestContext, APIResponse } from '@playwright/test';
import { failApiCall, finishApiCall, startApiCall } from '../utils/api-report-recorder';

export type JsonBody = Record<string, unknown> | unknown[];

export class BaseApi {
  readonly baseUrl: string;

  constructor(protected readonly request: APIRequestContext) {
    this.baseUrl = (process.env.API_BASE_URL || '').replace(/\/$/, '');
    if (!this.baseUrl) {
      throw new Error('API_BASE_URL is required');
    }
  }

  protected url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private async execute(
    method: string,
    path: string,
    data?: JsonBody,
  ): Promise<APIResponse> {
    const url = this.url(path);
    const record = startApiCall(method, url, data);
    const startedAt = Date.now();
    try {
      const options = data === undefined ? undefined : { data };
      const response = method === 'GET'
        ? await this.request.get(url)
        : method === 'POST'
          ? await this.request.post(url, options)
          : method === 'PATCH'
            ? await this.request.patch(url, options)
            : method === 'PUT'
              ? await this.request.put(url, options)
              : await this.request.delete(url);
      await finishApiCall(record, response, startedAt);
      return response;
    } catch (error) {
      failApiCall(record, error, startedAt);
      throw error;
    }
  }

  get(path: string): Promise<APIResponse> {
    return this.execute('GET', path);
  }

  post(path: string, data?: JsonBody): Promise<APIResponse> {
    return this.execute('POST', path, data);
  }

  patch(path: string, data?: JsonBody): Promise<APIResponse> {
    return this.execute('PATCH', path, data);
  }

  put(path: string, data?: JsonBody): Promise<APIResponse> {
    return this.execute('PUT', path, data);
  }

  delete(path: string): Promise<APIResponse> {
    return this.execute('DELETE', path);
  }
}
