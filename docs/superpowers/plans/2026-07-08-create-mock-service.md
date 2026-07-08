# Create Mock Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local ted-sbrain mock service and shared API access layer so the frontend can switch between mock and real services through configuration.

**Architecture:** Add a typed `src/services/tedSbrain/` API boundary that always builds real-compatible `/ted-sbrain/...` paths and unwraps the documented response wrapper. Add a focused `src/mocks/tedSbrain/` mock service with deterministic fixtures, table-driven routing, filtering, pagination, CORS, and `404 + wrapper` failure semantics. Use a dedicated `tsconfig.mock.json` so the TypeScript mock server can compile to Node-runnable JavaScript without adding Express, Fastify, or `tsx`.

**Tech Stack:** React 19, Vite 8, TypeScript strict mode, Vitest, Node built-in `http` module, Node built-in `URL` utilities.

---

## File Structure

- Create `src/services/tedSbrain/types.ts`: shared response wrapper, risk, score, metric, snapshot, and pagination types based on `docs/api`.
- Create `src/services/tedSbrain/config.ts`: resolves `VITE_TED_SBRAIN_API_BASE_URL`, joins base URLs with `/ted-sbrain/...` paths, and exports the default mock base URL.
- Create `src/services/tedSbrain/client.ts`: low-level fetch wrapper, wrapper parsing, and consistent `TedSbrainApiError`.
- Create `src/services/tedSbrain/api.ts`: endpoint-specific functions such as `fetchPatchScore`, `calculatePatchScore`, `fetchPatchScoreHistory`, `fetchScoreSnapshot`, `listScoreSnapshots`, `pageScoreSnapshots`, and `fetchLatestTodayScoreSnapshots`.
- Create `src/services/tedSbrain/client.test.ts`: tests for base URL switching, path construction, wrapper parsing, and error shaping.
- Create `src/mocks/tedSbrain/fixtures.ts`: deterministic score and snapshot records covering `HIGH`, `MEDIUM`, `LOW`, and `UNKNOWN`.
- Create `src/mocks/tedSbrain/repository.ts`: lookup, history, filter, and pagination helpers.
- Create `src/mocks/tedSbrain/repository.test.ts`: tests for lookup, filtering, pagination, and history ordering.
- Create `src/mocks/tedSbrain/http.ts`: route normalization, handler dispatch, JSON response helpers, CORS headers, and `404 + wrapper` failures.
- Create `src/mocks/tedSbrain/http.test.ts`: tests for every documented endpoint, prefixed and unprefixed route behavior, CORS, and response wrapper shape.
- Create `src/mocks/tedSbrain/server.ts`: Node `http` server entry point with configurable host and port logging.
- Create `tsconfig.mock.json`: emits only the mock server files needed for `node .mock-dist/mocks/tedSbrain/server.js`.
- Modify `package.json`: add `mock:build` and `mock` scripts.
- Modify `vite.config.ts`: add optional `/ted-sbrain` proxy controlled by `VITE_TED_SBRAIN_PROXY_TARGET`.
- Create `docs/mock-ted-sbrain.md`: local mock usage, real-service switch examples, endpoints, and path rules.

## Task 1: Shared ted-sbrain API Types And Client

**Files:**
- Create: `src/services/tedSbrain/types.ts`
- Create: `src/services/tedSbrain/config.ts`
- Create: `src/services/tedSbrain/client.ts`
- Create: `src/services/tedSbrain/api.ts`
- Test: `src/services/tedSbrain/client.test.ts`

- [ ] **Step 1: Write the failing API client tests**

Create `src/services/tedSbrain/client.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
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

  it('throws a consistent error for non-json responses', async () => {
    const fetcher = vi.fn(async () => new Response('not json', { status: 502 }));
    const client = createTedSbrainClient({ baseUrl: 'http://localhost:49152', fetcher });

    await expect(client.request('/health')).rejects.toBeInstanceOf(TedSbrainApiError);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/services/tedSbrain/client.test.ts`

Expected: FAIL with module resolution errors for `./client`.

- [ ] **Step 3: Implement shared types**

Create `src/services/tedSbrain/types.ts`:

```ts
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface TedSbrainResponse<T> {
  result: boolean;
  message: string;
  data: T;
  criticalProcess: Record<string, unknown>;
}

export interface MetricVO {
  metricCode: string;
  metricName: string;
  phase: string;
  phaseName: string;
  dataDimension: string;
  dataDimensionName: string;
  evalTarget: string;
  evalTargetName: string;
  calcScore: number;
  actualScore: number;
  riskLevel: RiskLevel;
  features: Record<string, unknown>;
  description: string;
  detailUrl: string;
}

export interface GroupVO {
  key: string;
  displayName: string;
  groupScore: number;
  metrics: MetricVO[];
}

export interface ScoreSnapshot {
  id: string;
  patchId: number;
  totalScore: number;
  qualityScore: number;
  behaviorScore: number;
  riskLevel: RiskLevel;
  snapshotsTs: string;
  summary: string;
  status: string;
  releaseType: string;
  description: string;
  sysId: string;
  systemName: string;
  systemKeyId: number;
  systemLevel: string;
  teamName: string;
  patchOwner: string;
  patchOwnerId: string;
  testLeader: string;
  testLeaderAccount: string;
  devLeader: string;
  devLeaderAccount: string;
  testOwner: string;
  testOwnerUserId: string;
  testOwnerGroup: string;
  planedTestFromTime: string;
  planedTestToTime: string;
  planedIssueTime: string;
  planedOnlineTime: string;
  auditTime: string;
  createTs: string;
  updateTs: string;
  creator: string;
  creatorId: string;
  updater: string;
  updaterId: string;
}

export type PatchScoreVO = Omit<ScoreSnapshot, 'id' | 'createTs' | 'updateTs' | 'creator' | 'creatorId' | 'updater' | 'updaterId'> & {
  metrics: MetricVO[];
  byPhase: GroupVO[];
  byDataDimension: GroupVO[];
  byEvalTarget: GroupVO[];
};

export interface ScoreSnapshotPage {
  records: ScoreSnapshot[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export type ScoreSnapshotFilters = Partial<Record<keyof ScoreSnapshot, string | number>>;
```

