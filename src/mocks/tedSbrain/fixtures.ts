import type { GroupVO, MetricVO, PatchScoreVO, RiskLevel, ScoreSnapshot } from '../../services/tedSbrain/types';

type SnapshotSeed = {
  id: string;
  patchId: number;
  totalScore: number;
  qualityScore: number;
  behaviorScore: number;
  riskLevel: RiskLevel;
  snapshotsTs: string;
  summary: string;
  status: string;
  releaseType: string;
  description: string;
  sysId: string;
  systemName: string;
  systemKeyId: number;
  systemLevel: string;
  teamName: string;
  patchOwner: string;
};

const makeSnapshot = (seed: SnapshotSeed): ScoreSnapshot => ({
  ...seed,
  patchOwnerId: `${seed.patchOwner.toLowerCase().replace(/\s+/g, '.')}.id`,
  testLeader: `${seed.teamName} QA Lead`,
  testLeaderAccount: `${seed.sysId.toLowerCase()}_qa_lead`,
  devLeader: `${seed.teamName} Dev Lead`,
  devLeaderAccount: `${seed.sysId.toLowerCase()}_dev_lead`,
  testOwner: `${seed.teamName} Tester`,
  testOwnerUserId: `${seed.sysId.toLowerCase()}_tester`,
  testOwnerGroup: `${seed.teamName} QA`,
  planedTestFromTime: '2026-07-08T09:00:00',
  planedTestToTime: '2026-07-08T18:00:00',
  planedIssueTime: '2026-07-08T18:30:00',
  planedOnlineTime: '2026-07-09T02:00:00',
  auditTime: seed.snapshotsTs,
  createTs: '2026-07-08T06:00:00',
  updateTs: seed.snapshotsTs,
  creator: 'ted-sbrain-mock',
  creatorId: 'mock-system',
  updater: 'ted-sbrain-mock',
  updaterId: 'mock-system',
});

const makeMetric = (
  metricCode: string,
  metricName: string,
  phase: string,
  phaseName: string,
  dataDimension: string,
  dataDimensionName: string,
  evalTarget: string,
  evalTargetName: string,
  calcScore: number,
  actualScore: number,
  riskLevel: RiskLevel,
): MetricVO => ({
  metricCode,
  metricName,
  phase,
  phaseName,
  dataDimension,
  dataDimensionName,
  evalTarget,
  evalTargetName,
  calcScore,
  actualScore,
  riskLevel,
  features: {
    source: 'mock',
    deterministic: true,
  },
  description: `${metricName} mock metric`,
  detailUrl: `/ted-sbrain/mock/metrics/${metricCode}`,
});

const groupMetrics = (metrics: MetricVO[], keyName: keyof MetricVO, displayName: keyof MetricVO): GroupVO[] => {
  const groups = new Map<string, MetricVO[]>();

  for (const metric of metrics) {
    const key = String(metric[keyName]);
    groups.set(key, [...(groups.get(key) ?? []), metric]);
  }

  return Array.from(groups.entries()).map(([key, groupedMetrics]) => ({
    key,
    displayName: String(groupedMetrics[0][displayName]),
    groupScore: Math.round(groupedMetrics.reduce((sum, metric) => sum + metric.actualScore, 0) / groupedMetrics.length),
    metrics: groupedMetrics,
  }));
};

const makeMetrics = (patchId: number, riskLevel: RiskLevel, totalScore: number): MetricVO[] => [
  makeMetric(
    `${patchId}-REQ`,
    'Requirement readiness',
    'REQUIREMENT',
    'Requirement',
    'QUALITY',
    'Quality',
    'PATCH',
    'Patch',
    totalScore,
    Math.max(0, totalScore - 2),
    riskLevel,
  ),
  makeMetric(
    `${patchId}-TEST`,
    'Test coverage',
    'TEST',
    'Testing',
    'QUALITY',
    'Quality',
    'SYSTEM',
    'System',
    totalScore,
    Math.max(0, totalScore - 5),
    riskLevel,
  ),
  makeMetric(
    `${patchId}-OPS`,
    'Operations stability',
    'RELEASE',
    'Release',
    'BEHAVIOR',
    'Behavior',
    'SYSTEM',
    'System',
    totalScore,
    Math.max(0, totalScore - 8),
    riskLevel,
  ),
];

