import { describe, expect, it } from 'vitest';
import { VersionDetail } from '../data/versionMock';
import { filterAndSortVersions, summarizeRiskCounts } from './versionListFilters';

function makeVersion(overrides: Partial<VersionDetail>): VersionDetail {
  return {
    patchId: 1,
    totalScore: 80,
    qualityScore: 4,
    behaviorScore: 3,
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

const versions = [
  makeVersion({ patchId: 1, totalScore: 88, riskLevel: 'LOW', sysId: 'TED', subNamedSystemName: '测试大脑系统', status: '测试中', snapshotsTs: '2026-06-20T09:00:00' }),
  makeVersion({ patchId: 2, totalScore: 62, riskLevel: 'HIGH', sysId: 'PAY', subNamedSystemName: '支付核心系统', status: '阻塞中', patchOwner: '赵六', snapshotsTs: '2026-06-24T09:00:00' }),
  makeVersion({ patchId: 3, totalScore: 74, riskLevel: 'MEDIUM', sysId: 'CRM', subNamedSystemName: '客户关系系统', status: '测试中', teamName: '业务平台部', snapshotsTs: '2026-06-22T09:00:00' }),
];

describe('filterAndSortVersions', () => {
  it('searches across summary, system, team, owner, leader, and patch id', () => {
    expect(filterAndSortVersions(versions, { query: '支付', risk: 'ALL', status: 'ALL', sort: 'RISK' }).map((version) => version.patchId)).toEqual([2]);
    expect(filterAndSortVersions(versions, { query: '业务平台', risk: 'ALL', status: 'ALL', sort: 'RISK' }).map((version) => version.patchId)).toEqual([3]);
    expect(filterAndSortVersions(versions, { query: '2', risk: 'ALL', status: 'ALL', sort: 'RISK' }).map((version) => version.patchId)).toEqual([2]);
  });

  it('filters by risk and status before sorting', () => {
    const result = filterAndSortVersions(versions, { query: '', risk: 'MEDIUM', status: '测试中', sort: 'SCORE_DESC' });

    expect(result.map((version) => version.patchId)).toEqual([3]);
  });

  it('sorts by risk, score, and latest snapshot time', () => {
    expect(filterAndSortVersions(versions, { query: '', risk: 'ALL', status: 'ALL', sort: 'RISK' }).map((version) => version.patchId)).toEqual([2, 3, 1]);
    expect(filterAndSortVersions(versions, { query: '', risk: 'ALL', status: 'ALL', sort: 'SCORE_ASC' }).map((version) => version.patchId)).toEqual([2, 3, 1]);
    expect(filterAndSortVersions(versions, { query: '', risk: 'ALL', status: 'ALL', sort: 'LATEST' }).map((version) => version.patchId)).toEqual([2, 3, 1]);
  });
});

describe('summarizeRiskCounts', () => {
  it('counts versions by known risk levels', () => {
    expect(summarizeRiskCounts(versions)).toEqual({ HIGH: 1, MEDIUM: 1, LOW: 1 });
  });
});