- [ ] **Step 4: Implement config and low-level client**

Create `src/services/tedSbrain/config.ts`:

```ts
export const DEFAULT_TED_SBRAIN_API_BASE_URL = 'http://localhost:49152';
export const TED_SBRAIN_PATH_PREFIX = '/ted-sbrain';

export interface TedSbrainEnv {
  VITE_TED_SBRAIN_API_BASE_URL?: string;
}

function readViteEnv(): TedSbrainEnv {
  const meta = import.meta as ImportMeta & { env?: TedSbrainEnv };
  return meta.env ?? {};
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getTedSbrainApiBaseUrl(env: TedSbrainEnv = readViteEnv()): string {
  const configured = env.VITE_TED_SBRAIN_API_BASE_URL?.trim();
  return trimTrailingSlash(configured || DEFAULT_TED_SBRAIN_API_BASE_URL);
}

export function normalizeTedSbrainPath(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.startsWith(TED_SBRAIN_PATH_PREFIX)
    ? withLeadingSlash
    : `${TED_SBRAIN_PATH_PREFIX}${withLeadingSlash}`;
}

export function buildTedSbrainUrl(baseUrl: string, path: string): string {
  return `${trimTrailingSlash(baseUrl)}${normalizeTedSbrainPath(path)}`;
}
```

Create `src/services/tedSbrain/client.ts`:

```ts
import { buildTedSbrainUrl, getTedSbrainApiBaseUrl } from './config';
import type { TedSbrainResponse } from './types';

export { buildTedSbrainUrl, getTedSbrainApiBaseUrl };

export class TedSbrainApiError extends Error {
  readonly status: number;
  readonly result: boolean;
  readonly data: unknown;

  constructor(message: string, options: { status: number; result?: boolean; data?: unknown }) {
    super(message);
    this.name = 'TedSbrainApiError';
    this.status = options.status;
    this.result = options.result ?? false;
    this.data = options.data;
  }
}

export interface TedSbrainClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export interface TedSbrainRequestOptions {
  method?: 'GET' | 'POST';
  query?: Record<string, string | number | undefined>;
}

export interface TedSbrainClient {
  request<T>(path: string, options?: TedSbrainRequestOptions): Promise<T>;
}

function appendQuery(url: string, query: TedSbrainRequestOptions['query']): string {
  if (!query) return url;

  const parsed = new URL(url);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      parsed.searchParams.set(key, String(value));
    }
  });
  return parsed.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: TedSbrainResponse<T | null>;
  try {
    payload = (await response.json()) as TedSbrainResponse<T | null>;
  } catch {
    throw new TedSbrainApiError(`ted-sbrain request failed with HTTP ${response.status}`, {
      status: response.status,
    });
  }

  if (!response.ok || payload.result !== true) {
    throw new TedSbrainApiError(payload.message || `ted-sbrain request failed with HTTP ${response.status}`, {
      status: response.status,
      result: payload.result,
      data: payload.data,
    });
  }

  return payload.data as T;
}

export function createTedSbrainClient(options: TedSbrainClientOptions = {}): TedSbrainClient {
  const baseUrl = options.baseUrl ?? getTedSbrainApiBaseUrl();
  const fetcher = options.fetcher ?? fetch;

  return {
    async request<T>(path, requestOptions = {}) {
      const url = appendQuery(buildTedSbrainUrl(baseUrl, path), requestOptions.query);
      const response = await fetcher(url, {
        method: requestOptions.method ?? 'GET',
        headers: { Accept: 'application/json' },
      });
      return parseResponse<T>(response);
    },
  };
}

export const tedSbrainClient = createTedSbrainClient();
```

- [ ] **Step 5: Implement endpoint-specific API functions**

Create `src/services/tedSbrain/api.ts`:

```ts
import { tedSbrainClient, type TedSbrainClient } from './client';
import type { PatchScoreVO, ScoreSnapshot, ScoreSnapshotFilters, ScoreSnapshotPage } from './types';

function withClient(client?: TedSbrainClient): TedSbrainClient {
  return client ?? tedSbrainClient;
}

export function fetchPatchScore(patchId: number, client?: TedSbrainClient): Promise<PatchScoreVO> {
  return withClient(client).request<PatchScoreVO>(`/metric/patches/${patchId}/score`);
}

export function calculatePatchScore(patchId: number, client?: TedSbrainClient): Promise<PatchScoreVO> {
  return withClient(client).request<PatchScoreVO>(`/metric/patches/${patchId}/score/calculate`, { method: 'POST' });
}

export function fetchPatchScoreHistory(patchId: number, client?: TedSbrainClient): Promise<PatchScoreVO[]> {
  return withClient(client).request<PatchScoreVO[]>(`/metric/patches/${patchId}/score/history`);
}

export function fetchScoreSnapshot(id: string, client?: TedSbrainClient): Promise<ScoreSnapshot> {
  return withClient(client).request<ScoreSnapshot>(`/scoreSnapshot/get/${id}`);
}

export function listScoreSnapshots(filters: ScoreSnapshotFilters = {}, client?: TedSbrainClient): Promise<ScoreSnapshot[]> {
  return withClient(client).request<ScoreSnapshot[]>('/scoreSnapshot/list', { query: filters });
}

export function pageScoreSnapshots(
  filters: ScoreSnapshotFilters & { page?: number; pageSize?: number } = {},
  client?: TedSbrainClient,
): Promise<ScoreSnapshotPage> {
  return withClient(client).request<ScoreSnapshotPage>('/scoreSnapshot/page', { query: filters });
}

export function fetchLatestTodayScoreSnapshots(
  filters: ScoreSnapshotFilters & { page?: number; pageSize?: number } = {},
  client?: TedSbrainClient,
): Promise<ScoreSnapshotPage> {
  return withClient(client).request<ScoreSnapshotPage>('/scoreSnapshot/queryLatestToday', { query: filters });
}
```

- [ ] **Step 6: Run focused tests**

Run: `npm test -- src/services/tedSbrain/client.test.ts`

Expected: PASS for all tests in `client.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/services/tedSbrain
git commit -m "feat: add ted-sbrain api client"
```

## Task 2: Mock Fixtures And Repository Helpers

**Files:**
- Create: `src/mocks/tedSbrain/fixtures.ts`
- Create: `src/mocks/tedSbrain/repository.ts`
- Test: `src/mocks/tedSbrain/repository.test.ts`

- [ ] **Step 1: Write the failing repository tests**

Create `src/mocks/tedSbrain/repository.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  findPatchScore,
  findScoreSnapshot,
  getPatchScoreHistory,
  listScoreSnapshots,
  pageScoreSnapshots,
} from './repository';

describe('ted-sbrain mock repository', () => {
  it('finds known patch scores and snapshots', () => {
    expect(findPatchScore(12345)?.riskLevel).toBe('LOW');
    expect(findScoreSnapshot('snapshot-12345-latest')?.patchId).toBe(12345);
  });

  it('returns undefined for unknown records', () => {
    expect(findPatchScore(99999)).toBeUndefined();
    expect(findScoreSnapshot('missing')).toBeUndefined();
  });

  it('returns ordered patch score history', () => {
    const history = getPatchScoreHistory(12345);
    expect(history).toHaveLength(3);
    expect(history.map((item) => item.snapshotsTs)).toEqual([
      '2026-07-06T10:00:00',
      '2026-07-07T10:15:00',
      '2026-07-08T10:30:00',
    ]);
  });

  it('filters snapshots using all supplied fields', () => {
    const records = listScoreSnapshots({ riskLevel: 'HIGH', sysId: 'PAY' });
    expect(records.map((record) => record.id)).toEqual(['snapshot-22345-latest']);
  });

  it('paginates snapshots with calculated totals', () => {
    const page = pageScoreSnapshots({ page: 2, pageSize: 2 });
    expect(page.current).toBe(2);
    expect(page.size).toBe(2);
    expect(page.total).toBe(4);
    expect(page.pages).toBe(2);
    expect(page.records.map((record) => record.id)).toEqual(['snapshot-32345-latest', 'snapshot-42345-latest']);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/mocks/tedSbrain/repository.test.ts`

Expected: FAIL with module resolution errors for `./repository`.

- [ ] **Step 3: Implement fixtures**

Create `src/mocks/tedSbrain/fixtures.ts`:

```ts
import type { GroupVO, MetricVO, PatchScoreVO, RiskLevel, ScoreSnapshot } from '../../services/tedSbrain/types';

function metric(metricCode: string, metricName: string, actualScore: number, riskLevel: RiskLevel): MetricVO {
  return {
    metricCode,
    metricName,
    phase: metricCode.includes('COVERAGE') ? 'TEST' : 'DEV',
    phaseName: metricCode.includes('COVERAGE') ? '测试阶段' : '开发阶段',
    dataDimension: metricCode.includes('RISK') ? 'QUALITY' : 'EFFICIENCY',
    dataDimensionName: metricCode.includes('RISK') ? '质量' : '效率',
    evalTarget: 'PATCH',
    evalTargetName: '版本',
    calcScore: actualScore,
    actualScore,
    riskLevel,
    features: { sampleSize: { value: Math.round(actualScore * 10) } },
    description: `${metricName} mock 指标`,
    detailUrl: `/ted-sbrain/mock/details/${metricCode}`,
  };
}

function groups(metrics: MetricVO[]): GroupVO[] {
  return [
    {
      key: 'PATCH',
      displayName: '版本',
      groupScore: Number((metrics.reduce((sum, item) => sum + item.actualScore, 0) / metrics.length).toFixed(1)),
      metrics,
    },
  ];
}

function snapshot(input: Omit<ScoreSnapshot, 'createTs' | 'updateTs' | 'creator' | 'creatorId' | 'updater' | 'updaterId'>): ScoreSnapshot {
  return {
    ...input,
    createTs: input.snapshotsTs,
    updateTs: input.snapshotsTs,
    creator: 'mock-admin',
    creatorId: 'mock-admin',
    updater: 'mock-admin',
    updaterId: 'mock-admin',
  };
}

export const scoreSnapshots: ScoreSnapshot[] = [
  snapshot({
    id: 'snapshot-12345-latest',
    patchId: 12345,
    totalScore: 88.5,
    qualityScore: 91,
    behaviorScore: 84,
    riskLevel: 'LOW',
    snapshotsTs: '2026-07-08T10:30:00',
    summary: 'SBrain V2.1 测试态势',
    status: 'TESTING',
    releaseType: 'NORMAL',
    description: '覆盖版本评分、快照和指标联调场景',
    sysId: 'SBRAIN',
    systemName: '测试大脑系统',
    systemKeyId: 1001,
    systemLevel: 'A',
    teamName: '质量团队',
    patchOwner: '张三',
    patchOwnerId: 'zhangsan',
    testLeader: '李四',
    testLeaderAccount: 'lisi',
    devLeader: '王五',
    devLeaderAccount: 'wangwu',
    testOwner: '赵六',
    testOwnerUserId: 'zhaoliu',
    testOwnerGroup: '测试一组',
    planedTestFromTime: '2026-07-01T00:00:00',
    planedTestToTime: '2026-07-15T00:00:00',
    planedIssueTime: '2026-07-20T00:00:00',
    planedOnlineTime: '2026-07-25T00:00:00',
    auditTime: '2026-07-05T14:00:00',
  }),
  snapshot({
    id: 'snapshot-22345-latest',
    patchId: 22345,
    totalScore: 52,
    qualityScore: 48,
    behaviorScore: 61,
    riskLevel: 'HIGH',
    snapshotsTs: '2026-07-08T09:45:00',
    summary: '支付核心风险回归',
    status: 'BLOCKED',
    releaseType: 'EMERGENCY',
    description: '高风险支付链路回归版本',
    sysId: 'PAY',
    systemName: '支付核心',
    systemKeyId: 2002,
    systemLevel: 'S',
    teamName: '支付团队',
    patchOwner: '钱一',
    patchOwnerId: 'qianyi',
    testLeader: '孙二',
    testLeaderAccount: 'suner',
    devLeader: '周三',
    devLeaderAccount: 'zhousan',
    testOwner: '吴四',
    testOwnerUserId: 'wusi',
    testOwnerGroup: '支付测试组',
    planedTestFromTime: '2026-07-03T00:00:00',
    planedTestToTime: '2026-07-12T00:00:00',
    planedIssueTime: '2026-07-18T00:00:00',
    planedOnlineTime: '2026-07-21T00:00:00',
    auditTime: '2026-07-04T16:00:00',
  }),
  snapshot({
    id: 'snapshot-32345-latest',
    patchId: 32345,
    totalScore: 72.5,
    qualityScore: 76,
    behaviorScore: 69,
    riskLevel: 'MEDIUM',
    snapshotsTs: '2026-07-08T08:20:00',
    summary: '会员中心灰度版本',
    status: 'TESTING',
    releaseType: 'GRAY',
    description: '中风险会员权益灰度版本',
    sysId: 'MEMBER',
    systemName: '会员中心',
    systemKeyId: 3003,
    systemLevel: 'B',
    teamName: '会员团队',
    patchOwner: '郑五',
    patchOwnerId: 'zhengwu',
    testLeader: '王六',
    testLeaderAccount: 'wangliu',
    devLeader: '冯七',
    devLeaderAccount: 'fengqi',
    testOwner: '陈八',
    testOwnerUserId: 'chenba',
    testOwnerGroup: '会员测试组',
    planedTestFromTime: '2026-07-02T00:00:00',
    planedTestToTime: '2026-07-16T00:00:00',
    planedIssueTime: '2026-07-22T00:00:00',
    planedOnlineTime: '2026-07-26T00:00:00',
    auditTime: '2026-07-06T11:00:00',
  }),
  snapshot({
    id: 'snapshot-42345-latest',
    patchId: 42345,
    totalScore: 0,
    qualityScore: 0,
    behaviorScore: 0,
    riskLevel: 'UNKNOWN',
    snapshotsTs: '2026-07-08T07:10:00',
    summary: '新接入系统基线',
    status: 'PENDING',
    releaseType: 'NORMAL',
    description: '尚未完成评分的新接入版本',
    sysId: 'NEWAPP',
    systemName: '新接入系统',
    systemKeyId: 4004,
    systemLevel: 'C',
    teamName: '平台团队',
    patchOwner: '刘九',
    patchOwnerId: 'liujiu',
    testLeader: '林十',
    testLeaderAccount: 'linshi',
    devLeader: '何一',
    devLeaderAccount: 'heyi',
    testOwner: '许二',
    testOwnerUserId: 'xuer',
    testOwnerGroup: '平台测试组',
    planedTestFromTime: '2026-07-08T00:00:00',
    planedTestToTime: '2026-07-19T00:00:00',
    planedIssueTime: '2026-07-24T00:00:00',
    planedOnlineTime: '2026-07-30T00:00:00',
    auditTime: '2026-07-08T10:00:00',
  }),
];

export const patchScores: PatchScoreVO[] = scoreSnapshots.map((item) => {
  const metrics = [
    metric('CHANGES_RISK', '变更风险', Math.max(0, item.qualityScore - 8), item.riskLevel),
    metric('CASE_REVIEW_TIMELINESS', '用例评审及时性', Math.max(0, item.behaviorScore - 4), item.riskLevel),
    metric('DEFECT_RISK', '缺陷风险', item.qualityScore, item.riskLevel),
    metric('SMART_TEST', '智能测试', item.behaviorScore, item.riskLevel),
    metric('COVERAGE_390', '390覆盖率', Math.max(0, item.totalScore - 6), item.riskLevel),
    metric('COVERAGE_FUNCTION', '函数覆盖率', Math.max(0, item.totalScore - 3), item.riskLevel),
  ];
  const { id, createTs, updateTs, creator, creatorId, updater, updaterId, ...score } = item;
  return {
    ...score,
    metrics,
    byPhase: groups(metrics),
    byDataDimension: groups(metrics),
    byEvalTarget: groups(metrics),
  };
});

export const patchScoreHistory: Record<number, PatchScoreVO[]> = {
  12345: [
    { ...patchScores[0], totalScore: 70, qualityScore: 75, behaviorScore: 65, riskLevel: 'MEDIUM', snapshotsTs: '2026-07-06T10:00:00' },
    { ...patchScores[0], totalScore: 81, qualityScore: 84, behaviorScore: 78, riskLevel: 'LOW', snapshotsTs: '2026-07-07T10:15:00' },
    patchScores[0],
  ],
  22345: [patchScores[1]],
  32345: [patchScores[2]],
  42345: [patchScores[3]],
};
```

