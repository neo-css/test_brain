import { formatDateTime, RISK_WEIGHT, type MetricFeatureValue, type MetricGroup, type MetricItem, type RiskLevel, type VersionDetail } from '../data/versionMock';

export interface DetailFact {
  label: string;
  value: string;
}

export interface DiagnosticView {
  key: 'phase' | 'dimension' | 'target';
  title: string;
  groups: MetricGroup[];
}

export interface EvidenceRow {
  metricCode: string;
  metricName: string;
  phaseName: string;
  dataDimensionName: string;
  evalTargetName: string;
  actualScore: number;
  calcScore: number;
  riskLevel: RiskLevel;
  facts: DetailFact[];
}

export interface FocusItem {
  metricCode: string;
  title: string;
  meta: string;
  action: string;
}

export interface RiskCompositionItem {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  label: string;
  value: number;
}

export interface CoverageSeriesItem {
  label: string;
  covered: number;
  total: number;
  rate: number;
}

export interface ScheduleBar {
  label: string;
  startLabel: string;
  endLabel: string;
  durationDays: number;
  offsetPercent: number;
  widthPercent: number;
}

export interface SnapshotMarker {
  label: string;
  timeLabel: string;
  offsetPercent: number;
}

export interface DetailChartCards {
  riskComposition: RiskCompositionItem[];
  coverageSeries: CoverageSeriesItem[];
  scheduleBars: ScheduleBar[];
  snapshotMarker: SnapshotMarker;
}

export interface VersionDetailInsights {
  diagnosticViews: DiagnosticView[];
  chartCards: DetailChartCards;
  evidenceRows: EvidenceRow[];
  focusItems: FocusItem[];
}

const TARGET_WEIGHT: Record<string, number> = {
  VERSION_QUALITY: 2,
  TEST_BEHAVIOR: 1,
};

const FEATURE_LABELS: Record<string, string> = {
  summaryReqConsistent: '需求摘要一致',
  summaryReqDiffCount: '需求差异数',
  summaryCodeConsistent: '代码摘要一致',
  summaryCodeDiffCount: '代码差异数',
  score: '特征评分',
  reviewTime: '评审时间',
  testStartTime: '测试开始',
  delayDays: '延迟天数',
  defectNum: '缺陷数',
  testStartDate: '测试开始日',
  testEndDate: '测试结束日',
  testDay: '测试天数',
  totalDays: '计划天数',
  clickCounts: '智能测试点击',
  num: '总数',
  cover: '覆盖数',
  coverageRate: '覆盖率',
  coverType: '覆盖类型',
  appLevel: '应用等级',
  javaCoverageInfo: 'Java 覆盖',
  cCoverageInfo: 'C 覆盖',
  deletedNum: '删除数',
  artificialNum: '人工补录',
  filterNum: '过滤数',
  coverState: '覆盖状态',
  description: '说明',
};

function riskWeight(riskLevel?: RiskLevel) {
  const key = riskLevel ?? 'LOW';
  return RISK_WEIGHT[key] ?? 0;
}

function asDisplayValue(value: MetricFeatureValue): string {
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  if (value === null) return '--';
  return JSON.stringify(value);
}

function formatFeatureValue(key: string, value: MetricFeatureValue): string {
  if (typeof value === 'number') {
    if (key === 'coverageRate') return `${Math.round(value * 100)}%`;
    if (key === 'delayDays') return `${value} 天`;
    return String(value);
  }

  return asDisplayValue(value);
}

function asRecord(value: MetricFeatureValue | undefined): Record<string, MetricFeatureValue> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value;
}

