# Version Cockpit Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Vite + TypeScript frontend with an in-test version situation list and a cockpit-style version detail page using the existing mock data.

**Architecture:** Create a small client-side React app with React Router. Keep data shaping in `src/data/versionMock.ts`, page composition in `src/pages`, reusable display components in `src/components`, and all cockpit styling in `src/styles.css`.

**Tech Stack:** React, Vite, TypeScript, React Router, SVG for the polygon radar chart, CSS modules through the global app stylesheet.

---

## File Structure

- Create `package.json`: project scripts and dependencies.
- Create `index.html`: Vite HTML entry.
- Create `tsconfig.json`: TypeScript app config.
- Create `tsconfig.node.json`: TypeScript config for Vite config.
- Create `vite.config.ts`: Vite React plugin setup.
- Create `src/main.tsx`: React root bootstrap.
- Create `src/App.tsx`: router and app shell.
- Create `src/data/versionMock.ts`: typed backend-shaped mock, derived version list, lookup helpers.
- Create `src/pages/VersionListPage.tsx`: in-test version situation list page.
- Create `src/pages/VersionDetailPage.tsx`: cockpit detail page and fallback state.
- Create `src/components/InfoPanel.tsx`: reusable panel wrapper.
- Create `src/components/VersionRowCard.tsx`: clickable row-like situation card.
- Create `src/components/ScoreHero.tsx`: total score, risk, and secondary score display.
- Create `src/components/RadarChart.tsx`: SVG polygon radar chart.
- Create `src/components/PhaseScoreBars.tsx`: phase score bars.
- Create `src/components/MetricRiskList.tsx`: metric risk list.
- Create `src/styles.css`: dark cockpit visual system and responsive layout.
- Modify none of the existing mock text file; use its values as source content.

---

### Task 1: Scaffold The React Vite App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create project metadata and scripts**

Create `package.json`:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create Vite HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>在测版本驾驶舱</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create Vite config**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 5: Create React bootstrap and router shell**

Create `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="page-shell">版本列表建设中</div>} />
      <Route path="/versions/:patchId" element={<div className="page-shell">版本详情建设中</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
```

Create `src/styles.css`:

```css
:root {
  font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  color: #e8f6ff;
  background: #061019;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #061019;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font: inherit;
}

.page-shell {
  min-height: 100vh;
  padding: 24px;
}
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: npm creates `package-lock.json` and installs dependencies without errors.

- [ ] **Step 7: Verify scaffold build**

Run: `npm run build`

Expected: TypeScript and Vite complete successfully and create `dist/`.

---

### Task 2: Add Typed Mock Data And Lookup Helpers

**Files:**
- Create: `src/data/versionMock.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create backend-shaped types and base detail record**

Create `src/data/versionMock.ts` with this content:

