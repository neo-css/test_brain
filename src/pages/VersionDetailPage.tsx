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
      <main className="page-shell detail-page cockpit-page">
      <header className="detail-header">
        <Link className="back-link" to="/"><ArrowLeft size={18} aria-hidden="true" />返回列表</Link>
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
            <span><Cpu size={16} aria-hidden="true" />{version.subNamedSystemName}</span>
            <span><GitBranch size={16} aria-hidden="true" />{version.sysId} / {version.systemLevel}</span>
            <span><UsersRound size={16} aria-hidden="true" />{version.teamName}</span>
            <span><CalendarClock size={16} aria-hidden="true" />审计 {formatDateTime(version.auditTime)}</span>
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
