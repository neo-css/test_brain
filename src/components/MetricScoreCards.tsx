import { CSSProperties, useMemo } from 'react';
import type { MetricItem, VersionDetail } from '../data/versionMock';
import { polarPoint, pointsToString, type RadarPoint } from './radarUtils';

interface MetricScoreCardsProps {
  version: VersionDetail;
}

const MAX_SCORE = 5;
const VIEW_SIZE = 440;
const CENTER = VIEW_SIZE / 2;
const MAX_RADIUS = 120;
const OUTER_RADIUS = 190;

function riskClass(level?: string): string {
  if (level === 'HIGH') return 'metric-radar-risk-high';
  if (level === 'MEDIUM') return 'metric-radar-risk-medium';
  return 'metric-radar-risk-low';
}

function textAnchor(index: number, total: number): 'start' | 'middle' | 'end' {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  const cos = Math.cos(angle);
  if (cos > 0.3) return 'start';
  if (cos < -0.3) return 'end';
  return 'middle';
}

function dyOffset(index: number, total: number): number {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  const sin = Math.sin(angle);
  if (sin < -0.3) return -8;
  if (sin > 0.3) return 14;
  return 4;
}

/** Split a metric name into lines of at most `maxChars` characters */
function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const lines: string[] = [];
  let rest = text;
  while (rest.length > maxChars) {
    let breakAt = rest.lastIndexOf('，', maxChars);
    if (breakAt < 1) breakAt = rest.lastIndexOf('、', maxChars);
    if (breakAt < 1) breakAt = maxChars;
    lines.push(rest.slice(0, breakAt));
    rest = rest.slice(breakAt);
  }
  if (rest) lines.push(rest);
  return lines;
}

export function buildMetricRadarPoints(metrics: MetricItem[], center: number, maxRadius: number): RadarPoint[] {
  return metrics.map((metric, index) => {
    const ratio = Math.min(Math.max(metric.actualScore / MAX_SCORE, 0), 1);
    const radius = Math.max(12, ratio * maxRadius);
    return polarPoint(index, metrics.length, radius, center);
  });
}

function MetricScoreCards({ version }: MetricScoreCardsProps) {
  const metrics = version.metrics;
  const total = metrics.length;
  const center = CENTER;
  const maxRadius = MAX_RADIUS;
  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  const axisPoints = metrics.map((_, index) => polarPoint(index, total, maxRadius, center));
  const outerPoints = metrics.map((_, index) => polarPoint(index, total, OUTER_RADIUS, center));
  const scorePoints = useMemo(
    () =>
      metrics.map((metric, index) => {
        const ratio = Math.min(Math.max(metric.actualScore / MAX_SCORE, 0), 1);
        const radius = Math.max(12, ratio * maxRadius);
        return polarPoint(index, total, radius, center);
      }),
    [metrics, maxRadius, center, total],
  );

  const labelPoints = metrics.map((_, index) =>
    polarPoint(index, total, OUTER_RADIUS + 8, center),
  );

  return (
    <div className="metric-radar-wrap">
      <svg
        className="metric-radar-chart"
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        role="img"
        aria-label="指标得分雷达图"
      >
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={pointsToString(metrics.map((_, index) => polarPoint(index, total, maxRadius * ring, center)))}
            className="radar-ring"
          />
        ))}
        {axisPoints.map((point, index) => (
          <line
            key={metrics[index].metricCode}
            x1={center} y1={center} x2={point.x} y2={point.y}
            className="radar-axis"
          />
        ))}
        <polygon points={pointsToString(outerPoints)} className="metric-radar-outer-ring" />
        {outerPoints.map((point, index) => (
          <circle
            key={`outer-${metrics[index].metricCode}`}
            cx={point.x} cy={point.y} r="3"
            className={`metric-radar-outer-dot ${riskClass(metrics[index].riskLevel)}`}
          />
        ))}
        <polygon points={pointsToString(scorePoints)} className="metric-radar-score metric-radar-score-animated" />
        {scorePoints.map((point, index) => {
          const metric = metrics[index];
          return (
            <circle
              key={metric.metricCode}
              cx={point.x} cy={point.y} r="4.5"
              className={`metric-radar-dot metric-radar-dot-animated ${riskClass(metric.riskLevel)}`}
              style={{ '--delay-index': index } as CSSProperties}
            />
          );
        })}
        {labelPoints.map((point, index) => {
          const metric = metrics[index];
          const anchor = textAnchor(index, total);
          const dy = dyOffset(index, total);
          const meta = `${metric.phaseName ?? '未知阶段'} / ${metric.evalTargetName ?? '未知目标'}`;
          const ariaLabel = `${metric.metricName}，得分 ${metric.actualScore.toFixed(1)}，${meta}`;
          const nameLines = wrapText(metric.metricName, 7);
          return (
            <g
              key={`${metric.metricCode}-label`}
              className="metric-radar-label-group metric-radar-label-animated"
              style={{ '--delay-index': index } as CSSProperties}
              role="text"
              aria-label={ariaLabel}
            >
              {nameLines.map((line, li) => (
                <text
                  key={li}
                  x={point.x}
                  y={point.y + dy + li * 14}
                  textAnchor={anchor}
                  className="metric-radar-label-name"
                >
                  {line}
                </text>
              ))}
              <text
                x={point.x}
                y={point.y + dy + nameLines.length * 14}
                textAnchor={anchor}
                className={`metric-radar-label-score ${riskClass(metric.riskLevel)}`}
              >
                {metric.actualScore.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default MetricScoreCards;