```ts
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | string;

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
  riskLevel?: RiskLevel;
  features?: Record<string, MetricFeatureValue>;
  description?: string;
  detailUrl?: string;
}

export interface MetricGroup {
  key: string;
  displayName: string;
  groupScore: number;
  metrics: Pick<MetricItem, 'metricCode' | 'metricName' | 'calcScore' | 'actualScore' | 'description'>[];
}

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
  actualSubmitTestTime: string;
  actualTestFromTime: string;
  actualTestToTime: string;
  planedTestFromTime: string;
  planedTestToTime: string;
  auditTime: string;
  summary: string;
  status: string;
  releaseType: string;
  metrics: MetricItem[];
  byPhase: MetricGroup[];
  byDataDimension: MetricGroup[];
  byEvalTarget: MetricGroup[];
}

const baseDetail: VersionDetail = {
  patchId: 64460,
  totalScore: 78.5,
  qualityScore: 3.82,
  behaviorScore: 2.75,
  riskLevel: 'LOW',
  snapshotsTs: '2026-06-23T09:30:00',
  sysId: 'TED',
  subNamedSystemName: '测试大脑系统',
  systemKeyId: 10001,
  systemLevel: '第四级',
  teamName: '质量保障部',
  patchOwner: '张三',
  patchOwnerAccount: 'zhangsan',
  testLeader: '李四',
  testLeaderAccount: 'lisi',
  devLeader: '王五',
  devLeaderAccount: 'wangwu',
  actualSubmitTestTime: '2026-06-10 14:00:00',
  actualTestFromTime: '2026-06-10 15:00:00',
  actualTestToTime: '2026-06-18 18:00:00',
  planedTestFromTime: '2026-06-09 09:00:00',
  planedTestToTime: '2026-06-17 18:00:00',
  auditTime: '2026-06-08 16:30:00',
  summary: 'TED系统 v2.3 迭代发布，新增智能测试模块、覆盖率数据采集优化、评分引擎重构',
  status: '测试中',
  releaseType: '迭代发布',
  metrics: [
    {
      metricCode: 'CHANGES_RISK',
      metricName: '版本变更风险',
      phase: 'ADMISSION',
      phaseName: '准入阶段',
      dataDimension: 'PERSONNEL_RELATED',
      dataDimensionName: '人员相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 4.4,
      actualScore: 4.4,
      riskLevel: 'LOW',
      features: {
        summaryReqConsistent: true,
        summaryReqDiffCount: 0,
        summaryCodeConsistent: false,
        summaryCodeDiffCount: 2,
        score: 4.4,
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'CASE_REVIEW_TIMELINESS',
      metricName: '案例评审时效',
      phase: 'PRE_TEST',
      phaseName: '测前阶段',
      dataDimension: 'CASE_RELATED',
      dataDimensionName: '用例相关',
      evalTarget: 'TEST_BEHAVIOR',
      evalTargetName: '测试行为',
      calcScore: 3,
      actualScore: 3,
      riskLevel: 'MEDIUM',
      features: {
        reviewTime: '2026-06-08 16:30:00',
        testStartTime: '2026-06-09 09:00:00',
        delayDays: 2,
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'DEFECT_RISK',
      metricName: '版本缺陷风险',
      phase: 'TEST_EXECUTION',
      phaseName: '测试执行阶段',
      dataDimension: 'DEFECT_RELATED',
      dataDimensionName: '缺陷相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 3.2,
      actualScore: 3.2,
      riskLevel: 'MEDIUM',
      features: {
        defectNum: 3,
        testStartDate: '2026-06-10',
        testEndDate: '2026-06-18',
        testDay: 13,
        totalDays: 9,
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'SMART_TEST',
      metricName: '智能测试渗透率',
      phase: 'TEST_EXECUTION',
      phaseName: '测试执行阶段',
      dataDimension: 'PERSONNEL_RELATED',
      dataDimensionName: '人员相关',
      evalTarget: 'TEST_BEHAVIOR',
      evalTargetName: '测试行为',
      calcScore: 3,
      actualScore: 3,
      riskLevel: 'MEDIUM',
      features: {
        clickCounts: {
          案例生成: 1,
          案例评审: 1,
          缺陷分析: 1,
        },
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'COVERAGE_390',
      metricName: '390回归测试覆盖率',
      phase: 'RELEASE',
      phaseName: '发布阶段',
      dataDimension: 'COVERAGE_RELATED',
      dataDimensionName: '覆盖率相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 4.25,
      actualScore: 4.25,
      riskLevel: 'LOW',
      features: {
        num: 800,
        cover: 680,
        coverageRate: 0.85,
        coverType: 'ARCH_ASSET',
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'COVERAGE_FUNCTION',
      metricName: '变更函数测试覆盖率',
      phase: 'RELEASE',
      phaseName: '发布阶段',
      dataDimension: 'COVERAGE_RELATED',
      dataDimensionName: '覆盖率相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 3,
      actualScore: 3,
      riskLevel: 'MEDIUM',
      features: {
        appLevel: '第四级',
        javaCoverageInfo: {
          cover: 156,
          num: 200,
          deletedNum: 10,
          artificialNum: 5,
          filterNum: 8,
          coverState: 'ALL_OPENED',
          description: 'all opened',
        },
        cCoverageInfo: {
          cover: 42,
          num: 103,
          deletedNum: 2,
          artificialNum: 0,
          filterNum: 3,
          coverState: 'ALL_OPENED',
          description: 'all opened',
        },
      },
      description: '',
      detailUrl: '',
    },
  ],
  byPhase: [
    {
      key: 'ADMISSION',
      displayName: '准入阶段',
      groupScore: 4.4,
      metrics: [{ metricCode: 'CHANGES_RISK', metricName: '版本变更风险', calcScore: 4.4, actualScore: 4.4, description: '' }],
    },
    {
      key: 'PRE_TEST',
      displayName: '测前阶段',
      groupScore: 3,
      metrics: [{ metricCode: 'CASE_REVIEW_TIMELINESS', metricName: '案例评审时效', calcScore: 3, actualScore: 3, description: '' }],
    },
    {
      key: 'TEST_EXECUTION',
      displayName: '测试执行阶段',
      groupScore: 6.2,
      metrics: [
        { metricCode: 'DEFECT_RISK', metricName: '版本缺陷风险', calcScore: 3.2, actualScore: 3.2, description: '' },
        { metricCode: 'SMART_TEST', metricName: '智能测试渗透率', calcScore: 3, actualScore: 3, description: '' },
      ],
    },
    {
      key: 'RELEASE',
      displayName: '发布阶段',
      groupScore: 7.25,
      metrics: [
        { metricCode: 'COVERAGE_390', metricName: '390回归测试覆盖率', calcScore: 4.25, actualScore: 4.25, description: '' },
        { metricCode: 'COVERAGE_FUNCTION', metricName: '变更函数测试覆盖率', calcScore: 3, actualScore: 3, description: '' },
      ],
    },
  ],
  byDataDimension: [],
  byEvalTarget: [],
};
```

