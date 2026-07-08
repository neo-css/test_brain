import {
  buildTedSbrainUrl,
  getTedSbrainApiBaseUrl,
} from './config';
import type { TedSbrainResponse } from './types';

export { buildTedSbrainUrl, getTedSbrainApiBaseUrl };

type QueryValue = string | number | boolean | null | undefined;

export class TedSbrainApiError extends Error {
  status: number;
  result: boolean;
  data: unknown;

  constructor(message: string, status: number, result: boolean, data: unknown) {
    super(message);
    this.name = 'TedSbrainApiError';
    this.status = status;
    this.result = result;
    this.data = data;
  }
}

export interface TedSbrainClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export interface TedSbrainRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
  query?: Record<string, QueryValue>;
}

export interface TedSbrainClient {
  request<T>(path: string, options?: TedSbrainRequestOptions): Promise<T>;
}

export function appendQuery(url: string, query: TedSbrainRequestOptions['query']): string {
  if (!query) return url;

  const isAbsolute = /^https?:\/\//.test(url);
  const parsedUrl = new URL(url, isAbsolute ? undefined : 'http://local.proxy');
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    parsedUrl.searchParams.set(key, String(value));
  });

  return isAbsolute ? parsedUrl.toString() : `${parsedUrl.pathname}${parsedUrl.search}`;
}

function isTedSbrainResponse<T>(value: unknown): value is TedSbrainResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'result' in value &&
    typeof (value as { result: unknown }).result === 'boolean' &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string' &&
    'data' in value &&
    'criticalProcess' in value &&
    typeof (value as { criticalProcess: unknown }).criticalProcess === 'object'
  );
}

export async function parseResponse<T>(response: Response): Promise<T> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new TedSbrainApiError(
      `ted-sbrain API returned non-JSON response (${response.status})`,
      response.status,
      false,
      null,
    );
  }

  if (!isTedSbrainResponse<T>(payload)) {
    throw new TedSbrainApiError('ted-sbrain API returned an invalid response wrapper', response.status, false, payload);
  }

  if (!response.ok || !payload.result) {
    throw new TedSbrainApiError(
      payload.message || `ted-sbrain API request failed (${response.status})`,
      response.status,
      payload.result,
      payload.data,
    );
  }

  return payload.data;
}

function buildRequestInit(options: TedSbrainRequestOptions): RequestInit {
  const { body, query: _query, headers, ...init } = options;
  const method = init.method ?? 'GET';

  if (body === undefined) {
    return {
      ...init,
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    };
  }

  if (body === null || body instanceof FormData || body instanceof Blob || typeof body === 'string') {
    return {
      ...init,
      method,
      body,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    };
  }

  return {
    ...init,
    method,
    body: JSON.stringify(body),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  };
}

export function createTedSbrainClient(options: TedSbrainClientOptions = {}): TedSbrainClient {
  const baseUrl = options.baseUrl ?? getTedSbrainApiBaseUrl();
  const fetcher = options.fetcher ?? ((input, init) => fetch(input, init));

  return {
    async request<T>(path: string, requestOptions: TedSbrainRequestOptions = {}): Promise<T> {
      const url = appendQuery(buildTedSbrainUrl(baseUrl, path), requestOptions.query);
      const response = await fetcher(url, buildRequestInit(requestOptions));

      return parseResponse<T>(response);
    },
  };
}

export const tedSbrainClient = createTedSbrainClient();
