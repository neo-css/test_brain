import { describe, expect, it } from 'vitest';
import {
  findPatchScore,
  findScoreSnapshot,
  getPatchScoreHistory,
  listScoreSnapshots,
  pageScoreSnapshots,
} from './repository';

const documentedMetricCodes = [
  'CHANGES_RISK',
  'CASE_REVIEW_TIMELINESS',
  'DEFECT_RISK',
  'SMART_TEST',
  'COVERAGE_390',
  'COVERAGE_FUNCTION',
];

describe('ted-sbrain mock repository', () => {
  it('finds known patch scores and snapshots', () => {
    expect(findPatchScore(12345)?.riskLevel).toBe('LOW');
    expect(findScoreSnapshot('snapshot-12345-latest')?.patchId).toBe(12345);
  });

  it('returns documented metric codes and populated grouped views', () => {
    const patchScore = findPatchScore(12345);

    expect(patchScore?.metrics.map((metric) => metric.metricCode)).toEqual(documentedMetricCodes);
    expect(patchScore?.metrics[0]).toMatchObject({
      metricName: '版本变更风险',
      phaseName: '开发阶段',
      dataDimensionName: '质量风险',
      evalTargetName: '版本',
      description: '基于版本数据的版本变更风险评估。',
    });
    expect(patchScore?.metrics[0].features).toMatchObject({
      changeCount: { value: expect.any(Number) },
    });
    expect(JSON.stringify(patchScore?.metrics)).not.toContain('mock服务');
    expect(JSON.stringify(patchScore?.metrics)).not.toContain('是否稳定样例');
    expect(patchScore?.metrics[0].detailUrl).toBe('/detail/changes');
    expect(patchScore?.byPhase.length).toBeGreaterThan(0);
    expect(patchScore?.byDataDimension.length).toBeGreaterThan(0);
    expect(patchScore?.byEvalTarget.length).toBeGreaterThan(0);
    expect(patchScore?.byPhase.flatMap((group) => group.metrics)).toHaveLength(documentedMetricCodes.length);
    expect(patchScore?.byDataDimension.flatMap((group) => group.metrics)).toHaveLength(documentedMetricCodes.length);
    expect(patchScore?.byEvalTarget.flatMap((group) => group.metrics)).toHaveLength(documentedMetricCodes.length);
  });

  it('returns undefined for unknown records', () => {
    expect(findPatchScore(99999)).toBeUndefined();
    expect(findScoreSnapshot('missing')).toBeUndefined();
  });

  it('returns ordered patch score history', () => {
    const history = getPatchScoreHistory(12345);
    expect(history).toHaveLength(3);
    expect(history.map((item) => item.snapshotsTs)).toEqual([
      '2026-07-06T10:00:00',
      '2026-07-07T10:15:00',
      '2026-07-08T10:30:00',
    ]);
  });

  it('filters snapshots using all supplied fields', () => {
    const records = listScoreSnapshots({ riskLevel: 'HIGH', sysId: 'PAY' });
    expect(records.map((record) => record.id)).toEqual(['snapshot-22345-latest']);
    expect(records[0]).toMatchObject({
      summary: '支付核心系统 v9.1 紧急修复风险评估',
      status: 'BLOCKED',
      releaseType: 'EMERGENCY_FIX',
      systemName: '支付核心系统',
      teamName: '支付质量组',
      patchOwner: '赵明远',
      testLeader: '支付质量组测试负责人',
      devLeader: '支付质量组开发负责人',
      testOwnerGroup: '支付质量组测试执行组',
    });
  });

  it('uses API-like status and release type code values in mock responses', () => {
    const snapshot = findScoreSnapshot('snapshot-12345-latest');

    expect(snapshot).toMatchObject({
      status: 'TESTING',
      releaseType: 'NORMAL',
    });
  });

  it('provides broad Chinese fixture coverage for page demos', () => {
    const records = listScoreSnapshots();

    expect(records).toHaveLength(10);
    expect(new Set(records.map((record) => record.sysId)).size).toBeGreaterThanOrEqual(8);
    expect(new Set(records.map((record) => record.patchOwner)).size).toBeGreaterThanOrEqual(8);
    expect(records.every((record) => /[\u4e00-\u9fa5]/.test(record.summary))).toBe(true);
  });

  it('paginates snapshots with calculated totals', () => {
    const page = pageScoreSnapshots({ page: 2, pageSize: 2 });
    expect(page.current).toBe(2);
    expect(page.size).toBe(2);
    expect(page.total).toBe(10);
    expect(page.pages).toBe(5);
    expect(page.records.map((record) => record.id)).toEqual(['snapshot-32345-latest', 'snapshot-42345-latest']);
  });
});