- [ ] **Step 2: Add derived records and helpers**

Append this code to `src/data/versionMock.ts`:

```ts
function cloneVersion(overrides: Partial<VersionDetail>): VersionDetail {
  return {
    ...baseDetail,
    ...overrides,
    metrics: overrides.metrics ?? baseDetail.metrics,
    byPhase: overrides.byPhase ?? baseDetail.byPhase,
    byDataDimension: overrides.byDataDimension ?? baseDetail.byDataDimension,
    byEvalTarget: overrides.byEvalTarget ?? baseDetail.byEvalTarget,
  };
}

export const versionDetails: VersionDetail[] = [
  baseDetail,
  cloneVersion({
    patchId: 64461,
    totalScore: 72.2,
    qualityScore: 3.36,
    behaviorScore: 2.42,
    riskLevel: 'MEDIUM',
    sysId: 'PAY',
    subNamedSystemName: '支付核心系统',
    systemKeyId: 10002,
    teamName: '支付质量组',
    patchOwner: '赵六',
    patchOwnerAccount: 'zhaoliu',
    testLeader: '钱七',
    testLeaderAccount: 'qianqi',
    devLeader: '孙八',
    devLeaderAccount: 'sunba',
    summary: 'PAY系统 v4.8 支付链路灰度发布，新增交易风控校验与对账任务优化',
    actualSubmitTestTime: '2026-06-12 10:20:00',
    actualTestFromTime: '2026-06-12 13:30:00',
    actualTestToTime: '2026-06-21 18:00:00',
    planedTestFromTime: '2026-06-12 09:00:00',
    planedTestToTime: '2026-06-20 18:00:00',
    snapshotsTs: '2026-06-23T10:00:00',
  }),
  cloneVersion({
    patchId: 64462,
    totalScore: 84.2,
    qualityScore: 4.18,
    behaviorScore: 3.2,
    riskLevel: 'LOW',
    sysId: 'CRM',
    subNamedSystemName: '客户域服务系统',
    systemKeyId: 10003,
    teamName: '客户体验质量组',
    patchOwner: '周九',
    patchOwnerAccount: 'zhoujiu',
    testLeader: '吴十',
    testLeaderAccount: 'wushi',
    devLeader: '郑一',
    devLeaderAccount: 'zhengyi',
    summary: 'CRM系统 v1.9 客户标签与权益同步回归测试',
    actualSubmitTestTime: '2026-06-14 11:00:00',
    actualTestFromTime: '2026-06-14 15:00:00',
    actualTestToTime: '2026-06-22 18:00:00',
    planedTestFromTime: '2026-06-14 09:00:00',
    planedTestToTime: '2026-06-22 18:00:00',
    snapshotsTs: '2026-06-23T10:30:00',
  }),
  cloneVersion({
    patchId: 64463,
    totalScore: 66.8,
    qualityScore: 2.98,
    behaviorScore: 2.2,
    riskLevel: 'HIGH',
    sysId: 'OPS',
    subNamedSystemName: '运维自动化平台',
    systemKeyId: 10004,
    teamName: '平台保障组',
    patchOwner: '王二',
    patchOwnerAccount: 'wanger',
    testLeader: '陈三',
    testLeaderAccount: 'chensan',
    devLeader: '刘四',
    devLeaderAccount: 'liusi',
    summary: 'OPS平台 v3.1 发布编排与告警规则调整',
    actualSubmitTestTime: '2026-06-15 09:40:00',
    actualTestFromTime: '2026-06-15 14:30:00',
    actualTestToTime: '2026-06-24 18:00:00',
    planedTestFromTime: '2026-06-15 09:00:00',
    planedTestToTime: '2026-06-23 18:00:00',
    snapshotsTs: '2026-06-23T11:00:00',
  }),
];

export function getVersionByPatchId(patchId: string | undefined): VersionDetail | undefined {
  const numericPatchId = Number(patchId);
  return versionDetails.find((version) => version.patchId === numericPatchId);
}

export function formatScore(score: number): string {
  return score.toFixed(score % 1 === 0 ? 0 : 1);
}

export function formatDateTime(value: string): string {
  return value.replace('T', ' ').slice(0, 16);
}

export function riskLabel(riskLevel: RiskLevel): string {
  if (riskLevel === 'LOW') return '低风险';
  if (riskLevel === 'MEDIUM') return '中风险';
  if (riskLevel === 'HIGH') return '高风险';
  return '未知风险';
}
```

