import { CSSProperties } from 'react';
import { ArrowLeft, CalendarClock, Cpu, GitBranch, ListChecks, Target, UsersRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import InfoPanel from '../components/InfoPanel';
import MetricScoreCards from '../components/MetricScoreCards';
import PhaseScoreBars from '../components/PhaseScoreBars';
import ScoreHero from '../components/ScoreHero';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { formatDateTime, formatScore, getVersionByPatchId, riskLabel } from '../data/versionMock';
import { buildVersionDetailInsights } from './versionDetailInsights';

function formatPercent(value: unknown) {
  return typeof value === 'number' ? `${Math.round(value * 100)}%` : '--';
}

function ChartNumber({ value }: { value: number }) {
  return <strong>{Number.isInteger(value) ? value : value.toFixed(1)}</strong>;
}

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

  const insights = buildVersionDetailInsights(version);
  const coverageMetric = version.metrics.find((metric) => metric.metricCode === 'COVERAGE_390');
  const defectMetric = version.metrics.find((metric) => metric.metricCode === 'DEFECT_RISK');
  const mediumRiskCount = version.metrics.filter((metric) => metric.riskLevel === 'MEDIUM').length;
  const highRiskCount = version.metrics.filter((metric) => metric.riskLevel === 'HIGH').length;

  return (
    <main className="page-shell detail-page cockpit-page">
      <header className="detail-header">
        <div className="detail-header-right">
          <div className="detail-title-block">
            <p className="eyebrow">VERSION COCKPIT</p>
            <h1>{version.summary}</h1>
            <div className="detail-tags">
              <span>{version.status}</span>
              <span>{version.releaseType}</span>
              <span>{formatDateTime(version.snapshotsTs)}</span>
            </div>
          </div>
          <div className="detail-header-actions">
            <Link className="detail-return-link" to="/versions"><ArrowLeft size={14} aria-hidden="true" />列表</Link>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Score Hero */}
      <ScoreHero version={version} />

      {/* Identity Bar */}
      <section className="identity-bar" aria-label="版本身份">
        <span><Cpu size={15} aria-hidden="true" />{version.subNamedSystemName}</span>
        <span className="identity-sep" aria-hidden="true" />
        <span><GitBranch size={15} aria-hidden="true" />{version.sysId} / {version.systemLevel}</span>
        <span className="identity-sep" aria-hidden="true" />
        <span><UsersRound size={15} aria-hidden="true" />{version.teamName}</span>
        <span className="identity-sep" aria-hidden="true" />
        <span>负责人 {version.patchOwner} / 测试 {version.testLeader}</span>
        <span className="identity-sep" aria-hidden="true" />
        <span><CalendarClock size={15} aria-hidden="true" />审计 {formatDateTime(version.auditTime)}</span>
      </section>

      <section className="cockpit-core cockpit-motion-sequence" aria-label="L3座舱核心">
        <div className="cockpit-wing cockpit-wing-left">
          <InfoPanel title="阶段得分" kicker="BARS">
            <PhaseScoreBars groups={version.byPhase} />
          </InfoPanel>
          <InfoPanel title="责任链路" kicker="OWNERS">
            <div className="owner-stack">
              <div><UsersRound size={17} aria-hidden="true" /><span>版本负责人</span><strong>{version.patchOwner}</strong><em>{version.patchOwnerAccount}</em></div>
              <div><ListChecks size={17} aria-hidden="true" /><span>测试负责人</span><strong>{version.testLeader}</strong><em>{version.testLeaderAccount}</em></div>
              <div><Target size={17} aria-hidden="true" /><span>开发负责人</span><strong>{version.devLeader}</strong><em>{version.devLeaderAccount}</em></div>
            </div>
          </InfoPanel>
        </div>

        <div className="cockpit-center">
          <InfoPanel title="指标雷达" kicker="CORE RADAR" className="cockpit-radar-panel">
            <MetricScoreCards version={version} />
          </InfoPanel>
        </div>

        <div className="cockpit-wing cockpit-wing-right">
          <InfoPanel title="风险与覆盖" kicker="SIGNALS">
          <div className="cockpit-signal-stack">
            <div className="risk-stack-card">
              <div className="mini-chart-head">
                <span>风险构成</span>
                <strong>{riskLabel(version.riskLevel)}</strong>
              </div>
              <div className="risk-stack-bar" aria-label={`风险构成：高风险${highRiskCount}，中风险${mediumRiskCount}`}>
                {insights.chartCards.riskComposition.map((item) => (
                  <span
                    className={`risk-stack-segment risk-stack-${item.riskLevel.toLowerCase()}`}
                    key={item.riskLevel}
                    style={{ '--segment-width': `${Math.max((item.value / version.metrics.length) * 100, item.value > 0 ? 8 : 0)}%` } as CSSProperties}
                  />
                ))}
              </div>
              <div className="risk-stack-legend">
                {insights.chartCards.riskComposition.map((item) => (
                  <span key={item.riskLevel}>{item.label}<b>{item.value}</b></span>
                ))}
              </div>
            </div>
            <div className="coverage-chart-card">
              <div className="mini-chart-head">
                <span>覆盖率</span>
                <strong>{formatPercent(coverageMetric?.features?.coverageRate)}</strong>
              </div>
              <div className="coverage-bars">
                {insights.chartCards.coverageSeries.map((item) => (
                  <div className="coverage-bar-row" key={item.label}>
                    <span>{item.label}</span>
                    <div className="coverage-bar-track">
                      <i style={{ '--bar-width': `${Math.min(100, Math.round(item.rate * 100))}%` } as CSSProperties} />
                    </div>
                    <strong>{Math.round(item.rate * 100)}%</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="defect-donut-card">
              <div className="mini-chart-head">
                <span>缺陷/周期</span>
                <strong>{String(defectMetric?.features?.defectNum ?? '--')} 个</strong>
              </div>
              <div className="defect-ring" style={{ '--ring-value': `${Math.min(100, ((Number(defectMetric?.features?.testDay) || 0) / Math.max(Number(defectMetric?.features?.totalDays) || 1, 1)) * 100)}%` } as CSSProperties}>
                <ChartNumber value={Number(defectMetric?.features?.testDay ?? 0)} />
                <span>测试天数</span>
              </div>
            </div>
          </div>
          </InfoPanel>
        </div>
      </section>

      <section className="diagnostic-zone" aria-label="三视角诊断">
        {insights.diagnosticViews.filter((view) => view.key !== 'phase').map((view) => (
          <InfoPanel title={view.title} kicker="DIAG" key={view.key}>
            <PhaseScoreBars groups={view.groups} />
          </InfoPanel>
        ))}
      </section>

      <section className="timeline-zone" aria-label="版本时间轴">
        <InfoPanel title="计划 / 实际时间轴" kicker="TIMELINE">
          <div className="timeline-chart">
            <div className="snapshot-marker" style={{ '--marker-left': `${insights.chartCards.snapshotMarker.offsetPercent}%` } as CSSProperties}>
              <span>{insights.chartCards.snapshotMarker.label}</span>
              <strong>{insights.chartCards.snapshotMarker.timeLabel}</strong>
            </div>
            {insights.chartCards.scheduleBars.map((bar) => (
              <div className="timeline-row" key={bar.label}>
                <span>{bar.label}</span>
                <div className="timeline-track">
                  <i
                    style={{
                      '--bar-left': `${bar.offsetPercent}%`,
                      '--bar-width': `${bar.widthPercent}%`,
                    } as CSSProperties}
                  />
                </div>
                <strong>{bar.durationDays} 天</strong>
                <em>{bar.startLabel} 至 {bar.endLabel}</em>
              </div>
            ))}
          </div>
        </InfoPanel>
      </section>

      <section className="focus-zone" aria-label="下一步关注">
        <InfoPanel title="下一步关注" kicker="FOCUS">
          <div className="focus-list">
            {insights.focusItems.length > 0 ? insights.focusItems.map((item, index) => (
              <div className="focus-item" key={item.metricCode}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{item.title}</strong>
                  <em>{item.meta}</em>
                  <p>{item.action}</p>
                </div>
              </div>
            )) : (
              <div className="focus-empty">当前没有中高风险指标，保持覆盖率与缺陷趋势巡检。</div>
            )}
          </div>
        </InfoPanel>
      </section>

      <section className="evidence-zone" aria-label="指标证据清单">
        <InfoPanel title="指标证据清单" kicker="EVIDENCE">
          <div className="evidence-table">
            {insights.evidenceRows.map((row) => (
              <article className={`evidence-row metric-risk-${String(row.riskLevel).toLowerCase()}`} key={row.metricCode}>
                <div className="evidence-title">
                  <strong>{row.metricName}</strong>
                  <span>{row.phaseName} / {row.dataDimensionName} / {row.evalTargetName}</span>
                </div>
                <div className="evidence-score">
                  <strong>{formatScore(row.actualScore)}</strong>
                  <em>计算 {formatScore(row.calcScore)}</em>
                </div>
                <div className="evidence-facts">
                  {row.facts.slice(0, 8).map((fact) => (
                    <span key={`${row.metricCode}-${fact.label}`}>
                      <em>{fact.label}</em>
                      <strong>{fact.value}</strong>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </InfoPanel>
      </section>
    </main>
  );
}

export default VersionDetailPage;
