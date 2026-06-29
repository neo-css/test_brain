import { CSSProperties } from 'react';
import { MetricGroup } from '../data/versionMock';

interface RadarChartProps {
  groups: MetricGroup[];
}

interface RadarPoint {
  x: number;
  y: number;
}

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

export function buildRadarPoints(groups: MetricGroup[], center: number, maxRadius: number): RadarPoint[] {
  const maxScore = Math.max(...groups.map((group) => group.groupScore), 10);
  return groups.map((group, index) => {
    const radius = Math.max(12, (group.groupScore / maxScore) * maxRadius);
    return polarPoint(index, groups.length, radius, center);
  });
}

function RadarChart({ groups }: RadarChartProps) {
  const size = 280;
  const center = size / 2;
  const maxRadius = 110;
  const rings = [0.25, 0.5, 0.75, 1];
  const axisPoints = groups.map((_, index) => polarPoint(index, groups.length, maxRadius, center));
  const scorePoints = buildRadarPoints(groups, center, maxRadius);

  return (
    <div className="radar-wrap">
      <svg className="radar-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="阶段得分多边形指标图">
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={pointsToString(groups.map((_, index) => polarPoint(index, groups.length, maxRadius * ring, center)))}
            className="radar-ring"
          />
        ))}
        {axisPoints.map((point, index) => (
          <line key={groups[index].key} x1={center} y1={center} x2={point.x} y2={point.y} className="radar-axis" />
        ))}
        <polygon points={pointsToString(scorePoints)} className="radar-score radar-score-animated" />
        {scorePoints.map((point, index) => (
          <circle
            key={groups[index].key}
            cx={point.x}
            cy={point.y}
            r="4"
            className="radar-dot radar-dot-animated"
            style={{ '--delay-index': index } as CSSProperties}
          />
        ))}
      </svg>
      <div className="radar-labels">
        {groups.map((group, index) => (
          <span
            key={group.key}
            className="radar-label radar-label-animated"
            style={{ '--delay-index': index } as CSSProperties}
          >
            {group.displayName} {group.groupScore.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RadarChart;
