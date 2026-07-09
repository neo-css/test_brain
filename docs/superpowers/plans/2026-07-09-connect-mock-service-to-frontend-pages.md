# Connect Mock Service To Frontend Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect all L1/L2/L3 frontend pages to the ted-sbrain mock-compatible API while preserving the existing topology, list, snake-road, and hex/radar controls and showing real API values everywhere values are displayed.

**Architecture:** Keep the existing UI controls and add a ted-sbrain view-model boundary between backend payloads and page components. Add envelope-preserving API helpers, adapter functions that separate raw API scores from derived visual ratios, local React loader hooks, and small additive UI enrichments for risk, schedule, metric evidence, history, recalculation, and audit data. Collection pages use snapshot/page endpoints; L3 detail uses patch score, history, and calculate endpoints.

**Tech Stack:** React 19, Vite 8, TypeScript strict mode, Vitest, existing ted-sbrain API client, React Router, server-rendered component tests via `react-dom/server`.

---

## File Structure

- Modify `src/data/versionMock.ts`: extend shared UI types with `UNKNOWN`, raw/display score fields, schedule fields, test owner fields, audit metadata, history points, missing metric states, and extra metrics while keeping old fixtures usable.
- Modify `src/services/tedSbrain/client.ts`: add envelope-preserving request support without breaking existing `request<T>()`.
- Modify `src/services/tedSbrain/api.ts`: add endpoint helpers that return the response envelope for loaders that need `message` and `criticalProcess`.
- Create `src/services/tedSbrain/versionViewModel.ts`: adapter from `ScoreSnapshot`, `PatchScoreVO`, and history payloads to `VersionDetail`, with fixed six metric slots, extra metric evidence, raw values, and display ratios.
- Create `src/services/tedSbrain/versionViewModel.test.ts`: tests for snapshot/detail mapping, raw values, normalization, missing and extra metrics, `UNKNOWN`, schedule, wrapper metadata, and partial history.
- Create `src/services/tedSbrain/versionLoaders.ts`: collection/detail/history/recalculate loader functions that return stable result objects for pages.
- Create `src/services/tedSbrain/versionLoaders.test.ts`: fake-client tests for success, empty, missing patch, envelope metadata, API failure, partial history, and recalculation.
- Create `src/services/tedSbrain/useTedSbrainVersions.ts`: local React hooks for collection and detail data loading.
- Modify `src/pages/versionListFilters.ts`: include `UNKNOWN`, coordination-field search, and stable risk ordering.
- Modify `src/pages/versionRoadGrouping.ts`: prefer `planedOnlineTime`, then `planedIssueTime`, then `actualTestToTime`; keep date-window evaluation aligned with placement.
- Modify `src/pages/l1DashboardSummary.ts`: include unknown-risk counts and keep priority ordering consistent.
- Modify related tests under `src/pages/*.test.ts`.
- Modify `src/pages/L1DashboardPage.tsx`, `src/pages/VersionListPage.tsx`, `src/pages/VersionRoadPage.tsx`, and `src/pages/VersionDetailPage.tsx`: split each API-backed route into a thin loader container and a pure content/cockpit component so React hooks are never called conditionally after loading/error branches.
- Modify `src/components/VersionOverviewPanel.tsx`: add the `UNKNOWN` risk filter option.
- Modify `src/components/VersionRowCard.tsx`: add compact planned issue/online/snapshot metadata while preserving card layout.
- Modify `src/components/RoadCar.tsx`: enrich hover with planned issue/online, snapshot, owner, status, and raw score.
- Modify `src/components/DynamicTopologyLogic.ts` and `src/components/DynamicTopology.tsx`: allow `UNKNOWN` scanner state, unknown styling, and richer L1 hover with raw version context.
- Modify `src/components/MetricScoreCards.tsx`: preserve the radar, use display ratios for geometry only, keep raw scores in labels/ARIA/title, support missing metric slots, and expose focusable hover evidence.
- Modify `src/pages/VersionListPage.tsx`, `src/pages/VersionRoadPage.tsx`, `src/pages/L1DashboardPage.tsx`, and `src/pages/VersionDetailPage.tsx`: replace direct fixture data with hooks/loaders and render loading/empty/error states.
- Create `src/components/ScoreHistoryPanel.tsx`: compact detail history trend with raw-value labels.
- Create `src/components/AuditDiagnosticPanel.tsx`: collapsible L3 diagnostic section for snapshot/envelope/audit data.
- Modify `src/App.css`: add unknown-risk, loading/error, metric hover, history, audit, and compact schedule styles without changing the main layouts.

## Task 1: View Model Types, Raw Values, And ted-sbrain Adapters

**Files:**
- Modify: `src/data/versionMock.ts`
- Create: `src/services/tedSbrain/versionViewModel.ts`
- Test: `src/services/tedSbrain/versionViewModel.test.ts`

- [ ] **Step 1: Write failing adapter tests**

Create `src/services/tedSbrain/versionViewModel.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { PatchScoreVO, ScoreSnapshot, TedSbrainResponse } from './types';
import {
  EXPECTED_METRIC_CODES,
  mapPatchScoreToVersionDetail,
  mapScoreHistory,
  mapScoreSnapshotToVersionDetail,
  mapTedSbrainEnvelopeMeta,
} from './versionViewModel';

function snapshot(overrides: Partial<ScoreSnapshot> = {}): ScoreSnapshot {
  return {
    id: 'snapshot-9001-latest',
    patchId: 9001,
    totalScore: 118.5,
    qualityScore: 92.35,
    behaviorScore: 78.25,
    riskLevel: 'UNKNOWN',
    snapshotsTs: '2026-07-08T10:30:00',
    summary: '支付核心 v9.1 风险评估',
    status: '测试中',
    releaseType: '迭代发布',
    description: '版本描述来自接口',
    sysId: 'PAY',
    systemName: '支付核心系统',
    systemKeyId: 90001,
    systemLevel: '核心系统',
    teamName: '支付质量组',
    patchOwner: '赵六',
    patchOwnerId: 'u-zhaoliu',
    testLeader: '钱七',
    testLeaderAccount: 'qianqi',
    devLeader: '孙八',
    devLeaderAccount: 'sunba',
    testOwner: '周九',
    testOwnerUserId: 'u-zhoujiu',
    testOwnerGroup: '支付测试组',
    planedTestFromTime: '2026-07-01 09:00:00',
    planedTestToTime: '2026-07-05 18:00:00',
    planedIssueTime: '2026-07-09 18:00:00',
    planedOnlineTime: '2026-07-10 21:00:00',
    auditTime: '2026-07-08 11:00:00',
    createTs: '2026-07-08 09:00:00',
    updateTs: '2026-07-08 11:00:00',
    creator: 'mock-service',
    creatorId: 'svc-1',
    updater: 'score-engine',
    updaterId: 'svc-2',
    ...overrides,
  };
}

function patchScore(overrides: Partial<PatchScoreVO> = {}): PatchScoreVO {
  const base = snapshot();
  return {
    ...base,
    metrics: [
      {
        metricCode: 'CHANGES_RISK',
        metricName: '版本变更风险',
        phase: 'ADMISSION',
        phaseName: '准入阶段',
        dataDimension: 'CHANGE',
        dataDimensionName: '变更相关',
        evalTarget: 'VERSION_QUALITY',
        evalTargetName: '版本质量',
        calcScore: 132.25,
        actualScore: 128.75,
        riskLevel: 'HIGH',
        features: { changedFiles: 42, scoreBasis: '大范围改动' },
        description: '真实评分依据',
        detailUrl: 'https://example.test/metric/CHANGES_RISK',
      },
      {
        metricCode: 'EXTRA_BACKEND_ONLY',
        metricName: '后端额外指标',
        phase: 'POST_TEST',
        phaseName: '测后阶段',
        dataDimension: 'RUNTIME',
        dataDimensionName: '运行相关',
        evalTarget: 'SERVICE',
        evalTargetName: '服务',
        calcScore: 61,
        actualScore: 60,
        riskLevel: 'MEDIUM',
        features: { p95: 230 },
        description: '额外指标不能撑破雷达',
        detailUrl: '',
      },
    ],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
    ...overrides,
  };
}

describe('ted-sbrain view model adapters', () => {
  it('maps snapshot fields without losing real API values', () => {
    const version = mapScoreSnapshotToVersionDetail(snapshot());

    expect(version.patchId).toBe(9001);
    expect(version.totalScore).toBe(118.5);
    expect(version.qualityScore).toBe(92.35);
    expect(version.behaviorScore).toBe(78.25);
    expect(version.riskLevel).toBe('UNKNOWN');
    expect(version.subNamedSystemName).toBe('支付核心系统');
    expect(version.description).toBe('版本描述来自接口');
    expect(version.testOwner).toBe('周九');
    expect(version.testOwnerGroup).toBe('支付测试组');
    expect(version.planedIssueTime).toBe('2026-07-09 18:00:00');
    expect(version.planedOnlineTime).toBe('2026-07-10 21:00:00');
    expect(version.audit?.snapshotId).toBe('snapshot-9001-latest');
  });

  it('keeps six radar slots, stores extra metrics, and separates raw scores from display ratios', () => {
    const version = mapPatchScoreToVersionDetail(patchScore());
    const first = version.metrics[0];

    expect(version.metrics.map((metric) => metric.metricCode)).toEqual(EXPECTED_METRIC_CODES);
    expect(first.metricCode).toBe('CHANGES_RISK');
    expect(first.actualScore).toBe(128.75);
    expect(first.calcScore).toBe(132.25);
    expect(first.displayScoreRatio).toBeGreaterThan(0);
    expect(first.displayScoreRatio).toBeLessThanOrEqual(1);
    expect(first.description).toBe('真实评分依据');
    expect(first.features?.changedFiles).toBe(42);
    expect(version.metrics.some((metric) => metric.isMissing)).toBe(true);
    expect(version.extraMetrics?.map((metric) => metric.metricCode)).toEqual(['EXTRA_BACKEND_ONLY']);
  });

  it('maps partial history points from raw values without requiring metrics', () => {
    const history = mapScoreHistory([
      { patchId: 9001, totalScore: 77.7, qualityScore: 66.6, behaviorScore: 55.5, riskLevel: 'LOW', snapshotsTs: '2026-07-07T09:00:00' },
      { patchId: 9001, totalScore: 118.5, riskLevel: 'UNKNOWN', snapshotsTs: '2026-07-08T09:00:00' },
    ]);

    expect(history).toEqual([
      {
        patchId: 9001,
        totalScore: 77.7,
        qualityScore: 66.6,
        behaviorScore: 55.5,
        riskLevel: 'LOW',
        snapshotsTs: '2026-07-07T09:00:00',
      },
      {
        patchId: 9001,
        totalScore: 118.5,
        qualityScore: undefined,
        behaviorScore: undefined,
        riskLevel: 'UNKNOWN',
        snapshotsTs: '2026-07-08T09:00:00',
      },
    ]);
  });

  it('preserves response envelope metadata for diagnostics', () => {
    const envelope: TedSbrainResponse<ScoreSnapshot[]> = {
      result: true,
      message: 'mock ok',
      data: [snapshot()],
      criticalProcess: { traceId: 'trace-1' },
    };

    expect(mapTedSbrainEnvelopeMeta(envelope)).toEqual({
      message: 'mock ok',
      criticalProcess: { traceId: 'trace-1' },
    });
  });
});
```

