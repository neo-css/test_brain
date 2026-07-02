import { CSSProperties } from 'react';
import type { MetricItem, VersionDetail } from '../data/versionMock';

interface MetricScoreCardsProps {
  version: VersionDetail;
}

interface RadarPoint {
  x: number;
  y: number;
}

const MAX_SCORE = 5;
const LABEL_WIDTH = 112;
const LABEL_HEIGHT = 46;
const LABEL_OFFSET = 14;

function polarPoint(index: number, total: number, radius: number, center: number): RadarPoint {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function pointsToString(points: RadarPoint[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function riskClass(level?: string): string {
  if (level === 'HIGH') return 'metric-radar-risk-high';
  if (level === 'MEDIUM') return 'metric-radar-risk-medium';
  return 'metric-radar-risk-low';
}

function labelAnchorPoint(index: number, total: number, radius: number, center: number): RadarPoint {
  const axisPoint = polarPoint(index, total, radius + LABEL_OFFSET, center);
  const horizontalBias = axisPoint.x < center - 8 ? -LABEL_WIDTH : axisPoint.x > center + 8 ? 0 : -LABEL_WIDTH / 2;
  const verticalBias = axisPoint.y < center - 8 ? -LABEL_HEIGHT : axisPoint.y > center + 8 ? 0 : -LABEL_HEIGHT / 2;

  return {
    x: Math.min(Math.max(axisPoint.x + horizontalBias, 4), center * 2 - LABEL_WIDTH - 4),
    y: Math.min(Math.max(axisPoint.y + verticalBias, 4), center * 2 - LABEL_HEIGHT - 4),
  };
}

export function buildMetricRadarPoints(metrics: MetricItem[], center: number, maxRadius: number): RadarPoint[] {
  return metrics.map((metric, index) => {
    const ratio = Math.min(Math.max(metric.actualScore / MAX_SCORE, 0), 1);
    const radius = Math.max(12, ratio * maxRadius);
    return polarPoint(index, metrics.length, radius, center);
  });
}

function MetricScoreCards({ version }: MetricScoreCardsProps) {
  const size = 320;
  const center = size / 2;
  const maxRadius = 124;
  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  const metrics = version.metrics;
  const axisPoints = metrics.map((_, index) => polarPoint(index, metrics.length, maxRadius, center));
  const scorePoints = buildMetricRadarPoints(metrics, center, maxRadius);

  return (
    <div className="metric-radar-wrap">
      <svg className="metric-radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="指标得分雷达图">
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={pointsToString(metrics.map((_, index) => polarPoint(index, metrics.length, maxRadius * ring, center)))}
            className="radar-ring"
          />
        ))}
        {axisPoints.map((point, index) => (
          <line key={metrics[index].metricCode} x1={center} y1={center} x2={point.x} y2={point.y} className="radar-axis" />
        ))}
        <polygon points={pointsToString(scorePoints)} className="metric-radar-score metric-radar-score-animated" />
        {scorePoints.map((point, index) => {
          const metric = metrics[index];
          return (
            <circle
              key={metric.metricCode}
              cx={point.x}
              cy={point.y}
              r="4.5"
              className={`metric-radar-dot metric-radar-dot-animated ${riskClass(metric.riskLevel)}`}
              style={{ '--delay-index': index } as CSSProperties}
            />
          );
        })}
        {metrics.map((metric, index) => {
          const labelPoint = labelAnchorPoint(index, metrics.length, maxRadius, center);
          const meta = `${metric.phaseName ?? '未知阶段'} / ${metric.evalTargetName ?? '未知目标'}`;
          const label = `${metric.metricName}，得分 ${metric.actualScore.toFixed(1)}，${meta}`;

          return (
            <foreignObject
              key={`${metric.metricCode}-label`}
              x={labelPoint.x}
              y={labelPoint.y}
              width={LABEL_WIDTH}
              height={LABEL_HEIGHT}
            >
              <div
                className="metric-radar-point-label metric-radar-label-animated"
                aria-label={label}
                title={label}
                style={{ '--delay-index': index } as CSSProperties}
              >
                <span className={`metric-radar-label-dot ${riskClass(metric.riskLevel)}`} />
                <strong className="metric-radar-label-name">{metric.metricName}</strong>
                <em className="metric-radar-label-score">{metric.actualScore.toFixed(1)}</em>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}

export default MetricScoreCards;
