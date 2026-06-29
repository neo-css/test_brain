import { describe, expect, it } from 'vitest';
import { formatDateTime, formatScore, getVersionByPatchId, riskLabel, versionDetails } from './versionMock';

describe('version mock data', () => {
  it('provides a large in-test version set for list filtering and density checks', () => {
    expect(versionDetails.length).toBeGreaterThanOrEqual(80);
    expect(new Set(versionDetails.map((version) => version.riskLevel))).toEqual(new Set(['LOW', 'MEDIUM', 'HIGH']));
    expect(new Set(versionDetails.map((version) => version.status)).size).toBeGreaterThanOrEqual(3);
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
