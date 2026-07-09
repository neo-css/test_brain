import type { MetricFeatureValue, MetricGroup, MetricItem, VersionDetail } from '../../data/versionMock';
import type { GroupVO, MetricVO, PatchScoreVO, ScoreSnapshot } from './types';

const STATUS_LABELS: Record<string, string> = {
  TESTING: '测试中',
  BLOCKED: '阻塞中',
  READY: '待发布',
  REGRESSION: '待回归',
  ADMISSION: '准入中',
};

const RELEASE_TYPE_LABELS: Record<string, string> = {
  NORMAL: '标准发布',
  EMERGENCY_FIX: '紧急修复',
  GRAY: '灰度发布',
  ITERATION: '迭代发布',
  SPECIAL_REGRESSION: '专项回归',
  CAMPAIGN_SUPPORT: '大促保障',
  SECURITY_HARDENING: '安全加固',
  DATA_FIX: '数据修复',
};

function displayLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}

function normalizeFeatureValue(value: unknown): MetricFeatureValue {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);

    if (keys.length === 1 && keys[0] === 'value') {
      return normalizeFeatureValue(record.value);
    }

    return Object.fromEntries(
      Object.entries(record).map(([key, childValue]) => [key, normalizeFeatureValue(childValue)]),
    ) as Record<string, MetricFeatureValue>;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeFeatureValue);
  }

  return String(value);
}

function mapFeatures(features: MetricVO['features']): Record<string, MetricFeatureValue> {
  return Object.fromEntries(
    Object.entries(features).map(([key, value]) => [key, normalizeFeatureValue(value)]),
  ) as Record<string, MetricFeatureValue>;
}

function mapMetric(metric: MetricVO): MetricItem {
  return {
    metricCode: metric.metricCode,
    metricName: metric.metricName,
    phase: metric.phase,
    phaseName: metric.phaseName,
    dataDimension: metric.dataDimension,
    dataDimensionName: metric.dataDimensionName,
    evalTarget: metric.evalTarget,
    evalTargetName: metric.evalTargetName,
    calcScore: metric.calcScore,
    actualScore: metric.actualScore,
    riskLevel: metric.riskLevel,
    features: mapFeatures(metric.features),
    description: metric.description,
    detailUrl: metric.detailUrl,
  };
}

function mapMetricGroup(group: GroupVO): MetricGroup {
  return {
    key: group.key,
    displayName: group.displayName,
    groupScore: group.groupScore,
    metrics: group.metrics.map((metric) => ({
      metricCode: metric.metricCode,
      metricName: metric.metricName,
      calcScore: metric.calcScore,
      actualScore: metric.actualScore,
      description: metric.description,
    })),
  };
}

export function mapScoreSnapshotToVersionDetail(snapshot: ScoreSnapshot): VersionDetail {
  return {
    patchId: snapshot.patchId,
    totalScore: snapshot.totalScore,
    qualityScore: snapshot.qualityScore,
    behaviorScore: snapshot.behaviorScore,
    riskLevel: snapshot.riskLevel,
    snapshotsTs: snapshot.snapshotsTs,
    sysId: snapshot.sysId,
    subNamedSystemName: snapshot.systemName,
    systemKeyId: snapshot.systemKeyId,
    systemLevel: snapshot.systemLevel,
    teamName: snapshot.teamName,
    patchOwner: snapshot.patchOwner,
    patchOwnerAccount: snapshot.patchOwnerId,
    testLeader: snapshot.testLeader,
    testLeaderAccount: snapshot.testLeaderAccount,
    devLeader: snapshot.devLeader,
    devLeaderAccount: snapshot.devLeaderAccount,
    actualSubmitTestTime: snapshot.planedTestFromTime,
    actualTestFromTime: snapshot.planedTestFromTime,
    actualTestToTime: snapshot.planedOnlineTime,
    planedTestFromTime: snapshot.planedTestFromTime,
    planedTestToTime: snapshot.planedTestToTime,
    auditTime: snapshot.auditTime,
    summary: snapshot.summary,
    status: displayLabel(STATUS_LABELS, snapshot.status),
    releaseType: displayLabel(RELEASE_TYPE_LABELS, snapshot.releaseType),
    metrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
  };
}

export function mapPatchScoreToVersionDetail(patchScore: PatchScoreVO): VersionDetail {
  return {
    ...mapScoreSnapshotToVersionDetail({
      ...patchScore,
      id: `patch-${patchScore.patchId}`,
      createTs: patchScore.snapshotsTs,
      updateTs: patchScore.snapshotsTs,
      creator: '',
      creatorId: '',
      updater: '',
      updaterId: '',
    }),
    metrics: patchScore.metrics.map(mapMetric),
    byPhase: patchScore.byPhase.map(mapMetricGroup),
    byDataDimension: patchScore.byDataDimension.map(mapMetricGroup),
    byEvalTarget: patchScore.byEvalTarget.map(mapMetricGroup),
  };
}
