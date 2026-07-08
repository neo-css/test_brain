export const DEFAULT_TED_SBRAIN_API_BASE_URL = 'http://localhost:49152';
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

export function getTedSbrainApiBaseUrl(env = readViteEnv()): string {
  const configuredBaseUrl = env.VITE_TED_SBRAIN_API_BASE_URL?.trim();

  return configuredBaseUrl ? trimTrailingSlash(configuredBaseUrl) : DEFAULT_TED_SBRAIN_API_BASE_URL;
}

export function normalizeTedSbrainPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === TED_SBRAIN_PATH_PREFIX || normalizedPath.startsWith(`${TED_SBRAIN_PATH_PREFIX}/`)) {
    return normalizedPath;
  }

  return `${TED_SBRAIN_PATH_PREFIX}${normalizedPath}`;
}

export function buildTedSbrainUrl(baseUrl: string, path: string): string {
  return `${trimTrailingSlash(baseUrl)}${normalizeTedSbrainPath(path)}`;
}
