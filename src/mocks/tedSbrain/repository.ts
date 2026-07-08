import type { PatchScoreVO, ScoreSnapshot, ScoreSnapshotFilters, ScoreSnapshotPage } from '../../services/tedSbrain/types';
import { patchScoreHistory, patchScores, scoreSnapshots } from './fixtures';

type ScoreSnapshotPageFilters = ScoreSnapshotFilters & {
  page?: number;
  pageSize?: number;
};

const bySnapshotsTsAscending = (left: PatchScoreVO, right: PatchScoreVO): number =>
  left.snapshotsTs.localeCompare(right.snapshotsTs);

const hasFilterValue = (value: unknown): boolean => value !== undefined && value !== null && value !== '';

export function findPatchScore(patchId: number): PatchScoreVO | undefined {
  return patchScores.find((patchScore) => patchScore.patchId === patchId);
}

export function getPatchScoreHistory(patchId: number): PatchScoreVO[] {
  return [...(patchScoreHistory[patchId] ?? [])].sort(bySnapshotsTsAscending);
}

export function findScoreSnapshot(id: string): ScoreSnapshot | undefined {
  return scoreSnapshots.find((snapshot) => snapshot.id === id);
}

export function listScoreSnapshots(filters: ScoreSnapshotFilters = {}): ScoreSnapshot[] {
  const activeFilters = Object.entries(filters).filter(([, value]) => hasFilterValue(value));

  return scoreSnapshots.filter((snapshot) =>
    activeFilters.every(([key, value]) => {
      const snapshotKey = key as keyof ScoreSnapshot;
      return String(snapshot[snapshotKey]) === String(value);
    }),
  );
}

export function pageScoreSnapshots(
  filters: ScoreSnapshotPageFilters = {},
  defaultPageSize = 10,
): ScoreSnapshotPage {
  const { page, pageSize, ...snapshotFilters } = filters;
  const current = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || defaultPageSize);
  const records = listScoreSnapshots(snapshotFilters);
  const total = records.length;
  const pages = Math.ceil(total / size);
  const start = (current - 1) * size;

  return {
    records: records.slice(start, start + size),
    total,
    size,
    current,
    pages,
  };
}
