import type { VersionDetail } from '../../data/versionMock';
import { fetchLatestTodayScoreSnapshots, fetchPatchScore } from './api';
import { tedSbrainClient, type TedSbrainClient } from './client';
import { mapPatchScoreToVersionDetail, mapScoreSnapshotToVersionDetail } from './versionViewModel';

export interface CollectionLoadState {
  status: 'loading' | 'success' | 'error';
  versions: VersionDetail[];
  error: string | null;
}

export interface DetailLoadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  version: VersionDetail | undefined;
  error: string | null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '加载 ted-sbrain 数据失败';
}

export async function loadCollectionVersions(
  client: TedSbrainClient = tedSbrainClient,
): Promise<CollectionLoadState> {
  try {
    const page = await fetchLatestTodayScoreSnapshots({ page: 1, pageSize: 200 }, client);

    return {
      status: 'success',
      versions: page.records.map(mapScoreSnapshotToVersionDetail),
      error: null,
    };
  } catch (error) {
    return {
      status: 'error',
      versions: [],
      error: errorMessage(error),
    };
  }
}

export async function loadPatchDetail(
  patchId: number,
  client: TedSbrainClient = tedSbrainClient,
): Promise<DetailLoadState> {
  if (!Number.isFinite(patchId)) {
    return {
      status: 'idle',
      version: undefined,
      error: null,
    };
  }

  try {
    const patchScore = await fetchPatchScore(patchId, client);

    return {
      status: 'success',
      version: mapPatchScoreToVersionDetail(patchScore),
      error: null,
    };
  } catch (error) {
    return {
      status: 'error',
      version: undefined,
      error: errorMessage(error),
    };
  }
}
