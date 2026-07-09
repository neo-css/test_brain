import { describe, expect, it, vi } from 'vitest';
import type { TedSbrainClient, TedSbrainRequestOptions } from './client';
import { loadCollectionVersions, loadPatchDetail } from './versionLoaders';

function createClient(dataByPath: Record<string, unknown>): TedSbrainClient {
  return {
    request: vi.fn(async (path: string, options: TedSbrainRequestOptions = {}) => {
      const query = options.query
        ? `?${new URLSearchParams(
          Object.entries(options.query).map(([key, value]) => [key, String(value)]),
        ).toString()}`
        : '';
      const key = `${path}${query}`;

      if (!(key in dataByPath)) {
        throw new Error(`missing fake response for ${key}`);
      }

      return dataByPath[key] as never;
    }),
  };
}

const snapshot = {
  id: 'snapshot-1',
  patchId: 12345,
  totalScore: 88,
  qualityScore: 90,
  behaviorScore: 86,
  riskLevel: 'MEDIUM',
  snapshotsTs: '2026-07-08T10:30:00',
  summary: '支付系统风险评估',
  status: 'TESTING',
  releaseType: 'NORMAL',
  description: '描述',
  sysId: 'PAY',
  systemName: '支付系统',
  systemKeyId: 1001,
  systemLevel: '核心系统',
  teamName: '支付质量组',
  patchOwner: '张三',
  patchOwnerId: 'pay_owner',
  testLeader: '李四',
  testLeaderAccount: 'pay_test_lead',
  devLeader: '王五',
  devLeaderAccount: 'pay_dev_lead',
  testOwner: '赵六',
  testOwnerUserId: 'pay_tester',
  testOwnerGroup: '支付测试组',
  planedTestFromTime: '2026-07-08T09:00:00',
  planedTestToTime: '2026-07-08T18:00:00',
  planedIssueTime: '2026-07-08T19:00:00',
  planedOnlineTime: '2026-07-09T02:00:00',
  auditTime: '2026-07-08T10:30:00',
  createTs: '2026-07-08T06:00:00',
  updateTs: '2026-07-08T10:30:00',
  creator: '系统',
  creatorId: 'system',
  updater: '系统',
  updaterId: 'system',
} as const;

describe('ted-sbrain version loaders', () => {
  it('loads collection versions from queryLatestToday through the client', async () => {
    const client = createClient({
      '/scoreSnapshot/queryLatestToday?page=1&pageSize=200': {
        records: [snapshot],
        total: 1,
        size: 200,
        current: 1,
        pages: 1,
      },
    });

    const state = await loadCollectionVersions(client);

    expect(state.status).toBe('success');
    expect(state.versions.map((version) => version.patchId)).toEqual([12345]);
    expect(client.request).toHaveBeenCalledWith('/scoreSnapshot/queryLatestToday', {
      query: { page: 1, pageSize: 200 },
    });
  });

  it('loads patch detail from the patch score endpoint through the client', async () => {
    const client = createClient({
      '/metric/patches/12345/score': {
        ...snapshot,
        metrics: [],
        byPhase: [],
        byDataDimension: [],
        byEvalTarget: [],
      },
    });

    const state = await loadPatchDetail(12345, client);

    expect(state.status).toBe('success');
    expect(state.version?.patchId).toBe(12345);
    expect(client.request).toHaveBeenCalledWith('/metric/patches/12345/score');
  });

  it('returns an error state when collection loading fails', async () => {
    const client: TedSbrainClient = {
      request: vi.fn(async () => {
        throw new Error('network down');
      }),
    };

    const state = await loadCollectionVersions(client);

    expect(state.status).toBe('error');
    expect(state.error).toBe('network down');
    expect(state.versions).toEqual([]);
  });

  it('returns an idle state when detail patch id is invalid', async () => {
    const client = createClient({});

    await expect(loadPatchDetail(Number.NaN, client)).resolves.toEqual({
      status: 'idle',
      version: undefined,
      error: null,
    });
  });
});