function asNumber(value: MetricFeatureValue | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function makeMetricGroup(groupKey: keyof Pick<MetricItem, 'phase' | 'dataDimension' | 'evalTarget'>, nameKey: keyof Pick<MetricItem, 'phaseName' | 'dataDimensionName' | 'evalTargetName'>, metric: MetricItem): MetricGroup {
  return {
    key: String(metric[groupKey] ?? 'UNKNOWN'),
    displayName: String(metric[nameKey] ?? '未分类'),
    groupScore: 0,
    metrics: [],
  };
}

function buildGroupsFromMetrics(
  metrics: MetricItem[],
  groupKey: keyof Pick<MetricItem, 'phase' | 'dataDimension' | 'evalTarget'>,
  nameKey: keyof Pick<MetricItem, 'phaseName' | 'dataDimensionName' | 'evalTargetName'>,
): MetricGroup[] {
  const groups = new Map<string, MetricGroup>();

  metrics.forEach((metric) => {
    const key = String(metric[groupKey] ?? 'UNKNOWN');
    const existing = groups.get(key) ?? makeMetricGroup(groupKey, nameKey, metric);

    existing.groupScore += metric.actualScore;
    existing.metrics.push({
      metricCode: metric.metricCode,
      metricName: metric.metricName,
      calcScore: metric.calcScore,
      actualScore: metric.actualScore,
      description: metric.description,
    });

    groups.set(key, existing);
  });

  return Array.from(groups.values());
}

function getGroups(version: VersionDetail, sourceGroups: MetricGroup[], groupKey: keyof Pick<MetricItem, 'phase' | 'dataDimension' | 'evalTarget'>, nameKey: keyof Pick<MetricItem, 'phaseName' | 'dataDimensionName' | 'evalTargetName'>): MetricGroup[] {
  return sourceGroups.length > 0 ? sourceGroups : buildGroupsFromMetrics(version.metrics, groupKey, nameKey);
}

function flattenFeatureFacts(key: string, value: MetricFeatureValue): DetailFact[] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (key === 'clickCounts') {
      return Object.entries(value).map(([clickName, clickValue]) => ({
        label: `${clickName}点击`,
        value: `${asDisplayValue(clickValue)} 次`,
      }));
    }

    return Object.entries(value).map(([childKey, childValue]) => ({
      label: FEATURE_LABELS[childKey] ?? childKey,
      value: formatFeatureValue(childKey, childValue),
    }));
  }

  return [
    {
      label: FEATURE_LABELS[key] ?? key,
      value: formatFeatureValue(key, value),
    },
  ];
}

function buildFacts(metric: MetricItem): DetailFact[] {
  if (!metric.features) return [];

  return Object.entries(metric.features).flatMap(([key, value]) => flattenFeatureFacts(key, value));
}

function buildFocusItems(metrics: MetricItem[]): FocusItem[] {
  return [...metrics]
    .filter((metric) => riskWeight(metric.riskLevel) >= riskWeight('MEDIUM'))
    .sort((first, second) => {
      const riskDelta = riskWeight(second.riskLevel) - riskWeight(first.riskLevel);
      const targetDelta = (TARGET_WEIGHT[String(second.evalTarget ?? '')] ?? 0) - (TARGET_WEIGHT[String(first.evalTarget ?? '')] ?? 0);
      return riskDelta || targetDelta || first.actualScore - second.actualScore;
    })
    .slice(0, 4)
    .map((metric) => ({
      metricCode: metric.metricCode,
      title: metric.metricName,
      meta: `${metric.phaseName ?? '未知阶段'} / ${metric.dataDimensionName ?? '未知维度'}`,
      action: `优先处理${metric.metricName}，${metric.riskLevel === 'HIGH' ? '高' : '中'}风险指标会影响${metric.evalTargetName ?? '版本'}判断。`,
    }));
}

function parseDateTime(value: string) {
  return new Date(value.replace(' ', 'T')).getTime();
}

function daysBetween(start: string, end: string) {
  const duration = parseDateTime(end) - parseDateTime(start);
  return Math.max(1, Math.ceil(duration / 86_400_000));
}

function buildRiskComposition(metrics: MetricItem[]): RiskCompositionItem[] {
  return [
    { riskLevel: 'HIGH', label: '高风险', value: metrics.filter((metric) => metric.riskLevel === 'HIGH').length },
    { riskLevel: 'MEDIUM', label: '中风险', value: metrics.filter((metric) => metric.riskLevel === 'MEDIUM').length },
    { riskLevel: 'LOW', label: '低风险', value: metrics.filter((metric) => metric.riskLevel === 'LOW').length },
  ];
}

function makeCoverageItem(label: string, covered?: number, total?: number, rate?: number): CoverageSeriesItem | undefined {
  if (covered === undefined || total === undefined || total <= 0) return undefined;

  return {
    label,
    covered,
    total,
    rate: Number((rate ?? covered / total).toFixed(4)),
  };
}