- [ ] **Step 4: Implement repository helpers**

Create `src/mocks/tedSbrain/repository.ts`:

```ts
import type { PatchScoreVO, ScoreSnapshot, ScoreSnapshotFilters, ScoreSnapshotPage } from '../../services/tedSbrain/types';
import { patchScoreHistory, patchScores, scoreSnapshots } from './fixtures';

export function findPatchScore(patchId: number): PatchScoreVO | undefined {
  return patchScores.find((score) => score.patchId === patchId);
}

export function getPatchScoreHistory(patchId: number): PatchScoreVO[] {
  return [...(patchScoreHistory[patchId] ?? [])].sort((a, b) => a.snapshotsTs.localeCompare(b.snapshotsTs));
}

export function findScoreSnapshot(id: string): ScoreSnapshot | undefined {
  return scoreSnapshots.find((snapshot) => snapshot.id === id);
}

function matchesFilter(record: ScoreSnapshot, filters: ScoreSnapshotFilters): boolean {
  return Object.entries(filters).every(([key, expected]) => {
    if (expected === undefined || expected === '') return true;
    const actual = record[key as keyof ScoreSnapshot];
    return String(actual) === String(expected);
  });
}

export function listScoreSnapshots(filters: ScoreSnapshotFilters = {}): ScoreSnapshot[] {
  return scoreSnapshots.filter((snapshot) => matchesFilter(snapshot, filters));
}

export function pageScoreSnapshots(
  filters: ScoreSnapshotFilters & { page?: number; pageSize?: number } = {},
  defaultPageSize = 10,
): ScoreSnapshotPage {
  const { page = 1, pageSize = defaultPageSize, ...snapshotFilters } = filters;
  const current = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || defaultPageSize);
  const records = listScoreSnapshots(snapshotFilters);
  const start = (current - 1) * size;
  return {
    records: records.slice(start, start + size),
    total: records.length,
    size,
    current,
    pages: Math.ceil(records.length / size),
  };
}
```

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/mocks/tedSbrain/repository.test.ts`

Expected: PASS for all tests in `repository.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/mocks/tedSbrain/fixtures.ts src/mocks/tedSbrain/repository.ts src/mocks/tedSbrain/repository.test.ts
git commit -m "feat: add ted-sbrain mock fixtures"
```

## Task 3: Mock HTTP Routing And Server Entry

**Files:**
- Create: `src/mocks/tedSbrain/http.ts`
- Create: `src/mocks/tedSbrain/http.test.ts`
- Create: `src/mocks/tedSbrain/server.ts`

- [ ] **Step 1: Write the failing HTTP tests**

Create `src/mocks/tedSbrain/http.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { handleTedSbrainMockRequest, normalizeMockPath } from './http';

async function request(path: string, init: RequestInit = {}) {
  return handleTedSbrainMockRequest(new Request(`http://localhost:49152${path}`, init));
}