- [ ] **Step 3: Wire real pages into the router as temporary imports**

Modify `src/App.tsx`:

```tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { versionDetails } from './data/versionMock';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="page-shell">在测版本：{versionDetails.length}</div>} />
      <Route path="/versions/:patchId" element={<div className="page-shell">版本详情建设中</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 4: Verify data compiles**

Run: `npm run build`

Expected: Build succeeds with no TypeScript errors.

---

### Task 3: Implement The Situation List Page

**Files:**
- Create: `src/components/VersionRowCard.tsx`
- Create: `src/pages/VersionListPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create clickable version row card**

Create `src/components/VersionRowCard.tsx`:

```tsx
import { ArrowRight, CalendarDays, ShieldAlert, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime, formatScore, riskLabel, VersionDetail } from '../data/versionMock';

interface VersionRowCardProps {
  version: VersionDetail;
}

function VersionRowCard({ version }: VersionRowCardProps) {
  return (
    <Link className="version-row" to={`/versions/${version.patchId}`}>
      <div className="row-score-block">
        <span className="row-score-label">总分</span>
        <strong>{formatScore(version.totalScore)}</strong>
      </div>
      <div className="row-main">
        <div className="row-title-line">
          <h2>{version.summary}</h2>
          <span className={`risk-badge risk-${version.riskLevel.toLowerCase()}`}>{riskLabel(version.riskLevel)}</span>
        </div>
        <div className="row-meta-grid">
          <span>{version.subNamedSystemName}</span>
          <span>{version.teamName}</span>
          <span>{version.releaseType}</span>
          <span>{version.status}</span>
        </div>
        <div className="row-signal-line">
          <span><UserRound size={14} />{version.patchOwner} / {version.testLeader}</span>
          <span><CalendarDays size={14} />{formatDateTime(version.actualTestFromTime)} 至 {formatDateTime(version.actualTestToTime)}</span>
          <span><ShieldAlert size={14} />快照 {formatDateTime(version.snapshotsTs)}</span>
        </div>
      </div>
      <div className="row-score-pair">
        <span>质量 {version.qualityScore.toFixed(2)}</span>
        <span>行为 {version.behaviorScore.toFixed(2)}</span>
      </div>
      <ArrowRight className="row-arrow" size={20} />
    </Link>
  );
}

export default VersionRowCard;
```

- [ ] **Step 2: Create list page**

Create `src/pages/VersionListPage.tsx`:

```tsx
import VersionRowCard from '../components/VersionRowCard';
import { versionDetails } from '../data/versionMock';

function VersionListPage() {
  return (
    <main className="page-shell list-page">
      <section className="list-header">
        <div>
          <p className="eyebrow">IN-TEST VERSIONS</p>
          <h1>在测版本态势列表</h1>
        </div>
        <div className="list-count">
          <span>当前在测</span>
          <strong>{versionDetails.length}</strong>
        </div>
      </section>

      <section className="version-list" aria-label="在测版本列表">
        {versionDetails.map((version) => (
          <VersionRowCard key={version.patchId} version={version} />
        ))}
      </section>
    </main>
  );
}

export default VersionListPage;
```

- [ ] **Step 3: Route the list page**

Modify `src/App.tsx`:

```tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import VersionListPage from './pages/VersionListPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<VersionListPage />} />
      <Route path="/versions/:patchId" element={<div className="page-shell">版本详情建设中</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 4: Add list page styles**

Append to `src/styles.css`:

```css
.page-shell {
  position: relative;
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(28, 154, 214, 0.28), transparent 34%),
    linear-gradient(135deg, #061019 0%, #081925 48%, #061019 100%);
}

.list-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.list-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 2px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #6ec8ff;
  font-size: 12px;
  letter-spacing: 0;
}

.list-header h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 700;
}

.list-count {
  min-width: 120px;
  padding: 14px 16px;
  border: 1px solid rgba(95, 205, 255, 0.28);
  background: rgba(6, 24, 38, 0.72);
  text-align: right;
}

.list-count span {
  display: block;
  color: #8fb8c9;
  font-size: 12px;
}

.list-count strong {
  display: block;
  color: #75f0bf;
  font-size: 30px;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) 116px 28px;
  gap: 18px;
  align-items: center;
  padding: 18px;
  border: 1px solid rgba(95, 205, 255, 0.18);
  border-left: 3px solid #35d0ff;
  background: linear-gradient(90deg, rgba(13, 70, 96, 0.58), rgba(8, 26, 40, 0.82));
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
  transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
}

