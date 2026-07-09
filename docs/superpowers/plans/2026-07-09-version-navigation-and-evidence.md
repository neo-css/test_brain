# Version Navigation And Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved version navigation, risk-filter, and metric evidence interaction spec while preserving the existing aircraft/topology and snake-road visual styles.

**Architecture:** Keep current pages and components, but make the situation-awareness page reusable at `/` and `/versions/overview`. Extend existing risk types to include `UNKNOWN`, replace topology dispatch buttons with a select filter, expand the version view switch to three routes, and move evidence detail into a stateful radar-panel interaction. Existing dirty mock/layout changes are treated as user-approved working context and must not be reverted.

**Tech Stack:** React 19, React Router, TypeScript, Vite, Vitest, existing CSS and server-render tests.

---

## File Structure

- Modify `src/data/versionMock.ts`: extend `RiskLevel`, `RISK_WEIGHT`, and `riskLabel` with `UNKNOWN`.
- Modify `src/pages/versionListFilters.ts`: extend `RiskFilter`, filtering, sorting, and risk counts for `UNKNOWN`.
- Modify `src/components/DynamicTopologyLogic.ts`: extend `ScannerRisk` with `UNKNOWN`.
- Modify `src/components/DynamicTopology.tsx`: preserve entry return state from the current route.
- Modify `src/pages/L1DashboardPage.tsx`: support home vs version-overview mode, replace dispatch buttons with risk select, update copy, and include unknown risk in legend.
- Modify `src/App.tsx`: add `/versions/overview`.
- Modify `src/components/VersionViewModeSwitch.tsx`: add `态势感知`, rename `版本态势` to `版本轨迹`.
- Modify `src/components/VersionOverviewPanel.tsx`: include `UNKNOWN` in the risk dropdown and default `backLabel` to `返回首页`.
- Modify `src/pages/VersionListPage.tsx` and `src/pages/VersionRoadPage.tsx`: update copy/back labels.
- Modify `src/components/MetricScoreCards.tsx`: make metric dimensions selectable and render a fixed evidence panel in the radar area.
- Modify `src/pages/VersionDetailPage.tsx`: own selected metric evidence state, pass selection props, remove bottom evidence list, and use location state for return link.
- Modify `src/styles.css`: add layout-only styles for the risk select and metric evidence panel; preserve aircraft and snake-road visual rules.
- Test `src/pages/versionListFilters.test.ts`, `src/components/DynamicTopology.test.ts`, `src/components/MetricScoreCards.test.ts`, `src/pages/VersionDetailPage.test.ts`, plus add focused route/switch tests if needed.

### Task 1: UNKNOWN Risk Support

**Files:**
- Modify: `src/data/versionMock.ts`
- Modify: `src/pages/versionListFilters.ts`
- Modify: `src/components/DynamicTopologyLogic.ts`
- Test: `src/pages/versionListFilters.test.ts`
- Test: `src/components/DynamicTopology.test.ts`

- [ ] **Step 1: Write failing tests for UNKNOWN risk**

Update `src/pages/versionListFilters.test.ts`:

```ts
const versions = [
  makeVersion({ patchId: 1, totalScore: 88, riskLevel: 'LOW', sysId: 'TED', subNamedSystemName: '测试大脑系统', status: '测试中', snapshotsTs: '2026-06-20T09:00:00' }),
  makeVersion({ patchId: 2, totalScore: 62, riskLevel: 'HIGH', sysId: 'PAY', subNamedSystemName: '支付核心系统', status: '阻塞中', patchOwner: '赵六', snapshotsTs: '2026-06-24T09:00:00' }),
  makeVersion({ patchId: 3, totalScore: 74, riskLevel: 'MEDIUM', sysId: 'CRM', subNamedSystemName: '客户关系系统', status: '测试中', teamName: '业务平台部', snapshotsTs: '2026-06-22T09:00:00' }),
  makeVersion({ patchId: 4, totalScore: 0, riskLevel: 'UNKNOWN', sysId: 'NEW', subNamedSystemName: '新接入系统', status: '准入中', snapshotsTs: '2026-06-25T09:00:00' }),
];
```

