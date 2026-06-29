import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RadarChart, { buildRadarPoints } from './RadarChart';

describe('buildRadarPoints', () => {
  it('returns one polygon point per metric group and scales scores inside the chart radius', () => {
    const points = buildRadarPoints([
      { key: 'A', displayName: '准入阶段', groupScore: 4, metrics: [] },
      { key: 'B', displayName: '测前阶段', groupScore: 8, metrics: [] },
      { key: 'C', displayName: '测试执行阶段', groupScore: 2, metrics: [] },
      { key: 'D', displayName: '发布阶段', groupScore: 6, metrics: [] },
    ], 140, 110);

    expect(points).toHaveLength(4);
    expect(points[1].y).toBeCloseTo(140);
    expect(points[1].x).toBeCloseTo(228);
    expect(points.every((point) => point.x >= 30 && point.x <= 250)).toBe(true);
    expect(points.every((point) => point.y >= 30 && point.y <= 250)).toBe(true);
  });
});

describe('RadarChart', () => {
  it('marks score shapes and labels for cockpit draw-in animation', () => {
    const html = renderToStaticMarkup(
      createElement(RadarChart, {
        groups: [
          { key: 'A', displayName: '准入阶段', groupScore: 4, metrics: [] },
          { key: 'B', displayName: '测前阶段', groupScore: 8, metrics: [] },
          { key: 'C', displayName: '测试执行阶段', groupScore: 2, metrics: [] },
        ],
      }),
    );

    expect(html).toContain('class="radar-score radar-score-animated"');
    expect(html).toContain('class="radar-dot radar-dot-animated"');
    expect(html).toContain('class="radar-label radar-label-animated"');
  });
});