.version-row:hover {
  transform: translateY(-2px);
  border-color: rgba(95, 205, 255, 0.48);
  background: linear-gradient(90deg, rgba(15, 91, 123, 0.72), rgba(8, 30, 46, 0.9));
}

.row-score-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row-score-label {
  color: #86aebf;
  font-size: 12px;
}

.row-score-block strong {
  color: #7af0c3;
  font-size: 34px;
  line-height: 1;
}

.row-main {
  min-width: 0;
}

.row-title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.row-title-line h2 {
  overflow: hidden;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18px;
}

.risk-badge {
  flex: none;
  padding: 5px 9px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 12px;
}

.risk-low {
  color: #7af0c3;
  border-color: rgba(122, 240, 195, 0.36);
  background: rgba(45, 143, 105, 0.18);
}

.risk-medium {
  color: #ffd27a;
  border-color: rgba(255, 210, 122, 0.36);
  background: rgba(156, 109, 28, 0.2);
}

.risk-high {
  color: #ff96a6;
  border-color: rgba(255, 150, 166, 0.42);
  background: rgba(145, 45, 64, 0.24);
}

.row-meta-grid,
.row-signal-line,
.row-score-pair {
  color: #9bbdca;
  font-size: 13px;
}

.row-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, max-content));
  gap: 12px;
  margin-top: 10px;
}

.row-signal-line {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
}

.row-signal-line span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.row-score-pair {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
}

.row-arrow {
  color: #70cff7;
}

@media (max-width: 760px) {
  .page-shell {
    padding: 18px;
  }

  .list-header,
  .row-title-line {
    align-items: flex-start;
    flex-direction: column;
  }

  .version-row {
    grid-template-columns: 1fr;
  }

  .row-score-pair {
    text-align: left;
  }

  .row-meta-grid {
    grid-template-columns: repeat(2, minmax(0, max-content));
  }
}
```

- [ ] **Step 5: Verify list page build**

Run: `npm run build`

Expected: Build succeeds and no TypeScript errors are reported.

---

### Task 4: Implement Cockpit Detail Components

**Files:**
- Create: `src/components/InfoPanel.tsx`
- Create: `src/components/ScoreHero.tsx`
- Create: `src/components/RadarChart.tsx`
- Create: `src/components/PhaseScoreBars.tsx`
- Create: `src/components/MetricRiskList.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create panel wrapper**

Create `src/components/InfoPanel.tsx`:

```tsx
import { ReactNode } from 'react';

interface InfoPanelProps {
  title: string;
  kicker?: string;
  children: ReactNode;
  className?: string;
}

function InfoPanel({ title, kicker, children, className = '' }: InfoPanelProps) {
  return (
    <section className={`info-panel ${className}`}>
      <div className="panel-heading">
        {kicker ? <span>{kicker}</span> : null}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default InfoPanel;
```

- [ ] **Step 2: Create score hero**

Create `src/components/ScoreHero.tsx`:

```tsx
import { Activity, ShieldCheck } from 'lucide-react';
import { formatScore, riskLabel, VersionDetail } from '../data/versionMock';

interface ScoreHeroProps {
  version: VersionDetail;
}

function ScoreHero({ version }: ScoreHeroProps) {
  return (
    <section className="score-hero">
      <div>
        <p className="eyebrow">VERSION SCORE</p>
        <div className="hero-score">{formatScore(version.totalScore)}</div>
        <span className={`risk-badge risk-${version.riskLevel.toLowerCase()}`}>{riskLabel(version.riskLevel)}</span>
      </div>
      <div className="hero-score-grid">
        <div>
          <ShieldCheck size={18} />
          <span>质量得分</span>
          <strong>{version.qualityScore.toFixed(2)}</strong>
        </div>
        <div>
          <Activity size={18} />
          <span>行为得分</span>
          <strong>{version.behaviorScore.toFixed(2)}</strong>
        </div>
      </div>
    </section>
  );
}

export default ScoreHero;
```

- [ ] **Step 3: Create radar chart**

Create `src/components/RadarChart.tsx`:

