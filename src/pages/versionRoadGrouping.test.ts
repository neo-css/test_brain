import { describe, expect, it } from 'vitest';
import { VersionDetail } from '../data/versionMock';
import {
  assignDamageLevel,
  buildDayWindow,
  buildRangeWindow,
  getDataAnchorDate,
  getReleaseDate,
  groupByDay,
  shiftDays,
  weekdayLabel,
} from './versionRoadGrouping';

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
    summary: '版本',
    status: '测试中',
    releaseType: '迭代发布',
    metrics: [],
    byPhase: [],
    byDataDimension: [],
    byEvalTarget: [],
    ...overrides,
  };
}

describe('assignDamageLevel', () => {
  it('maps risk levels from mock data to car damage levels', () => {
    expect(assignDamageLevel('LOW')).toBe(0);
    expect(assignDamageLevel('MEDIUM')).toBe(2);
    expect(assignDamageLevel('HIGH')).toBe(4);
    expect(assignDamageLevel('UNKNOWN')).toBe(3);
  });
});

describe('buildDayWindow', () => {
  it('returns N consecutive future days from anchor', () => {
    expect(buildDayWindow('2026-06-24', 10)).toEqual([
      '2026-06-24',
      '2026-06-25',
      '2026-06-26',
      '2026-06-27',
      '2026-06-28',
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ]);
  });

  it('handles month boundary crossing', () => {
    const window = buildDayWindow('2026-06-29', 4);
    expect(window).toEqual(['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02']);
  });

  it('returns at least one day for invalid counts', () => {
    expect(buildDayWindow('2026-06-02', 0)).toEqual(['2026-06-02']);
  });
});

describe('buildRangeWindow', () => {
  it('returns ascending dates from start to end (inclusive)', () => {
    expect(buildRangeWindow('2026-06-01', '2026-06-04')).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
    ]);
  });

  it('normalizes inverted ranges', () => {
    expect(buildRangeWindow('2026-06-04', '2026-06-01')).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
    ]);
  });
});

describe('groupByDay', () => {
  it('fills empty days and only includes versions within window', () => {
    const versions = [
      makeVersion({ patchId: 1, actualTestToTime: '2026-06-20 18:00:00' }),
      makeVersion({ patchId: 2, actualTestToTime: '2026-06-20 09:00:00' }),
      makeVersion({ patchId: 3, actualTestToTime: '2026-06-18 18:00:00' }),
      makeVersion({ patchId: 4, actualTestToTime: '2026-05-01 18:00:00' }),
    ];
    const window = buildDayWindow('2026-06-20', 3);
    const grouped = groupByDay(versions, window);
    expect(grouped.map((day) => day.dateKey)).toEqual(['2026-06-20', '2026-06-21', '2026-06-22']);
    expect(grouped[0].versions.map((version) => version.patchId)).toEqual([1, 2]);
    expect(grouped[1].versions).toEqual([]);
    expect(grouped[2].versions).toEqual([]);
  });
});

describe('getReleaseDate / getDataAnchorDate', () => {
  it('uses actualTestToTime as release date', () => {
    expect(getReleaseDate(makeVersion({ actualTestToTime: '2026-06-18 18:00:00' }))).toBe('2026-06-18');
  });

  it('returns the latest release date as anchor', () => {
    const versions = [
      makeVersion({ patchId: 1, actualTestToTime: '2026-06-10 18:00:00' }),
      makeVersion({ patchId: 2, actualTestToTime: '2026-06-24 18:00:00' }),
      makeVersion({ patchId: 3, actualTestToTime: '2026-06-15 18:00:00' }),
    ];
    expect(getDataAnchorDate(versions)).toBe('2026-06-24');
  });
});

describe('shiftDays / weekdayLabel', () => {
  it('shifts forwards and backwards', () => {
    expect(shiftDays('2026-06-01', -1)).toBe('2026-05-31');
    expect(shiftDays('2026-06-01', 5)).toBe('2026-06-06');
  });

  it('returns Chinese weekday', () => {
    expect(weekdayLabel('2026-06-22')).toBe('周一');
  });
});
