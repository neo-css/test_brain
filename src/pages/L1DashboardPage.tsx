import { useState } from 'react';
import { Link } from 'react-router-dom';
import DynamicTopology from '../components/DynamicTopology';
import type { ScannerRisk } from '../components/DynamicTopologyLogic';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { formatScore, riskLabel } from '../data/versionMock';
import { useCollectionVersions } from '../services/tedSbrain/useTedSbrainVersions';
import { buildL1DashboardSummary } from './l1DashboardSummary';

const fromHomeState = { from: '/', fromLabel: '返回首页' };
const topologyRiskFilters: ScannerRisk[] = ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];

interface L1DashboardPageProps {
  mode?: 'home' | 'version-overview';
}

function riskClass(riskLevel: string) {
  return `risk-${riskLevel.toLowerCase()}`;
}

function topologyFilterLabel(filter: ScannerRisk) {
  if (filter === 'ALL') return '全部风险';
  return riskLabel(filter);
}

function L1DashboardPage({ mode = 'home' }: L1DashboardPageProps) {
  const [topologyRisk, setTopologyRisk] = useState<ScannerRisk>('ALL');
  const [scannerSpeed, setScannerSpeed] = useState(1);
  const { status, versions, error } = useCollectionVersions();
  const summary = buildL1DashboardSummary(versions);
  const l2State = { from: '/', fromLabel: '返回首页' };
  const detailState = mode === 'version-overview'
    ? { from: '/versions/overview', fromLabel: '返回态势感知' }
    : { from: '/', fromLabel: '返回首页' };

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

  return (
    <main className="l1-page">
      <div className="l1-atmosphere" aria-hidden="true" />

      <header className="l1-command-header">
        <Link className="l1-brand-lockup" to="/versions" state={l2State}>
          <span>VERSION MODULE</span>
          <strong>态势感知</strong>
        </Link>
        <div className="l1-header-actions">
          <Link className="l1-header-link" to="/versions" state={l2State}>进入版本列表</Link>
          <ThemeSwitcher />
        </div>
      </header>

      <section className="l1-command-grid" aria-label="L1 全域质量态势">
        <aside className="l1-command-panel">
          <div className="l1-hero-score" aria-label="全域平均分">
            <span>平均质量分</span>
            <strong>{formatScore(summary.averageScore)}</strong>
            <em>最新快照 {summary.latestSnapshot}</em>
          </div>

          <div className="l1-metric-grid" aria-label="全域风险摘要">
            <Link to="/versions" state={fromHomeState}>
              <span>在测版本</span>
              <strong>{summary.totalVersions}</strong>
            </Link>
            <Link to="/versions" state={fromHomeState}>
              <span>高风险占比</span>
              <strong>{summary.highRiskRatio}%</strong>
            </Link>
            <Link to="/versions" state={fromHomeState}>
              <span>中风险</span>
              <strong>{summary.riskCounts.MEDIUM}</strong>
            </Link>
            <Link to="/versions" state={fromHomeState}>
              <span>低风险</span>
              <strong>{summary.riskCounts.LOW}</strong>
            </Link>
          </div>

          <div className="l1-risk-strip" aria-label="风险等级分布">
            <span className="risk-high" style={{ flexGrow: Math.max(summary.riskCounts.HIGH, 1) }}>
              高 {summary.riskCounts.HIGH}
            </span>
            <span className="risk-medium" style={{ flexGrow: Math.max(summary.riskCounts.MEDIUM, 1) }}>
              中 {summary.riskCounts.MEDIUM}
            </span>
            <span className="risk-low" style={{ flexGrow: Math.max(summary.riskCounts.LOW, 1) }}>
              低 {summary.riskCounts.LOW}
            </span>
          </div>

          <div className="l1-priority-list">
            <div className="l1-section-heading">
              <span>PRIORITY</span>
              <strong>重点关注版本</strong>
            </div>
            {summary.priorityVersions.map((version) => (
              <Link
                className={`l1-priority-row ${riskClass(version.riskLevel)}`}
                key={version.patchId}
                to={`/versions/${version.patchId}`}
                state={detailState}
              >
                <span>{version.sysId}</span>
                <div>
                  <strong>{version.subNamedSystemName}</strong>
                  <em>{version.status} / {version.teamName}</em>
                </div>
                <b>{formatScore(version.totalScore)}</b>
              </Link>
            ))}
          </div>
        </aside>

        <section className="l1-canvas-shell" aria-label="L1 全域质量拓扑">
          <div className="l1-canvas-header">
            <div className="l1-canvas-title">
              <span>AI GUARDIAN MAP</span>
              <strong>全域扫描拓扑</strong>
            </div>
            <div className="l1-canvas-controls">
              <label className="l1-risk-filter">
                <span>风险筛选</span>
                <select
                  value={topologyRisk}
                  aria-label="拓扑风险筛选"
                  onChange={(event) => setTopologyRisk(event.target.value as ScannerRisk)}
                >
                {topologyRiskFilters.map((filter) => (
                  <option
                    key={filter}
                    value={filter}
                  >
                    {topologyFilterLabel(filter)}
                  </option>
                ))}
                </select>
              </label>
              <label className="l1-speed-control">
                <span>扫描速度</span>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.1"
                  value={scannerSpeed}
                  aria-label="调整扫描速度"
                  onChange={(event) => setScannerSpeed(Number(event.target.value))}
                />
                <strong>{scannerSpeed.toFixed(1)}x</strong>
              </label>
            </div>
          </div>
          <div className="l1-canvas-card">
            <DynamicTopology
              versions={versions}
              scannerRisk={topologyRisk}
              scannerSpeed={scannerSpeed}
              detailState={detailState}
            />
          </div>
          <div className="l1-canvas-footer" aria-label="拓扑风险图例">
            {(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'] as const).map((riskLevel) => (
              <span className={riskClass(riskLevel)} key={riskLevel}>
                <i aria-hidden="true" />
                {riskLabel(riskLevel)}
              </span>
            ))}
            <em>单击光柱节点进入版本详情</em>
          </div>
        </section>
      </section>
    </main>
  );
}

export default L1DashboardPage;