```tsx
import { MetricGroup } from '../data/versionMock';

interface RadarChartProps {
  groups: MetricGroup[];
}

function polarPoint(index: number, total: number, radius: number, center: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function pointsToString(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function RadarChart({ groups }: RadarChartProps) {
  const size = 280;
  const center = size / 2;
  const maxScore = Math.max(...groups.map((group) => group.groupScore), 10);
  const rings = [0.25, 0.5, 0.75, 1];
  const axisPoints = groups.map((_, index) => polarPoint(index, groups.length, 110, center));
  const scorePoints = groups.map((group, index) => {
    const radius = Math.max(12, (group.groupScore / maxScore) * 110);
    return polarPoint(index, groups.length, radius, center);
  });

  return (
    <div className="radar-wrap">
      <svg className="radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="阶段得分多边形指标图">
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={pointsToString(groups.map((_, index) => polarPoint(index, groups.length, 110 * ring, center)))}
            className="radar-ring"
          />
        ))}
        {axisPoints.map((point, index) => (
          <line key={groups[index].key} x1={center} y1={center} x2={point.x} y2={point.y} className="radar-axis" />
        ))}
        <polygon points={pointsToString(scorePoints)} className="radar-score" />
        {scorePoints.map((point, index) => (
          <circle key={groups[index].key} cx={point.x} cy={point.y} r="4" className="radar-dot" />
        ))}
      </svg>
      <div className="radar-labels">
        {groups.map((group) => (
          <span key={group.key}>{group.displayName} {group.groupScore.toFixed(2)}</span>
        ))}
      </div>
    </div>
  );
}

export default RadarChart;
```

- [ ] **Step 4: Create phase score bars**

Create `src/components/PhaseScoreBars.tsx`:

