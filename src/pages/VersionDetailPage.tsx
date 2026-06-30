import { ArrowLeft, CalendarClock, Cpu, GitBranch, UsersRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import InfoPanel from '../components/InfoPanel';
import MetricRiskList from '../components/MetricRiskList';
import MetricScoreCards from '../components/MetricScoreCards';
import PhaseScoreBars from '../components/PhaseScoreBars';
import RadarChart from '../components/RadarChart';
import ScoreHero from '../components/ScoreHero';
import ThemeSwitcher from '../components/ThemeSwitcher';
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
    <main className="page-shell detail-page cockpit-page">
      {/* Header */}
      <header className="detail-header">
        <Link className="back-link" to="/"><ArrowLeft size={18} aria-hidden="true" />返回列表</Link>
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
          <ThemeSwitcher />
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

      {/* Chart Zone */}
      <section className="chart-zone">
        <InfoPanel title="阶段雷达" kicker="RADAR">
          <RadarChart groups={version.byPhase} />
        </InfoPanel>
        <InfoPanel title="阶段得分" kicker="BARS">
          <PhaseScoreBars groups={version.byPhase} />
        </InfoPanel>
        <InfoPanel title="指标得分卡" kicker="SCORES">
          <MetricScoreCards version={version} />
        </InfoPanel>
      </section>

      {/* Bottom Zone */}
      <section className="bottom-zone">
        <InfoPanel title="指标风险清单" kicker="METRICS">
          <MetricRiskList version={version} />
        </InfoPanel>
        <InfoPanel title="执行摘要" kicker="OPERATIONS">
          <div className="operation-grid">
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
