import { describe, expect, it, vi } from 'vitest';
import {
  calculatePatchScore,
  fetchLatestTodayScoreSnapshots,
  fetchPatchScore,
  fetchPatchScoreHistory,
  fetchScoreSnapshot,
  listScoreSnapshots,
  pageScoreSnapshots,
} from './api';
import {
  TedSbrainApiError,
  buildTedSbrainUrl,
  createTedSbrainClient,
  getTedSbrainApiBaseUrl,
} from './client';

describe('ted-sbrain API client', () => {
  it('uses the local mock base URL when no env value is provided', () => {
    expect(getTedSbrainApiBaseUrl({})).toBe('http://localhost:49152');
  });

  it('uses VITE_TED_SBRAIN_API_BASE_URL when provided', () => {
    expect(getTedSbrainApiBaseUrl({ VITE_TED_SBRAIN_API_BASE_URL: 'https://api.example.com/root/' })).toBe(
      'https://api.example.com/root',
    );
  });

  it('allows an empty API base URL for same-origin proxy mode', () => {
    expect(getTedSbrainApiBaseUrl({ VITE_TED_SBRAIN_API_BASE_URL: '' })).toBe('');
    expect(buildTedSbrainUrl('', '/health')).toBe('/ted-sbrain/health');
  });

  it('builds real-compatible ted-sbrain paths', () => {
    expect(buildTedSbrainUrl('http://localhost:49152', '/metric/patches/123/score')).toBe(
      'http://localhost:49152/ted-sbrain/metric/patches/123/score',
    );
    expect(buildTedSbrainUrl('http://localhost:49152/', '/ted-sbrain/health')).toBe(
      'http://localhost:49152/ted-sbrain/health',
    );
  });

  it('returns data from successful response wrappers', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ result: true, message: 'success', data: { patchId: 123 }, criticalProcess: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createTedSbrainClient({ baseUrl: 'http://localhost:49152', fetcher });

    await expect(client.request<{ patchId: number }>('/metric/patches/123/score')).resolves.toEqual({ patchId: 123 });
  });

  it('throws a consistent error for failure wrappers', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ result: false, message: 'patch not found', data: null, criticalProcess: {} }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createTedSbrainClient({ baseUrl: 'http://localhost:49152', fetcher });

    await expect(client.request('/metric/patches/999/score')).rejects.toMatchObject({
      name: 'TedSbrainApiError',
      message: 'patch not found',
      status: 404,
      result: false,
    });
  });

  it('adds query parameters to relative proxy URLs', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ result: true, message: 'success', data: [], criticalProcess: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createTedSbrainClient({ baseUrl: '', fetcher });

    await client.request('/scoreSnapshot/list', { query: { riskLevel: 'LOW' } });

    expect(fetcher).toHaveBeenCalledWith('/ted-sbrain/scoreSnapshot/list?riskLevel=LOW', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  });

  it('throws a consistent error for non-json responses', async () => {
    const fetcher = vi.fn(async () => new Response('not json', { status: 502 }));
    const client = createTedSbrainClient({ baseUrl: 'http://localhost:49152', fetcher });

    await expect(client.request('/health')).rejects.toBeInstanceOf(TedSbrainApiError);
  });

  it('endpoint functions build documented ted-sbrain paths', async () => {
    const calls: Array<{ url: string; method?: string }> = [];
    const fetcher = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method });
      return new Response(JSON.stringify({ result: true, message: 'success', data: {}, criticalProcess: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const client = createTedSbrainClient({ baseUrl: 'http://localhost:49152', fetcher });

    await fetchPatchScore(12345, client);
    await calculatePatchScore(12345, client);
    await fetchPatchScoreHistory(12345, client);
    await fetchScoreSnapshot('snapshot-12345-latest', client);
    await listScoreSnapshots({ riskLevel: 'LOW' }, client);
    await pageScoreSnapshots({ page: 2, pageSize: 5 }, client);
    await fetchLatestTodayScoreSnapshots({}, client);

    expect(calls).toEqual([
      { url: 'http://localhost:49152/ted-sbrain/metric/patches/12345/score', method: 'GET' },
      { url: 'http://localhost:49152/ted-sbrain/metric/patches/12345/score/calculate', method: 'POST' },
      { url: 'http://localhost:49152/ted-sbrain/metric/patches/12345/score/history', method: 'GET' },
      { url: 'http://localhost:49152/ted-sbrain/scoreSnapshot/get/snapshot-12345-latest', method: 'GET' },
      { url: 'http://localhost:49152/ted-sbrain/scoreSnapshot/list?riskLevel=LOW', method: 'GET' },
      { url: 'http://localhost:49152/ted-sbrain/scoreSnapshot/page?page=2&pageSize=5', method: 'GET' },
      { url: 'http://localhost:49152/ted-sbrain/scoreSnapshot/queryLatestToday', method: 'GET' },
    ]);
  });
});
