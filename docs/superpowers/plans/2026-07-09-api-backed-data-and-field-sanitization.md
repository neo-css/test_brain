# API-Backed Data And Field Sanitization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all version pages load ted-sbrain data through the HTTP API layer so `VITE_TED_SBRAIN_API_BASE_URL` can switch between mock and real services, and prevent UI evidence panels from displaying raw JSON/API field names.

**Architecture:** Keep `src/services/tedSbrain/` as the only backend boundary. Move backend-to-view mapping into a dedicated view-model adapter, add loader functions and React hooks for collection/detail data, then update pages to consume those hooks instead of importing mock fixtures. Evidence details will use a display whitelist that shows business-readable fields only and suppresses technical codes, accounts, mock provenance, URLs, and unknown raw JSON keys.

**Tech Stack:** React, TypeScript, Vite, Vitest, existing `fetch`-based ted-sbrain client, existing Node mock server under `src/mocks/tedSbrain`.

---

## File Structure

- Create `src/services/tedSbrain/versionViewModel.ts`
  - Owns mapping from `ScoreSnapshot` and `PatchScoreVO` to the existing `VersionDetail` shape.
  - Replaces the direct `src/data/versionSource.ts -> src/mocks/tedSbrain/fixtures.ts` dependency for runtime data.
- Create `src/services/tedSbrain/versionViewModel.test.ts`
  - Verifies snapshot and patch score mapping, missing groups, API code-to-display label mapping, and account fields being kept in state but not required for display.
- Create `src/services/tedSbrain/versionLoaders.ts`
  - Owns async collection/detail loading through `src/services/tedSbrain/api.ts`.
  - Returns stable load-state objects instead of throwing into components.
- Create `src/services/tedSbrain/versionLoaders.test.ts`
  - Uses fake ted-sbrain clients to verify endpoint calls, successful mapping, missing IDs, and error states.
- Create `src/services/tedSbrain/useTedSbrainVersions.ts`
  - React hooks for pages: `useCollectionVersions()` and `usePatchDetail(patchId)`.
- Modify `src/pages/L1DashboardPage.tsx`
  - Replace `mockServiceVersions` with `useCollectionVersions()`.
  - Render compact loading/error/empty states.
- Modify `src/pages/VersionListPage.tsx`
  - Replace `mockServiceVersions` with `useCollectionVersions()`.
  - Keep existing filter/sort behavior after data loads.
- Modify `src/pages/VersionRoadPage.tsx`
  - Replace `mockServiceVersions` with `useCollectionVersions()`.
  - Keep existing range/filter/road rendering after data loads.
- Modify `src/pages/VersionDetailPage.tsx`
  - Replace `findVersionByPatchId()` with `usePatchDetail(patchId)`.
  - Keep route-state return behavior.
- Modify page tests:
  - `src/pages/VersionDataSourcePages.test.ts`
  - `src/pages/VersionDetailPage.test.ts`
  - `src/pages/L1DashboardPage.test.ts`
  - Use `vi.mock('../services/tedSbrain/useTedSbrainVersions', ...)` to provide deterministic test data without importing fixtures directly in components.
- Modify `src/pages/versionDetailInsights.ts`
  - Replace evidence fact construction with a display whitelist/sanitizer.
- Modify `src/pages/versionDetailInsights.test.ts`
  - Assert no raw codes, mock provenance, detail URLs, account IDs, or unknown JSON keys leak into evidence facts.
- Modify `src/mocks/tedSbrain/fixtures.ts`
  - Keep mock service response field names and metric feature shapes aligned with `docs/api`; mock-only provenance stays in tests, not service responses.
- Modify `src/mocks/tedSbrain/repository.test.ts`
  - Assert mock metric codes and feature keys match documented API examples and do not include mock provenance fields.
- Modify `src/data/versionSource.ts`
  - Remove runtime fixture import or leave only compatibility exports if a test still needs pure mapping during the transition.
  - Preferred final state: no production page imports `mockServiceVersions` or `findVersionByPatchId`.
- Modify `src/data/versionSource.test.ts`
  - Either move mapping tests to `versionViewModel.test.ts` and delete obsolete expectations, or convert this test to assert compatibility re-exports only.

---

### Task 1: Add Backend-To-View Mapping Adapter

**Files:**
- Create: `src/services/tedSbrain/versionViewModel.ts`
- Create: `src/services/tedSbrain/versionViewModel.test.ts`

- [ ] **Step 1: Write failing adapter tests**

