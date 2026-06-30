'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readStoredAppearance, resolveTheme, writeStoredAppearance, type ThemeAppearance, type ResolvedTheme } from './themeHelpers';

interface ThemeContextValue {
  appearance: ThemeAppearance;
  resolved: ResolvedTheme;
  setAppearance: (appearance: ThemeAppearance) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] = useState<ThemeAppearance>(() => readStoredAppearance());
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const resolved = useMemo(() => resolveTheme(appearance, systemDark), [appearance, systemDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const setAppearance = useCallback((next: ThemeAppearance) => {
    setAppearanceState(next);
    writeStoredAppearance(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ appearance, resolved, setAppearance }),
    [appearance, resolved, setAppearance],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
