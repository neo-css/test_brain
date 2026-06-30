import { describe, expect, it } from 'vitest';
import { resolveTheme, STORAGE_KEY, type ThemeAppearance } from '../contexts/themeHelpers';

describe('resolveTheme', () => {
  it('returns dark when appearance is dark regardless of system preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('returns light when appearance is light regardless of system preference', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('follows system preference when appearance is system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('defaults to dark when appearance is unknown', () => {
    expect(resolveTheme('unknown' as ThemeAppearance, false)).toBe('dark');
  });
});

describe('localStorage helpers', () => {
  it('uses the expected storage key', () => {
    expect(STORAGE_KEY).toBe('test_brain_theme');
  });
});
