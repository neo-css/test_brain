import { formatDateTime, RISK_WEIGHT, type VersionDetail } from '../data/versionMock';
import { summarizeRiskCounts } from './versionListFilters';

export interface L1DashboardSummary {
  totalVersions: number;
  averageScore: number;
  latestSnapshot: string;
  riskCounts: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  highRiskRatio: number;
  priorityVersions: VersionDetail[];
}

export function buildL1DashboardSummary(versions: VersionDetail[]): L1DashboardSummary {
  const totalVersions = versions.length;
  const riskCounts = summarizeRiskCounts(versions);

  if (totalVersions === 0) {
    return {
      totalVersions,
      averageScore: 0,
      latestSnapshot: '--',
      riskCounts,
      highRiskRatio: 0,
      priorityVersions: [],
    };
  }

  const averageScore = Number((versions.reduce((sum, version) => sum + version.totalScore, 0) / totalVersions).toFixed(1));
  const latestSnapshot = versions.reduce((latest, version) =>
    new Date(version.snapshotsTs).getTime() > new Date(latest.snapshotsTs).getTime() ? version : latest,
  ).snapshotsTs;

  const priorityVersions = [...versions]
    .sort((a, b) => {
      const riskDiff = (RISK_WEIGHT[b.riskLevel] ?? 0) - (RISK_WEIGHT[a.riskLevel] ?? 0);
      if (riskDiff !== 0) return riskDiff;
      return a.totalScore - b.totalScore;
    })
    .slice(0, 3);

  return {
    totalVersions,
    averageScore,
    latestSnapshot: formatDateTime(latestSnapshot),
    riskCounts,
    highRiskRatio: Math.round((riskCounts.HIGH / totalVersions) * 100),
    priorityVersions,
  };
}
