import type { ScoreSnapshotFilters, TedSbrainResponse } from '../../services/tedSbrain/types';
import {
  findPatchScore,
  findScoreSnapshot,
  getPatchScoreHistory,
  listScoreSnapshots,
  pageScoreSnapshots,
} from './repository';

const API_PREFIX = '/ted-sbrain';

const jsonHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Accept',
  'Content-Type': 'application/json; charset=utf-8',
};

type ScoreSnapshotRouteFilters = ScoreSnapshotFilters & {
  page?: number;
  pageSize?: number;
};

export function normalizeMockPath(pathname: string): string {
  if (pathname === API_PREFIX) {
    return '/';
  }

  if (pathname.startsWith(`${API_PREFIX}/`)) {
    return pathname.slice(API_PREFIX.length);
  }

  return pathname;
}

function successResponse<T>(data: T, status = 200): Response {
  const body: TedSbrainResponse<T> = {
    result: true,
    message: 'success',
    data,
    criticalProcess: {},
  };

  return jsonResponse(body, status);
}

function failureResponse(message: string, status = 404): Response {
  return jsonResponse(
    {
      result: false,
      message,
      data: null,
      criticalProcess: {},
    },
    status,
  );
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

function filtersFrom(searchParams: URLSearchParams): ScoreSnapshotRouteFilters {
  const filters: ScoreSnapshotRouteFilters = {};

  searchParams.forEach((value, key) => {
    if (key === 'page' || key === 'pageSize') {
      filters[key] = Number(value);
      return;
    }

    (filters as Record<string, string>)[key] = value;
  });

  return filters;
}

function patchIdFromPath(pathname: string, routeSuffix: string): number | undefined {
  const pattern = new RegExp(`^/metric/patches/(\\d+)/score${routeSuffix}$`);
  const match = pathname.match(pattern);
  return match ? Number(match[1]) : undefined;
}

export async function handleTedSbrainMockRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = normalizeMockPath(url.pathname);
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return successResponse(null);
  }

  if (method === 'GET' && pathname === '/health') {
    return successResponse({ status: 'ok' });
  }

  const historyPatchId = method === 'GET' ? patchIdFromPath(pathname, '/history') : undefined;
  if (historyPatchId !== undefined) {
    if (!findPatchScore(historyPatchId)) {
      return failureResponse('patch score not found');
    }

    return successResponse(getPatchScoreHistory(historyPatchId));
  }

  const getPatchId = method === 'GET' ? patchIdFromPath(pathname, '') : undefined;
  if (getPatchId !== undefined) {
    const patchScore = findPatchScore(getPatchId);

    return patchScore ? successResponse(patchScore) : failureResponse('patch score not found');
  }

  const calculatePatchId = method === 'POST' ? patchIdFromPath(pathname, '/calculate') : undefined;
  if (calculatePatchId !== undefined) {
    const patchScore = findPatchScore(calculatePatchId);

    return patchScore ? successResponse(patchScore) : failureResponse('patch score not found');
  }

  if (method === 'GET' && pathname.startsWith('/scoreSnapshot/get/')) {
    const id = decodeURIComponent(pathname.slice('/scoreSnapshot/get/'.length));
    const snapshot = findScoreSnapshot(id);

    return snapshot ? successResponse(snapshot) : failureResponse('score snapshot not found');
  }

  if (method === 'GET' && pathname === '/scoreSnapshot/list') {
    return successResponse(listScoreSnapshots(filtersFrom(url.searchParams)));
  }

  if (method === 'GET' && pathname === '/scoreSnapshot/page') {
    return successResponse(pageScoreSnapshots(filtersFrom(url.searchParams)));
  }

  if (method === 'GET' && pathname === '/scoreSnapshot/queryLatestToday') {
    return successResponse(pageScoreSnapshots(filtersFrom(url.searchParams), 200));
  }

  return failureResponse(`mock route not found: ${method} ${pathname}`);
}