- [ ] **Step 2: Run adapter tests and verify they fail**

Run: `npm test -- src/services/tedSbrain/versionViewModel.test.ts`

Expected: FAIL with `Cannot find module './versionViewModel'`.

- [ ] **Step 3: Extend UI types while preserving fixture compatibility**

Modify the top type section of `src/data/versionMock.ts` to match this shape:

```ts
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export const RISK_WEIGHT: Record<RiskLevel, number> = {
  HIGH: 4,
  UNKNOWN: 3,
  MEDIUM: 2,
  LOW: 1,
};

export type MetricFeatureValue =
  | string
  | number
  | boolean
  | null
  | MetricFeatureValue[]
  | { [key: string]: MetricFeatureValue };

export interface MetricItem {
  metricCode: string;
  metricName: string;
  phase?: string;
  phaseName?: string;
  dataDimension?: string;
  dataDimensionName?: string;
  evalTarget?: string;
  evalTargetName?: string;
  calcScore: number;
  actualScore: number;
  displayScoreRatio?: number;
  riskLevel?: RiskLevel;
  features?: Record<string, MetricFeatureValue>;
  description?: string;
  detailUrl?: string;
  isMissing?: boolean;
}

export interface MetricGroup {
  key: string;
  displayName: string;
  groupScore: number;
  metrics: Pick<MetricItem, 'metricCode' | 'metricName' | 'calcScore' | 'actualScore' | 'description'>[];
}

export interface ScoreHistoryPoint {
  patchId: number;
  totalScore: number;
  qualityScore?: number;
  behaviorScore?: number;
  riskLevel: RiskLevel;
  snapshotsTs: string;
}

export interface VersionAuditMeta {
  snapshotId?: string;
  createTs?: string;
  updateTs?: string;
  creator?: string;
  creatorId?: string;
  updater?: string;
  updaterId?: string;
  message?: string;
  criticalProcess?: Record<string, unknown>;
}

export type ReleaseDateSource = 'PLANED_ONLINE' | 'PLANED_ISSUE' | 'ACTUAL_TEST_TO' | 'PLANED_TEST_TO' | 'NONE';

export interface VersionDetail {
  patchId: number;
  totalScore: number;
  qualityScore: number;
  behaviorScore: number;
  riskLevel: RiskLevel;
  snapshotsTs: string;
  sysId: string;
  subNamedSystemName: string;
  systemKeyId: number;
  systemLevel: string;
  teamName: string;
  patchOwner: string;
  patchOwnerAccount: string;
  testLeader: string;
  testLeaderAccount: string;
  devLeader: string;
  devLeaderAccount: string;
  testOwner?: string;
  testOwnerUserId?: string;
  testOwnerGroup?: string;
  actualSubmitTestTime: string;
  actualTestFromTime: string;
  actualTestToTime: string;
  planedTestFromTime: string;
  planedTestToTime: string;
  planedIssueTime?: string;
  planedOnlineTime?: string;
  selectedReleaseDate?: string;
  selectedReleaseDateSource?: ReleaseDateSource;
  auditTime: string;
  summary: string;
  description?: string;
  status: string;
  releaseType: string;
  metrics: MetricItem[];
  extraMetrics?: MetricItem[];
  byPhase: MetricGroup[];
  byDataDimension: MetricGroup[];
  byEvalTarget: MetricGroup[];
  history?: ScoreHistoryPoint[];
  audit?: VersionAuditMeta;
}
```

Also update `riskLabel` in the same file:

```ts
export function riskLabel(riskLevel: RiskLevel | string) {
  if (riskLevel === 'HIGH') return '高风险';
  if (riskLevel === 'MEDIUM') return '中风险';
  if (riskLevel === 'LOW') return '低风险';
  if (riskLevel === 'UNKNOWN') return '未知风险';
  return '未知风险';
}
```

- [ ] **Step 4: Implement the adapter module**

Create `src/services/tedSbrain/versionViewModel.ts`:

```ts
import type {
  MetricFeatureValue,
  MetricGroup,
  MetricItem,
  RiskLevel as UiRiskLevel,
  ScoreHistoryPoint,
  VersionAuditMeta,
  VersionDetail,
} from '../../data/versionMock';
import type { GroupVO, MetricVO, PatchScoreVO, RiskLevel, ScoreSnapshot, TedSbrainResponse } from './types';

export const EXPECTED_METRIC_CODES = [
  'CHANGES_RISK',
  'CASE_REVIEW_TIMELINESS',
  'DEFECT_RISK',
  'SMART_TEST',
  'COVERAGE_390',
  'COVERAGE_FUNCTION',
] as const;

const METRIC_LABELS: Record<(typeof EXPECTED_METRIC_CODES)[number], string> = {
  CHANGES_RISK: '版本变更风险',
  CASE_REVIEW_TIMELINESS: '案例评审时效',
  DEFECT_RISK: '版本缺陷风险',
  SMART_TEST: '智能测试渗透率',
  COVERAGE_390: '390回归测试覆盖率',
  COVERAGE_FUNCTION: '变更函数测试覆盖率',
};

export interface TedSbrainEnvelopeMeta {
  message?: string;
  criticalProcess?: Record<string, unknown>;
}

function risk(value: RiskLevel | undefined): UiRiskLevel {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW' || value === 'UNKNOWN' ? value : 'UNKNOWN';
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function scoreRatio(value: number, scale = 100) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value / scale));
}

function datePart(value?: string) {
  return (value || '').slice(0, 10);
}

function selectReleaseDate(snapshot: Pick<ScoreSnapshot, 'planedOnlineTime' | 'planedIssueTime' | 'planedTestToTime'>) {
  if (datePart(snapshot.planedOnlineTime)) {
    return { selectedReleaseDate: datePart(snapshot.planedOnlineTime), selectedReleaseDateSource: 'PLANED_ONLINE' as const };
  }
  if (datePart(snapshot.planedIssueTime)) {
    return { selectedReleaseDate: datePart(snapshot.planedIssueTime), selectedReleaseDateSource: 'PLANED_ISSUE' as const };
  }
  if (datePart(snapshot.planedTestToTime)) {
    return { selectedReleaseDate: datePart(snapshot.planedTestToTime), selectedReleaseDateSource: 'PLANED_TEST_TO' as const };
  }
  return { selectedReleaseDate: undefined, selectedReleaseDateSource: 'NONE' as const };
}

function mapMetric(metric: MetricVO): MetricItem {
  return {
    metricCode: metric.metricCode,
    metricName: text(metric.metricName, metric.metricCode),
    phase: metric.phase,
    phaseName: text(metric.phaseName, '未知阶段'),
    dataDimension: metric.dataDimension,
    dataDimensionName: text(metric.dataDimensionName, '未知维度'),
    evalTarget: metric.evalTarget,
    evalTargetName: text(metric.evalTargetName, '未知目标'),
    calcScore: metric.calcScore,
    actualScore: metric.actualScore,
    displayScoreRatio: scoreRatio(metric.actualScore),
    riskLevel: risk(metric.riskLevel),
    features: metric.features as Record<string, MetricFeatureValue>,
    description: metric.description,
    detailUrl: metric.detailUrl,
  };
}

function missingMetric(metricCode: (typeof EXPECTED_METRIC_CODES)[number]): MetricItem {
  return {
    metricCode,
    metricName: METRIC_LABELS[metricCode],
    calcScore: 0,
    actualScore: 0,
    displayScoreRatio: 0,
    riskLevel: 'UNKNOWN',
    description: '接口未返回该指标',
    features: {},
    isMissing: true,
  };
}

function mapGroup(group: GroupVO): MetricGroup {
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

export function mapTedSbrainEnvelopeMeta(envelope: Pick<TedSbrainResponse<unknown>, 'message' | 'criticalProcess'>): TedSbrainEnvelopeMeta {
  return {
    message: envelope.message,
    criticalProcess: envelope.criticalProcess,
  };
}

function auditFromSnapshot(snapshot: ScoreSnapshot, meta?: TedSbrainEnvelopeMeta): VersionAuditMeta {
  return {
    snapshotId: snapshot.id,
    createTs: snapshot.createTs,
    updateTs: snapshot.updateTs,
    creator: snapshot.creator,
    creatorId: snapshot.creatorId,
    updater: snapshot.updater,
    updaterId: snapshot.updaterId,
    message: meta?.message,
    criticalProcess: meta?.criticalProcess,
  };
}

export function mapScoreSnapshotToVersionDetail(snapshot: ScoreSnapshot, meta?: TedSbrainEnvelopeMeta): VersionDetail {
  const releaseDate = selectReleaseDate(snapshot);

  return {
    patchId: snapshot.patchId,
    totalScore: snapshot.totalScore,
    qualityScore: snapshot.qualityScore,
    behaviorScore: snapshot.behaviorScore,
    riskLevel: risk(snapshot.riskLevel),
    snapshotsTs: snapshot.snapshotsTs,
    sysId: snapshot.sysId,
    subNamedSystemName: text(snapshot.systemName, snapshot.sysId),
    systemKeyId: snapshot.systemKeyId,
    systemLevel: snapshot.systemLevel,
    teamName: snapshot.teamName,
    patchOwner: snapshot.patchOwner,
    patchOwnerAccount: snapshot.patchOwnerId,
    testLeader: snapshot.testLeader,
    testLeaderAccount: snapshot.testLeaderAccount,
    devLeader: snapshot.devLeader,
    devLeaderAccount: snapshot.devLeaderAccount,
    testOwner: snapshot.testOwner,
    testOwnerUserId: snapshot.testOwnerUserId,
    testOwnerGroup: snapshot.testOwnerGroup,
    actualSubmitTestTime: '',
    actualTestFromTime: '',
    actualTestToTime: '',
    planedTestFromTime: snapshot.planedTestFromTime,
    planedTestToTime: snapshot.planedTestToTime,
    planedIssueTime: snapshot.planedIssueTime,
    planedOnlineTime: snapshot.planedOnlineTime,
    selectedReleaseDate: releaseDate.selectedReleaseDate,
    selectedReleaseDateSource: releaseDate.selectedReleaseDateSource,
    auditTime: snapshot.auditTime,
    summary: snapshot.summary,
    description: snapshot.description,
    status: snapshot.status,
    releaseType: snapshot.releaseType,
    metrics: EXPECTED_METRIC_CODES.map(missingMetric),
    extraMetrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
    audit: auditFromSnapshot(snapshot, meta),
  };
}

export function mapPatchScoreToVersionDetail(score: PatchScoreVO, meta?: TedSbrainEnvelopeMeta): VersionDetail {
  const metricMap = new Map(score.metrics.map((metric) => [metric.metricCode, metric]));
  const fixedMetrics = EXPECTED_METRIC_CODES.map((metricCode) => {
    const metric = metricMap.get(metricCode);
    return metric ? mapMetric(metric) : missingMetric(metricCode);
  });
  const extraMetrics = score.metrics
    .filter((metric) => !EXPECTED_METRIC_CODES.includes(metric.metricCode as (typeof EXPECTED_METRIC_CODES)[number]))
    .map(mapMetric);

  return {
    ...mapScoreSnapshotToVersionDetail({ ...score, id: '', createTs: '', updateTs: '', creator: '', creatorId: '', updater: '', updaterId: '' }, meta),
    metrics: fixedMetrics,
    extraMetrics,
    byPhase: score.byPhase.map(mapGroup),
    byDataDimension: score.byDataDimension.map(mapGroup),
    byEvalTarget: score.byEvalTarget.map(mapGroup),
    audit: {
      message: meta?.message,
      criticalProcess: meta?.criticalProcess,
    },
  };
}

export function mapScoreHistory(points: Array<Partial<PatchScoreVO> & { patchId: number; totalScore: number; riskLevel: RiskLevel; snapshotsTs: string }>): ScoreHistoryPoint[] {
  return points.map((point) => ({
    patchId: point.patchId,
    totalScore: point.totalScore,
    qualityScore: point.qualityScore,
    behaviorScore: point.behaviorScore,
    riskLevel: risk(point.riskLevel),
    snapshotsTs: point.snapshotsTs,
  }));
}
```