```tsx
import { MetricGroup } from '../data/versionMock';

interface PhaseScoreBarsProps {
  groups: MetricGroup[];
}

function PhaseScoreBars({ groups }: PhaseScoreBarsProps) {
  const maxScore = Math.max(...groups.map((group) => group.groupScore), 1);

  return (
    <div className="phase-bars">
      {groups.map((group) => (
        <div className="phase-bar-row" key={group.key}>
          <div className="phase-bar-head">
            <span>{group.displayName}</span>
            <strong>{group.groupScore.toFixed(2)}</strong>
          </div>
          <div className="phase-bar-track">
            <div className="phase-bar-fill" style={{ width: `${(group.groupScore / maxScore) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PhaseScoreBars;
```

- [ ] **Step 5: Create metric risk list**

Create `src/components/MetricRiskList.tsx`:

```tsx
import { formatScore, riskLabel, VersionDetail } from '../data/versionMock';

interface MetricRiskListProps {
  version: VersionDetail;
}

function MetricRiskList({ version }: MetricRiskListProps) {
  return (
    <div className="metric-list">
      {version.metrics.map((metric) => (
        <div className="metric-row" key={metric.metricCode}>
          <div>
            <strong>{metric.metricName}</strong>
            <span>{metric.phaseName ?? '未知阶段'} / {metric.evalTargetName ?? '未知目标'}</span>
          </div>
          <div className="metric-score">
            <span>{formatScore(metric.actualScore)}</span>
            <em className={`risk-badge risk-${(metric.riskLevel ?? 'LOW').toLowerCase()}`}>{riskLabel(metric.riskLevel ?? 'LOW')}</em>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MetricRiskList;
```

- [ ] **Step 6: Add component styles**

Append to `src/styles.css`:

```css
.info-panel,
.score-hero {
  border: 1px solid rgba(95, 205, 255, 0.2);
  background: linear-gradient(180deg, rgba(11, 37, 55, 0.88), rgba(6, 19, 31, 0.9));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 18px 38px rgba(0, 0, 0, 0.2);
}

.info-panel {
  padding: 18px;
}

.panel-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-heading span {
  color: #6ec8ff;
  font-size: 12px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 18px;
}

.score-hero {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(220px, 1fr);
  gap: 18px;
  padding: 24px;
}

.hero-score {
  margin: 4px 0 14px;
  color: #79f0c2;
  font-size: clamp(64px, 10vw, 116px);
  font-weight: 800;
  line-height: 0.95;
}

.hero-score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-content: end;
}

.hero-score-grid div {
  display: flex;
  min-height: 116px;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid rgba(95, 205, 255, 0.18);
  background: rgba(8, 31, 48, 0.72);
}

.hero-score-grid span {
  color: #9bbdca;
  font-size: 13px;
}

.hero-score-grid strong {
  color: #e8f6ff;
  font-size: 32px;
}

.radar-wrap {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 18px;
  align-items: center;
}

.radar-chart {
  width: 100%;
  max-width: 280px;
}

.radar-ring {
  fill: none;
  stroke: rgba(95, 205, 255, 0.2);
  stroke-width: 1;
}

.radar-axis {
  stroke: rgba(95, 205, 255, 0.18);
  stroke-width: 1;
}

.radar-score {
  fill: rgba(63, 210, 255, 0.26);
  stroke: #5bd6ff;
  stroke-width: 2;
}

.radar-dot {
  fill: #7af0c3;
  stroke: #061019;
  stroke-width: 2;
}

.radar-labels {
  display: grid;
  gap: 10px;
  color: #bad7e4;
  font-size: 13px;
}

.phase-bars {
  display: grid;
  gap: 14px;
}

.phase-bar-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 7px;
  color: #bad7e4;
  font-size: 13px;
}

.phase-bar-track {
  overflow: hidden;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
}

.phase-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #35d0ff, #7af0c3);
}

.metric-list {
  display: grid;
  gap: 10px;
}

.metric-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(95, 205, 255, 0.14);
  background: rgba(8, 29, 45, 0.65);
}

.metric-row strong,
.metric-row span {
  display: block;
}

.metric-row strong {
  margin-bottom: 5px;
  font-size: 14px;
}

.metric-row span {
  color: #8fb2c2;
  font-size: 12px;
}

.metric-score {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-score > span {
  color: #e8f6ff;
  font-size: 20px;
}

.metric-score em {
  font-style: normal;
}

@media (max-width: 860px) {
  .score-hero,
  .radar-wrap {
    grid-template-columns: 1fr;
  }

  .hero-score-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 7: Verify component compilation**

Run: `npm run build`

Expected: Build succeeds with unused import and type errors absent.

---

### Task 5: Implement The Cockpit Detail Page

**Files:**
- Create: `src/pages/VersionDetailPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create detail page**

Create `src/pages/VersionDetailPage.tsx`:

```tsx
import { ArrowLeft, CalendarClock, Cpu, GitBranch, UsersRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import InfoPanel from '../components/InfoPanel';
import MetricRiskList from '../components/MetricRiskList';
import PhaseScoreBars from '../components/PhaseScoreBars';
import RadarChart from '../components/RadarChart';
import ScoreHero from '../components/ScoreHero';
import { formatDateTime, getVersionByPatchId } from '../data/versionMock';

function VersionDetailPage() {
  const { patchId } = useParams();
  const version = getVersionByPatchId(patchId);

  if (!version) {
    return (
      <main className="page-shell detail-page detail-empty">
        <h1>未找到版本</h1>
        <Link className="back-link" to="/">返回在测版本列表</Link>
      </main>
    );
  }

  const coverageMetric = version.metrics.find((metric) => metric.metricCode === 'COVERAGE_390');
  const defectMetric = version.metrics.find((metric) => metric.metricCode === 'DEFECT_RISK');
  const smartMetric = version.metrics.find((metric) => metric.metricCode === 'SMART_TEST');

  return (
    <main className="page-shell detail-page">
      <header className="detail-header">
        <Link className="back-link" to="/"><ArrowLeft size={18} />返回列表</Link>
        <div className="detail-title-block">
          <p className="eyebrow">VERSION COCKPIT</p>
          <h1>{version.summary}</h1>
          <div className="detail-tags">
            <span>{version.status}</span>
            <span>{version.releaseType}</span>
            <span>{formatDateTime(version.snapshotsTs)}</span>
          </div>
        </div>
      </header>

      <section className="detail-grid-main">
        <ScoreHero version={version} />
        <InfoPanel title="版本身份" kicker="SYSTEM">
          <div className="identity-grid">
            <span><Cpu size={16} />{version.subNamedSystemName}</span>
            <span><GitBranch size={16} />{version.sysId} / {version.systemLevel}</span>
            <span><UsersRound size={16} />{version.teamName}</span>
            <span><CalendarClock size={16} />审计 {formatDateTime(version.auditTime)}</span>
          </div>
        </InfoPanel>
      </section>

      <section className="detail-grid-two">
        <InfoPanel title="阶段多边形指标" kicker="PHASE RADAR" className="radar-panel">
          <RadarChart groups={version.byPhase} />
        </InfoPanel>
        <InfoPanel title="阶段得分" kicker="PHASE SCORE">
          <PhaseScoreBars groups={version.byPhase} />
        </InfoPanel>
      </section>

      <section className="detail-grid-two detail-grid-bottom">
        <InfoPanel title="指标风险清单" kicker="METRICS">
          <MetricRiskList version={version} />
        </InfoPanel>
        <InfoPanel title="执行摘要" kicker="OPERATIONS">
          <div className="operation-grid">
            <div>
              <span>负责人</span>
              <strong>{version.patchOwner}</strong>
              <em>测试 {version.testLeader} / 开发 {version.devLeader}</em>
            </div>
            <div>
              <span>实际周期</span>
              <strong>{formatDateTime(version.actualTestFromTime)}</strong>
              <em>至 {formatDateTime(version.actualTestToTime)}</em>
            </div>
            <div>
              <span>覆盖率</span>
              <strong>{String(coverageMetric?.features?.coverageRate ?? '--')}</strong>
              <em>覆盖 {String(coverageMetric?.features?.cover ?? '--')} / 总数 {String(coverageMetric?.features?.num ?? '--')}</em>
            </div>
            <div>
              <span>缺陷风险</span>
              <strong>{String(defectMetric?.features?.defectNum ?? '--')}</strong>
              <em>测试天数 {String(defectMetric?.features?.testDay ?? '--')}</em>
            </div>
            <div>
              <span>智能测试</span>
              <strong>{smartMetric ? smartMetric.actualScore.toFixed(1) : '--'}</strong>
              <em>案例生成 / 评审 / 缺陷分析</em>
            </div>
          </div>
        </InfoPanel>
      </section>
    </main>
  );
}

export default VersionDetailPage;
```

- [ ] **Step 2: Route detail page**

Modify `src/App.tsx`:

```tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import VersionDetailPage from './pages/VersionDetailPage';
import VersionListPage from './pages/VersionListPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<VersionListPage />} />
      <Route path="/versions/:patchId" element={<VersionDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 3: Add detail page styles**

Append to `src/styles.css`:

```css
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 9px 12px;
  border: 1px solid rgba(95, 205, 255, 0.22);
  color: #a9d9ed;
  background: rgba(6, 24, 38, 0.72);
}

.detail-title-block h1 {
  max-width: 1120px;
  margin: 0;
  font-size: clamp(26px, 3.8vw, 42px);
  line-height: 1.18;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.detail-tags span {
  padding: 7px 10px;
  border: 1px solid rgba(95, 205, 255, 0.18);
  color: #9fc3d2;
  background: rgba(8, 29, 45, 0.66);
  font-size: 13px;
}

.detail-grid-main {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  gap: 18px;
}

.detail-grid-two {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 18px;
}

.detail-grid-bottom {
  align-items: start;
}

.identity-grid {
  display: grid;
  gap: 14px;
}

.identity-grid span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #bad7e4;
  font-size: 14px;
}

.operation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.operation-grid div {
  min-height: 118px;
  padding: 14px;
  border: 1px solid rgba(95, 205, 255, 0.14);
  background: rgba(8, 29, 45, 0.65);
}

.operation-grid span,
.operation-grid em {
  display: block;
  color: #8fb2c2;
  font-size: 12px;
  font-style: normal;
}

.operation-grid strong {
  display: block;
  margin: 10px 0;
  color: #e8f6ff;
  font-size: 23px;
}

.detail-empty {
  align-items: flex-start;
  justify-content: center;
}

@media (max-width: 980px) {
  .detail-header,
  .detail-grid-main,
  .detail-grid-two {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .operation-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Verify detail page build**

Run: `npm run build`

Expected: Build succeeds with no TypeScript errors.

---

### Task 6: Final Verification And Local Run

**Files:**
- No source edits unless verification exposes a defect.

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: Build succeeds and outputs `dist/`.

- [ ] **Step 2: Start dev server**

Run: `npm run dev -- --port 5173`

Expected: Vite starts and prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 3: Manually verify pages in browser**

Open `http://localhost:5173/`.

Expected on list page:

- Page title is `在测版本态势列表`.
- There are multiple in-test version rows.
- The page does not contain overview statistic cards beyond the compact current count.
- Rows look like cockpit situation cards, not a bordered spreadsheet.

Click the TED row.

Expected on detail page:

- URL changes to `/versions/64460`.
- Header shows the TED version summary.
- Total score is prominent.
- Risk badge is visible.
- Polygon radar chart renders with four phase axes.
- Phase bars, metric risk list, and execution summary render.

Open `http://localhost:5173/versions/999999`.

Expected:

- Not-found state appears.
- Back link returns to the list page.

- [ ] **Step 4: Check responsive behavior**

Use browser devtools or a narrow browser window around 390px wide.

Expected:

- List rows stack without text overlap.
- Detail panels stack vertically.
- Radar chart remains visible and not clipped.
- Buttons and badges keep readable text.

- [ ] **Step 5: Stop only obsolete development servers**

If the dev server was started for this task and no longer needed, stop it with Ctrl-C in the running shell session. If it is running in the background through the tool harness, leave it available for the user and report the URL.

---

## Self-Review

Spec coverage:

- React + Vite + TypeScript scaffold is covered by Task 1.
- Local mock data shaped from `版本详情.txt` is covered by Task 2.
- In-test version situation list with clickable rows is covered by Task 3.
- Management cockpit detail page is covered by Tasks 4 and 5.
- Polygon metric chart is covered by `RadarChart` in Task 4.
- No overview page is preserved by routing only `/` and `/versions/:patchId`, with `/` as the list page.
- Error fallback for unknown patch IDs is covered by Task 5.
- Build and manual verification are covered by Task 6.

Placeholder scan: no TBD/TODO/fill-in-later steps remain.

Type consistency: all shared types come from `src/data/versionMock.ts`; component props reference those exported types consistently.