Add assertions:

```ts
expect(filterAndSortVersions(versions, { query: '', risk: 'UNKNOWN', status: 'ALL', sort: 'RISK' }).map((version) => version.patchId)).toEqual([4]);
expect(summarizeRiskCounts(versions)).toEqual({ HIGH: 1, MEDIUM: 1, LOW: 1, UNKNOWN: 1 });
```

Update `src/components/DynamicTopology.test.ts` to import `getTopologyColumnScanState` and assert:

```ts
expect(getTopologyColumnScanState({
  screenX: 50,
  scanMinX: 0,
  scanMaxX: 100,
  scannerRisk: 'UNKNOWN',
  riskLevel: 'UNKNOWN',
}).isLit).toBe(true);
```

Run: `npm test -- src/pages/versionListFilters.test.ts src/components/DynamicTopology.test.ts`
Expected: FAIL because `UNKNOWN` is not in the current types/counts.

- [ ] **Step 2: Implement UNKNOWN risk**

Change:

```ts
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
```

Set `RISK_WEIGHT.UNKNOWN = 0`, `riskLabel('UNKNOWN')` to `未知风险`, `RiskFilter` to include `UNKNOWN`, `summarizeRiskCounts` to return `{ HIGH, MEDIUM, LOW, UNKNOWN }`, and `ScannerRisk` to include `UNKNOWN`.

- [ ] **Step 3: Verify UNKNOWN tests**

Run: `npm test -- src/pages/versionListFilters.test.ts src/components/DynamicTopology.test.ts`
Expected: PASS.

### Task 2: Routes, View Switch, And Return Semantics

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/VersionViewModeSwitch.tsx`
- Modify: `src/components/VersionOverviewPanel.tsx`
- Modify: `src/pages/L1DashboardPage.tsx`
- Modify: `src/pages/VersionListPage.tsx`
- Modify: `src/pages/VersionRoadPage.tsx`
- Modify: `src/pages/VersionDetailPage.tsx`
- Test: `src/pages/VersionDetailPage.test.ts`
- Test: add or update a route/switch render test using existing server-render patterns

- [ ] **Step 1: Write failing tests for route copy and return state**

Add tests that server-render the switch and detail page:

```ts
expect(html).toContain('态势感知');
expect(html).toContain('版本列表');
expect(html).toContain('版本轨迹');
expect(html).not.toContain('版本态势');
```

Update `VersionDetailPage.test.ts` with MemoryRouter `initialEntries` containing:

```ts
{ pathname: '/versions/64460', state: { from: '/versions/overview', fromLabel: '返回态势感知' } }
```

Assert the detail return link contains `href="/versions/overview"` and `返回态势感知`.

Run: `npm test -- src/pages/VersionDetailPage.test.ts`
Expected: FAIL because the return link is hard-coded to `/versions` and the switch lacks `态势感知`.

- [ ] **Step 2: Implement route and switch changes**

Add `/versions/overview` in `App.tsx`, render `L1DashboardPage` with a prop or wrapper that marks it as version-module mode. Update `VersionViewModeSwitch` to three `NavLink`s:

- `/versions/overview`: `态势感知`
- `/versions`: `版本列表`
- `/versions/road`: `版本轨迹`

Update list/road page copy to use `返回首页`.

- [ ] **Step 3: Implement detail return semantics**

Read `useLocation()` in `VersionDetailPage`; default to `{ from: '/versions', fromLabel: '返回版本列表' }`. Use state-provided `from` and `fromLabel` for the return link. Update topology/list/road links to pass the correct state.

- [ ] **Step 4: Verify route tests**

Run: `npm test -- src/pages/VersionDetailPage.test.ts`
Expected: PASS.

### Task 3: Situation-Awareness Risk Select

**Files:**
- Modify: `src/pages/L1DashboardPage.tsx`
- Modify: `src/components/VersionOverviewPanel.tsx`
- Modify: `src/styles.css`
- Test: relevant server-render tests or raw-source assertions

- [ ] **Step 1: Write failing tests for dropdown copy**

Add assertions that rendered situation-awareness markup includes `风险筛选`, `未知风险`, and does not include `下发全部探测器`.

Run the focused test file that renders `L1DashboardPage` or a raw-source test if no render test exists.
Expected: FAIL because buttons still exist.

- [ ] **Step 2: Replace buttons with select**

In `L1DashboardPage.tsx`, replace `.l1-risk-filter` button group with:

```tsx
<label className="l1-risk-filter">
  <span>风险筛选</span>
  <select value={topologyRisk} onChange={(event) => setTopologyRisk(event.target.value as ScannerRisk)} aria-label="拓扑风险筛选">
    {topologyRiskFilters.map((filter) => (
      <option value={filter} key={filter}>{topologyFilterLabel(filter)}</option>
    ))}
  </select>
