import { VersionDetail } from '../data/versionMock';

export type RiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type StatusFilter = 'ALL' | string;
export type VersionSort = 'RISK' | 'SCORE_ASC' | 'SCORE_DESC' | 'LATEST';

export interface VersionListFilters {
  query: string;
  risk: RiskFilter;
  status: StatusFilter;
  sort: VersionSort;
}

const riskWeight: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function matchesQuery(version: VersionDetail, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  return [
    version.patchId,
    version.summary,
    version.sysId,
    version.subNamedSystemName,
    version.teamName,
    version.patchOwner,
    version.testLeader,
    version.devLeader,
  ].some((field) => normalize(field).includes(normalizedQuery));
}

function compareByRisk(first: VersionDetail, second: VersionDetail) {
  const riskDiff = (riskWeight[second.riskLevel] ?? 0) - (riskWeight[first.riskLevel] ?? 0);
  if (riskDiff !== 0) return riskDiff;
  return second.totalScore - first.totalScore;
}

export function filterAndSortVersions(versions: VersionDetail[], filters: VersionListFilters) {
  const filtered = versions.filter((version) => {
    const riskMatches = filters.risk === 'ALL' || version.riskLevel === filters.risk;
    const statusMatches = filters.status === 'ALL' || version.status === filters.status;
    return riskMatches && statusMatches && matchesQuery(version, filters.query);
  });

  return [...filtered].sort((first, second) => {
    if (filters.sort === 'SCORE_ASC') return first.totalScore - second.totalScore;
    if (filters.sort === 'SCORE_DESC') return second.totalScore - first.totalScore;
    if (filters.sort === 'LATEST') return Date.parse(second.snapshotsTs) - Date.parse(first.snapshotsTs);
    return compareByRisk(first, second);
  });
}

export function summarizeRiskCounts(versions: VersionDetail[]) {
  return versions.reduce(
    (counts, version) => {
      if (version.riskLevel === 'HIGH' || version.riskLevel === 'MEDIUM' || version.riskLevel === 'LOW') {
        counts[version.riskLevel] += 1;
      }
      return counts;
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0 },
  );
}

export function getStatusOptions(versions: VersionDetail[]) {
  return Array.from(new Set(versions.map((version) => version.status))).filter(Boolean);
}
