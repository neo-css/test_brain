export type ThemeAppearance = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const STORAGE_KEY = 'test_brain_theme';

const VALID_APPEARANCES: Set<string> = new Set(['light', 'dark', 'system']);

export function resolveTheme(appearance: ThemeAppearance, systemPrefersDark: boolean): ResolvedTheme {
  if (appearance === 'dark') return 'dark';
  if (appearance === 'light') return 'light';
  if (appearance === 'system') return systemPrefersDark ? 'dark' : 'light';
  return 'dark';
}

export function readStoredAppearance(): ThemeAppearance {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_APPEARANCES.has(stored)) return stored as ThemeAppearance;
  } catch {
    // localStorage unavailable (SSR, privacy mode)
  }
  return 'system';
}

export function writeStoredAppearance(appearance: ThemeAppearance): void {
  try {
    localStorage.setItem(STORAGE_KEY, appearance);
  } catch {
    // storage full or unavailable
  }
}