Create `src/services/tedSbrain/versionViewModel.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { PatchScoreVO, ScoreSnapshot } from './types';
import {
  mapPatchScoreToVersionDetail,
  mapScoreSnapshotToVersionDetail,
} from './versionViewModel';

const snapshot: ScoreSnapshot = {
  id: 'snapshot-1',
  patchId: 12345,
  totalScore: 88,
  qualityScore: 90,
  behaviorScore: 86,
  riskLevel: 'MEDIUM',
  snapshotsTs: '2026-07-08T10:30:00',
  summary: '支付系统标准发布风险评估',
  status: 'TESTING',
  releaseType: 'NORMAL',
  description: '版本描述',
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
};

const patchScore: PatchScoreVO = {
  patchId: snapshot.patchId,
  totalScore: snapshot.totalScore,
  qualityScore: snapshot.qualityScore,
  behaviorScore: snapshot.behaviorScore,
  riskLevel: snapshot.riskLevel,
  snapshotsTs: snapshot.snapshotsTs,
  summary: snapshot.summary,
  status: snapshot.status,
  releaseType: snapshot.releaseType,
  description: snapshot.description,
  sysId: snapshot.sysId,
  systemName: snapshot.systemName,
  systemKeyId: snapshot.systemKeyId,
  systemLevel: snapshot.systemLevel,
  teamName: snapshot.teamName,
  patchOwner: snapshot.patchOwner,
  patchOwnerId: snapshot.patchOwnerId,
  testLeader: snapshot.testLeader,
  testLeaderAccount: snapshot.testLeaderAccount,
  devLeader: snapshot.devLeader,
  devLeaderAccount: snapshot.devLeaderAccount,
  testOwner: snapshot.testOwner,
  testOwnerUserId: snapshot.testOwnerUserId,
  testOwnerGroup: snapshot.testOwnerGroup,
  planedTestFromTime: snapshot.planedTestFromTime,
  planedTestToTime: snapshot.planedTestToTime,
  planedIssueTime: snapshot.planedIssueTime,
  planedOnlineTime: snapshot.planedOnlineTime,
  auditTime: snapshot.auditTime,
  metrics: [
    {
      metricCode: 'CHANGES_RISK',
      metricName: '版本变更风险',
      phase: 'DEV',
      phaseName: '开发阶段',
      dataDimension: 'QUALITY',
      dataDimensionName: '质量风险',
      evalTarget: 'PATCH',
      evalTargetName: '版本',
      calcScore: 88,
      actualScore: 84,
      riskLevel: 'MEDIUM',
      features: { changeCount: { value: 23 }, defectNum: { value: 3 } },
      description: '变更范围较大。',
      detailUrl: '/detail/changes',
    },
  ],
  byPhase: [],
  byDataDimension: [],
  byEvalTarget: [],
};

describe('ted-sbrain version view model', () => {
  it('maps ScoreSnapshot records to list-ready VersionDetail objects', () => {
    const version = mapScoreSnapshotToVersionDetail(snapshot);

    expect(version.patchId).toBe(12345);
    expect(version.subNamedSystemName).toBe('支付系统');
    expect(version.actualTestFromTime).toBe('2026-07-08T09:00:00');
    expect(version.actualTestToTime).toBe('2026-07-09T02:00:00');
    expect(version.metrics).toEqual([]);
    expect(version.byPhase).toEqual([]);
    expect(version.patchOwner).toBe('张三');
    expect(version.patchOwnerAccount).toBe('pay_owner');
    expect(version.status).toBe('测试中');
    expect(version.releaseType).toBe('标准发布');
  });

  it('maps PatchScoreVO records to detail-ready VersionDetail objects with metrics and groups', () => {
    const version = mapPatchScoreToVersionDetail(patchScore);

    expect(version.patchId).toBe(12345);
    expect(version.metrics).toHaveLength(1);
    expect(version.metrics[0]).toMatchObject({
      metricCode: 'CHANGES_RISK',
      metricName: '版本变更风险',
      phaseName: '开发阶段',
      dataDimensionName: '质量风险',
      evalTargetName: '版本',
      actualScore: 84,
      riskLevel: 'MEDIUM',
      description: '变更范围较大。',
    });
    expect(version.metrics[0].features).toEqual({ changeCount: { value: 23 }, defectNum: { value: 3 } });
  });
});
```

- [ ] **Step 2: Run adapter tests to verify they fail**

Run:

```bash
npm test -- src/services/tedSbrain/versionViewModel.test.ts
```

Expected: FAIL because `src/services/tedSbrain/versionViewModel.ts` does not exist.

- [ ] **Step 3: Implement the mapping adapter**

Create `src/services/tedSbrain/versionViewModel.ts`:

```ts
import type { MetricFeatureValue, MetricGroup, MetricItem, VersionDetail } from '../../data/versionMock';
import type { GroupVO, MetricVO, PatchScoreVO, ScoreSnapshot } from './types';

const STATUS_LABELS: Record<string, string> = {
  TESTING: '测试中',
  BLOCKED: '阻塞中',
  READY: '待发布',
  REGRESSION: '待回归',
  ADMISSION: '准入中',
};

const RELEASE_TYPE_LABELS: Record<string, string> = {
  NORMAL: '标准发布',
  EMERGENCY_FIX: '紧急修复',
  GRAY: '灰度发布',
  ITERATION: '迭代发布',
  SPECIAL_REGRESSION: '专项回归',
  CAMPAIGN_SUPPORT: '大促保障',
  SECURITY_HARDENING: '安全加固',
  DATA_FIX: '数据修复',
};

function displayLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}

function mapMetric(metric: MetricVO): MetricItem {
  return {
    metricCode: metric.metricCode,
    metricName: metric.metricName,
    phase: metric.phase,
    phaseName: metric.phaseName,
    dataDimension: metric.dataDimension,
    dataDimensionName: metric.dataDimensionName,
    evalTarget: metric.evalTarget,
    evalTargetName: metric.evalTargetName,
    calcScore: metric.calcScore,
    actualScore: metric.actualScore,
    riskLevel: metric.riskLevel,
    features: metric.features as Record<string, MetricFeatureValue>,
    description: metric.description,
    detailUrl: metric.detailUrl,
  };
}

function mapMetricGroup(group: GroupVO): MetricGroup {
  return {
    key: group.key,
    displayName: group.displayName,
    groupScore: group.groupScore,
    metrics: group.metrics.map((metric) => ({
      metricCode: metric.metricCode,
      metricName: metric.metricName,
      calcScore: metric.calcScore,
      actualScore: metric.actualScore,
      description: metric.description,
    })),
  };
}

export function mapScoreSnapshotToVersionDetail(snapshot: ScoreSnapshot): VersionDetail {
  return {
    patchId: snapshot.patchId,
    totalScore: snapshot.totalScore,
    qualityScore: snapshot.qualityScore,
    behaviorScore: snapshot.behaviorScore,
    riskLevel: snapshot.riskLevel,
    snapshotsTs: snapshot.snapshotsTs,
    sysId: snapshot.sysId,
    subNamedSystemName: snapshot.systemName,
    systemKeyId: snapshot.systemKeyId,
    systemLevel: snapshot.systemLevel,
    teamName: snapshot.teamName,
    patchOwner: snapshot.patchOwner,
    patchOwnerAccount: snapshot.patchOwnerId,
    testLeader: snapshot.testLeader,
    testLeaderAccount: snapshot.testLeaderAccount,
    devLeader: snapshot.devLeader,
    devLeaderAccount: snapshot.devLeaderAccount,
    actualSubmitTestTime: snapshot.planedTestFromTime,
    actualTestFromTime: snapshot.planedTestFromTime,
    actualTestToTime: snapshot.planedOnlineTime,
    planedTestFromTime: snapshot.planedTestFromTime,
    planedTestToTime: snapshot.planedTestToTime,
    auditTime: snapshot.auditTime,
    summary: snapshot.summary,
    status: displayLabel(STATUS_LABELS, snapshot.status),
    releaseType: displayLabel(RELEASE_TYPE_LABELS, snapshot.releaseType),
    metrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
  };
}

export function mapPatchScoreToVersionDetail(patchScore: PatchScoreVO): VersionDetail {
  return {
    ...mapScoreSnapshotToVersionDetail({
      ...patchScore,
      id: `patch-${patchScore.patchId}`,
      createTs: patchScore.snapshotsTs,
      updateTs: patchScore.snapshotsTs,
      creator: '',
      creatorId: '',
      updater: '',
      updaterId: '',
    }),
    metrics: patchScore.metrics.map(mapMetric),
    byPhase: patchScore.byPhase.map(mapMetricGroup),
    byDataDimension: patchScore.byDataDimension.map(mapMetricGroup),
    byEvalTarget: patchScore.byEvalTarget.map(mapMetricGroup),
  };
}
```

- [ ] **Step 4: Run adapter tests to verify they pass**

Run:

```bash
npm test -- src/services/tedSbrain/versionViewModel.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit adapter**

```bash
git add src/services/tedSbrain/versionViewModel.ts src/services/tedSbrain/versionViewModel.test.ts
git commit -m "feat: add ted-sbrain version view model adapter"
```

---

### Task 2: Add API Loaders With Stable States

**Files:**
- Create: `src/services/tedSbrain/versionLoaders.ts`
- Create: `src/services/tedSbrain/versionLoaders.test.ts`

- [ ] **Step 1: Write failing loader tests**

Create `src/services/tedSbrain/versionLoaders.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import type { TedSbrainClient } from './client';
import { loadCollectionVersions, loadPatchDetail } from './versionLoaders';

