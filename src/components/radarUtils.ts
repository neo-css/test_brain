export interface RadarPoint {
  x: number;
  y: number;
}

export function polarPoint(index: number, total: number, radius: number, center: number): RadarPoint {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

export function pointsToString(points: RadarPoint[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}
