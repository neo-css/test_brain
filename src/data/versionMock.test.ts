import { describe, expect, it } from 'vitest';
import { getTopologyColumnProgress } from '../components/DynamicTopologyLogic';
import { formatDateTime, formatScore, getVersionByPatchId, riskLabel, versionDetails } from './versionMock';

describe('version mock data', () => {
  it('provides a large in-test version set for list filtering and density checks', () => {
    expect(versionDetails.length).toBeGreaterThanOrEqual(80);
    expect(new Set(versionDetails.map((version) => version.riskLevel))).toEqual(new Set(['LOW', 'MEDIUM', 'HIGH']));
    expect(new Set(versionDetails.map((version) => version.status))).toEqual(
      new Set(['准入中', '测试中', '阻塞中', '待回归', '待发布']),
    );
  });

  it('spreads mock snapshots across version phases so topology towers have varied heights', () => {
    const progressValues = versionDetails.map((version) => getTopologyColumnProgress(version));

    expect(progressValues.filter((progress) => progress <= 0.3).length).toBeGreaterThanOrEqual(18);
    expect(progressValues.filter((progress) => progress > 0.3 && progress <= 0.7).length).toBeGreaterThanOrEqual(28);
    expect(progressValues.filter((progress) => progress > 0.7).length).toBeGreaterThanOrEqual(18);
  });

  it('provides multiple in-test version records derived from the backend detail shape', () => {
    expect(versionDetails.length).toBeGreaterThanOrEqual(4);
    expect(versionDetails[0].patchId).toBe(64460);
    expect(versionDetails[0].summary).toContain('TED系统 v2.3');
  });

  it('finds version detail records by patch id string', () => {
    expect(getVersionByPatchId('64460')?.sysId).toBe('TED');
    expect(getVersionByPatchId('999999')).toBeUndefined();
  });

  it('formats scores, date-time values, and risk labels for display', () => {
    expect(formatScore(78.5)).toBe('78.5');
    expect(formatScore(72)).toBe('72');
    expect(formatDateTime('2026-06-23T09:30:00')).toBe('2026-06-23 09:30');
    expect(riskLabel('MEDIUM')).toBe('中风险');
  });
});
