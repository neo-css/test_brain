export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface TedSbrainResponse<T> {
  result: boolean;
  message: string;
  data: T;
  criticalProcess: Record<string, unknown>;
}

export interface MetricVO {
  metricCode: string;
  metricName: string;
  phase: string;
  phaseName: string;
  dataDimension: string;
  dataDimensionName: string;
  evalTarget: string;
  evalTargetName: string;
  calcScore: number;
  actualScore: number;
  riskLevel: RiskLevel;
  features: Record<string, unknown>;
  description: string;
  detailUrl: string;
}

export interface GroupVO {
  key: string;
  displayName: string;
  groupScore: number;
  metrics: MetricVO[];
}

export interface ScoreSnapshot {
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
  patchOwnerId: string;
  testLeader: string;
  testLeaderAccount: string;
  devLeader: string;
  devLeaderAccount: string;
  testOwner: string;
  testOwnerUserId: string;
  testOwnerGroup: string;
  planedTestFromTime: string;
  planedTestToTime: string;
  planedIssueTime: string;
  planedOnlineTime: string;
  auditTime: string;
  createTs: string;
  updateTs: string;
  creator: string;
  creatorId: string;
  updater: string;
  updaterId: string;
}

export type PatchScoreVO = Omit<
  ScoreSnapshot,
  'id' | 'createTs' | 'updateTs' | 'creator' | 'creatorId' | 'updater' | 'updaterId'
> & {
  metrics: MetricVO[];
  byPhase: GroupVO[];
  byDataDimension: GroupVO[];
  byEvalTarget: GroupVO[];
};

export interface ScoreSnapshotPage {
  records: ScoreSnapshot[];
  total: number;
  size: number;
  current: number;
  orders?: Array<{
    column: string;
    asc: boolean;
  }>;
  optimizeCountSql?: boolean;
  searchCount?: boolean;
  optimizeJoinOfCountSql?: boolean;
  maxLimit?: number;
  countId?: string;
  pages: number;
}

export type ScoreSnapshotFilters = Partial<Omit<ScoreSnapshot, never>>;
