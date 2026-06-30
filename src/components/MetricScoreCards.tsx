import { CSSProperties } from 'react';
import { VersionDetail } from '../data/versionMock';

interface MetricScoreCardsProps {
  version: VersionDetail;
}

const MAX_SCORE = 5;
const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function riskClass(level?: string): string {
  if (level === 'HIGH') return 'card-risk-high';
  if (level === 'MEDIUM') return 'card-risk-medium';
  return 'card-risk-low';
}

function MetricScoreCards({ version }: MetricScoreCardsProps) {
  return (
    <div className="metric-cards">
      {version.metrics.map((metric, index) => {
        const ratio = Math.min(Math.max(metric.actualScore / MAX_SCORE, 0), 1);
        const dashOffset = RING_CIRCUMFERENCE * (1 - ratio);
        const style = { '--card-index': index } as CSSProperties;

        return (
          <div key={metric.metricCode} className={`metric-card ${riskClass(metric.riskLevel)}`} style={style}>
            <div className="metric-card-head">
              <span className="metric-card-name">{metric.metricName}</span>
              <span className="metric-card-ring" role="meter" aria-valuenow={metric.actualScore} aria-valuemin={0} aria-valuemax={MAX_SCORE} aria-label={`${metric.metricName}得分`}>
                <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
                  <circle cx="32" cy="32" r={RING_RADIUS} className="ring-track" fill="none" strokeWidth="5" />
                  <circle
                    cx="32"
                    cy="32"
                    r={RING_RADIUS}
                    className="ring-fill"
                    fill="none"
                    strokeWidth="5"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <strong>{metric.actualScore.toFixed(1)}</strong>
              </span>
            </div>
            <div className="metric-card-foot">
              <span>{metric.phaseName ?? '未知阶段'}</span>
              <span>{metric.evalTargetName ?? '未知目标'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MetricScoreCards;
