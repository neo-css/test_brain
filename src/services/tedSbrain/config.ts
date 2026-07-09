export const DEFAULT_TED_SBRAIN_API_BASE_URL = 'http://172.21.126.221:49152';
export const TED_SBRAIN_PATH_PREFIX = '/ted-sbrain';

export interface TedSbrainEnv {
  VITE_TED_SBRAIN_API_BASE_URL?: string;
}

export function readViteEnv(): TedSbrainEnv {
  const meta = import.meta as ImportMeta & { env?: TedSbrainEnv };
  return meta.env ?? {};
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getTedSbrainApiBaseUrl(env: TedSbrainEnv = readViteEnv()): string {
  const configured = env.VITE_TED_SBRAIN_API_BASE_URL?.trim();

  return configured === '' ? '' : trimTrailingSlash(configured || DEFAULT_TED_SBRAIN_API_BASE_URL);
}

export function normalizeTedSbrainPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === TED_SBRAIN_PATH_PREFIX || normalizedPath.startsWith(`${TED_SBRAIN_PATH_PREFIX}/`)) {
    return normalizedPath;
  }

  return `${TED_SBRAIN_PATH_PREFIX}${normalizedPath}`;
}

export function buildTedSbrainUrl(baseUrl: string, path: string): string {
  const normalizedPath = normalizeTedSbrainPath(path);
  const normalizedBase = trimTrailingSlash(baseUrl);

  if (!normalizedBase) return normalizedPath;

  if (normalizedBase.endsWith(TED_SBRAIN_PATH_PREFIX)) {
    return `${normalizedBase}${normalizedPath.slice(TED_SBRAIN_PATH_PREFIX.length)}`;
  }

  return `${normalizedBase}${normalizedPath}`;
}
