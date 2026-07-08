import { describe, expect, it } from 'vitest';
import {
  findPatchScore,
  findScoreSnapshot,
  getPatchScoreHistory,
  listScoreSnapshots,
  pageScoreSnapshots,
} from './repository';

describe('ted-sbrain mock repository', () => {
  it('finds known patch scores and snapshots', () => {
    expect(findPatchScore(12345)?.riskLevel).toBe('LOW');
    expect(findScoreSnapshot('snapshot-12345-latest')?.patchId).toBe(12345);
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
  });

  it('paginates snapshots with calculated totals', () => {
    const page = pageScoreSnapshots({ page: 2, pageSize: 2 });
    expect(page.current).toBe(2);
    expect(page.size).toBe(2);
    expect(page.total).toBe(4);
    expect(page.pages).toBe(2);
    expect(page.records.map((record) => record.id)).toEqual(['snapshot-32345-latest', 'snapshot-42345-latest']);
  });
});
