import { ArrowRight, CalendarDays, ShieldAlert, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime, formatScore, riskLabel, VersionDetail } from '../data/versionMock';

interface VersionRowCardProps {
  version: VersionDetail;
}

function VersionRowCard({ version }: VersionRowCardProps) {
  return (
    <Link className={`version-row risk-line-${version.riskLevel.toLowerCase()}`} to={`/versions/${version.patchId}`}>
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
          <span><UserRound size={14} aria-hidden="true" />{version.patchOwner} / {version.testLeader}</span>
          <span><CalendarDays size={14} aria-hidden="true" />{formatDateTime(version.actualTestFromTime)} 至 {formatDateTime(version.actualTestToTime)}</span>
          <span><ShieldAlert size={14} aria-hidden="true" />快照 {formatDateTime(version.snapshotsTs)}</span>
        </div>
      </div>
      <div className="row-score-pair">
        <span>质量 <strong>{version.qualityScore.toFixed(2)}</strong></span>
        <span>行为 <strong>{version.behaviorScore.toFixed(2)}</strong></span>
      </div>
      <ArrowRight className="row-arrow" size={20} aria-hidden="true" />
    </Link>
  );
}

export default VersionRowCard;
