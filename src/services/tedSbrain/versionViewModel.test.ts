import { describe, expect, it } from 'vitest';
import type { PatchScoreVO, ScoreSnapshot } from './types';
import {
  mapPatchScoreToVersionDetail,
  mapScoreSnapshotToVersionDetail,
} from './versionViewModel';

const snapshot: ScoreSnapshot = {
  id: 'snapshot-1',
  patchId: 12345,
  totalScore: 88,
  qualityScore: 90,
  behaviorScore: 86,
  riskLevel: 'MEDIUM',
  snapshotsTs: '2026-07-08T10:30:00',
  summary: '支付系统标准发布风险评估',
  status: 'TESTING',
  releaseType: 'NORMAL',
  description: '版本描述',
  sysId: 'PAY',
  systemName: '支付系统',
  systemKeyId: 1001,
  systemLevel: '核心系统',
  teamName: '支付质量组',
  patchOwner: '张三',
  patchOwnerId: 'pay_owner',
  testLeader: '李四',
  testLeaderAccount: 'pay_test_lead',
  devLeader: '王五',
  devLeaderAccount: 'pay_dev_lead',
  testOwner: '赵六',
  testOwnerUserId: 'pay_tester',
  testOwnerGroup: '支付测试组',
  planedTestFromTime: '2026-07-08T09:00:00',
  planedTestToTime: '2026-07-08T18:00:00',
  planedIssueTime: '2026-07-08T19:00:00',
  planedOnlineTime: '2026-07-09T02:00:00',
  auditTime: '2026-07-08T10:30:00',
  createTs: '2026-07-08T06:00:00',
  updateTs: '2026-07-08T10:30:00',
  creator: '系统',
  creatorId: 'system',
  updater: '系统',
  updaterId: 'system',
};

const patchScore: PatchScoreVO = {
  patchId: snapshot.patchId,
  totalScore: snapshot.totalScore,
  qualityScore: snapshot.qualityScore,
  behaviorScore: snapshot.behaviorScore,
  riskLevel: snapshot.riskLevel,
  snapshotsTs: snapshot.snapshotsTs,
  summary: snapshot.summary,
  status: snapshot.status,
  releaseType: snapshot.releaseType,
  description: snapshot.description,
  sysId: snapshot.sysId,
  systemName: snapshot.systemName,
  systemKeyId: snapshot.systemKeyId,
  systemLevel: snapshot.systemLevel,
  teamName: snapshot.teamName,
  patchOwner: snapshot.patchOwner,
  patchOwnerId: snapshot.patchOwnerId,
  testLeader: snapshot.testLeader,
  testLeaderAccount: snapshot.testLeaderAccount,
  devLeader: snapshot.devLeader,
  devLeaderAccount: snapshot.devLeaderAccount,
  testOwner: snapshot.testOwner,
  testOwnerUserId: snapshot.testOwnerUserId,
  testOwnerGroup: snapshot.testOwnerGroup,
  planedTestFromTime: snapshot.planedTestFromTime,
  planedTestToTime: snapshot.planedTestToTime,
  planedIssueTime: snapshot.planedIssueTime,
  planedOnlineTime: snapshot.planedOnlineTime,
  auditTime: snapshot.auditTime,
  metrics: [
    {
      metricCode: 'CHANGES_RISK',
      metricName: '版本变更风险',
      phase: 'DEV',
      phaseName: '开发阶段',
      dataDimension: 'QUALITY',
      dataDimensionName: '质量风险',
      evalTarget: 'PATCH',
      evalTargetName: '版本',
      calcScore: 88,
      actualScore: 84,
      riskLevel: 'MEDIUM',
      features: { changeCount: { value: 23 }, defectNum: { value: 3 } },
      description: '变更范围较大。',
      detailUrl: '/detail/changes',
    },
  ],
  byPhase: [],
  byDataDimension: [],
  byEvalTarget: [],
};

describe('ted-sbrain version view model', () => {
  it('maps ScoreSnapshot records to list-ready VersionDetail objects', () => {
    const version = mapScoreSnapshotToVersionDetail(snapshot);

    expect(version.patchId).toBe(12345);
    expect(version.subNamedSystemName).toBe('支付系统');
    expect(version.actualTestFromTime).toBe('2026-07-08T09:00:00');
    expect(version.actualTestToTime).toBe('2026-07-09T02:00:00');
    expect(version.metrics).toEqual([]);
    expect(version.byPhase).toEqual([]);
    expect(version.patchOwner).toBe('张三');
    expect(version.patchOwnerAccount).toBe('pay_owner');
    expect(version.status).toBe('测试中');
    expect(version.releaseType).toBe('标准发布');
  });

  it('maps PatchScoreVO records to detail-ready VersionDetail objects with metrics and groups', () => {
    const version = mapPatchScoreToVersionDetail(patchScore);

    expect(version.patchId).toBe(12345);
    expect(version.metrics).toHaveLength(1);
    expect(version.metrics[0]).toMatchObject({
      metricCode: 'CHANGES_RISK',
      metricName: '版本变更风险',
      phaseName: '开发阶段',
      dataDimensionName: '质量风险',
      evalTargetName: '版本',
      actualScore: 84,
      riskLevel: 'MEDIUM',
      description: '变更范围较大。',
    });
    expect(version.metrics[0].features).toEqual({ changeCount: 23, defectNum: 3 });
  });
});