function buildCoverageSeries(metrics: MetricItem[]): CoverageSeriesItem[] {
  const coverage390 = metrics.find((metric) => metric.metricCode === 'COVERAGE_390')?.features;
  const functionCoverage = metrics.find((metric) => metric.metricCode === 'COVERAGE_FUNCTION')?.features;
  const javaCoverage = asRecord(functionCoverage?.javaCoverageInfo);
  const cCoverage = asRecord(functionCoverage?.cCoverageInfo);

  return [
    makeCoverageItem(
      '390回归',
      asNumber(coverage390?.cover),
      asNumber(coverage390?.num),
      asNumber(coverage390?.coverageRate),
    ),
    makeCoverageItem('Java函数', asNumber(javaCoverage?.cover), asNumber(javaCoverage?.num)),
    makeCoverageItem('C函数', asNumber(cCoverage?.cover), asNumber(cCoverage?.num)),
  ].filter((item): item is CoverageSeriesItem => Boolean(item));
}

function buildScheduleBars(version: VersionDetail): ScheduleBar[] {
  const entries = [
    {
      label: '计划测试',
      start: version.planedTestFromTime,
      end: version.planedTestToTime,
    },
    {
      label: '实际测试',
      start: version.actualTestFromTime,
      end: version.actualTestToTime,
    },
  ];
  const minTime = Math.min(...entries.map((entry) => parseDateTime(entry.start)));
  const maxTime = Math.max(...entries.map((entry) => parseDateTime(entry.end)), parseDateTime(version.snapshotsTs));
  const totalRange = Math.max(maxTime - minTime, 1);

  return entries.map((entry) => {
    const start = parseDateTime(entry.start);
    const end = parseDateTime(entry.end);

    return {
      label: entry.label,
      startLabel: formatDateTime(entry.start),
      endLabel: formatDateTime(entry.end),
      durationDays: daysBetween(entry.start, entry.end),
      offsetPercent: Math.round(((start - minTime) / totalRange) * 100),
      widthPercent: Math.max(8, Math.round(((end - start) / totalRange) * 100)),
    };
  });
}

function buildSnapshotMarker(version: VersionDetail): SnapshotMarker {
  const minTime = Math.min(parseDateTime(version.planedTestFromTime), parseDateTime(version.actualTestFromTime));
  const maxTime = Math.max(parseDateTime(version.planedTestToTime), parseDateTime(version.actualTestToTime), parseDateTime(version.snapshotsTs));
  const totalRange = Math.max(maxTime - minTime, 1);

  return {
    label: '快照',
    timeLabel: formatDateTime(version.snapshotsTs),
    offsetPercent: Math.min(100, Math.max(0, Math.round(((parseDateTime(version.snapshotsTs) - minTime) / totalRange) * 100))),
  };
}

function buildChartCards(version: VersionDetail): DetailChartCards {
  return {
    riskComposition: buildRiskComposition(version.metrics),
    coverageSeries: buildCoverageSeries(version.metrics),
    scheduleBars: buildScheduleBars(version),
    snapshotMarker: buildSnapshotMarker(version),
  };
}

export function buildVersionDetailInsights(version: VersionDetail): VersionDetailInsights {
  return {
    diagnosticViews: [
      {
        key: 'phase',
        title: '阶段路径',
        groups: getGroups(version, version.byPhase, 'phase', 'phaseName'),
      },
      {
        key: 'dimension',
        title: '数据维度',
        groups: getGroups(version, version.byDataDimension, 'dataDimension', 'dataDimensionName'),
      },
      {
        key: 'target',
        title: '评价对象',
        groups: getGroups(version, version.byEvalTarget, 'evalTarget', 'evalTargetName'),
      },
    ],
    chartCards: buildChartCards(version),
    evidenceRows: version.metrics.map((metric) => ({
      metricCode: metric.metricCode,
      metricName: metric.metricName,
      phaseName: metric.phaseName ?? '未知阶段',
      dataDimensionName: metric.dataDimensionName ?? '未知维度',
      evalTargetName: metric.evalTargetName ?? '未知目标',
      actualScore: metric.actualScore,
      calcScore: metric.calcScore,
      riskLevel: metric.riskLevel ?? 'LOW',
      facts: buildFacts(metric),
    })),
    focusItems: buildFocusItems(version.metrics),
  };
}
