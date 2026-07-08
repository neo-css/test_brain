export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export const RISK_WEIGHT: Record<RiskLevel, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export type MetricFeatureValue =
  | string
  | number
  | boolean
  | null
  | MetricFeatureValue[]
  | { [key: string]: MetricFeatureValue };

export interface MetricItem {
  metricCode: string;
  metricName: string;
  phase?: string;
  phaseName?: string;
  dataDimension?: string;
  dataDimensionName?: string;
  evalTarget?: string;
  evalTargetName?: string;
  calcScore: number;
  actualScore: number;
  riskLevel?: RiskLevel;
  features?: Record<string, MetricFeatureValue>;
  description?: string;
  detailUrl?: string;
}

export interface MetricGroup {
  key: string;
  displayName: string;
  groupScore: number;
  metrics: Pick<MetricItem, 'metricCode' | 'metricName' | 'calcScore' | 'actualScore' | 'description'>[];
}

export interface VersionDetail {
  patchId: number;
  totalScore: number;
  qualityScore: number;
  behaviorScore: number;
  riskLevel: RiskLevel;
  snapshotsTs: string;
  sysId: string;
  subNamedSystemName: string;
  systemKeyId: number;
  systemLevel: string;
  teamName: string;
  patchOwner: string;
  patchOwnerAccount: string;
  testLeader: string;
  testLeaderAccount: string;
  devLeader: string;
  devLeaderAccount: string;
  actualSubmitTestTime: string;
  actualTestFromTime: string;
  actualTestToTime: string;
  planedTestFromTime: string;
  planedTestToTime: string;
  auditTime: string;
  summary: string;
  status: string;
  releaseType: string;
  metrics: MetricItem[];
  byPhase: MetricGroup[];
  byDataDimension: MetricGroup[];
  byEvalTarget: MetricGroup[];
}

