import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { VersionDetail } from '../data/versionMock';
import ScoreHero from './ScoreHero';

function makeVersion(overrides: Partial<VersionDetail> = {}): VersionDetail {
  return {
    patchId: 1,
    totalScore: 71.4,
    qualityScore: 3.93,
    behaviorScore: 3.18,
    riskLevel: 'HIGH',
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
    metrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
    ...overrides,
  };
}

describe('ScoreHero', () => {
  it('renders a compact score strip instead of tall score cards', () => {
    const html = renderToStaticMarkup(createElement(ScoreHero, { version: makeVersion() }));

    expect(html).toContain('class="score-hero score-strip"');
    expect(html).toContain('class="score-strip-value"');
    expect(html).toContain('class="score-strip-metrics"');
    expect(html).not.toContain('class="hero-score-grid"');
    expect(html).toContain('71.4');
    expect(html).toContain('高风险');
    expect(html).toContain('质量 3.93');
    expect(html).toContain('行为 3.18');
    expect(html).toContain('class="score-strip-owners"');
    expect(html).toContain('版本负责人');
    expect(html).toContain('张三');
    expect(html).toContain('测试负责人');
    expect(html).toContain('李四');
    expect(html).toContain('开发负责人');
    expect(html).toContain('王五');
    expect(html).not.toContain('zhangsan');
    expect(html).not.toContain('lisi');
    expect(html).not.toContain('wangwu');
  });
});