- [ ] **Step 5: Run adapter tests and typecheck**

Run: `npm test -- src/services/tedSbrain/versionViewModel.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: FAIL only if existing code now rejects `UNKNOWN` or missing new optional fields; use the next tasks to address those compile errors.

- [ ] **Step 6: Commit**

```bash
git add src/data/versionMock.ts src/services/tedSbrain/versionViewModel.ts src/services/tedSbrain/versionViewModel.test.ts
git commit -m "feat: map ted-sbrain payloads to frontend view models"
```

## Task 2: Envelope-Preserving Client And Loader Result Shapes

**Files:**
- Modify: `src/services/tedSbrain/client.ts`
- Modify: `src/services/tedSbrain/api.ts`
- Create: `src/services/tedSbrain/versionLoaders.ts`
- Test: `src/services/tedSbrain/client.test.ts`
- Test: `src/services/tedSbrain/versionLoaders.test.ts`

- [ ] **Step 1: Add failing client envelope test**

Append to `src/services/tedSbrain/client.test.ts`:

```ts
it('can return the full response envelope when diagnostics need wrapper metadata', async () => {
  const fetcher = vi.fn(async () =>
    new Response(JSON.stringify({
      result: true,
      message: 'mock envelope preserved',
      data: { patchId: 123 },
      criticalProcess: { traceId: 'trace-123' },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  const client = createTedSbrainClient({ baseUrl: 'http://localhost:49152', fetcher });

  await expect(client.requestEnvelope<{ patchId: number }>('/metric/patches/123/score')).resolves.toEqual({
    result: true,
    message: 'mock envelope preserved',
    data: { patchId: 123 },
    criticalProcess: { traceId: 'trace-123' },
  });
});
```

- [ ] **Step 2: Run the focused client test and verify failure**

Run: `npm test -- src/services/tedSbrain/client.test.ts`

Expected: FAIL with `Property 'requestEnvelope' does not exist`.

- [ ] **Step 3: Implement `requestEnvelope` without breaking `request`**

Modify `src/services/tedSbrain/client.ts`:

```ts
export interface TedSbrainClient {
  request<T>(path: string, options?: TedSbrainRequestOptions): Promise<T>;
  requestEnvelope<T>(path: string, options?: TedSbrainRequestOptions): Promise<TedSbrainResponse<T>>;
}

export async function parseResponseEnvelope<T>(response: Response): Promise<TedSbrainResponse<T>> {
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

  return payload;
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await parseResponseEnvelope<T>(response);
  return payload.data;
}

export function createTedSbrainClient(options: TedSbrainClientOptions = {}): TedSbrainClient {
  const baseUrl = options.baseUrl ?? getTedSbrainApiBaseUrl();
  const fetcher = options.fetcher ?? ((input, init) => fetch(input, init));

  async function execute(path: string, requestOptions: TedSbrainRequestOptions = {}) {
    const url = appendQuery(buildTedSbrainUrl(baseUrl, path), requestOptions.query);
    return fetcher(url, buildRequestInit(requestOptions));
  }

  return {
    async request<T>(path: string, requestOptions: TedSbrainRequestOptions = {}): Promise<T> {
      return parseResponse<T>(await execute(path, requestOptions));
    },
    async requestEnvelope<T>(path: string, requestOptions: TedSbrainRequestOptions = {}): Promise<TedSbrainResponse<T>> {
      return parseResponseEnvelope<T>(await execute(path, requestOptions));
    },
  };
}
```

- [ ] **Step 4: Add envelope API helpers**

Append to `src/services/tedSbrain/api.ts`:

```ts
import type { TedSbrainResponse } from './types';

export function fetchPatchScoreEnvelope(
  patchId: number,
  client: TedSbrainClient = tedSbrainClient,
): Promise<TedSbrainResponse<PatchScoreVO>> {
  return client.requestEnvelope<PatchScoreVO>(`/metric/patches/${patchId}/score`);
}

export function calculatePatchScoreEnvelope(
  patchId: number,
  client: TedSbrainClient = tedSbrainClient,
): Promise<TedSbrainResponse<PatchScoreVO>> {
  return client.requestEnvelope<PatchScoreVO>(`/metric/patches/${patchId}/score/calculate`, {
    method: 'POST',
  });
}

export function fetchPatchScoreHistoryEnvelope(
  patchId: number,
  client: TedSbrainClient = tedSbrainClient,
): Promise<TedSbrainResponse<PatchScoreVO[]>> {
  return client.requestEnvelope<PatchScoreVO[]>(`/metric/patches/${patchId}/score/history`);
}

export function fetchLatestTodayScoreSnapshotsEnvelope(
  params: ScoreSnapshotFilters & { page?: number; pageSize?: number } = {},
  client: TedSbrainClient = tedSbrainClient,
): Promise<TedSbrainResponse<ScoreSnapshotPage>> {
  return client.requestEnvelope<ScoreSnapshotPage>('/scoreSnapshot/queryLatestToday', {
    query: params,
  });
}
```

If TypeScript complains about duplicate imports, merge `TedSbrainResponse` into the existing type import at the top.

- [ ] **Step 5: Write failing loader tests**

Create `src/services/tedSbrain/versionLoaders.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import type { TedSbrainClient } from './client';
import { TedSbrainApiError } from './client';
import type { TedSbrainResponse } from './types';
import { loadCollectionVersions, loadPatchDetail, recalculatePatchDetail } from './versionLoaders';

function clientWith(dataByPath: Record<string, unknown>, failPath?: string): TedSbrainClient {
  return {
    async request() {
      throw new Error('loaders must use requestEnvelope to preserve metadata');
    },
    async requestEnvelope<T>(path: string): Promise<TedSbrainResponse<T>> {
      if (path === failPath) {
        throw new TedSbrainApiError('patch not found', 404, false, null);
      }
      const data = dataByPath[path];
      if (!data) throw new Error(`unexpected path ${path}`);
      return data as TedSbrainResponse<T>;
    },
  };
}

const snapshotEnvelope = {
  result: true,
  message: 'collection ok',
  criticalProcess: { traceId: 'collection-1' },
  data: {
    records: [],
    total: 0,
    size: 20,
    current: 1,
    pages: 0,
  },
};

describe('version loaders', () => {
  it('maps empty collection responses to an empty success state with envelope metadata', async () => {
    const state = await loadCollectionVersions(clientWith({
      '/scoreSnapshot/queryLatestToday': snapshotEnvelope,
    }));

    expect(state).toEqual({
      status: 'success',
      versions: [],
      meta: { message: 'collection ok', criticalProcess: { traceId: 'collection-1' } },
    });
  });

  it('maps missing patch failures to not-found states', async () => {
    const state = await loadPatchDetail(999, clientWith({}, '/metric/patches/999/score'));

    expect(state.status).toBe('not-found');
  });

  it('calls calculate endpoint and reloads current detail and history', async () => {
    const requestEnvelope = vi.fn(async (path: string) => {
      if (path.endsWith('/score/calculate')) {
        return { result: true, message: 'calculated', criticalProcess: {}, data: patchPayload(71) };
      }
      if (path.endsWith('/score/history')) {
        return { result: true, message: 'history', criticalProcess: {}, data: [patchPayload(64), patchPayload(71)] };
      }
      return { result: true, message: 'detail', criticalProcess: {}, data: patchPayload(71) };
    });
    const client = { request: vi.fn(), requestEnvelope } as unknown as TedSbrainClient;

    const state = await recalculatePatchDetail(123, client);

    expect(state.status).toBe('success');
    if (state.status === 'success') {
      expect(state.version.totalScore).toBe(71);
      expect(state.version.history?.map((point) => point.totalScore)).toEqual([64, 71]);
    }
    expect(requestEnvelope).toHaveBeenCalledWith('/metric/patches/123/score/calculate', { method: 'POST' });
  });
});

function patchPayload(totalScore: number) {
  return {
    patchId: 123,
    totalScore,
    qualityScore: 3,
    behaviorScore: 4,
    riskLevel: 'LOW',
    snapshotsTs: '2026-07-08T10:00:00',
    summary: '版本',
    status: '测试中',
    releaseType: '迭代发布',
    description: '',
    sysId: 'TED',
    systemName: '测试大脑',
    systemKeyId: 1,
    systemLevel: 'L4',
    teamName: '质量组',
    patchOwner: '张三',
    patchOwnerId: 'zhangsan',
    testLeader: '李四',
    testLeaderAccount: 'lisi',
    devLeader: '王五',
    devLeaderAccount: 'wangwu',
    testOwner: '赵六',
    testOwnerUserId: 'zhaoliu',
    testOwnerGroup: '测试组',
    planedTestFromTime: '2026-07-01 09:00:00',
    planedTestToTime: '2026-07-05 18:00:00',
    planedIssueTime: '2026-07-08 18:00:00',
    planedOnlineTime: '2026-07-09 21:00:00',
    auditTime: '2026-07-08 11:00:00',
    metrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
  };
}
```

- [ ] **Step 6: Implement loader result objects**

Create `src/services/tedSbrain/versionLoaders.ts`:

```ts
import {
  calculatePatchScoreEnvelope,
  fetchLatestTodayScoreSnapshotsEnvelope,
  fetchPatchScoreEnvelope,
  fetchPatchScoreHistoryEnvelope,
} from './api';
import type { TedSbrainClient } from './client';
import { TedSbrainApiError, tedSbrainClient } from './client';
import type { VersionDetail } from '../../data/versionMock';
import {
  mapPatchScoreToVersionDetail,
  mapScoreHistory,
  mapScoreSnapshotToVersionDetail,
  mapTedSbrainEnvelopeMeta,
  type TedSbrainEnvelopeMeta,
} from './versionViewModel';

export type CollectionLoadState =
  | { status: 'success'; versions: VersionDetail[]; meta?: TedSbrainEnvelopeMeta }
  | { status: 'error'; message: string; error: unknown };

export type DetailLoadState =
  | { status: 'success'; version: VersionDetail; meta?: TedSbrainEnvelopeMeta }
  | { status: 'not-found'; message: string }
  | { status: 'error'; message: string; error: unknown };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'ted-sbrain API 请求失败';
}

function isNotFound(error: unknown) {
  return error instanceof TedSbrainApiError && error.status === 404;
}

export async function loadCollectionVersions(client: TedSbrainClient = tedSbrainClient): Promise<CollectionLoadState> {
  try {
    const envelope = await fetchLatestTodayScoreSnapshotsEnvelope({}, client);
    const meta = mapTedSbrainEnvelopeMeta(envelope);
    return {
      status: 'success',
      versions: envelope.data.records.map((record) => mapScoreSnapshotToVersionDetail(record, meta)),
      meta,
    };
  } catch (error) {
    return { status: 'error', message: errorMessage(error), error };
  }
}

export async function loadPatchDetail(patchId: number, client: TedSbrainClient = tedSbrainClient): Promise<DetailLoadState> {
  try {
    const [detailEnvelope, historyEnvelope] = await Promise.all([
      fetchPatchScoreEnvelope(patchId, client),
      fetchPatchScoreHistoryEnvelope(patchId, client).catch(() => undefined),
    ]);
    const meta = mapTedSbrainEnvelopeMeta(detailEnvelope);
    const version = mapPatchScoreToVersionDetail(detailEnvelope.data, meta);
    if (historyEnvelope) version.history = mapScoreHistory(historyEnvelope.data);
    return { status: 'success', version, meta };
  } catch (error) {
    if (isNotFound(error)) return { status: 'not-found', message: errorMessage(error) };
    return { status: 'error', message: errorMessage(error), error };
  }
}

export async function recalculatePatchDetail(patchId: number, client: TedSbrainClient = tedSbrainClient): Promise<DetailLoadState> {
  try {
    await calculatePatchScoreEnvelope(patchId, client);
    return loadPatchDetail(patchId, client);
  } catch (error) {
    if (isNotFound(error)) return { status: 'not-found', message: errorMessage(error) };
    return { status: 'error', message: errorMessage(error), error };
  }
}
```

- [ ] **Step 7: Run focused tests**

Run: `npm test -- src/services/tedSbrain/client.test.ts src/services/tedSbrain/versionLoaders.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/services/tedSbrain/client.ts src/services/tedSbrain/api.ts src/services/tedSbrain/client.test.ts src/services/tedSbrain/versionLoaders.ts src/services/tedSbrain/versionLoaders.test.ts
git commit -m "feat: preserve ted-sbrain envelopes in loaders"
```

## Task 3: Shared Risk, Search, Road Date, And Summary Helpers

**Files:**
- Modify: `src/pages/versionListFilters.ts`
- Modify: `src/pages/versionRoadGrouping.ts`
- Modify: `src/pages/l1DashboardSummary.ts`
- Modify: `src/components/DynamicTopologyLogic.ts`
- Test: `src/pages/versionListFilters.test.ts`
- Test: `src/pages/versionRoadGrouping.test.ts`
- Test: `src/pages/l1DashboardSummary.test.ts`
- Test: `src/components/DynamicTopology.test.ts`

- [ ] **Step 1: Add failing helper tests**

Update `src/pages/versionListFilters.test.ts`:

```ts
it('supports UNKNOWN as a first-class risk filter and count', () => {
  const unknownVersion = makeVersion({ patchId: 4, totalScore: 90, riskLevel: 'UNKNOWN' });
  const all = [...versions, unknownVersion];

  expect(filterAndSortVersions(all, { query: '', risk: 'UNKNOWN', status: 'ALL', sort: 'RISK' }).map((version) => version.patchId)).toEqual([4]);
  expect(summarizeRiskCounts(all)).toEqual({ HIGH: 1, UNKNOWN: 1, MEDIUM: 1, LOW: 1 });
});

it('orders HIGH before UNKNOWN before MEDIUM before LOW for risk sorting', () => {
  const all = [
    makeVersion({ patchId: 1, totalScore: 99, riskLevel: 'LOW' }),
    makeVersion({ patchId: 2, totalScore: 60, riskLevel: 'MEDIUM' }),
    makeVersion({ patchId: 3, totalScore: 88, riskLevel: 'UNKNOWN' }),
    makeVersion({ patchId: 4, totalScore: 70, riskLevel: 'HIGH' }),
  ];

  expect(filterAndSortVersions(all, { query: '', risk: 'ALL', status: 'ALL', sort: 'RISK' }).map((version) => version.patchId)).toEqual([4, 3, 2, 1]);
});

it('searches coordination and audit fields that may not be shown by default', () => {
  const target = makeVersion({
    patchId: 5,
    patchOwnerAccount: 'owner-account',
    testOwner: '测试执行人',
    testOwnerGroup: '核心测试组',
    sysId: 'SYS-X',
    audit: { snapshotId: 'snapshot-search-id' },
  });

  expect(filterAndSortVersions([target], { query: '核心测试组', risk: 'ALL', status: 'ALL', sort: 'RISK' })).toHaveLength(1);
  expect(filterAndSortVersions([target], { query: 'snapshot-search-id', risk: 'ALL', status: 'ALL', sort: 'RISK' })).toHaveLength(1);
});
```

Update `src/pages/versionRoadGrouping.test.ts`:

```ts
it('prefers planned online date, then planned issue date, then actual test end date', () => {
  expect(getReleaseDate(makeVersion({
    planedOnlineTime: '2026-07-10 21:00:00',
    planedIssueTime: '2026-07-09 18:00:00',
    actualTestToTime: '2026-07-08 18:00:00',
  }))).toBe('2026-07-10');

  expect(getReleaseDate(makeVersion({
    planedOnlineTime: '',
    planedIssueTime: '2026-07-09 18:00:00',
    actualTestToTime: '2026-07-08 18:00:00',
  }))).toBe('2026-07-09');

  expect(getReleaseDate(makeVersion({
    planedOnlineTime: '',
    planedIssueTime: '',
    actualTestToTime: '2026-07-08 18:00:00',
  }))).toBe('2026-07-08');
});
```

Update `src/pages/l1DashboardSummary.test.ts`:

```ts
it('includes unknown risk counts in L1 summaries', () => {
  const summary = buildL1DashboardSummary([
    makeVersion({ patchId: 1, riskLevel: 'HIGH', totalScore: 60 }),
    makeVersion({ patchId: 2, riskLevel: 'UNKNOWN', totalScore: 95 }),
    makeVersion({ patchId: 3, riskLevel: 'LOW', totalScore: 99 }),
  ]);

  expect(summary.riskCounts).toEqual({ HIGH: 1, UNKNOWN: 1, MEDIUM: 0, LOW: 1 });
  expect(summary.priorityVersions.map((version) => version.patchId)).toEqual([1, 2, 3]);
});
```

Update `src/components/DynamicTopology.test.ts`:

```ts
import { buildTopologyTipRows } from './DynamicTopologyLogic';

it('builds L1 topology hover rows with real version context', () => {
  const rows = buildTopologyTipRows(makeVersion({
    patchId: 9001,
    sysId: 'PAY',
    subNamedSystemName: '支付核心系统',
    riskLevel: 'UNKNOWN',
    totalScore: 118.5,
    status: '测试中',
    patchOwner: '赵六',
    patchOwnerAccount: 'zhaoliu',
    snapshotsTs: '2026-07-08T10:30:00',
    planedIssueTime: '2026-07-09 18:00:00',
    planedOnlineTime: '2026-07-10 21:00:00',
  }));

  expect(rows.title).toBe('支付核心系统');
  expect(rows.items).toContain('PAY / 补丁 #9001');
  expect(rows.items).toContain('风险 UNKNOWN / 总分 118.5');
  expect(rows.items).toContain('状态 测试中');
  expect(rows.items).toContain('负责人 赵六 / zhaoliu');
  expect(rows.items).toContain('快照 2026-07-08 10:30');
  expect(rows.items).toContain('计划发版 2026-07-09 18:00');
  expect(rows.items).toContain('计划上线 2026-07-10 21:00');
});
```

- [ ] **Step 2: Run helper tests and verify failure**

Run: `npm test -- src/pages/versionListFilters.test.ts src/pages/versionRoadGrouping.test.ts src/pages/l1DashboardSummary.test.ts src/components/DynamicTopology.test.ts`

Expected: FAIL because `UNKNOWN` is not accepted, road dates still use `actualTestToTime`, and `buildTopologyTipRows()` does not exist yet.

- [ ] **Step 3: Implement risk/search updates**

Modify `src/pages/versionListFilters.ts`:

```ts
import { RISK_WEIGHT, VersionDetail } from '../data/versionMock';

export type RiskFilter = 'ALL' | 'HIGH' | 'UNKNOWN' | 'MEDIUM' | 'LOW';
export type StatusFilter = 'ALL' | string;
export type VersionSort = 'RISK' | 'SCORE_ASC' | 'SCORE_DESC' | 'LATEST';

function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function matchesQuery(version: VersionDetail, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  return [
    version.patchId,
    version.summary,
    version.description,
    version.sysId,
    version.subNamedSystemName,
    version.teamName,
    version.patchOwner,
    version.patchOwnerAccount,
    version.testLeader,
    version.testLeaderAccount,
    version.devLeader,
    version.devLeaderAccount,
    version.testOwner,
    version.testOwnerUserId,
    version.testOwnerGroup,
    version.systemKeyId,
    version.audit?.snapshotId,
  ].some((field) => normalize(field).includes(normalizedQuery));
}

function compareByRisk(first: VersionDetail, second: VersionDetail) {
  const riskDiff = (RISK_WEIGHT[second.riskLevel] ?? 0) - (RISK_WEIGHT[first.riskLevel] ?? 0);
  if (riskDiff !== 0) return riskDiff;
  return first.totalScore - second.totalScore;
}

export function filterAndSortVersions(versions: VersionDetail[], filters: VersionListFilters) {
  const filtered = versions.filter((version) => {
    const riskMatches = filters.risk === 'ALL' || version.riskLevel === filters.risk;
    const statusMatches = filters.status === 'ALL' || version.status === filters.status;
    return riskMatches && statusMatches && matchesQuery(version, filters.query);
  });

  return [...filtered].sort((first, second) => {
    if (filters.sort === 'SCORE_ASC') return first.totalScore - second.totalScore;
    if (filters.sort === 'SCORE_DESC') return second.totalScore - first.totalScore;
    if (filters.sort === 'LATEST') return Date.parse(second.snapshotsTs) - Date.parse(first.snapshotsTs);
    return compareByRisk(first, second);
  });
}

export function summarizeRiskCounts(versions: VersionDetail[]) {
  return versions.reduce(
    (counts, version) => {
      if (version.riskLevel === 'HIGH' || version.riskLevel === 'UNKNOWN' || version.riskLevel === 'MEDIUM' || version.riskLevel === 'LOW') {
        counts[version.riskLevel] += 1;
      }
      return counts;
    },
    { HIGH: 0, UNKNOWN: 0, MEDIUM: 0, LOW: 0 },
  );
}

export function getStatusOptions(versions: VersionDetail[]) {
  return Array.from(new Set(versions.map((version) => version.status))).filter(Boolean);
}
```

- [ ] **Step 4: Implement road release date priority**

Modify `src/pages/versionRoadGrouping.ts`:

```ts
function datePart(value?: string) {
  return (value || '').slice(0, 10);
}

export function getReleaseDate(version: VersionDetail): string {
  return (
    datePart(version.planedOnlineTime) ||
    datePart(version.planedIssueTime) ||
    datePart(version.actualTestToTime) ||
    datePart(version.planedTestToTime) ||
    datePart(version.selectedReleaseDate)
  );
}
```

Keep `groupByDay()` unchanged so it uses the same `getReleaseDate()` for date-window inclusion.

- [ ] **Step 5: Update topology risk type**

Modify `src/components/DynamicTopologyLogic.ts`:

```ts
import { formatDateTime, type VersionDetail } from '../data/versionMock';

export type ScannerRisk = 'ALL' | 'HIGH' | 'UNKNOWN' | 'MEDIUM' | 'LOW';

export function getTopologyColumnBody(riskLevel: string) {
  if (riskLevel === 'HIGH') return { width: 15, depth: 8 };
  if (riskLevel === 'UNKNOWN') return { width: 14, depth: 8 };
  if (riskLevel === 'MEDIUM') return { width: 13, depth: 7 };
  return { width: 11, depth: 6 };
}

function displayValue(value?: string | number) {
  const text = String(value ?? '').trim();
  return text || '--';
}

export function buildTopologyTipRows(version: VersionDetail) {
  return {
    title: version.subNamedSystemName,
    items: [
      `${version.sysId} / 补丁 #${version.patchId}`,
      `风险 ${version.riskLevel} / 总分 ${version.totalScore.toFixed(1)}`,
      `状态 ${displayValue(version.status)}`,
      `负责人 ${displayValue(version.patchOwner)} / ${displayValue(version.patchOwnerAccount)}`,
      `快照 ${formatDateTime(version.snapshotsTs)}`,
      `计划发版 ${formatDateTime(version.planedIssueTime)}`,
      `计划上线 ${formatDateTime(version.planedOnlineTime)}`,
    ],
  };
}
```

- [ ] **Step 6: Run helper tests**

Run: `npm test -- src/pages/versionListFilters.test.ts src/pages/versionRoadGrouping.test.ts src/pages/l1DashboardSummary.test.ts src/components/DynamicTopology.test.ts`

Expected: PASS after updating test helper `makeVersion()` objects to include optional new fields only where needed.

- [ ] **Step 7: Commit**

```bash
git add src/pages/versionListFilters.ts src/pages/versionRoadGrouping.ts src/pages/l1DashboardSummary.ts src/components/DynamicTopologyLogic.ts src/pages/versionListFilters.test.ts src/pages/versionRoadGrouping.test.ts src/pages/l1DashboardSummary.test.ts src/components/DynamicTopology.test.ts
git commit -m "feat: support unknown risk and release-date semantics"
```

## Task 4: API Hooks And L1/L2 Collection Pages

**Files:**
- Create: `src/services/tedSbrain/useTedSbrainVersions.ts`
- Modify: `src/components/VersionOverviewPanel.tsx`
- Modify: `src/components/VersionRowCard.tsx`
- Modify: `src/components/RoadCar.tsx`
- Modify: `src/pages/L1DashboardPage.tsx`
- Modify: `src/pages/VersionListPage.tsx`
- Modify: `src/pages/VersionRoadPage.tsx`
- Modify: `src/App.css`
- Test: `src/components/VersionRowCard.test.tsx` or `src/components/VersionRowCard.test.ts`
- Test: `src/pages/VersionDetailPage.test.ts`

- [ ] **Step 1: Write failing component tests for L2 raw/schedule display**

Create `src/components/VersionRowCard.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { VersionDetail } from '../data/versionMock';
import VersionRowCard from './VersionRowCard';

function version(): VersionDetail {
  return {
    patchId: 7001,
    totalScore: 118.5,
    qualityScore: 92.35,
    behaviorScore: 78.25,
    riskLevel: 'UNKNOWN',
    snapshotsTs: '2026-07-08T10:30:00',
    sysId: 'PAY',
    subNamedSystemName: '支付核心系统',
    systemKeyId: 90001,
    systemLevel: '核心系统',
    teamName: '支付质量组',
    patchOwner: '赵六',
    patchOwnerAccount: 'zhaoliu',
    testLeader: '钱七',
    testLeaderAccount: 'qianqi',
    devLeader: '孙八',
    devLeaderAccount: 'sunba',
    testOwner: '周九',
    testOwnerGroup: '支付测试组',
    actualSubmitTestTime: '',
    actualTestFromTime: '2026-07-01 09:00:00',
    actualTestToTime: '2026-07-05 18:00:00',
    planedTestFromTime: '2026-07-01 09:00:00',
    planedTestToTime: '2026-07-05 18:00:00',
    planedIssueTime: '2026-07-09 18:00:00',
    planedOnlineTime: '2026-07-10 21:00:00',
    auditTime: '2026-07-08 11:00:00',
    summary: '支付核心 v9.1',
    description: '接口真实描述',
    status: '测试中',
    releaseType: '迭代发布',
    metrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
  };
}

describe('VersionRowCard API-backed metadata', () => {
  it('renders unknown risk and real API scores while showing planned schedule metadata', () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(VersionRowCard, { version: version() })),
    );

    expect(html).toContain('118.5');
    expect(html).toContain('未知风险');
    expect(html).toContain('计划发版');
    expect(html).toContain('2026-07-09 18:00');
    expect(html).toContain('计划上线');
    expect(html).toContain('2026-07-10 21:00');
    expect(html).toContain('周九');
  });
});
```

- [ ] **Step 2: Run the component test and verify failure**

Run: `npm test -- src/components/VersionRowCard.test.ts`

Expected: FAIL because the card does not render planned issue/online or `UNKNOWN`.

- [ ] **Step 3: Create collection/detail hooks**

Create `src/services/tedSbrain/useTedSbrainVersions.ts`:

```ts
import { useCallback, useEffect, useState } from 'react';
import type { DetailLoadState, CollectionLoadState } from './versionLoaders';
import { loadCollectionVersions, loadPatchDetail, recalculatePatchDetail } from './versionLoaders';