const makePatchScore = (snapshot: ScoreSnapshot): PatchScoreVO => {
  const metrics = makeMetrics(snapshot.patchId, snapshot.riskLevel, snapshot.totalScore);

  return {
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
    metrics,
    byPhase: groupMetrics(metrics, 'phase', 'phaseName'),
    byDataDimension: groupMetrics(metrics, 'dataDimension', 'dataDimensionName'),
    byEvalTarget: groupMetrics(metrics, 'evalTarget', 'evalTargetName'),
  };
};

export const scoreSnapshots: ScoreSnapshot[] = [
  makeSnapshot({
    id: 'snapshot-12345-latest',
    patchId: 12345,
    totalScore: 92,
    qualityScore: 94,
    behaviorScore: 90,
    riskLevel: 'LOW',
    snapshotsTs: '2026-07-08T10:30:00',
    summary: 'Low-risk SBRAIN release candidate',
    status: 'READY',
    releaseType: 'STANDARD',
    description: 'Deterministic low-risk baseline fixture',
    sysId: 'SBRAIN',
    systemName: 'Ted SBrain',
    systemKeyId: 1001,
    systemLevel: 'L1',
    teamName: 'SBrain Platform',
    patchOwner: 'Ada Lovelace',
  }),
  makeSnapshot({
    id: 'snapshot-22345-latest',
    patchId: 22345,
    totalScore: 58,
    qualityScore: 62,
    behaviorScore: 54,
    riskLevel: 'HIGH',
    snapshotsTs: '2026-07-08T09:45:00',
    summary: 'High-risk payment release candidate',
    status: 'BLOCKED',
    releaseType: 'EMERGENCY',
    description: 'Payment fixture with elevated risk',
    sysId: 'PAY',
    systemName: 'Payment Core',
    systemKeyId: 1002,
    systemLevel: 'L0',
    teamName: 'Payments',
    patchOwner: 'Grace Hopper',
  }),
  makeSnapshot({
    id: 'snapshot-32345-latest',
    patchId: 32345,
    totalScore: 76,
    qualityScore: 79,
    behaviorScore: 73,
    riskLevel: 'MEDIUM',
    snapshotsTs: '2026-07-08T08:20:00',
    summary: 'Medium-risk member release candidate',
    status: 'REVIEWING',
    releaseType: 'STANDARD',
    description: 'Member fixture with medium risk',
    sysId: 'MEMBER',
    systemName: 'Member Center',
    systemKeyId: 1003,
    systemLevel: 'L1',
    teamName: 'Member Experience',
    patchOwner: 'Katherine Johnson',
  }),
  makeSnapshot({
    id: 'snapshot-42345-latest',
    patchId: 42345,
    totalScore: 0,
    qualityScore: 0,
    behaviorScore: 0,
    riskLevel: 'UNKNOWN',
    snapshotsTs: '2026-07-08T07:10:00',
    summary: 'New application release candidate awaiting evaluation',
    status: 'PENDING',
    releaseType: 'STANDARD',
    description: 'New application fixture before scoring completes',
    sysId: 'NEWAPP',
    systemName: 'New Application',
    systemKeyId: 1004,
    systemLevel: 'L2',
    teamName: 'Incubation',
    patchOwner: 'Margaret Hamilton',
  }),
];

export const patchScores: PatchScoreVO[] = scoreSnapshots.map(makePatchScore);

export const patchScoreHistory: Record<number, PatchScoreVO[]> = {
  12345: [
    makePatchScore({
      ...scoreSnapshots[0],
      totalScore: 86,
      qualityScore: 88,
      behaviorScore: 84,
      snapshotsTs: '2026-07-06T10:00:00',
      auditTime: '2026-07-06T10:00:00',
      updateTs: '2026-07-06T10:00:00',
      summary: 'Initial low-risk SBRAIN score',
    }),
    makePatchScore({
      ...scoreSnapshots[0],
      totalScore: 89,
      qualityScore: 91,
      behaviorScore: 87,
      snapshotsTs: '2026-07-07T10:15:00',
      auditTime: '2026-07-07T10:15:00',
      updateTs: '2026-07-07T10:15:00',
      summary: 'Improved SBRAIN score after test evidence refresh',
    }),
    patchScores[0],
  ],
  22345: [patchScores[1]],
  32345: [patchScores[2]],
  42345: [patchScores[3]],
};
