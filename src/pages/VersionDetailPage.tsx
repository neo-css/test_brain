import { CSSProperties, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import InfoPanel from '../components/InfoPanel';
import MetricScoreCards from '../components/MetricScoreCards';
import PhaseScoreBars from '../components/PhaseScoreBars';
import ScoreHero from '../components/ScoreHero';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { formatDateTime, formatScore, riskLabel } from '../data/versionMock';
import { usePatchDetail } from '../services/tedSbrain/useTedSbrainVersions';
import { buildVersionDetailInsights } from './versionDetailInsights';

function formatPercent(value: unknown) {
  return typeof value === 'number' ? `${Math.round(value * 100)}%` : '--';
}

function ChartNumber({ value }: { value: number }) {
  return <strong>{Number.isInteger(value) ? value : value.toFixed(1)}</strong>;
}

function VersionDetailPage() {
  const { patchId } = useParams();
  const location = useLocation();
  const numericPatchId = Number(patchId);
  const { status: detailStatus, version, error } = usePatchDetail(numericPatchId);
  const routeState = location.state as { from?: string; fromLabel?: string } | null;
  const returnTarget = routeState?.from ?? '/versions';
  const returnLabel = routeState?.fromLabel ?? '返回版本列表';
  const insights = useMemo(() => (version ? buildVersionDetailInsights(version) : null), [version]);
  const defaultMetricCode = useMemo(() => {
    const evidenceRows = insights?.evidenceRows ?? [];
    return evidenceRows.find((row) => row.metricName.includes('版本变更风险'))?.metricCode
      ?? evidenceRows.find((row) => row.metricCode === 'CHANGES_RISK')?.metricCode
      ?? evidenceRows[0]?.metricCode;
  }, [insights]);
  const [selectedMetricCode, setSelectedMetricCode] = useState<string | undefined>();
  const activeMetricCode = selectedMetricCode ?? defaultMetricCode;
  const selectedEvidence = activeMetricCode
    ? insights?.evidenceRows.find((row) => row.metricCode === activeMetricCode)
    : undefined;

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

  if (!version || !insights) {
    return (
      <main className="page-shell detail-page detail-empty">
        <h1>未找到版本</h1>
        <Link className="back-link" to="/">返回在测版本列表</Link>
      </main>
    );
  }

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
            <Link className="detail-return-link" to={returnTarget}><ArrowLeft size={14} aria-hidden="true" />{returnLabel}</Link>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Score Hero */}
      <ScoreHero version={version} />

      <section className="detail-top-zone" aria-label="版本时间与责任">
        <section className="timeline-zone" aria-label="版本时间轴">
          <InfoPanel title="计划 / 实际时间轴" kicker="TIMELINE">
            <div className="timeline-chart">
              {insights.chartCards.scheduleBars.map((bar) => (
                <div className="timeline-row" key={bar.label}>
                  <span>{bar.label}</span>
                  <div
                    className="timeline-track"
                    title={`${bar.label}: ${bar.startLabel} 至 ${bar.endLabel}，持续 ${bar.durationDays} 天`}
                  >
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
      </section>

      <section className="cockpit-core cockpit-motion-sequence" aria-label="L3座舱核心">
        <div className="cockpit-wing cockpit-wing-left">
          <InfoPanel title="阶段得分" kicker="BARS">
            <PhaseScoreBars groups={version.byPhase} />
          </InfoPanel>
          {selectedEvidence ? (
            <div className={`metric-evidence-panel metric-risk-${String(selectedEvidence.riskLevel).toLowerCase()}`} aria-live="polite">
              <div className="metric-evidence-head">
                <div>
                  <span>EVIDENCE</span>
                  <strong>{selectedEvidence.metricName}</strong>
                  <em>{selectedEvidence.phaseName} / {selectedEvidence.dataDimensionName} / {selectedEvidence.evalTargetName}</em>
                </div>
                <div className="metric-evidence-score">
                  <strong>{formatScore(selectedEvidence.actualScore)}</strong>
                  <em>计算 {formatScore(selectedEvidence.calcScore)}</em>
                </div>
              </div>
              <div className="metric-evidence-facts">
                {selectedEvidence.facts.map((fact) => (
                  <span key={`${selectedEvidence.metricCode}-${fact.label}`}>
                    <em>{fact.label}</em>
                    <strong>{fact.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="cockpit-center">
          <InfoPanel kicker="CORE RADAR" className="cockpit-radar-panel">
            <MetricScoreCards
              version={version}
              selectedMetricCode={activeMetricCode}
              onSelectMetric={setSelectedMetricCode}
            />
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
    </main>
  );
}

export default VersionDetailPage;
