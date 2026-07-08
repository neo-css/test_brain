import { describe, expect, it } from 'vitest';
import { handleTedSbrainMockRequest, normalizeMockPath } from './http';

const makeRequest = (path: string, init: RequestInit = {}): Request =>
  new Request(`http://localhost:49152${path}`, init);

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('ted-sbrain mock HTTP routing', () => {
  it('normalizes paths with the ted-sbrain prefix', () => {
    expect(normalizeMockPath('/ted-sbrain/metric/patches/12345/score')).toBe('/metric/patches/12345/score');
  });

  it('leaves unprefixed paths unchanged', () => {
    expect(normalizeMockPath('/metric/patches/12345/score')).toBe('/metric/patches/12345/score');
  });

  it('returns the health wrapper', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/health'));
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ result: true, data: { status: 'ok' } });
  });

  it('returns the LOW patch score for GET score requests', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/metric/patches/12345/score'));
    const body = await readJson<{ result: boolean; data: { patchId: number; riskLevel: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.result).toBe(true);
    expect(body.data.patchId).toBe(12345);
    expect(body.data.riskLevel).toBe('LOW');
  });

  it('returns the LOW patch score for POST calculate requests', async () => {
    const response = await handleTedSbrainMockRequest(
      makeRequest('/ted-sbrain/metric/patches/12345/score/calculate', { method: 'POST' }),
    );
    const body = await readJson<{ result: boolean; data: { patchId: number; riskLevel: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.result).toBe(true);
    expect(body.data.patchId).toBe(12345);
    expect(body.data.riskLevel).toBe('LOW');
  });

  it('returns patch score history sorted by timestamp', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/metric/patches/12345/score/history'));
    const body = await readJson<{ data: Array<{ snapshotsTs: string }> }>(response);

    expect(response.status).toBe(200);
    expect(body.data.map((item) => item.snapshotsTs)).toEqual([
      '2026-07-06T10:00:00',
      '2026-07-07T10:15:00',
      '2026-07-08T10:30:00',
    ]);
  });

  it('returns score snapshots by id', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/scoreSnapshot/get/snapshot-12345-latest'));
    const body = await readJson<{ result: boolean; data: { id: string; patchId: number; riskLevel: string } }>(response);

    expect(response.status).toBe(200);
    expect(body.result).toBe(true);
    expect(body.data).toMatchObject({
      id: 'snapshot-12345-latest',
      patchId: 12345,
      riskLevel: 'LOW',
    });
  });

  it('filters score snapshot lists by query parameters', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/scoreSnapshot/list?riskLevel=HIGH'));
    const body = await readJson<{ data: Array<{ id: string; riskLevel: string }> }>(response);

    expect(response.status).toBe(200);
    expect(body.data).toEqual([expect.objectContaining({ id: 'snapshot-22345-latest', riskLevel: 'HIGH' })]);
  });

  it('paginates score snapshots from query parameters', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/scoreSnapshot/page?page=2&pageSize=2'));
    const body = await readJson<{
      data: { current: number; size: number; total: number; pages: number; records: Array<{ id: string }> };
    }>(response);

    expect(response.status).toBe(200);
    expect(body.data.current).toBe(2);
    expect(body.data.size).toBe(2);
    expect(body.data.total).toBe(4);
    expect(body.data.pages).toBe(2);
    expect(body.data.records.map((record) => record.id)).toEqual(['snapshot-32345-latest', 'snapshot-42345-latest']);
  });

  it('uses a default page size of 200 for queryLatestToday', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/scoreSnapshot/queryLatestToday'));
    const body = await readJson<{ data: { current: number; size: number; total: number; records: unknown[] } }>(response);

    expect(response.status).toBe(200);
    expect(body.data.current).toBe(1);
    expect(body.data.size).toBe(200);
    expect(body.data.total).toBe(4);
    expect(body.data.records).toHaveLength(4);
  });

  it('returns a 404 failure wrapper for missing patches', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/metric/patches/99999/score'));
    const body = await readJson(response);

    expect(response.status).toBe(404);
    expect(body).toEqual({
      result: false,
      message: 'patch score not found',
      data: null,
      criticalProcess: {},
    });
  });

  it('includes permissive CORS response headers', async () => {
    const response = await handleTedSbrainMockRequest(makeRequest('/ted-sbrain/health'));

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
