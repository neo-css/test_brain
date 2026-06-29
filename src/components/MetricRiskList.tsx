import { CSSProperties } from 'react';
import { formatScore, riskLabel, VersionDetail } from '../data/versionMock';

interface MetricRiskListProps {
  version: VersionDetail;
}

function MetricRiskList({ version }: MetricRiskListProps) {
  return (
    <div className="metric-list">
      {version.metrics.map((metric, index) => (
        <div
          className={`metric-row metric-risk-${(metric.riskLevel ?? 'LOW').toLowerCase()}`}
          key={metric.metricCode}
          style={{ '--delay-index': index } as CSSProperties}
        >
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
