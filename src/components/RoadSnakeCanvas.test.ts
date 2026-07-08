import { describe, expect, it } from 'vitest';
import { getCarLayoutPoint } from './RoadSnakeCanvas';

const CAR_WIDTH = 96 * 0.84;
const CAR_HEIGHT = 56 * 0.84;
const ROAD_CENTER_Y = 76;
const ROAD_HALF_WIDTH = 96 / 2;

function overlaps(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) < CAR_WIDTH && Math.abs(a.y - b.y) < CAR_HEIGHT;
}

describe('getCarLayoutPoint', () => {
  it('spreads cars without visual overlap', () => {
    const points = Array.from({ length: 8 }, (_, index) => getCarLayoutPoint(0, index, 8));

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        expect(overlaps(points[i], points[j])).toBe(false);
      }
    }
  });

  it('keeps the layout from becoming a rigid straight row', () => {
    const points = Array.from({ length: 6 }, (_, index) => getCarLayoutPoint(1, index, 6));
    const uniqueY = new Set(points.map((point) => Math.round(point.y)));

    expect(uniqueY.size).toBeGreaterThan(1);
  });

  it('keeps every car inside the road surface', () => {
    const points = Array.from({ length: 8 }, (_, index) => getCarLayoutPoint(0, index, 8));

    points.forEach((point) => {
      expect(point.y - CAR_HEIGHT / 2).toBeGreaterThanOrEqual(ROAD_CENTER_Y - ROAD_HALF_WIDTH);
      expect(point.y + CAR_HEIGHT / 2).toBeLessThanOrEqual(ROAD_CENTER_Y + ROAD_HALF_WIDTH);
    });
  });
});