export type AsyncCollectionState =
  | { status: 'loading' }
  | CollectionLoadState;

export type AsyncDetailState =
  | { status: 'loading' }
  | DetailLoadState;

export function useCollectionVersions() {
  const [state, setState] = useState<AsyncCollectionState>({ status: 'loading' });

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    void loadCollectionVersions().then(setState);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { state, reload };
}

export function usePatchDetail(patchId: number | null) {
  const [state, setState] = useState<AsyncDetailState>({ status: 'loading' });
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (patchId === null) {
      setState({ status: 'not-found', message: '缺少版本标识' });
      return;
    }
    setState({ status: 'loading' });
    void loadPatchDetail(patchId).then(setState);
  }, [patchId]);

  const recalculate = useCallback(async () => {
    if (patchId === null) return;
    setIsRecalculating(true);
    setActionMessage(null);
    const next = await recalculatePatchDetail(patchId);
    setState(next);
    setActionMessage(next.status === 'success' ? '评分已刷新' : next.message);
    setIsRecalculating(false);
  }, [patchId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { state, reload, recalculate, isRecalculating, actionMessage };
}
```

- [ ] **Step 4: Add `UNKNOWN` filter option**

Modify `src/components/VersionOverviewPanel.tsx` risk select:

```tsx
<option value="ALL">全部风险</option>
<option value="HIGH">高风险</option>
<option value="UNKNOWN">未知风险</option>
<option value="MEDIUM">中风险</option>
<option value="LOW">低风险</option>
```

- [ ] **Step 5: Enrich version list card without changing its structure**

In `src/components/VersionRowCard.tsx`, keep the existing root/link layout and replace the schedule signal line with:

```tsx
<div className="row-signal-line">
  <span><UserRound size={14} aria-hidden="true" />{version.patchOwner} / {version.testOwner || version.testLeader}</span>
  <span><CalendarDays size={14} aria-hidden="true" />计划发版 {formatDateTime(version.planedIssueTime)}</span>
  <span><CalendarDays size={14} aria-hidden="true" />计划上线 {formatDateTime(version.planedOnlineTime)}</span>
  <span><ShieldAlert size={14} aria-hidden="true" />快照 {formatDateTime(version.snapshotsTs)}</span>
</div>
```

- [ ] **Step 6: Wire collection hooks into L1/List/Road pages**

In each of `src/pages/L1DashboardPage.tsx`, `src/pages/VersionListPage.tsx`, and `src/pages/VersionRoadPage.tsx`:

```ts
import { useCollectionVersions } from '../services/tedSbrain/useTedSbrainVersions';
```

Refactor each file into a loader container plus a content component. Do not place `useMemo`, `useState`, or any other hook after a loading/error early return in the same component.

Use this shape in `src/pages/VersionListPage.tsx`:

```tsx
interface VersionListContentProps {
  versions: VersionDetail[];
}

function VersionListContent({ versions }: VersionListContentProps) {
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<RiskFilter>('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState<VersionSort>('RISK');

  const statusOptions = useMemo(() => getStatusOptions(versions), [versions]);
  const filteredVersions = useMemo(
    () => filterAndSortVersions(versions, { query, risk, status, sort }),
    [versions, query, risk, status, sort],
  );
  const filteredRiskCounts = useMemo(() => summarizeRiskCounts(filteredVersions), [filteredVersions]);
}
```

Move the current `VersionListPage` JSX return into `VersionListContent` unchanged first, then replace every `versionDetails` reference inside that moved JSX with `versions`.

Keep the route component as the loader shell:

```tsx
function VersionListPage() {
  const { state, reload } = useCollectionVersions();

  if (state.status === 'loading') {
    return <main className="page-shell"><section className="list-empty" aria-live="polite"><h1>正在加载版本数据</h1><p>正在连接 ted-sbrain mock 服务。</p></section></main>;
  }

  if (state.status === 'error') {
    return <main className="page-shell"><section className="list-empty" aria-live="polite"><h1>版本数据加载失败</h1><p>{state.message}</p><button type="button" onClick={reload}>重试</button></section></main>;
  }

  return <VersionListContent versions={state.versions} />;
}
```

Apply the same pattern to `src/pages/L1DashboardPage.tsx` and `src/pages/VersionRoadPage.tsx`:

```tsx
function L1DashboardContent({ versions }: { versions: VersionDetail[] }) {
  const [topologyRisk, setTopologyRisk] = useState<ScannerRisk>('ALL');
  const [scannerSpeed, setScannerSpeed] = useState(1);
  const summary = buildL1DashboardSummary(versions);
}

function VersionRoadContent({ versions }: { versions: VersionDetail[] }) {
  const anchor = useMemo(() => getDataAnchorDate(versions), [versions]);
  const [rangeMode, setRangeMode] = useState<RangeMode>('QUICK');
  const [quickDays, setQuickDays] = useState<QuickDays>(10);
  const [fromDate, setFromDate] = useState<string>(anchor);
  const [toDate, setToDate] = useState<string>(shiftDays(anchor, 9));
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<RiskFilter>('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSort] = useState<VersionSort>('RISK');
}
```

Move the current L1 and road JSX returns into these content components unchanged first, then replace every `versionDetails` reference inside the moved JSX/calculations with `versions`. Because the content components mount only after data is loaded, their hook order is stable. For L1 keep `DynamicTopology versions={versions}`. For list and road compute `statusOptions`, `filteredVersions`, `dayRows`, `riskCounts`, and summaries from `versions`.

- [ ] **Step 7: Include unknown risk summary items**

In L1, list, and road summary arrays, add:

```ts
{ label: '未知风险', value: riskCounts.UNKNOWN }
```

For L1 risk strip and footer legend, include `UNKNOWN` between `HIGH` and `MEDIUM`.

- [ ] **Step 8: Render richer L1 topology hover**

In `src/components/DynamicTopology.tsx`, import and use the helper from Task 3:

```ts
import { buildTopologyTipRows } from './DynamicTopologyLogic';
```

Inside the component body, derive the hover rows before `return`:

```tsx
const topologyTip = hover ? buildTopologyTipRows(hover.version) : null;
```

Replace the existing hover tip JSX with:

```tsx
{topologyTip ? (
  <div className="l1-topology-tip">
    <strong>{topologyTip.title}</strong>
    {topologyTip.items.map((item) => (
      <span key={item}>{item}</span>
    ))}
  </div>
) : null}
```

Keep the canvas, scanner animation, hit testing, and click navigation unchanged.

- [ ] **Step 9: Update RoadCar tooltip with release context**

In `src/components/RoadCar.tsx`, change the tooltip date/meta section to include:

```tsx
<span className="car-summary-date">定位日期 {getReleaseDate(version)}</span>
<span className="car-summary-date">定位来源 {version.selectedReleaseDateSource || 'NONE'}</span>
<span className="car-summary-date">计划发版 {formatDateTime(version.planedIssueTime)}</span>
<span className="car-summary-date">计划上线 {formatDateTime(version.planedOnlineTime)}</span>
<span className="car-summary-date">快照 {formatDateTime(version.snapshotsTs)}</span>
<span className="car-summary-date">负责人 {version.patchOwner || '--'} / {version.testOwner || version.testLeader || '--'}</span>
<span className="car-summary-date">状态 {version.status || '--'} / 总分 {version.totalScore.toFixed(1)}</span>
```

Keep the existing road car SVG and hover mechanics unchanged.

- [ ] **Step 10: Add minimal styles**

Append to `src/App.css`:

```css
.risk-unknown,
.risk-badge.risk-unknown,
.car-summary-risk.risk-unknown,
.metric-radar-risk-unknown {
  color: var(--text-muted);
  border-color: color-mix(in srgb, var(--text-muted) 40%, transparent);
}

.risk-line-unknown {
  border-left-color: var(--text-muted);
}

.row-signal-line {
  flex-wrap: wrap;
}
```

- [ ] **Step 11: Run collection tests and build**

Run: `npm test -- src/components/VersionRowCard.test.ts src/pages/versionListFilters.test.ts src/pages/versionRoadGrouping.test.ts src/pages/l1DashboardSummary.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS or only CSS-independent TypeScript errors from L3 files not yet updated.

- [ ] **Step 12: Commit**

```bash
git add src/services/tedSbrain/useTedSbrainVersions.ts src/components/VersionOverviewPanel.tsx src/components/VersionRowCard.tsx src/components/RoadCar.tsx src/components/DynamicTopology.tsx src/pages/L1DashboardPage.tsx src/pages/VersionListPage.tsx src/pages/VersionRoadPage.tsx src/App.css src/components/VersionRowCard.test.ts
git commit -m "feat: load L1 and L2 pages from ted-sbrain snapshots"
```

## Task 5: L3 Detail Loading, History, Recalculation, And Audit

**Files:**
- Modify: `src/pages/VersionDetailPage.tsx`
- Create: `src/components/ScoreHistoryPanel.tsx`
- Create: `src/components/AuditDiagnosticPanel.tsx`
- Modify: `src/App.css`
- Test: `src/pages/VersionDetailPage.test.ts`
- Test: `src/components/ScoreHistoryPanel.test.ts`
- Test: `src/components/AuditDiagnosticPanel.test.ts`

- [ ] **Step 1: Add failing tests for history raw values and audit metadata**

Create `src/components/ScoreHistoryPanel.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ScoreHistoryPoint } from '../data/versionMock';
import ScoreHistoryPanel from './ScoreHistoryPanel';

describe('ScoreHistoryPanel', () => {
  it('renders raw API score values in compact history labels', () => {
    const points: ScoreHistoryPoint[] = [
      { patchId: 1, totalScore: 64.25, qualityScore: 60, behaviorScore: 58, riskLevel: 'HIGH', snapshotsTs: '2026-07-07T09:00:00' },
      { patchId: 1, totalScore: 118.5, riskLevel: 'UNKNOWN', snapshotsTs: '2026-07-08T09:00:00' },
    ];

    const html = renderToStaticMarkup(createElement(ScoreHistoryPanel, { points }));

    expect(html).toContain('64.25');
    expect(html).toContain('118.5');
    expect(html).toContain('未知风险');
  });
});
```

Create `src/components/AuditDiagnosticPanel.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AuditDiagnosticPanel from './AuditDiagnosticPanel';

describe('AuditDiagnosticPanel', () => {
  it('renders audit and response envelope metadata in a collapsible details element', () => {
    const html = renderToStaticMarkup(createElement(AuditDiagnosticPanel, {
      audit: {
        snapshotId: 'snapshot-1',
        createTs: '2026-07-08 09:00:00',
        updateTs: '2026-07-08 11:00:00',
        creator: 'mock-service',
        updater: 'score-engine',
        message: 'mock ok',
        criticalProcess: { traceId: 'trace-1' },
      },
    }));

    expect(html).toContain('<details');
    expect(html).toContain('snapshot-1');
    expect(html).toContain('mock ok');
    expect(html).toContain('trace-1');
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- src/components/ScoreHistoryPanel.test.ts src/components/AuditDiagnosticPanel.test.ts`

Expected: FAIL because both components are missing.

- [ ] **Step 3: Implement history component**

Create `src/components/ScoreHistoryPanel.tsx`:

```tsx
import { formatDateTime, formatScore, riskLabel, type ScoreHistoryPoint } from '../data/versionMock';

interface ScoreHistoryPanelProps {
  points?: ScoreHistoryPoint[];
}

function ScoreHistoryPanel({ points = [] }: ScoreHistoryPanelProps) {
  if (points.length === 0) {
    return <div className="score-history-empty">暂无历史评分</div>;
  }

  return (
    <div className="score-history-list" aria-label="评分历史">
      {points.map((point) => (
        <div className={`score-history-point risk-${point.riskLevel.toLowerCase()}`} key={`${point.patchId}-${point.snapshotsTs}`}>
          <span>{formatDateTime(point.snapshotsTs)}</span>
          <strong>{formatScore(point.totalScore)}</strong>
          <em>{riskLabel(point.riskLevel)}</em>
          {typeof point.qualityScore === 'number' && <small>质量 {formatScore(point.qualityScore)}</small>}
          {typeof point.behaviorScore === 'number' && <small>行为 {formatScore(point.behaviorScore)}</small>}
        </div>
      ))}
    </div>
  );
}

export default ScoreHistoryPanel;
```

- [ ] **Step 4: Implement audit component**

Create `src/components/AuditDiagnosticPanel.tsx`:

```tsx
import type { VersionAuditMeta } from '../data/versionMock';

interface AuditDiagnosticPanelProps {
  audit?: VersionAuditMeta;
}

function renderJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function AuditDiagnosticPanel({ audit }: AuditDiagnosticPanelProps) {
  if (!audit) return null;

  return (
    <details className="audit-diagnostic-panel">
      <summary>接口诊断</summary>
      <dl>
        {audit.snapshotId && <><dt>Snapshot ID</dt><dd>{audit.snapshotId}</dd></>}
        {audit.createTs && <><dt>创建时间</dt><dd>{audit.createTs}</dd></>}
        {audit.updateTs && <><dt>更新时间</dt><dd>{audit.updateTs}</dd></>}
        {audit.creator && <><dt>创建人</dt><dd>{audit.creator}</dd></>}
        {audit.updater && <><dt>更新人</dt><dd>{audit.updater}</dd></>}
        {audit.message && <><dt>接口消息</dt><dd>{audit.message}</dd></>}
      </dl>
      {audit.criticalProcess && (
        <pre>{renderJson(audit.criticalProcess)}</pre>
      )}
    </details>
  );
}

export default AuditDiagnosticPanel;
```

- [ ] **Step 5: Wire L3 page to `usePatchDetail`**

Modify imports in `src/pages/VersionDetailPage.tsx`:

```ts
import { useMemo } from 'react';
import ScoreHistoryPanel from '../components/ScoreHistoryPanel';
import AuditDiagnosticPanel from '../components/AuditDiagnosticPanel';
import { usePatchDetail } from '../services/tedSbrain/useTedSbrainVersions';
```

First extract the current cockpit markup into an exported pure component in the same file. Move the existing logic from `const insights = buildVersionDetailInsights(version);` through the final `</main>` into this component:

```tsx
export interface VersionDetailCockpitProps {
  version: VersionDetail;
  onRecalculate: () => void;
  isRecalculating: boolean;
  actionMessage: string | null;
}

export function VersionDetailCockpit({
  version,
  onRecalculate,
  isRecalculating,
  actionMessage,
}: VersionDetailCockpitProps) {
  const insights = buildVersionDetailInsights(version);
  const coverageMetric = version.metrics.find((metric) => metric.metricCode === 'COVERAGE_390');
  const defectMetric = version.metrics.find((metric) => metric.metricCode === 'DEFECT_RISK');
  const mediumRiskCount = version.metrics.filter((metric) => metric.riskLevel === 'MEDIUM').length;
  const highRiskCount = version.metrics.filter((metric) => metric.riskLevel === 'HIGH').length;
}
```

Move the current successful-detail JSX return into `VersionDetailCockpit` unchanged first. Then apply the description, recalculate, history, audit, responsibility-chain, and timeline additions below.

Then replace the route component's direct fixture lookup:

```ts
const version = getVersionByPatchId(patchId);
```

with:

```ts
const numericPatchId = useMemo(() => {
  const parsed = Number(patchId);
  return Number.isFinite(parsed) ? parsed : null;
}, [patchId]);
const { state, reload, recalculate, isRecalculating, actionMessage } = usePatchDetail(numericPatchId);

if (state.status === 'loading') {
  return (
    <main className="page-shell detail-page detail-empty">
      <h1>正在加载版本</h1>
      <p>正在从 ted-sbrain 获取评分数据。</p>
    </main>
  );
}

if (state.status === 'not-found') {
  return (
    <main className="page-shell detail-page detail-empty">
      <h1>未找到版本</h1>
      <p>{state.message}</p>
      <Link className="back-link" to="/">返回在测版本列表</Link>
    </main>
  );
}

if (state.status === 'error') {
  return (
    <main className="page-shell detail-page detail-empty">
      <h1>版本加载失败</h1>
      <p>{state.message}</p>
      <button type="button" onClick={reload}>重试</button>
      <Link className="back-link" to="/versions">返回列表</Link>
    </main>
  );
}

const version = state.version;
```

Then return the cockpit component from the route:

```tsx
return (
  <VersionDetailCockpit
    version={version}
    onRecalculate={recalculate}
    isRecalculating={isRecalculating}
    actionMessage={actionMessage}
  />
);
```

Near the title block inside `VersionDetailCockpit`, under `<h1>{version.summary}</h1>`, add:

```tsx
{version.description && <p className="detail-description">{version.description}</p>}
```

Near `ScoreHero`, add a controlled recalc action:

```tsx
<div className="score-action-row" aria-live="polite">
  <button type="button" onClick={onRecalculate} disabled={isRecalculating}>
    {isRecalculating ? '刷新评分中' : '刷新评分'}
  </button>
  {actionMessage && <span>{actionMessage}</span>}
</div>
```

Add history and audit panels without replacing current sections:

```tsx
<section className="history-zone" aria-label="评分历史">
  <InfoPanel title="评分历史" kicker="HISTORY">
    <ScoreHistoryPanel points={version.history} />
  </InfoPanel>
</section>

<section className="audit-zone" aria-label="接口诊断">
  <InfoPanel title="接口诊断" kicker="AUDIT">
    <AuditDiagnosticPanel audit={version.audit} />
  </InfoPanel>
</section>
```

- [ ] **Step 6: Extend responsibility chain and timeline**

In the responsibility chain section, include test owner:

```tsx
<div><ListChecks size={17} aria-hidden="true" /><span>测试执行人</span><strong>{version.testOwner || version.testLeader}</strong><em>{version.testOwnerGroup || version.testLeaderAccount}</em></div>
```

In `src/pages/versionDetailInsights.ts`, update `buildScheduleBars()` entries:

```ts
const entries = [
  { label: '计划测试', start: version.planedTestFromTime, end: version.planedTestToTime },
  { label: '实际测试', start: version.actualTestFromTime, end: version.actualTestToTime },
  { label: '计划发版', start: version.planedIssueTime, end: version.planedIssueTime },
  { label: '计划上线', start: version.planedOnlineTime, end: version.planedOnlineTime },
].filter((entry) => entry.start && entry.end);
```

Keep the existing rendering loop and skip empty entries.

- [ ] **Step 7: Add styles**

Append to `src/App.css`:

```css
.detail-description {
  margin: 10px 0 0;
  color: var(--text-muted);
  max-width: 880px;
}

.score-action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: -8px 0 16px;
}

.score-history-list {
  display: grid;
  gap: 8px;
}

.score-history-point,
.score-history-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
}

.score-history-point strong {
  color: var(--text-primary);
}

.audit-diagnostic-panel summary {
  cursor: pointer;
  font-weight: 700;
}

.audit-diagnostic-panel dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px 14px;
}

.audit-diagnostic-panel pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
```

- [ ] **Step 8: Run focused L3 tests**

Run: `npm test -- src/components/ScoreHistoryPanel.test.ts src/components/AuditDiagnosticPanel.test.ts src/pages/VersionDetailPage.test.ts src/pages/versionDetailInsights.test.ts`

Expected: PASS after updating `VersionDetailPage.test.ts` so the route component asserts the loading state and the exported `VersionDetailCockpit` asserts the cockpit layout, radar placement, description, history, and audit sections with a direct `version` prop.

- [ ] **Step 9: Commit**

```bash
git add src/pages/VersionDetailPage.tsx src/pages/versionDetailInsights.ts src/components/ScoreHistoryPanel.tsx src/components/AuditDiagnosticPanel.tsx src/components/ScoreHistoryPanel.test.ts src/components/AuditDiagnosticPanel.test.ts src/pages/VersionDetailPage.test.ts src/pages/versionDetailInsights.test.ts src/App.css
git commit -m "feat: load L3 detail score history and audit data"
```

## Task 6: Metric Radar Evidence, Missing Slots, Extra Metrics, And Raw Display

**Files:**
- Modify: `src/components/MetricScoreCards.tsx`
- Modify: `src/pages/versionDetailInsights.ts`
- Modify: `src/pages/VersionDetailPage.tsx`
- Modify: `src/App.css`
- Test: `src/components/MetricScoreCards.test.ts`
- Test: `src/pages/versionDetailInsights.test.ts`

- [ ] **Step 1: Add failing metric tests**

Update `src/components/MetricScoreCards.test.ts`:

```ts
it('uses display ratios for geometry but renders raw API scores in labels and titles', () => {
  const html = renderToStaticMarkup(
    createElement(MetricScoreCards, {
      version: makeVersion([
        makeMetric({
          metricCode: 'CHANGES_RISK',
          metricName: '版本变更风险',
          actualScore: 128.75,
          calcScore: 132.25,
          displayScoreRatio: 0.8,
          description: '大范围改动导致评分升高',
          features: { changedFiles: 42 },
        }),
      ]),
    }),
  );

  expect(html).toContain('128.8');
  expect(html).toContain('计算 132.3');
  expect(html).toContain('大范围改动导致评分升高');
  expect(html).toContain('changedFiles');
  expect(html).not.toContain('得分 0.8');
});

it('renders missing metric slots as unknown instead of removing radar points', () => {
  const html = renderToStaticMarkup(
    createElement(MetricScoreCards, {
      version: makeVersion([
        makeMetric({
          metricCode: 'COVERAGE_FUNCTION',
          metricName: '变更函数测试覆盖率',
          actualScore: 0,
          calcScore: 0,
          displayScoreRatio: 0,
          riskLevel: 'UNKNOWN',
          isMissing: true,
          description: '接口未返回该指标',
        }),
      ]),
    }),
  );

  expect(html).toContain('未知风险');
  expect(html).toContain('接口未返回该指标');
  expect(html).toContain('metric-radar-risk-unknown');
});

it('renders focusable metric controls that expose raw evidence and detail links', () => {
  const html = renderToStaticMarkup(
    createElement(MetricScoreCards, {
      version: makeVersion([
        makeMetric({
          metricCode: 'CHANGES_RISK',
          metricName: '版本变更风险',
          actualScore: 128.75,
          calcScore: 132.25,
          displayScoreRatio: 0.8,
          description: '大范围改动导致评分升高',
          detailUrl: 'https://example.test/metric/CHANGES_RISK',
          features: { changedFiles: 42, riskReason: '跨模块修改' },
        }),
      ]),
    }),
  );

  expect(html).toContain('tabindex="0"');
  expect(html).toContain('data-metric-code="CHANGES_RISK"');
  expect(html).toContain('aria-controls="metric-radar-active-evidence"');
  expect(html).toContain('大范围改动导致评分升高');
  expect(html).toContain('https://example.test/metric/CHANGES_RISK');
});
```

Update `src/pages/versionDetailInsights.test.ts`:

```ts
it('keeps extra metric evidence and metric detail links from the API', () => {
  const insights = buildVersionDetailInsights(makeVersion({
    metrics: [
      makeMetric({
        metricCode: 'CHANGES_RISK',
        metricName: '版本变更风险',
        detailUrl: 'https://example.test/metric/CHANGES_RISK',
      }),
    ],
    extraMetrics: [
      makeMetric({
        metricCode: 'MODEL_CONFIDENCE',
        metricName: '模型置信度',
        actualScore: 0.67,
        calcScore: 0.67,
        detailUrl: 'https://example.test/metric/MODEL_CONFIDENCE',
        features: { confidence: 0.67 },
      }),
    ],
  }));

  expect(insights.evidenceRows.map((row) => row.metricCode)).toEqual(['CHANGES_RISK', 'MODEL_CONFIDENCE']);
  expect(insights.evidenceRows[0].detailUrl).toBe('https://example.test/metric/CHANGES_RISK');
  expect(insights.evidenceRows[1].detailUrl).toBe('https://example.test/metric/MODEL_CONFIDENCE');
});
```

- [ ] **Step 2: Run metric tests and verify failure**

Run: `npm test -- src/components/MetricScoreCards.test.ts src/pages/versionDetailInsights.test.ts`

Expected: FAIL because current geometry uses `actualScore / MAX_SCORE`, no focusable hover evidence is rendered, and evidence rows do not carry `detailUrl` or `extraMetrics`.

- [ ] **Step 3: Update radar point helper**

Modify `src/components/MetricScoreCards.tsx` helper logic:

```ts
import { riskLabel, type MetricFeatureValue, type MetricItem, type VersionDetail } from '../data/versionMock';

function riskClass(level?: string): string {
  if (level === 'HIGH') return 'metric-radar-risk-high';
  if (level === 'MEDIUM') return 'metric-radar-risk-medium';
  if (level === 'UNKNOWN') return 'metric-radar-risk-unknown';
  return 'metric-radar-risk-low';
}

function metricRatio(metric: MetricItem) {
  if (typeof metric.displayScoreRatio === 'number') {
    return Math.max(0, Math.min(1, metric.displayScoreRatio));
  }
  return Math.min(Math.max(metric.actualScore / MAX_SCORE, 0), 1);
}

function formatFeatureForTitle(value: MetricFeatureValue): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map(formatFeatureForTitle).join(', ')}]`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function summarizeMetricFeatures(metric: MetricItem) {
  return Object.entries(metric.features ?? {})
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${formatFeatureForTitle(value)}`)
    .join('；');
}

function formatMetricTitle(metric: MetricItem) {
  const featureSummary = summarizeMetricFeatures(metric);
  return `${metric.metricName}：实际 ${metric.actualScore.toFixed(1)}，计算 ${metric.calcScore.toFixed(1)}，${riskLabel(metric.riskLevel || 'UNKNOWN')}。${metric.description || ''}${featureSummary ? `。${featureSummary}` : ''}`;
}

export function buildMetricRadarPoints(metrics: MetricItem[], center = CENTER, maxRadius = MAX_RADIUS) {
  const total = metrics.length;
  return metrics.map((metric, index) => {
    const ratio = metricRatio(metric);
    const radius = metric.isMissing ? 12 : Math.max(12, ratio * maxRadius);
    return polarPoint(index, total, radius, center);
  });
}
```

Then replace the inline `metrics.map()` score point calculation with:

```ts
const scorePoints = useMemo(
  () => buildMetricRadarPoints(metrics, center, maxRadius),
  [metrics, center, maxRadius],
);
```

- [ ] **Step 4: Render focusable raw evidence in the existing radar control**

At the top of `MetricScoreCards`, keep the existing `metrics` value and add selected metric state:

```tsx
const [selectedMetricCode, setSelectedMetricCode] = useState(metrics[0]?.metricCode ?? '');
const selectedMetric = metrics.find((metric) => metric.metricCode === selectedMetricCode) ?? metrics[0];
```

If the file currently imports only `useMemo`, change the React import to:

```ts
import { CSSProperties, useMemo, useState } from 'react';
```

In the dot render loop, add a nested title:

```tsx
<circle
  key={metric.metricCode}
  cx={point.x} cy={point.y} r="4.5"
  className={`metric-radar-dot metric-radar-dot-animated ${riskClass(metric.riskLevel)}`}
  tabIndex={0}
  role="button"
  aria-controls="metric-radar-active-evidence"
  aria-pressed={selectedMetricCode === metric.metricCode}
  data-metric-code={metric.metricCode}
  onFocus={() => setSelectedMetricCode(metric.metricCode)}
  onMouseEnter={() => setSelectedMetricCode(metric.metricCode)}
  onClick={() => setSelectedMetricCode(metric.metricCode)}
  style={{ '--delay-index': index } as CSSProperties}
>
  <title>{formatMetricTitle(metric)}</title>
</circle>
```

Under each label score, add compact evidence text:

```tsx
<text
  x={point.x}
  y={point.y + dy + nameLines.length * 14 + 13}
  textAnchor={anchor}
  className="metric-radar-label-meta"
>
  {metric.isMissing ? '未返回' : `计算 ${metric.calcScore.toFixed(1)}`}
</text>
```

Update `ariaLabel`:

```ts
const ariaLabel = `${metric.metricName}，实际得分 ${metric.actualScore.toFixed(1)}，计算得分 ${metric.calcScore.toFixed(1)}，${meta}，${metric.description || ''}`;
```

Below the `svg`, still inside `.metric-radar-wrap`, render the active evidence summary. This panel shows API raw values and links; it must not use normalized display ratios:

```tsx
{selectedMetric ? (
  <div id="metric-radar-active-evidence" className="metric-radar-active-evidence" aria-live="polite">
    <strong>{selectedMetric.metricName}</strong>
    <span>实际 {selectedMetric.actualScore.toFixed(1)} / 计算 {selectedMetric.calcScore.toFixed(1)} / {riskLabel(selectedMetric.riskLevel || 'UNKNOWN')}</span>
    {selectedMetric.description ? <p>{selectedMetric.description}</p> : null}
    {summarizeMetricFeatures(selectedMetric) ? <em>{summarizeMetricFeatures(selectedMetric)}</em> : null}
    {selectedMetric.detailUrl ? <a href={selectedMetric.detailUrl} target="_blank" rel="noreferrer">查看明细</a> : null}
  </div>
) : null}
```

- [ ] **Step 5: Keep extra metrics and detail links visible in evidence rows**

In `src/pages/versionDetailInsights.ts`, extend `EvidenceRow`:

```ts
export interface EvidenceRow {
  metricCode: string;
  metricName: string;
  phaseName: string;
  dataDimensionName: string;
  evalTargetName: string;
  actualScore: number;
  calcScore: number;
  riskLevel: RiskLevel;
  detailUrl?: string;
  facts: DetailFact[];
}
```

In `src/pages/versionDetailInsights.ts`, change evidence row construction from `version.metrics.map(...)` to:

```ts
const evidenceMetrics = [...version.metrics, ...(version.extraMetrics ?? [])];
```

Then map `evidenceMetrics` so extra backend metrics appear in the evidence list but not in radar geometry.
Include `detailUrl: metric.detailUrl` in each row.

In `src/pages/VersionDetailPage.tsx`, render the detail link after the fact list:

```tsx
{row.detailUrl ? (
  <a className="evidence-detail-link" href={row.detailUrl} target="_blank" rel="noreferrer">
    查看明细
  </a>
) : null}
```

- [ ] **Step 6: Add styles**

Append to `src/App.css`:

```css
.metric-radar-label-meta {
  fill: var(--text-muted);
  font-size: 10px;
}

.metric-radar-dot.metric-radar-risk-unknown {
  stroke-dasharray: 2 3;
}

.metric-radar-active-evidence {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.metric-radar-active-evidence strong {
  color: var(--text-primary);
}

.metric-radar-active-evidence a,
.evidence-detail-link {
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
}
```

- [ ] **Step 7: Run metric tests**

Run: `npm test -- src/components/MetricScoreCards.test.ts src/pages/versionDetailInsights.test.ts`

Expected: PASS. Confirm tests assert raw scores such as `128.8`, not display ratios.

- [ ] **Step 8: Commit**

```bash
git add src/components/MetricScoreCards.tsx src/components/MetricScoreCards.test.ts src/pages/versionDetailInsights.ts src/pages/versionDetailInsights.test.ts src/pages/VersionDetailPage.tsx src/App.css
git commit -m "feat: show metric evidence on radar with raw scores"
```

## Task 7: Final Integration Verification

**Files:**
- Modify as needed: `src/App.css`
- Modify as needed: failing tests only

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: PASS. If tests fail because old fixtures do not include optional fields, update only the test fixture factories or optional fallbacks. Do not remove assertions that core controls still render.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Run OpenSpec validation**

Run: `openspec validate --changes "connect-mock-service-to-frontend-pages"`

Expected:

```text
✓ change/connect-mock-service-to-frontend-pages
Totals: 2 passed, 0 failed
```

The total may include `create-mock-service`; that is acceptable if both changes pass.

- [ ] **Step 4: Start the mock service**

Run: `npm run mock`

Expected: logs show the mock service listening on `http://localhost:49152` and serving `/ted-sbrain/...` paths.

- [ ] **Step 5: Start the frontend in another terminal**

Run: `npm run dev`

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 6: Manual L1 verification**

Open `/`.

Expected:
- L1 topology/exhibition still renders as the primary surface.
- Risk filter includes all, high, unknown, medium, low.
- Summary includes unknown-risk count.
- Topology nodes use API-backed systems and scores.
- Latest snapshot matches an API `snapshotsTs` value.

- [ ] **Step 7: Manual L2 list verification**

Open `/versions`.

Expected:
- Existing card list remains.
- Cards show raw API `totalScore`, `qualityScore`, and `behaviorScore`.
- Planned issue and planned online dates show when the API returns them.
- Searching by hidden coordination fields such as `testOwnerGroup` or `snapshotId` returns matching rows.
- Filtering by `UNKNOWN` works.

- [ ] **Step 8: Manual L2 road verification**

Open `/versions/road`.

Expected:
- Existing snake-road canvas remains.
- Road placement uses `planedOnlineTime`, then `planedIssueTime`, then `actualTestToTime`.
- Hover shows raw score, risk, status, owner, planned issue, planned online, and snapshot time.
- Date windows include records based on the same date used for placement.

- [ ] **Step 9: Manual L3 detail verification**

Open `/versions/<mock patch id>`.

Expected:
- Existing cockpit layout remains: left/right wings and center hex/radar score.
- Version description is visible near the title.
- Score hero shows raw API scores.
- Recalculate button calls `score/calculate`, enters disabled/loading state, then refreshes detail and history.
- History labels show raw API values.
- Radar geometry is normalized only visually; labels, title/tooltip evidence, and evidence rows show raw `actualScore` and `calcScore`.
- Missing metric slots remain visible as unknown/unavailable.
- Extra metrics appear in evidence rows, not as extra radar points.
- Audit/diagnostic details are collapsed by default and show snapshot/envelope metadata when expanded.

- [ ] **Step 10: Commit verification fixes**

```bash
git add src src/App.css
git commit -m "test: verify ted-sbrain frontend integration"
```

If there are no verification fixes, skip this commit.

## Self-Review

- Spec coverage: Collection loading is covered by Tasks 2 and 4. Core control preservation is covered by Tasks 4, 5, and 6. View-model mapping, envelope metadata, raw/display value separation, `UNKNOWN`, L1 freshness, L2 schedule/search, L3 patch detail, metric evidence, history, recalculation, timeline, async states, routes, and configuration-driven service selection are covered across Tasks 1 through 7.
- Placeholder scan: The plan contains no placeholder markers, no vague safety instructions, and every code-changing task includes concrete file paths, commands, expected outcomes, and code snippets.
- Type consistency: `RiskLevel`, `MetricItem.displayScoreRatio`, `VersionDetail.extraMetrics`, `VersionDetail.history`, `VersionDetail.audit`, `TedSbrainClient.requestEnvelope`, and loader state names are used consistently from adapter through components.
