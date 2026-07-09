import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VersionDetail } from '../data/versionMock';
import { buildVersionDetailInsights } from './versionDetailInsights';

function makeVersion(overrides: Partial<VersionDetail> = {}): VersionDetail {
  return {
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
    summary: 'TED系统 v2.3 迭代发布',
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
          summaryCodeConsistent: false,
          summaryCodeDiffCount: 2,
        },
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
          testDay: 13,
          totalDays: 9,
        },
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
            缺陷分析: 2,
          },
        },
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
        },
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
        riskLevel: 'LOW',
        features: {
          javaCoverageInfo: {
            cover: 156,
            num: 200,
          },
          cCoverageInfo: {
            cover: 42,
            num: 103,
          },
        },
      },
    ],
    byPhase: [
      {
        key: 'ADMISSION',
        displayName: '准入阶段',
        groupScore: 4.4,
        metrics: [{ metricCode: 'CHANGES_RISK', metricName: '版本变更风险', calcScore: 4.4, actualScore: 4.4 }],
      },
      {
        key: 'TEST_EXECUTION',
        displayName: '测试执行阶段',
        groupScore: 6.2,
        metrics: [
          { metricCode: 'DEFECT_RISK', metricName: '版本缺陷风险', calcScore: 3.2, actualScore: 3.2 },
          { metricCode: 'SMART_TEST', metricName: '智能测试渗透率', calcScore: 3, actualScore: 3 },
        ],
      },
    ],
    byDataDimension: [
      {
        key: 'PERSONNEL_RELATED',
        displayName: '人员相关',
        groupScore: 7.4,
        metrics: [
          { metricCode: 'CHANGES_RISK', metricName: '版本变更风险', calcScore: 4.4, actualScore: 4.4 },
          { metricCode: 'SMART_TEST', metricName: '智能测试渗透率', calcScore: 3, actualScore: 3 },
        ],
      },
      {
        key: 'DEFECT_RELATED',
        displayName: '缺陷相关',
        groupScore: 3.2,
        metrics: [{ metricCode: 'DEFECT_RISK', metricName: '版本缺陷风险', calcScore: 3.2, actualScore: 3.2 }],
      },
    ],
    byEvalTarget: [
      {
        key: 'VERSION_QUALITY',
        displayName: '版本质量',
        groupScore: 7.6,
        metrics: [
          { metricCode: 'CHANGES_RISK', metricName: '版本变更风险', calcScore: 4.4, actualScore: 4.4 },
          { metricCode: 'DEFECT_RISK', metricName: '版本缺陷风险', calcScore: 3.2, actualScore: 3.2 },
        ],
      },
      {
        key: 'TEST_BEHAVIOR',
        displayName: '测试行为',
        groupScore: 3,
        metrics: [{ metricCode: 'SMART_TEST', metricName: '智能测试渗透率', calcScore: 3, actualScore: 3 }],
      },
    ],
    ...overrides,
  };
}