function createClient(dataByPath: Record<string, unknown>): TedSbrainClient {
  return {
    request: vi.fn(async (path: string, options = {}) => {
      const query = options.query ? `?${new URLSearchParams(Object.entries(options.query).map(([k, v]) => [k, String(v)])).toString()}` : '';
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
```

- [ ] **Step 2: Run loader tests to verify they fail**

Run:

```bash
npm test -- src/services/tedSbrain/versionLoaders.test.ts
```

Expected: FAIL because `src/services/tedSbrain/versionLoaders.ts` does not exist.

- [ ] **Step 3: Implement loaders**

Create `src/services/tedSbrain/versionLoaders.ts`:

```ts
import { fetchLatestTodayScoreSnapshots, fetchPatchScore } from './api';
import { tedSbrainClient, type TedSbrainClient } from './client';
import { mapPatchScoreToVersionDetail, mapScoreSnapshotToVersionDetail } from './versionViewModel';
import type { VersionDetail } from '../../data/versionMock';

export interface CollectionLoadState {
  status: 'loading' | 'success' | 'error';
  versions: VersionDetail[];
  error: string | null;
}

export interface DetailLoadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  version: VersionDetail | undefined;
  error: string | null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载 ted-sbrain 数据失败';
}

export async function loadCollectionVersions(
  client: TedSbrainClient = tedSbrainClient,
): Promise<CollectionLoadState> {
  try {
    const page = await fetchLatestTodayScoreSnapshots({ page: 1, pageSize: 200 }, client);

    return {
      status: 'success',
      versions: page.records.map(mapScoreSnapshotToVersionDetail),
      error: null,
    };
  } catch (error) {
    return {
      status: 'error',
      versions: [],
      error: errorMessage(error),
    };
  }
}

export async function loadPatchDetail(
  patchId: number,
  client: TedSbrainClient = tedSbrainClient,
): Promise<DetailLoadState> {
  if (!Number.isFinite(patchId)) {
    return {
      status: 'idle',
      version: undefined,
      error: null,
    };
  }

  try {
    const patchScore = await fetchPatchScore(patchId, client);

    return {
      status: 'success',
      version: mapPatchScoreToVersionDetail(patchScore),
      error: null,
    };
  } catch (error) {
    return {
      status: 'error',
      version: undefined,
      error: errorMessage(error),
    };
  }
}
```

- [ ] **Step 4: Run loader tests to verify they pass**

Run:

```bash
npm test -- src/services/tedSbrain/versionLoaders.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit loaders**

```bash
git add src/services/tedSbrain/versionLoaders.ts src/services/tedSbrain/versionLoaders.test.ts
git commit -m "feat: load version data through ted-sbrain api"
```

---

### Task 3: Add React Data Hooks

**Files:**
- Create: `src/services/tedSbrain/useTedSbrainVersions.ts`

- [ ] **Step 1: Create the hook module**

Create `src/services/tedSbrain/useTedSbrainVersions.ts`:

```ts
import { useEffect, useState } from 'react';
import {
  loadCollectionVersions,
  loadPatchDetail,
  type CollectionLoadState,
  type DetailLoadState,
} from './versionLoaders';

const initialCollectionState: CollectionLoadState = {
  status: 'loading',
  versions: [],
  error: null,
};

function initialDetailState(patchId: number): DetailLoadState {
  return Number.isFinite(patchId)
    ? { status: 'loading', version: undefined, error: null }
    : { status: 'idle', version: undefined, error: null };
}

export function useCollectionVersions(): CollectionLoadState {
  const [state, setState] = useState<CollectionLoadState>(initialCollectionState);

  useEffect(() => {
    let active = true;
    setState(initialCollectionState);

    loadCollectionVersions().then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function usePatchDetail(patchId: number): DetailLoadState {
  const [state, setState] = useState<DetailLoadState>(() => initialDetailState(patchId));

  useEffect(() => {
    let active = true;
    setState(initialDetailState(patchId));

    loadPatchDetail(patchId).then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, [patchId]);

  return state;
}
```

- [ ] **Step 2: Type-check the hook**

Run:

```bash
npm run build
```

Expected: PASS, with no TypeScript errors for `useTedSbrainVersions.ts`.

- [ ] **Step 3: Commit hooks**

```bash
git add src/services/tedSbrain/useTedSbrainVersions.ts
git commit -m "feat: add ted-sbrain version data hooks"
```

---

### Task 4: Migrate Collection Pages Off Static Fixtures

**Files:**
- Modify: `src/pages/L1DashboardPage.tsx`
- Modify: `src/pages/VersionListPage.tsx`
- Modify: `src/pages/VersionRoadPage.tsx`
- Modify: `src/pages/VersionDataSourcePages.test.ts`
- Modify: `src/pages/L1DashboardPage.test.ts`

- [ ] **Step 1: Update tests to mock the collection hook**

Modify the top of `src/pages/VersionDataSourcePages.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import { patchScores } from '../mocks/tedSbrain/fixtures';
import { mapPatchScoreToVersionDetail } from '../services/tedSbrain/versionViewModel';
import VersionListPage from './VersionListPage';
import VersionRoadPage from './VersionRoadPage';

const versions = patchScores.map(mapPatchScoreToVersionDetail);
const unknownCount = versions.filter((version) => version.riskLevel === 'UNKNOWN').length;

vi.mock('../services/tedSbrain/useTedSbrainVersions', () => ({
  useCollectionVersions: () => ({
    status: 'success',
    versions,
    error: null,
  }),
}));
```

Leave the existing `renderPage()` helper and tests intact, except replace `patchScores.length` with `versions.length`.

Add this test to `src/pages/VersionDataSourcePages.test.ts`:

```ts
it('renders a collection loading state while ted-sbrain data is loading', async () => {
  vi.resetModules();
  vi.doMock('../services/tedSbrain/useTedSbrainVersions', () => ({
    useCollectionVersions: () => ({
      status: 'loading',
      versions: [],
      error: null,
    }),
  }));
  const { default: ReloadedVersionListPage } = await import('./VersionListPage');

  const html = renderPage(createElement(ReloadedVersionListPage));

  expect(html).toContain('版本数据加载中');
});
```

- [ ] **Step 2: Run collection page tests to verify they fail**

Run:

```bash
npm test -- src/pages/VersionDataSourcePages.test.ts src/pages/L1DashboardPage.test.ts
```

Expected: FAIL because pages still import `mockServiceVersions` and do not render hook loading/error states.

- [ ] **Step 3: Update collection pages**

In `src/pages/L1DashboardPage.tsx`, replace:

```ts
import { mockServiceVersions } from '../data/versionSource';
```

with:

```ts
import { useCollectionVersions } from '../services/tedSbrain/useTedSbrainVersions';
```

Then replace:

```ts
const versions = mockServiceVersions;
```

with:

```ts
const { status, versions, error } = useCollectionVersions();
```

After computing `detailState`, add:

```tsx
if (status === 'loading') {
  return (
    <main className="l1-page">
      <section className="list-empty" aria-live="polite">
        <h1>版本数据加载中</h1>
        <p>正在从 ted-sbrain 服务获取最新评分数据。</p>
      </section>
    </main>
  );
}

if (status === 'error') {
  return (
    <main className="l1-page">
      <section className="list-empty" aria-live="polite">
        <h1>版本数据加载失败</h1>
        <p>{error}</p>
      </section>
    </main>
  );
}
```

In `src/pages/VersionListPage.tsx`, replace:

```ts
import { mockServiceVersions } from '../data/versionSource';
```

with:

```ts
import { useCollectionVersions } from '../services/tedSbrain/useTedSbrainVersions';
```

Then replace:

```ts
const versions = mockServiceVersions;
```

with:

```ts
const { status: loadStatus, versions, error } = useCollectionVersions();
```

After derived state declarations, add:

```tsx
if (loadStatus === 'loading') {
  return (
    <main className="page-shell list-page">
      <section className="list-empty" aria-live="polite">
        <h1>版本数据加载中</h1>
        <p>正在从 ted-sbrain 服务获取最新评分数据。</p>
      </section>
    </main>
  );
}

if (loadStatus === 'error') {
  return (
    <main className="page-shell list-page">
      <section className="list-empty" aria-live="polite">
        <h1>版本数据加载失败</h1>
        <p>{error}</p>
      </section>
    </main>
  );
}
```

In `src/pages/VersionRoadPage.tsx`, replace:

```ts
import { mockServiceVersions } from '../data/versionSource';
```

with:

```ts
import { useCollectionVersions } from '../services/tedSbrain/useTedSbrainVersions';
```

Then replace:

```ts
const versions = mockServiceVersions;
```

with:

```ts
const { status: loadStatus, versions, error } = useCollectionVersions();
```

Before rendering the normal page, add the same loading/error blocks used in `VersionListPage`.

- [ ] **Step 4: Run collection page tests to verify they pass**

Run:

```bash
npm test -- src/pages/VersionDataSourcePages.test.ts src/pages/L1DashboardPage.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit collection page migration**

```bash
git add src/pages/L1DashboardPage.tsx src/pages/VersionListPage.tsx src/pages/VersionRoadPage.tsx src/pages/VersionDataSourcePages.test.ts src/pages/L1DashboardPage.test.ts
git commit -m "feat: load collection pages from ted-sbrain api"
```

---

### Task 5: Migrate Detail Page Off Static Fixtures

**Files:**
- Modify: `src/pages/VersionDetailPage.tsx`
- Modify: `src/pages/VersionDetailPage.test.ts`

- [ ] **Step 1: Update detail tests to mock `usePatchDetail`**

At the top of `src/pages/VersionDetailPage.test.ts`, add imports:

```ts
import { patchScores } from '../mocks/tedSbrain/fixtures';
import { mapPatchScoreToVersionDetail } from '../services/tedSbrain/versionViewModel';
```

Add this module mock before `describe(...)`:

```ts
const detailVersion = mapPatchScoreToVersionDetail(patchScores[0]);

vi.mock('../services/tedSbrain/useTedSbrainVersions', () => ({
  usePatchDetail: () => ({
    status: 'success',
    version: detailVersion,
    error: null,
  }),
}));
```

Update the `vitest` import:

```ts
import { describe, expect, it, vi } from 'vitest';
```

- [ ] **Step 2: Add a failing loading-state test**

Append to `src/pages/VersionDetailPage.test.ts`:

```ts
it('renders a detail loading state while ted-sbrain data is loading', async () => {
  vi.resetModules();
  vi.doMock('../services/tedSbrain/useTedSbrainVersions', () => ({
    usePatchDetail: () => ({
      status: 'loading',
      version: undefined,
      error: null,
    }),
  }));
  const { default: ReloadedVersionDetailPage } = await import('./VersionDetailPage');

  const html = renderToStaticMarkup(
    createElement(ThemeProvider, null,
      createElement(MemoryRouter, { initialEntries: ['/versions/12345'] },
        createElement(Routes, null,
          createElement(Route, { path: '/versions/:patchId', element: createElement(ReloadedVersionDetailPage) }),
        ),
      ),
    ),
  );

  expect(html).toContain('版本详情加载中');
});
```

- [ ] **Step 3: Run detail tests to verify they fail**

Run:

```bash
npm test -- src/pages/VersionDetailPage.test.ts
```

Expected: FAIL because `VersionDetailPage` still imports `findVersionByPatchId()`.

- [ ] **Step 4: Update detail page**

In `src/pages/VersionDetailPage.tsx`, replace:

```ts
import { findVersionByPatchId } from '../data/versionSource';
```

with:

```ts
import { usePatchDetail } from '../services/tedSbrain/useTedSbrainVersions';
```

Replace:

```ts
const version = findVersionByPatchId(patchId);
```

with:

```ts
const numericPatchId = Number(patchId);
const { status: detailStatus, version, error } = usePatchDetail(numericPatchId);
```

Before `if (!version || !insights)`, add:

```tsx
if (detailStatus === 'loading') {
  return (
    <main className="page-shell detail-page detail-empty">
      <h1>版本详情加载中</h1>
      <Link className="back-link" to={returnTarget}>{returnLabel}</Link>
    </main>
  );
}

if (detailStatus === 'error') {
  return (
    <main className="page-shell detail-page detail-empty">
      <h1>版本详情加载失败</h1>
      <p>{error}</p>
      <Link className="back-link" to={returnTarget}>{returnLabel}</Link>
    </main>
  );
}
```

Keep the existing not-found fallback for invalid or missing records.

- [ ] **Step 5: Run detail tests to verify they pass**

Run:

```bash
npm test -- src/pages/VersionDetailPage.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit detail migration**

```bash
git add src/pages/VersionDetailPage.tsx src/pages/VersionDetailPage.test.ts
git commit -m "feat: load version detail from ted-sbrain api"
```

---

### Task 6: Remove Runtime Static Fixture Data Source

**Files:**
- Modify: `src/data/versionSource.ts`
- Modify: `src/data/versionSource.test.ts`
- Modify imports in pages if any remain.

- [ ] **Step 1: Write a guard test against runtime fixture imports**

Create or update `src/data/versionSource.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mapPatchScoreToVersionDetail } from '../services/tedSbrain/versionViewModel';

describe('versionSource compatibility', () => {
  it('exports no static runtime collection from mock fixtures', async () => {
    const source = await import('./versionSource');

    expect('mockServiceVersions' in source).toBe(false);
    expect('findVersionByPatchId' in source).toBe(false);
    expect(typeof mapPatchScoreToVersionDetail).toBe('function');
  });
});
```

- [ ] **Step 2: Run the guard test to verify it fails**

Run:

```bash
npm test -- src/data/versionSource.test.ts
```

Expected: FAIL because `versionSource.ts` still exports `mockServiceVersions` and `findVersionByPatchId`.

- [ ] **Step 3: Delete static source exports**

Replace `src/data/versionSource.ts` with:

```ts
export {
  mapPatchScoreToVersionDetail,
  mapScoreSnapshotToVersionDetail,
} from '../services/tedSbrain/versionViewModel';
```

- [ ] **Step 4: Search for forbidden runtime imports**

Run:

```bash
rg "mockServiceVersions|findVersionByPatchId|from '../mocks/tedSbrain/fixtures'|from './mocks/tedSbrain/fixtures'" src
```

Expected: matches only in tests and mock service files, not in page/component runtime files.

- [ ] **Step 5: Run guard test to verify it passes**

Run:

```bash
npm test -- src/data/versionSource.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit static source removal**

```bash
git add src/data/versionSource.ts src/data/versionSource.test.ts
git commit -m "refactor: remove static fixture runtime data source"
```

---

### Task 7: Sanitize Evidence Facts To Prevent JSON Field Leakage

**Files:**
- Modify: `src/pages/versionDetailInsights.ts`
- Modify: `src/pages/versionDetailInsights.test.ts`
- Modify: `src/pages/VersionDetailPage.test.ts`

- [ ] **Step 1: Write failing sanitizer tests**

Append to `src/pages/versionDetailInsights.test.ts`:

```ts
it('does not expose raw API codes, mock provenance, URLs, accounts, or unknown JSON keys in evidence facts', () => {
  const version = makeVersion({
    metrics: [
      {
        metricCode: 'CHANGES_RISK',
        metricName: 'mock字段泄漏检查',
        phase: 'DEV',
        phaseName: '开发阶段',
        dataDimension: 'QUALITY',
        dataDimensionName: '质量风险',
        evalTarget: 'PATCH',
        evalTargetName: '版本',
        calcScore: 70,
        actualScore: 68,
        riskLevel: 'MEDIUM',
        features: {
          数据来源: 'mock服务',
          是否稳定样例: true,
          changeCount: { value: 23 },
          defectNum: 5,
          unknownRawKey: 'raw-value',
        },
        description: '可读的指标说明。',
        detailUrl: '/detail/changes',
      },
    ],
  });

  const facts = buildVersionDetailInsights(version).evidenceRows[0].facts;
  const rendered = facts.map((fact) => `${fact.label}:${fact.value}`).join('|');

  expect(rendered).toContain('指标说明:可读的指标说明。');
  expect(rendered).toContain('缺陷数:5');
  expect(rendered).toContain('特征值:23');
  expect(rendered).not.toContain('指标编码');
  expect(rendered).not.toContain('阶段编码');
  expect(rendered).not.toContain('数据维度编码');
  expect(rendered).not.toContain('评价对象编码');
  expect(rendered).not.toContain('详情链接');
  expect(rendered).not.toContain('mock服务');
  expect(rendered).not.toContain('是否稳定样例');
  expect(rendered).not.toContain('数据来源');
  expect(rendered).not.toContain('changeCount');
  expect(rendered).not.toContain('unknownRawKey');
  expect(rendered).not.toContain('raw-value');
});
```

- [ ] **Step 2: Run sanitizer tests to verify they fail**

Run:

```bash
npm test -- src/pages/versionDetailInsights.test.ts
```

Expected: FAIL because `buildFacts()` currently includes raw interface facts and unknown feature keys.

- [ ] **Step 3: Implement the sanitizer**

In `src/pages/versionDetailInsights.ts`, replace `FEATURE_LABELS` with:

```ts
const FEATURE_LABELS: Record<string, string> = {
  summaryReqConsistent: '需求摘要一致',
  summaryReqDiffCount: '需求差异数',
  summaryCodeConsistent: '代码摘要一致',
  summaryCodeDiffCount: '代码差异数',
  score: '特征评分',
  reviewTime: '评审时间',
  testStartTime: '测试开始',
  delayDays: '延迟天数',
  defectNum: '缺陷数',
  testStartDate: '测试开始日',
  testEndDate: '测试结束日',
  testDay: '测试天数',
  totalDays: '计划天数',
  clickCounts: '智能测试点击',
  num: '总数',
  cover: '覆盖数',
  coverageRate: '覆盖率',
  coverType: '覆盖类型',
  appLevel: '应用等级',
  javaCoverageInfo: 'Java 覆盖',
  cCoverageInfo: 'C 覆盖',
  deletedNum: '删除数',
  artificialNum: '人工补录',
  filterNum: '过滤数',
  coverState: '覆盖状态',
  description: '说明',
  value: '特征值',
};

const HIDDEN_FEATURE_KEYS = new Set([
  '数据来源',
  '是否稳定样例',
  'source',
  'mock',
  'mockSource',
  'stableSample',
]);
```

Replace `flattenFeatureFacts()` with:

```ts
function flattenFeatureFacts(key: string, value: MetricFeatureValue): DetailFact[] {
  if (HIDDEN_FEATURE_KEYS.has(key)) return [];

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (key === 'clickCounts') {
      return Object.entries(value).map(([clickName, clickValue]) => ({
        label: `${clickName}点击`,
        value: `${asDisplayValue(clickValue)} 次`,
      }));
    }

    if ('value' in value) {
      return [{
        label: FEATURE_LABELS[key] ?? FEATURE_LABELS.value,
        value: formatFeatureValue('value', (value as Record<string, MetricFeatureValue>).value),
      }];
    }

    if (key in FEATURE_LABELS) {
      return Object.entries(value)
        .filter(([childKey]) => childKey in FEATURE_LABELS && !HIDDEN_FEATURE_KEYS.has(childKey))
        .map(([childKey, childValue]) => ({
          label: FEATURE_LABELS[childKey],
          value: formatFeatureValue(childKey, childValue),
        }));
    }

    return [];
  }

  if (!(key in FEATURE_LABELS)) return [];

  return [
    {
      label: FEATURE_LABELS[key],
      value: formatFeatureValue(key, value),
    },
  ];
}
```

Replace `buildFacts()` with:

```ts
function buildFacts(metric: MetricItem): DetailFact[] {
  const readableFacts = [
    optionalFact('指标说明', metric.description),
  ].filter((fact): fact is DetailFact => Boolean(fact));

  const featureFacts = metric.features
    ? Object.entries(metric.features).flatMap(([key, value]) => flattenFeatureFacts(key, value))
    : [];

  return [...readableFacts, ...featureFacts];
}
```

- [ ] **Step 4: Update old evidence tests**

In `src/pages/versionDetailInsights.test.ts`, replace assertions expecting these facts:

```ts
{ label: '指标编码', value: 'CHANGES_RISK' },
{ label: '阶段编码', value: 'DEV' },
{ label: '数据维度编码', value: 'QUALITY' },
{ label: '评价对象编码', value: 'PATCH' },
{ label: '详情链接', value: '/detail/changes' },
{ label: '数据来源', value: 'mock服务' },
{ label: '是否稳定样例', value: '是' },
```

with assertions that they are absent:

```ts
const rendered = row.facts.map((fact) => `${fact.label}:${fact.value}`).join('|');
expect(rendered).not.toContain('指标编码');
expect(rendered).not.toContain('阶段编码');
expect(rendered).not.toContain('数据维度编码');
expect(rendered).not.toContain('评价对象编码');
expect(rendered).not.toContain('详情链接');
expect(rendered).not.toContain('mock服务');
expect(rendered).not.toContain('是否稳定样例');
expect(rendered).toContain('指标说明:来自mock服务MetricVO的指标说明。');
```

- [ ] **Step 5: Run sanitizer tests to verify they pass**

Run:

```bash
npm test -- src/pages/versionDetailInsights.test.ts src/pages/VersionDetailPage.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit sanitizer**

```bash
git add src/pages/versionDetailInsights.ts src/pages/versionDetailInsights.test.ts src/pages/VersionDetailPage.test.ts
git commit -m "fix: hide raw api fields from evidence details"
```

---

### Task 8: Align Mock Service Payloads With docs/api

**Files:**
- Modify: `src/mocks/tedSbrain/fixtures.ts`
- Modify: `src/mocks/tedSbrain/repository.test.ts`
- Test: `src/mocks/tedSbrain/http.test.ts`

- [ ] **Step 1: Add mock contract assertions**

Update `src/mocks/tedSbrain/repository.test.ts` so the documented metric test also asserts:

```ts
expect(patchScore?.metrics[0].features).toMatchObject({
  changeCount: { value: expect.any(Number) },
});
expect(JSON.stringify(patchScore?.metrics)).not.toContain('mock服务');
expect(JSON.stringify(patchScore?.metrics)).not.toContain('是否稳定样例');
expect(patchScore?.metrics[0].detailUrl).toBe('/detail/changes');
```

Add a snapshot-level assertion that mock fixtures use API-like code values when that is what `docs/api` examples show:

```ts
const snapshot = findScoreSnapshot('snapshot-12345-latest');
expect(snapshot).toMatchObject({
  status: 'TESTING',
  releaseType: 'NORMAL',
});
```

- [ ] **Step 2: Run mock repository tests to verify they fail**

Run:

```bash
npm test -- src/mocks/tedSbrain/repository.test.ts
```

Expected: FAIL because mock fixtures still expose mock provenance feature fields and Chinese status/release type values.

- [ ] **Step 3: Update mock fixture payloads**

In `src/mocks/tedSbrain/fixtures.ts`:

- Replace mock-only metric feature fields (`数据来源`, `是否稳定样例`) with documented business feature shapes. Use object-with-`value` entries where possible, for example:

```ts
features: {
  changeCount: { value: Math.max(1, Math.round((100 - totalScore) / 2)) },
}
```

- Keep metric codes within the documented set only:
  - `CHANGES_RISK`
  - `CASE_REVIEW_TIMELINESS`
  - `DEFECT_RISK`
  - `SMART_TEST`
  - `COVERAGE_390`
  - `COVERAGE_FUNCTION`
- Replace mock-only detail URLs such as `/ted-sbrain/mock/metrics/CHANGES_RISK` with API-example-style URLs such as `/detail/changes`.
- Use API-like code values for `status` and `releaseType` in mock responses when known from `docs/api` examples (`TESTING`, `NORMAL`). If a fixture needs a value not documented as an enum, keep a stable code-like value and add it to the view-model display map with fallback behavior.

- [ ] **Step 4: Run mock service contract tests**

Run:

```bash
npm test -- src/mocks/tedSbrain/repository.test.ts src/mocks/tedSbrain/http.test.ts src/services/tedSbrain/client.test.ts
```

Expected: PASS, and mock HTTP responses still use the documented response wrapper and endpoint paths.

- [ ] **Step 5: Commit mock payload alignment**

```bash
git add src/mocks/tedSbrain/fixtures.ts src/mocks/tedSbrain/repository.test.ts
git commit -m "fix: align ted-sbrain mock payloads with api docs"
```

---

### Task 9: Verify Environment-Based Service Switching

**Files:**
- Modify: `docs/mock-ted-sbrain.md`
- Test: existing service and page tests.

- [ ] **Step 1: Update service switching docs**

Append this section to `docs/mock-ted-sbrain.md`:

```md
## Frontend data source switching

The frontend loads version collection and detail data through `src/services/tedSbrain/api.ts`.
It no longer imports mock fixtures directly in runtime page code.

Mock service:

```bash
npm run mock
VITE_TED_SBRAIN_API_BASE_URL=http://localhost:49152 npm run dev
```

Real service:

```bash
VITE_TED_SBRAIN_API_BASE_URL=http://172.21.126.221:49152 npm run dev
```

Same-origin proxy mode:

```bash
VITE_TED_SBRAIN_API_BASE_URL= VITE_TED_SBRAIN_PROXY_TARGET=http://172.21.126.221:49152 npm run dev
```

In proxy mode browser requests use `/ted-sbrain/...`, and Vite forwards them to the configured target.
```

- [ ] **Step 2: Run endpoint/config tests**

Run:

```bash
npm test -- src/services/tedSbrain/client.test.ts src/mocks/tedSbrain/http.test.ts src/mocks/tedSbrain/repository.test.ts vite.config.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run the mock server build**

Run:

```bash
npm run mock:build
```

Expected: PASS and `.mock-dist/mocks/tedSbrain/server.js` exists.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: PASS for all tests and production build.

- [ ] **Step 5: Search for forbidden runtime fixture imports and field leaks**

Run:

```bash
rg "mockServiceVersions|findVersionByPatchId|from '../mocks/tedSbrain/fixtures'|from './mocks/tedSbrain/fixtures'" src/pages src/components src/services src/data
rg "数据来源|是否稳定样例|详情链接|指标编码|阶段编码|数据维度编码|评价对象编码|_owner|_test_lead|_dev_lead" src/pages src/components src/data src/services
```

Expected:
- First command has no matches in runtime page/component code.
- Second command has no matches in user-facing runtime display code. Matches in tests or mock fixture files are acceptable.

- [ ] **Step 6: Commit docs and verification changes**

```bash
git add docs/mock-ted-sbrain.md
git commit -m "docs: document ted-sbrain service switching"
```

---

## Self-Review

**Spec coverage:**
- Frontend requests mock service instead of static fixtures: Tasks 1-6.
- Environment-variable switching between mock and real service: Tasks 2, 3, 9.
- `docs/api` as real source contract: Tasks 1, 2, and 8 use existing `services/tedSbrain/types.ts`, endpoint helpers, and mock payload contract checks created from `docs/api`.
- JSON field leakage: Task 7.
- Verification: Task 9.

**Placeholder scan:**
- No `TBD`, `TODO`, “implement later”, or unspecified test steps remain.
- Each code-changing step includes concrete code or exact replacement instructions.

**Type consistency:**
- `VersionDetail`, `MetricItem`, and `MetricGroup` remain imported from `src/data/versionMock.ts` because the UI still uses those established view-model types.
- Backend DTOs remain imported from `src/services/tedSbrain/types.ts`.
- Loaders expose `CollectionLoadState` and `DetailLoadState`; hooks return the same states; pages consume those names consistently.
