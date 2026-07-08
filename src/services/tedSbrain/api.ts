import { tedSbrainClient } from './client';
import type { TedSbrainClient } from './client';
import type { PatchScoreVO, ScoreSnapshot, ScoreSnapshotFilters, ScoreSnapshotPage } from './types';

export function fetchPatchScore(patchId: number, client: TedSbrainClient = tedSbrainClient): Promise<PatchScoreVO> {
  return client.request<PatchScoreVO>(`/metric/patches/${patchId}/score`);
}

export function calculatePatchScore(patchId: number, client: TedSbrainClient = tedSbrainClient): Promise<PatchScoreVO> {
  return client.request<PatchScoreVO>(`/metric/patches/${patchId}/score/calculate`, {
    method: 'POST',
  });
}

export function fetchPatchScoreHistory(
  patchId: number,
  client: TedSbrainClient = tedSbrainClient,
): Promise<PatchScoreVO[]> {
  return client.request<PatchScoreVO[]>(`/metric/patches/${patchId}/score/history`);
}

export function fetchScoreSnapshot(id: string, client: TedSbrainClient = tedSbrainClient): Promise<ScoreSnapshot> {
  return client.request<ScoreSnapshot>(`/scoreSnapshot/get/${id}`);
}

export function listScoreSnapshots(
  filters: ScoreSnapshotFilters = {},
  client: TedSbrainClient = tedSbrainClient,
): Promise<ScoreSnapshot[]> {
  return client.request<ScoreSnapshot[]>('/scoreSnapshot/list', {
    query: filters,
  });
}

export function pageScoreSnapshots(
  params: ScoreSnapshotFilters & { page?: number; pageSize?: number } = {},
  client: TedSbrainClient = tedSbrainClient,
): Promise<ScoreSnapshotPage> {
  return client.request<ScoreSnapshotPage>('/scoreSnapshot/page', {
    query: params,
  });
}

export function fetchLatestTodayScoreSnapshots(
  params: ScoreSnapshotFilters & { page?: number; pageSize?: number } = {},
  client: TedSbrainClient = tedSbrainClient,
): Promise<ScoreSnapshotPage> {
  return client.request<ScoreSnapshotPage>('/scoreSnapshot/queryLatestToday', {
    query: params,
  });
}