describe('ted-sbrain mock HTTP handlers', () => {
  it('normalizes prefixed and unprefixed paths', () => {
    expect(normalizeMockPath('/ted-sbrain/metric/patches/12345/score')).toBe('/metric/patches/12345/score');
    expect(normalizeMockPath('/metric/patches/12345/score')).toBe('/metric/patches/12345/score');
  });

  it('handles health checks', async () => {
    const response = await request('/ted-sbrain/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ result: true, data: { status: 'ok' } });
  });

  it('handles patch score detail and recalculation', async () => {
    const detail = await request('/ted-sbrain/metric/patches/12345/score');
    const recalculated = await request('/ted-sbrain/metric/patches/12345/score/calculate', { method: 'POST' });
    expect(detail.status).toBe(200);
    expect(recalculated.status).toBe(200);
    await expect(detail.json()).resolves.toMatchObject({ result: true, data: { patchId: 12345, riskLevel: 'LOW' } });
    await expect(recalculated.json()).resolves.toMatchObject({ result: true, data: { patchId: 12345, riskLevel: 'LOW' } });
  });

  it('handles patch score history', async () => {
    const response = await request('/ted-sbrain/metric/patches/12345/score/history');
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.data.map((item: { snapshotsTs: string }) => item.snapshotsTs)).toEqual([
      '2026-07-06T10:00:00',
      '2026-07-07T10:15:00',
      '2026-07-08T10:30:00',
    ]);
  });

  it('handles snapshot get, list, page, and latest today', async () => {
    await expect((await request('/ted-sbrain/scoreSnapshot/get/snapshot-12345-latest')).json()).resolves.toMatchObject({
      data: { id: 'snapshot-12345-latest' },
    });
    await expect((await request('/ted-sbrain/scoreSnapshot/list?riskLevel=HIGH')).json()).resolves.toMatchObject({
      data: [{ id: 'snapshot-22345-latest' }],
    });
    await expect((await request('/ted-sbrain/scoreSnapshot/page?page=2&pageSize=2')).json()).resolves.toMatchObject({
      data: { current: 2, size: 2, total: 4 },
    });
    await expect((await request('/ted-sbrain/scoreSnapshot/queryLatestToday')).json()).resolves.toMatchObject({
      data: { current: 1, size: 200, total: 4 },
    });
  });

  it('returns 404 with wrapper for missing resources', async () => {
    const response = await request('/ted-sbrain/metric/patches/99999/score');
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ result: false, data: null, criticalProcess: {} });
  });

  it('adds development CORS headers', async () => {
    const response = await request('/ted-sbrain/health');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/mocks/tedSbrain/http.test.ts`

Expected: FAIL with module resolution errors for `./http`.

- [ ] **Step 3: Implement HTTP handlers**

Create `src/mocks/tedSbrain/http.ts`:

```ts
import type { TedSbrainResponse } from '../../services/tedSbrain/types';
import {
  findPatchScore,
  findScoreSnapshot,
  getPatchScoreHistory,
  listScoreSnapshots,
  pageScoreSnapshots,
} from './repository';

const PREFIX = '/ted-sbrain';

export function normalizeMockPath(pathname: string): string {
  return pathname.startsWith(PREFIX) ? pathname.slice(PREFIX.length) || '/' : pathname;
}

function wrapper<T>(data: T, message = 'success'): TedSbrainResponse<T> {
  return { result: true, message, data, criticalProcess: {} };
}

function failure(message: string): TedSbrainResponse<null> {
  return { result: false, message, data: null, criticalProcess: {} };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
    },
  });
}

function filtersFrom(searchParams: URLSearchParams): Record<string, string> {
  return Object.fromEntries([...searchParams.entries()].filter(([, value]) => value !== ''));
}

export async function handleTedSbrainMockRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = normalizeMockPath(url.pathname);
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return jsonResponse(wrapper({ status: 'ok' }));
  }

  if (method === 'GET' && path === '/health') {
    return jsonResponse(wrapper({ status: 'ok' }));
  }

  const scoreMatch = path.match(/^\/metric\/patches\/(\d+)\/score$/);
  if (scoreMatch && method === 'GET') {
    const score = findPatchScore(Number(scoreMatch[1]));
    return score ? jsonResponse(wrapper(score)) : jsonResponse(failure(`patch ${scoreMatch[1]} not found`), 404);
  }

  const calculateMatch = path.match(/^\/metric\/patches\/(\d+)\/score\/calculate$/);
  if (calculateMatch && method === 'POST') {
    const score = findPatchScore(Number(calculateMatch[1]));
    return score ? jsonResponse(wrapper(score)) : jsonResponse(failure(`patch ${calculateMatch[1]} not found`), 404);
  }

  const historyMatch = path.match(/^\/metric\/patches\/(\d+)\/score\/history$/);
  if (historyMatch && method === 'GET') {
    const history = getPatchScoreHistory(Number(historyMatch[1]));
    return history.length > 0 ? jsonResponse(wrapper(history)) : jsonResponse(failure(`patch ${historyMatch[1]} not found`), 404);
  }

  const snapshotMatch = path.match(/^\/scoreSnapshot\/get\/([^/]+)$/);
  if (snapshotMatch && method === 'GET') {
    const snapshot = findScoreSnapshot(decodeURIComponent(snapshotMatch[1]));
    return snapshot ? jsonResponse(wrapper(snapshot)) : jsonResponse(failure(`snapshot ${snapshotMatch[1]} not found`), 404);
  }

  if (method === 'GET' && path === '/scoreSnapshot/list') {
    return jsonResponse(wrapper(listScoreSnapshots(filtersFrom(url.searchParams))));
  }

  if (method === 'GET' && path === '/scoreSnapshot/page') {
    return jsonResponse(wrapper(pageScoreSnapshots(filtersFrom(url.searchParams))));
  }

  if (method === 'GET' && path === '/scoreSnapshot/queryLatestToday') {
    return jsonResponse(wrapper(pageScoreSnapshots(filtersFrom(url.searchParams), 200)));
  }

  return jsonResponse(failure(`route ${method} ${url.pathname} not found`), 404);
}
```

- [ ] **Step 4: Implement Node server entry**

Create `src/mocks/tedSbrain/server.ts`:

```ts
import { createServer } from 'node:http';
import { handleTedSbrainMockRequest } from './http';