</label>
```

Set labels to `全部风险`, `高风险`, `中风险`, `低风险`, `未知风险`. Include `UNKNOWN` in the filter array and footer legend.

- [ ] **Step 3: Add layout-only select CSS**

Use existing surface/border/control tokens in `styles.css`; do not change aircraft canvas or snake-road visuals.

- [ ] **Step 4: Verify dropdown tests**

Run the focused test.
Expected: PASS.

### Task 4: Metric Radar Evidence Panel

**Files:**
- Modify: `src/components/MetricScoreCards.tsx`
- Modify: `src/pages/VersionDetailPage.tsx`
- Modify: `src/styles.css`
- Test: `src/components/MetricScoreCards.test.ts`
- Test: `src/pages/VersionDetailPage.test.ts`

- [ ] **Step 1: Write failing tests for selectable metrics and evidence panel**

Update `MetricScoreCards.test.ts` to assert metric labels render as buttons or focusable controls with `aria-pressed` and evidence panel classes:

```ts
expect(html).toContain('metric-radar-hit-target');
expect(html).toContain('aria-pressed="true"');
expect(html).toContain('metric-evidence-panel');
expect(html).toContain('版本变更风险');
```

Update `VersionDetailPage.test.ts` to assert the old bottom `evidence-zone` is absent and `metric-evidence-panel` is present.

Run: `npm test -- src/components/MetricScoreCards.test.ts src/pages/VersionDetailPage.test.ts`
Expected: FAIL because the chart is static and evidence remains at the bottom.

- [ ] **Step 2: Add selection props to MetricScoreCards**

Change props to:

```ts
interface MetricScoreCardsProps {
  version: VersionDetail;
  selectedMetricCode?: string;
  onSelectMetric?: (metricCode: string) => void;
}
```

Render transparent SVG hit targets for each metric, with `role="button"`, `tabIndex={0}`, `aria-pressed`, `onClick`, and `onKeyDown` for Enter/Space.

- [ ] **Step 3: Move evidence panel into radar InfoPanel**

In `VersionDetailPage`, compute a default selected metric by highest risk, maintain `selectedMetricCode`, find the matching evidence row, pass selection props to `MetricScoreCards`, and render a fixed `.metric-evidence-panel` inside the radar `InfoPanel` below the chart.

Remove the bottom `evidence-zone` section from the page.

- [ ] **Step 4: Add layout-only evidence CSS**

Add CSS for `.metric-evidence-panel`, `.metric-evidence-facts`, and selected radar target state. Reuse existing text, border, and risk color vocabulary.

- [ ] **Step 5: Verify evidence tests**

Run: `npm test -- src/components/MetricScoreCards.test.ts src/pages/VersionDetailPage.test.ts`
Expected: PASS.

### Task 5: Full Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Manual browser check if dev server is available**

Open the running Vite URL. Check:

- `/` temporary home still renders the aircraft/topology page.
- `/versions/overview`, `/versions`, and `/versions/road` show three switch options.
- Risk filter dropdown includes unknown risk.
- `/versions/64460` shows metric evidence inside the radar panel and no bottom EVIDENCE list.
- Aircraft and snake-road visual styles are preserved.