const baseDetail: VersionDetail = {
  patchId: 64460,
  totalScore: 78.5,
  qualityScore: 3.82,
  behaviorScore: 2.75,
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
  summary: 'TED系统 v2.3 迭代发布，新增智能测试模块、覆盖率数据采集优化、评分引擎重构',
  status: '测试中',
  releaseType: '迭代发布',
  metrics: [
    {
      metricCode: 'CHANGES_RISK',
      metricName: '版本变更风险',
      phase: 'ADMISSION',
      phaseName: '准入阶段',
      dataDimension: 'PERSONNEL_RELATED',
      dataDimensionName: '人员相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 4.4,
      actualScore: 4.4,
      riskLevel: 'LOW',
      features: {
        summaryReqConsistent: true,
        summaryReqDiffCount: 0,
        summaryCodeConsistent: false,
        summaryCodeDiffCount: 2,
        score: 4.4,
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'CASE_REVIEW_TIMELINESS',
      metricName: '案例评审时效',
      phase: 'PRE_TEST',
      phaseName: '测前阶段',
      dataDimension: 'CASE_RELATED',
      dataDimensionName: '用例相关',
      evalTarget: 'TEST_BEHAVIOR',
      evalTargetName: '测试行为',
      calcScore: 3,
      actualScore: 3,
      riskLevel: 'MEDIUM',
      features: {
        reviewTime: '2026-06-08 16:30:00',
        testStartTime: '2026-06-09 09:00:00',
        delayDays: 2,
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'DEFECT_RISK',
      metricName: '版本缺陷风险',
      phase: 'TEST_EXECUTION',
      phaseName: '测试执行阶段',
      dataDimension: 'DEFECT_RELATED',
      dataDimensionName: '缺陷相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 3.2,
      actualScore: 3.2,
      riskLevel: 'MEDIUM',
      features: {
        defectNum: 3,
        testStartDate: '2026-06-10',
        testEndDate: '2026-06-18',
        testDay: 13,
        totalDays: 9,
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'SMART_TEST',
      metricName: '智能测试渗透率',
      phase: 'TEST_EXECUTION',
      phaseName: '测试执行阶段',
      dataDimension: 'PERSONNEL_RELATED',
      dataDimensionName: '人员相关',
      evalTarget: 'TEST_BEHAVIOR',
      evalTargetName: '测试行为',
      calcScore: 3,
      actualScore: 3,
      riskLevel: 'MEDIUM',
      features: {
        clickCounts: {
          案例生成: 1,
          案例评审: 1,
          缺陷分析: 1,
        },
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'COVERAGE_390',
      metricName: '390回归测试覆盖率',
      phase: 'RELEASE',
      phaseName: '发布阶段',
      dataDimension: 'COVERAGE_RELATED',
      dataDimensionName: '覆盖率相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 4.25,
      actualScore: 4.25,
      riskLevel: 'LOW',
      features: {
        num: 800,
        cover: 680,
        coverageRate: 0.85,
        coverType: 'ARCH_ASSET',
      },
      description: '',
      detailUrl: '',
    },
    {
      metricCode: 'COVERAGE_FUNCTION',
      metricName: '变更函数测试覆盖率',
      phase: 'RELEASE',
      phaseName: '发布阶段',
      dataDimension: 'COVERAGE_RELATED',
      dataDimensionName: '覆盖率相关',
      evalTarget: 'VERSION_QUALITY',
      evalTargetName: '版本质量',
      calcScore: 3,
      actualScore: 3,
      riskLevel: 'MEDIUM',
      features: {
        appLevel: '第四级',
        javaCoverageInfo: {
          cover: 156,
          num: 200,
          deletedNum: 10,
          artificialNum: 5,
          filterNum: 8,
          coverState: 'ALL_OPENED',
          description: 'all opened',
        },
        cCoverageInfo: {
          cover: 42,
          num: 103,
          deletedNum: 2,
          artificialNum: 0,
          filterNum: 3,
          coverState: 'ALL_OPENED',
          description: 'all opened',
        },
      },
      description: '',
      detailUrl: '',
    },
  ],
  byPhase: [
    {
      key: 'ADMISSION',
      displayName: '准入阶段',
      groupScore: 4.4,
      metrics: [{ metricCode: 'CHANGES_RISK', metricName: '版本变更风险', calcScore: 4.4, actualScore: 4.4, description: '' }],
    },
    {
      key: 'PRE_TEST',
      displayName: '测前阶段',
      groupScore: 3,
      metrics: [{ metricCode: 'CASE_REVIEW_TIMELINESS', metricName: '案例评审时效', calcScore: 3, actualScore: 3, description: '' }],
    },
    {
      key: 'TEST_EXECUTION',
      displayName: '测试执行阶段',
      groupScore: 6.2,
      metrics: [
        { metricCode: 'DEFECT_RISK', metricName: '版本缺陷风险', calcScore: 3.2, actualScore: 3.2, description: '' },
        { metricCode: 'SMART_TEST', metricName: '智能测试渗透率', calcScore: 3, actualScore: 3, description: '' },
      ],
    },
    {
      key: 'RELEASE',
      displayName: '发布阶段',
      groupScore: 7.25,
      metrics: [
        { metricCode: 'COVERAGE_390', metricName: '390回归测试覆盖率', calcScore: 4.25, actualScore: 4.25, description: '' },
        { metricCode: 'COVERAGE_FUNCTION', metricName: '变更函数测试覆盖率', calcScore: 3, actualScore: 3, description: '' },
      ],
    },
  ],
  byDataDimension: [],
  byEvalTarget: [],
};

function cloneVersion(overrides: Partial<VersionDetail>): VersionDetail {
  return {
    ...baseDetail,
    ...overrides,
    metrics: overrides.metrics ?? baseDetail.metrics,
    byPhase: overrides.byPhase ?? baseDetail.byPhase,
    byDataDimension: overrides.byDataDimension ?? baseDetail.byDataDimension,
    byEvalTarget: overrides.byEvalTarget ?? baseDetail.byEvalTarget,
  };
}

const seedVersions: VersionDetail[] = [
  baseDetail,
  cloneVersion({
    patchId: 64461,
    totalScore: 72.2,
    qualityScore: 3.36,
    behaviorScore: 2.42,
    riskLevel: 'MEDIUM',
    sysId: 'PAY',
    subNamedSystemName: '支付核心系统',
    systemKeyId: 10002,
    teamName: '支付质量组',
    patchOwner: '赵六',
    patchOwnerAccount: 'zhaoliu',
    testLeader: '钱七',
    testLeaderAccount: 'qianqi',
    devLeader: '孙八',
    devLeaderAccount: 'sunba',
    summary: 'PAY系统 v4.8 支付链路灰度发布，新增交易风控校验与对账任务优化',
    actualSubmitTestTime: '2026-06-12 10:20:00',
    actualTestFromTime: '2026-06-12 13:30:00',
    actualTestToTime: '2026-06-21 18:00:00',
    planedTestFromTime: '2026-06-12 09:00:00',
    planedTestToTime: '2026-06-20 18:00:00',
    snapshotsTs: '2026-06-23T10:00:00',
  }),
  cloneVersion({
    patchId: 64462,
    totalScore: 84.2,
    qualityScore: 4.18,
    behaviorScore: 3.2,
    riskLevel: 'LOW',
    sysId: 'CRM',
    subNamedSystemName: '客户域服务系统',
    systemKeyId: 10003,
    teamName: '客户体验质量组',
    patchOwner: '周九',
    patchOwnerAccount: 'zhoujiu',
    testLeader: '吴十',
    testLeaderAccount: 'wushi',
    devLeader: '郑一',
    devLeaderAccount: 'zhengyi',
    summary: 'CRM系统 v1.9 客户标签与权益同步回归测试',
    actualSubmitTestTime: '2026-06-14 11:00:00',
    actualTestFromTime: '2026-06-14 15:00:00',
    actualTestToTime: '2026-06-22 18:00:00',
    planedTestFromTime: '2026-06-14 09:00:00',
    planedTestToTime: '2026-06-22 18:00:00',
    snapshotsTs: '2026-06-23T10:30:00',
  }),
  cloneVersion({
    patchId: 64463,
    totalScore: 66.8,
    qualityScore: 2.98,
    behaviorScore: 2.2,
    riskLevel: 'HIGH',
    sysId: 'OPS',
    subNamedSystemName: '运维自动化平台',
    systemKeyId: 10004,
    teamName: '平台保障组',
    patchOwner: '王二',
    patchOwnerAccount: 'wanger',
    testLeader: '陈三',
    testLeaderAccount: 'chensan',
    devLeader: '刘四',
    devLeaderAccount: 'liusi',
    summary: 'OPS平台 v3.1 发布编排与告警规则调整',
    actualSubmitTestTime: '2026-06-15 09:40:00',
    actualTestFromTime: '2026-06-15 14:30:00',
    actualTestToTime: '2026-06-24 18:00:00',
    planedTestFromTime: '2026-06-15 09:00:00',
    planedTestToTime: '2026-06-23 18:00:00',
    snapshotsTs: '2026-06-23T11:00:00',
  }),
];

const mockSystems = [
  { sysId: 'MKT', name: '营销活动平台', team: '增长质量组', level: '第三级' },
  { sysId: 'ORD', name: '订单履约系统', team: '交易质量组', level: '第四级' },
  { sysId: 'INV', name: '库存协同系统', team: '供应链质量组', level: '第三级' },
  { sysId: 'RPT', name: '经营报表中心', team: '数据质量组', level: '第二级' },
  { sysId: 'IAM', name: '统一权限中心', team: '平台安全组', level: '第四级' },
  { sysId: 'MSG', name: '消息触达系统', team: '中台质量组', level: '第三级' },
  { sysId: 'SET', name: '结算清分系统', team: '资金质量组', level: '第四级' },
  { sysId: 'APP', name: '移动端聚合服务', team: '客户端质量组', level: '第三级' },
];

const mockPeople = [
  ['林澈', '何曼', '陆遥'],
  ['顾青', '宋然', '许舟'],
  ['唐越', '沈嘉', '叶宁'],
  ['姜南', '梁夏', '秦川'],
  ['程砚', '罗予', '孟溪'],
  ['韩序', '邵羽', '白珩'],
];

type KnownRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

const mockReleaseTypes = ['迭代发布', '灰度发布', '紧急修复', '专项回归'];
const mockPhaseProfiles: {
  status: string;
  progress: number;
  risks: KnownRiskLevel[];
  scoreBase: Record<KnownRiskLevel, number>;
}[] = [
  {
    status: '准入中',
    progress: 0.18,
    risks: ['LOW', 'MEDIUM', 'LOW', 'MEDIUM', 'HIGH'],
    scoreBase: { LOW: 84, MEDIUM: 73, HIGH: 61 },
  },
  {
    status: '测试中',
    progress: 0.52,
    risks: ['LOW', 'MEDIUM', 'LOW', 'HIGH', 'MEDIUM'],
    scoreBase: { LOW: 81, MEDIUM: 70, HIGH: 59 },
  },
  {
    status: '阻塞中',
    progress: 0.38,
    risks: ['HIGH', 'MEDIUM', 'HIGH', 'MEDIUM', 'LOW'],
    scoreBase: { LOW: 76, MEDIUM: 66, HIGH: 54 },
  },
  {
    status: '待回归',
    progress: 0.76,
    risks: ['MEDIUM', 'LOW', 'MEDIUM', 'HIGH', 'LOW'],
    scoreBase: { LOW: 86, MEDIUM: 74, HIGH: 62 },
  },
  {
    status: '待发布',
    progress: 0.9,
    risks: ['LOW', 'LOW', 'MEDIUM', 'LOW', 'HIGH'],
    scoreBase: { LOW: 88, MEDIUM: 78, HIGH: 65 },
  },
];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatMockDateTime(date: Date, separator: ' ' | 'T') {
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `2026-${month}-${day}${separator}${hour}:${minute}:00`;
}

function buildMockSnapshotTime(startDay: number, endDay: number, progress: number, index: number) {
  const start = new Date(2026, 5, startDay, 14, 0, 0);
  const end = new Date(2026, 5, endDay, 18, 0, 0);
  const jitter = ((index % 3) - 1) * 0.035;
  const snapshotProgress = Math.min(0.96, Math.max(0.08, progress + jitter));
  return formatMockDateTime(new Date(start.getTime() + (end.getTime() - start.getTime()) * snapshotProgress), 'T');
}

function generateMockVersions(count: number): VersionDetail[] {
  return Array.from({ length: count }, (_, index) => {
    const system = mockSystems[index % mockSystems.length];
    const people = mockPeople[index % mockPeople.length];
    const phase = mockPhaseProfiles[index % mockPhaseProfiles.length];
    const riskLevel = phase.risks[Math.floor(index / mockPhaseProfiles.length) % phase.risks.length];
    const scoreBase = phase.scoreBase[riskLevel];
    const totalScore = Math.min(96, scoreBase + ((index * 7) % 9) + (index % 2 === 0 ? 0.4 : 0.8));
    const day = 1 + (index % 24);
    const endDayNumber = Math.min(day + 5 + (index % 4), 28);
    const startDay = pad(day);
    const endDay = pad(endDayNumber);
    const patchId = 64500 + index;
    const releaseType = mockReleaseTypes[index % mockReleaseTypes.length];

    return cloneVersion({
      patchId,
      totalScore,
      qualityScore: Number((2.5 + (totalScore / 100) * 2).toFixed(2)),
      behaviorScore: Number((2.1 + (index % 9) * 0.18).toFixed(2)),
      riskLevel,
      sysId: system.sysId,
      subNamedSystemName: system.name,
      systemKeyId: 11000 + index,
      systemLevel: system.level,
      teamName: system.team,
      patchOwner: people[0],
      patchOwnerAccount: `owner${index}`,
      testLeader: people[1],
      testLeaderAccount: `tester${index}`,
      devLeader: people[2],
      devLeaderAccount: `dev${index}`,
      actualSubmitTestTime: `2026-06-${startDay} 10:00:00`,
      actualTestFromTime: `2026-06-${startDay} 14:00:00`,
      actualTestToTime: `2026-06-${endDay} 18:00:00`,
      planedTestFromTime: `2026-06-${startDay} 09:00:00`,
      planedTestToTime: `2026-06-${endDay} 18:00:00`,
      auditTime: `2026-06-${startDay} 16:30:00`,
      snapshotsTs: buildMockSnapshotTime(day, endDayNumber, phase.progress, index),
      summary: `${system.sysId}系统 v${1 + (index % 6)}.${index % 10} ${releaseType}，${system.name}${phase.status}版本 ${patchId}`,
      status: phase.status,
      releaseType,
    });
  });
}

export const versionDetails: VersionDetail[] = [
  ...seedVersions,
  ...generateMockVersions(96),
];

export function getVersionByPatchId(patchId: string | undefined): VersionDetail | undefined {
  const numericPatchId = Number(patchId);
  return versionDetails.find((version) => version.patchId === numericPatchId);
}

export function formatScore(score: number): string {
  return score.toFixed(score % 1 === 0 ? 0 : 1);
}

export function formatDateTime(value: string): string {
  return value.replace('T', ' ').slice(0, 16);
}

export function riskLabel(riskLevel: RiskLevel): string {
  if (riskLevel === 'LOW') return '低风险';
  if (riskLevel === 'MEDIUM') return '中风险';
  if (riskLevel === 'HIGH') return '高风险';
  return '未知风险';
}