describe('buildVersionDetailInsights', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('surfaces phase, data-dimension, and evaluation-target groups for L3 diagnostics', () => {
    const insights = buildVersionDetailInsights(makeVersion());

    expect(insights.diagnosticViews.map((view) => view.title)).toEqual(['阶段路径', '数据维度', '评价对象']);
    expect(insights.diagnosticViews[1].groups.map((group) => group.displayName)).toEqual(['人员相关', '缺陷相关']);
    expect(insights.diagnosticViews[2].groups.map((group) => group.displayName)).toEqual(['版本质量', '测试行为']);
  });

  it('turns metric feature payloads into operator-readable evidence', () => {
    const insights = buildVersionDetailInsights(makeVersion());

    expect(insights.evidenceRows.find((row) => row.metricCode === 'CHANGES_RISK')?.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '需求摘要一致', value: '是' }),
        expect.objectContaining({ label: '代码摘要一致', value: '否' }),
        expect.objectContaining({ label: '代码差异数', value: '2' }),
      ]),
    );
    expect(insights.evidenceRows.find((row) => row.metricCode === 'SMART_TEST')?.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '案例生成点击', value: '1 次' }),
        expect.objectContaining({ label: '缺陷分析点击', value: '2 次' }),
      ]),
    );
  });

  it('keeps nested coverage facts readable and uniquely keyed', () => {
    const insights = buildVersionDetailInsights(makeVersion({
      metrics: [
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
            javaCoverageInfo: {
              filterNum: 8,
              cover: 156,
            },
            cCoverageInfo: {
              filterNum: 3,
              cover: 42,
            },
          },
        },
      ],
    }));

    const coverageFacts = insights.evidenceRows[0].facts;
    const factKeys = coverageFacts.map((fact) => (fact as { key?: string }).key);

    expect(coverageFacts).toEqual(
      expect.arrayContaining([
        { key: 'javaCoverageInfo.filterNum', label: 'Java 覆盖 / 过滤数', value: '8' },
        { key: 'cCoverageInfo.filterNum', label: 'C 覆盖 / 过滤数', value: '3' },
      ]),
    );
    expect(new Set(factKeys).size).toBe(factKeys.length);
  });

  it('does not expose raw API codes, mock provenance, URLs, accounts, or unknown JSON keys in evidence facts', () => {
    const insights = buildVersionDetailInsights(makeVersion({
      metrics: [
        {
          metricCode: 'CHANGES_RISK',
          metricName: 'mock字段泄漏检查',
          phase: 'DEV',
          phaseName: '开发阶段',
          dataDimension: 'QUALITY',
          dataDimensionName: '质量风险',
          evalTarget: 'PATCH',
          evalTargetName: '版本',
          calcScore: 92,
          actualScore: 90,
          riskLevel: 'LOW',
          features: {
            数据来源: 'mock服务',
            是否稳定样例: true,
            changeCount: { value: 23 },
            defectNum: 5,
            unknownRawKey: 'raw-value',
          },
          description: '可读的指标说明。',
          detailUrl: '/detail/changes',
        },
      ],
    }));

    const rendered = insights.evidenceRows[0].facts.map((fact) => `${fact.label}:${fact.value}`).join('|');

    expect(rendered).toContain('指标说明:可读的指标说明。');
    expect(rendered).toContain('缺陷数:5');
    expect(rendered).toContain('特征值:23');
    expect(rendered).not.toContain('指标编码');
    expect(rendered).not.toContain('阶段编码');
    expect(rendered).not.toContain('数据维度编码');
    expect(rendered).not.toContain('评价对象编码');
    expect(rendered).not.toContain('详情链接');
    expect(rendered).not.toContain('mock服务');
    expect(rendered).not.toContain('是否稳定样例');
    expect(rendered).not.toContain('数据来源');
    expect(rendered).not.toContain('changeCount');
    expect(rendered).not.toContain('unknownRawKey');
    expect(rendered).not.toContain('raw-value');
  });

  it('builds chart-ready risk, coverage, and schedule payloads', () => {
    const insights = buildVersionDetailInsights(makeVersion());

    expect(insights.chartCards.riskComposition).toEqual([
      { riskLevel: 'HIGH', label: '高风险', value: 0 },
      { riskLevel: 'MEDIUM', label: '中风险', value: 2 },
      { riskLevel: 'LOW', label: '低风险', value: 3 },
    ]);
    expect(insights.chartCards.coverageSeries).toEqual([
      { label: '390回归', covered: 680, total: 800, rate: 0.85 },
      { label: 'Java函数', covered: 156, total: 200, rate: 0.78 },
      { label: 'C函数', covered: 42, total: 103, rate: 0.4078 },
    ]);
    expect(insights.chartCards.scheduleBars).toMatchObject([
      { label: '计划测试', startLabel: '2026-06-09 09:00', endLabel: '2026-06-17 18:00', durationDays: 9 },
      { label: '实际测试', startLabel: '2026-06-10 15:00', endLabel: '2026-06-18 18:00', durationDays: 9 },
    ]);
    expect(insights.chartCards.snapshotMarker.label).toBe('当前时间');
  });

  it('uses exact time proportions and current time for the timeline marker', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-09T12:00:00'));

    const insights = buildVersionDetailInsights(makeVersion({
      planedTestFromTime: '2026-07-09 00:00:00',
      planedTestToTime: '2026-07-10 00:00:00',
      actualTestFromTime: '2026-07-09 06:00:00',
      actualTestToTime: '2026-07-09 06:14:24',
      snapshotsTs: '2026-07-09T08:00:00',
    }));

    expect(insights.chartCards.scheduleBars).toMatchObject([
      { label: '计划测试', offsetPercent: 0, widthPercent: 100 },
      { label: '实际测试', offsetPercent: 25, widthPercent: 1 },
    ]);
    expect(insights.chartCards.snapshotMarker).toMatchObject({
      label: '当前时间',
      timeLabel: '2026-07-09 12:00',
      offsetPercent: 50,
    });
  });

  it('prioritizes medium and high risk metrics as next focus items', () => {
    const insights = buildVersionDetailInsights(makeVersion());

    expect(insights.focusItems).toEqual([
      {
        metricCode: 'DEFECT_RISK',
        title: '版本缺陷风险',
        meta: '测试执行阶段 / 缺陷相关',
        action: '优先处理版本缺陷风险，中风险指标会影响版本质量判断。',
      },
      {
        metricCode: 'SMART_TEST',
        title: '智能测试渗透率',
        meta: '测试执行阶段 / 人员相关',
        action: '优先处理智能测试渗透率，中风险指标会影响测试行为判断。',
      },
    ]);
  });
});
