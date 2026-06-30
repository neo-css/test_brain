import { useState } from 'react';
import { Link } from 'react-router-dom';
import DynamicTopology from '../components/DynamicTopology';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { formatScore, riskLabel, versionDetails } from '../data/versionMock';
import { buildL1DashboardSummary } from './l1DashboardSummary';

type TopologyRiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

const fromHomeState = { from: '/', fromLabel: '返回测试大脑' };
const topologyRiskFilters: TopologyRiskFilter[] = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

function riskClass(riskLevel: string) {
  return `risk-${riskLevel.toLowerCase()}`;
}

function topologyFilterLabel(filter: TopologyRiskFilter) {
  if (filter === 'ALL') return '下发全部探测器';
  return `下发${riskLabel(filter)}探测器`;
}

function L1DashboardPage() {
  const [topologyRisk, setTopologyRisk] = useState<TopologyRiskFilter>('ALL');
  const [scannerSpeed, setScannerSpeed] = useState(1);
  const summary = buildL1DashboardSummary(versionDetails);
  const l2State = { from: '/', fromLabel: '返回测试大脑' };

  return (
    <main className="l1-page">
      <div className="l1-atmosphere" aria-hidden="true" />

      <header className="l1-command-header">
        <Link className="l1-brand-lockup" to="/versions" state={l2State}>
          <span>L1 COMMAND</span>
          <strong>全域在测版本态势</strong>
        </Link>
        <div className="l1-header-actions">
          <Link className="l1-header-link" to="/versions" state={l2State}>进入 L2 态势感知</Link>
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
                state={fromHomeState}
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
            <div className="l1-risk-filter" role="group" aria-label="拓扑风险扫描筛选">
              {topologyRiskFilters.map((filter) => (
                <button
                  className={topologyRisk === filter ? 'active' : ''}
                  key={filter}
                  type="button"
                  aria-label={topologyFilterLabel(filter)}
                  onClick={() => setTopologyRisk(filter)}
                >
                  {topologyFilterLabel(filter)}
                </button>
              ))}
            </div>
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
          <div className="l1-canvas-card">
            <DynamicTopology versions={versionDetails} scannerRisk={topologyRisk} scannerSpeed={scannerSpeed} />
          </div>
          <div className="l1-canvas-footer" aria-label="拓扑风险图例">
            {(['HIGH', 'MEDIUM', 'LOW'] as const).map((riskLevel) => (
              <span className={riskClass(riskLevel)} key={riskLevel}>
                <i aria-hidden="true" />
                {riskLabel(riskLevel)}
              </span>
            ))}
            <em>单击光柱节点进入 L3</em>
          </div>
        </section>
      </section>
    </main>
  );
}

export default L1DashboardPage;
