import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { MetricItem, VersionDetail } from '../data/versionMock';
import MetricScoreCards, { buildMetricRadarPoints } from './MetricScoreCards';

function makeMetric(overrides: Partial<MetricItem>): MetricItem {
  return {
    metricCode: 'M1',
    metricName: '版本变更风险',
    calcScore: 4,
    actualScore: 4,
    riskLevel: 'LOW',
    phaseName: '准入阶段',
    evalTargetName: '版本质量',
    ...overrides,
  };
}

function makeVersion(metrics: MetricItem[]): VersionDetail {
  return {
    patchId: 1,
    totalScore: 80,
    qualityScore: 4,
    behaviorScore: 3,
    riskLevel: 'LOW',
    snapshotsTs: '2026-06-23T09:30:00',
    sysId: 'TED',
    subNamedSystemName: '测试大脑系统',
    systemKeyId: 10001,
    systemLevel: '第四级',
    teamName: '质量保障部',
    patchOwner: '张三',
    patchOwnerAccount: 'zhangsan',
    testLeader: '李四',
    testLeaderAccount: 'lisi',
    devLeader: '王五',
    devLeaderAccount: 'wangwu',
    actualSubmitTestTime: '2026-06-10 14:00:00',
    actualTestFromTime: '2026-06-10 15:00:00',
    actualTestToTime: '2026-06-18 18:00:00',
    planedTestFromTime: '2026-06-09 09:00:00',
    planedTestToTime: '2026-06-17 18:00:00',
    auditTime: '2026-06-08 16:30:00',
    summary: 'TED系统 v2.3 迭代发布',
    status: '测试中',
    releaseType: '迭代发布',
    metrics,
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
  };
}

describe('buildMetricRadarPoints', () => {
  function radiusOf(point: { x: number; y: number }, center: number): number {
    return Math.hypot(point.x - center, point.y - center);
  }

  it('returns one point per metric and scales scores against the metric max score', () => {
    const points = buildMetricRadarPoints([
      makeMetric({ metricCode: 'A', actualScore: 5 }),
      makeMetric({ metricCode: 'B', actualScore: 2.5 }),
      makeMetric({ metricCode: 'C', actualScore: 1 }),
    ], 140, 110);

    expect(points).toHaveLength(3);
    expect(points[0].y).toBeCloseTo(30);
    expect(points[1].x).toBeCloseTo(187.63, 1);
    expect(points.every((point) => point.x >= 30 && point.x <= 250)).toBe(true);
    expect(points.every((point) => point.y >= 30 && point.y <= 250)).toBe(true);
  });

  it('scales mock service 100-point scores instead of clamping every metric to a full hexagon', () => {
    const points = buildMetricRadarPoints([
      makeMetric({ metricCode: 'A', actualScore: 100 }),
      makeMetric({ metricCode: 'B', actualScore: 50 }),
      makeMetric({ metricCode: 'C', actualScore: 20 }),
    ], 140, 100);

    expect(radiusOf(points[0], 140)).toBeCloseTo(100);
    expect(radiusOf(points[1], 140)).toBeCloseTo(50);
    expect(radiusOf(points[2], 140)).toBeCloseTo(20);
  });
});

describe('MetricScoreCards', () => {
  it('renders radar with outer hexagon ring, labels with line wrapping, and scores', () => {
    const html = renderToStaticMarkup(
      createElement(MetricScoreCards, {
        version: makeVersion([
          makeMetric({ metricCode: 'CHANGES_RISK', metricName: '版本变更风险', actualScore: 4.4 }),
          makeMetric({ metricCode: 'DEFECT_RISK', metricName: '版本缺陷风险', actualScore: 3.2, riskLevel: 'MEDIUM' }),
          makeMetric({ metricCode: 'SMART_TEST', metricName: '智能测试渗透率', actualScore: 3, riskLevel: 'MEDIUM' }),
        ]),
        selectedMetricCode: 'CHANGES_RISK',
        onSelectMetric: () => undefined,
      }),
    );

    expect(html).toContain('class="metric-radar-outer-ring"');
    expect(html).toContain('metric-radar-outer-dot');
    expect(html).toContain('class="metric-radar-label-group metric-radar-label-animated"');
    expect(html).toContain('class="metric-radar-label-name"');
    expect(html).not.toContain('metric-radar-label-score');
    expect(html).toContain('class="metric-radar-score metric-radar-score-animated"');
    expect(html).not.toContain('metric-radar-hit-target-selected');
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-label="查看版本变更风险证据"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('class="metric-radar-dot metric-radar-dot-animated metric-radar-risk-medium"');
    expect(html).toContain('aria-label="版本变更风险，准入阶段 / 版本质量"');
    expect(html).not.toContain('>4.4</text>');
    expect(html).not.toContain('foreignObject');
  });
});