const host = process.env.MOCK_HOST || '0.0.0.0';
const port = Number(process.env.MOCK_PORT || 49152);

const server = createServer(async (incoming, outgoing) => {
  const requestUrl = `http://${incoming.headers.host || `${host}:${port}`}${incoming.url || '/'}`;
  const headers = new Headers();
  Object.entries(incoming.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  });
  const request = new Request(requestUrl, {
    method: incoming.method,
    headers,
  });

  const response = await handleTedSbrainMockRequest(request);
  outgoing.statusCode = response.status;
  response.headers.forEach((value, key) => outgoing.setHeader(key, value));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(port, host, () => {
  console.log(`ted-sbrain mock listening at http://localhost:${port}/ted-sbrain`);
});
```

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/mocks/tedSbrain/http.test.ts`

Expected: PASS for all tests in `http.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/mocks/tedSbrain/http.ts src/mocks/tedSbrain/http.test.ts src/mocks/tedSbrain/server.ts
git commit -m "feat: add ted-sbrain mock http service"
```

## Task 4: Build Scripts, Vite Proxy, And Documentation

**Files:**
- Create: `tsconfig.mock.json`
- Create: `docs/mock-ted-sbrain.md`
- Modify: `package.json`
- Modify: `vite.config.ts`
- Test: `src/services/tedSbrain/client.test.ts`

- [ ] **Step 1: Add a proxy config assertion test**

Append this test to `src/services/tedSbrain/client.test.ts`:

```ts
it('allows an empty API base URL for same-origin proxy mode', () => {
  expect(getTedSbrainApiBaseUrl({ VITE_TED_SBRAIN_API_BASE_URL: '' })).toBe('');
  expect(buildTedSbrainUrl('', '/health')).toBe('/ted-sbrain/health');
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
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/services/tedSbrain/client.test.ts`

Expected: FAIL because `getTedSbrainApiBaseUrl({ VITE_TED_SBRAIN_API_BASE_URL: '' })` currently falls back to the mock base URL and `appendQuery` cannot process relative proxy URLs.

- [ ] **Step 3: Update URL building and query handling for proxy mode**

Modify `src/services/tedSbrain/config.ts` so the API base URL can intentionally be empty:

```ts
export const DEFAULT_TED_SBRAIN_API_BASE_URL = 'http://localhost:49152';
export const TED_SBRAIN_PATH_PREFIX = '/ted-sbrain';

export interface TedSbrainEnv {
  VITE_TED_SBRAIN_API_BASE_URL?: string;
}

function readViteEnv(): TedSbrainEnv {
  const meta = import.meta as ImportMeta & { env?: TedSbrainEnv };
  return meta.env ?? {};
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getTedSbrainApiBaseUrl(env: TedSbrainEnv = readViteEnv()): string {
  const configured = env.VITE_TED_SBRAIN_API_BASE_URL?.trim();
  return configured === '' ? '' : trimTrailingSlash(configured || DEFAULT_TED_SBRAIN_API_BASE_URL);
}

export function normalizeTedSbrainPath(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.startsWith(TED_SBRAIN_PATH_PREFIX)
    ? withLeadingSlash
    : `${TED_SBRAIN_PATH_PREFIX}${withLeadingSlash}`;
}

export function buildTedSbrainUrl(baseUrl: string, path: string): string {
  const normalizedPath = normalizeTedSbrainPath(path);
  const normalizedBase = trimTrailingSlash(baseUrl);
  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
}
```

Modify the `appendQuery` function in `src/services/tedSbrain/client.ts`:

```ts
function appendQuery(url: string, query: TedSbrainRequestOptions['query']): string {
  if (!query) return url;

  const isAbsolute = /^https?:\/\//.test(url);
  const parsed = new URL(url, isAbsolute ? undefined : 'http://local.proxy');
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      parsed.searchParams.set(key, String(value));
    }
  });
  return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
}
```

- [ ] **Step 4: Add mock TypeScript build config**

Create `tsconfig.mock.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": ".mock-dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/mocks/tedSbrain/**/*.ts", "src/services/tedSbrain/types.ts"],
  "exclude": ["**/*.test.ts"]
}
```

- [ ] **Step 5: Add npm scripts**

Modify `package.json` scripts to include:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "preview": "vite preview --host 0.0.0.0",
    "mock:build": "tsc -p tsconfig.mock.json",
    "mock": "npm run mock:build && node .mock-dist/mocks/tedSbrain/server.js"
  }
}
```

- [ ] **Step 6: Add optional Vite proxy config**

Modify `vite.config.ts`:

```ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_TED_SBRAIN_PROXY_TARGET;

  return {
    plugins: [react()],
    server: proxyTarget
      ? {
          proxy: {
            '/ted-sbrain': {
              target: proxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  };
});
```

- [ ] **Step 7: Add documentation**

Create `docs/mock-ted-sbrain.md`:

````md
# ted-sbrain Mock Service

The local mock service implements the ted-sbrain API endpoints documented in `docs/api`.

## Start The Mock

Run:

```bash
npm run mock
```

Default local base URL:

```text
http://localhost:49152/ted-sbrain
```

Override the mock port:

```bash
MOCK_PORT=49153 npm run mock
```

## Frontend Target Selection

Direct browser calls to the mock:

```bash
VITE_TED_SBRAIN_API_BASE_URL=http://localhost:49152 npm run dev
```

Same-origin browser calls through Vite proxy:

```bash
VITE_TED_SBRAIN_API_BASE_URL= VITE_TED_SBRAIN_PROXY_TARGET=http://localhost:49152 npm run dev
```

Real backend calls:

```bash
VITE_TED_SBRAIN_API_BASE_URL=http://172.21.126.221:49152 npm run dev
```

Frontend code should call `/ted-sbrain/...` paths through the shared API client. Unprefixed mock routes such as `/health` and `/metric/patches/12345/score` are local development conveniences only.

## Supported Endpoints

- `GET /ted-sbrain/metric/patches/{patchId}/score`
- `POST /ted-sbrain/metric/patches/{patchId}/score/calculate`
- `GET /ted-sbrain/metric/patches/{patchId}/score/history`
- `GET /ted-sbrain/scoreSnapshot/get/{id}`
- `GET /ted-sbrain/scoreSnapshot/list`
- `GET /ted-sbrain/scoreSnapshot/page`
- `GET /ted-sbrain/scoreSnapshot/queryLatestToday`
- `GET /ted-sbrain/health`

Missing patch or snapshot records return HTTP `404` with the documented wrapper shape:

```json
{
  "result": false,
  "message": "patch 99999 not found",
  "data": null,
  "criticalProcess": {}
}
```
````

- [ ] **Step 8: Run focused checks**

Run: `npm test -- src/services/tedSbrain/client.test.ts`

Expected: PASS for all tests in `client.test.ts`.

Run: `npm run mock:build`

Expected: PASS and `.mock-dist/mocks/tedSbrain/server.js` exists.

- [ ] **Step 9: Commit**

```bash
git add package.json vite.config.ts tsconfig.mock.json docs/mock-ted-sbrain.md src/services/tedSbrain/client.test.ts src/services/tedSbrain/config.ts
git commit -m "chore: wire ted-sbrain mock service tooling"
```

## Task 5: API Contract Coverage

**Files:**
- Modify: `src/services/tedSbrain/client.test.ts`
- Test: `src/mocks/tedSbrain/http.test.ts`

- [ ] **Step 1: Add endpoint API function tests**

Add these imports near the top of `src/services/tedSbrain/client.test.ts`:

```ts
import {
  calculatePatchScore,
  fetchLatestTodayScoreSnapshots,
  fetchPatchScore,
  fetchPatchScoreHistory,
  fetchScoreSnapshot,
  listScoreSnapshots,
  pageScoreSnapshots,
} from './api';
```

Append this test block to `src/services/tedSbrain/client.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the focused API client tests**

Run: `npm test -- src/services/tedSbrain/client.test.ts`

Expected: PASS for base URL, wrapper, error, proxy URL, and endpoint path tests.

- [ ] **Step 3: Run mock HTTP tests**

Run: `npm test -- src/mocks/tedSbrain/http.test.ts`

Expected: PASS for route matching, wrapper shape, CORS, and all documented endpoints.

- [ ] **Step 4: Commit**

```bash
git add src/services/tedSbrain/client.test.ts
git commit -m "test: cover ted-sbrain api contract paths"
```

## Task 6: Final Verification And OpenSpec Task Sync

**Files:**
- Modify: `openspec/changes/create-mock-service/tasks.md`

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: PASS for all Vitest files.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: PASS with TypeScript build and Vite production build completing successfully.

- [ ] **Step 3: Run the mock server build**

Run: `npm run mock:build`

Expected: PASS with `.mock-dist/mocks/tedSbrain/server.js` emitted.

- [ ] **Step 4: Smoke test the mock server manually**

Run: `npm run mock`

Expected: terminal logs:

```text
ted-sbrain mock listening at http://localhost:49152/ted-sbrain
```

In another terminal, run:

```bash
curl -s http://localhost:49152/ted-sbrain/metric/patches/12345/score
```

Expected response contains:

```json
{"result":true,"message":"success","data":{"patchId":12345
```

Stop the mock server with `Ctrl+C`.

- [ ] **Step 5: Mark OpenSpec tasks complete**

Modify `openspec/changes/create-mock-service/tasks.md` so every completed implementation checkbox is changed from `- [ ]` to `- [x]`.

- [ ] **Step 6: Check OpenSpec status**

Run: `openspec status --change create-mock-service`

Expected:

```text
Progress: 4/4 artifacts complete

[x] proposal
[x] design
[x] specs
[x] tasks

All artifacts complete!
```

- [ ] **Step 7: Commit**

```bash
git add openspec/changes/create-mock-service/tasks.md
git commit -m "chore: complete create mock service tasks"
```

## Self-Review

- Spec coverage: Task 1 covers API client, base URL switching, wrapper parsing, and real-compatible paths. Task 2 covers deterministic data, model fields, filtering, pagination, and history. Task 3 covers documented routes, CORS, health, route normalization, and missing resource failures. Task 4 covers scripts, proxy, docs, and Node-runnable TypeScript. Task 5 covers contract paths and configuration behavior. Task 6 covers final verification and OpenSpec task sync.
- Placeholder scan: The plan contains no incomplete sections, no deferred implementation steps, and no vague validation instructions without commands.
- Type consistency: `PatchScoreVO`, `ScoreSnapshot`, `ScoreSnapshotPage`, `TedSbrainResponse`, `TedSbrainApiError`, `createTedSbrainClient`, and endpoint function names are defined before use and reused consistently.
