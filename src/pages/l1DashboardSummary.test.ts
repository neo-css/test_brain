import { describe, expect, it } from 'vitest';
import type { VersionDetail } from '../data/versionMock';
import { buildL1DashboardSummary } from './l1DashboardSummary';

function makeVersion(overrides: Partial<VersionDetail>): VersionDetail {
  return {
    patchId: 1,
    totalScore: 80,
    qualityScore: 4,
    behaviorScore: 3,
    riskLevel: 'LOW',
    snapshotsTs: '2026-06-20T09:00:00',
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
    summary: '版本迭代发布',
    status: '测试中',
    releaseType: '迭代发布',
    metrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
    ...overrides,
  };
}

describe('buildL1DashboardSummary', () => {
  it('summarizes global version posture for the L1 dashboard', () => {
    const versions = [
      makeVersion({ patchId: 1, totalScore: 88, riskLevel: 'LOW', snapshotsTs: '2026-06-20T09:00:00' }),
      makeVersion({ patchId: 2, totalScore: 62, riskLevel: 'HIGH', snapshotsTs: '2026-06-24T09:00:00', status: '阻塞中' }),
      makeVersion({ patchId: 3, totalScore: 76, riskLevel: 'MEDIUM', snapshotsTs: '2026-06-22T09:00:00' }),
      makeVersion({ patchId: 4, totalScore: 68, riskLevel: 'HIGH', snapshotsTs: '2026-06-23T09:00:00' }),
    ];

    const summary = buildL1DashboardSummary(versions);

    expect(summary.totalVersions).toBe(4);
    expect(summary.averageScore).toBe(73.5);
    expect(summary.latestSnapshot).toBe('2026-06-24 09:00');
    expect(summary.riskCounts).toEqual({ HIGH: 2, MEDIUM: 1, LOW: 1, UNKNOWN: 0 });
    expect(summary.highRiskRatio).toBe(50);
    expect(summary.priorityVersions.map((version) => version.patchId)).toEqual([2, 4, 3]);
  });

  it('returns stable empty values when no versions exist', () => {
    expect(buildL1DashboardSummary([])).toEqual({
      totalVersions: 0,
      averageScore: 0,
      latestSnapshot: '--',
      riskCounts: { HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 },
      highRiskRatio: 0,
      priorityVersions: [],
    });
  });
});
