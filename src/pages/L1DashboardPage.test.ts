import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import type { VersionDetail } from '../data/versionMock';
import { patchScores } from '../mocks/tedSbrain/fixtures';
import { mapPatchScoreToVersionDetail } from '../services/tedSbrain/versionViewModel';
import L1DashboardPage from './L1DashboardPage';

const collectionState = vi.hoisted(() => ({
  versions: [] as VersionDetail[],
}));

const versions = patchScores.map(mapPatchScoreToVersionDetail);
collectionState.versions = versions;

vi.mock('../services/tedSbrain/useTedSbrainVersions', () => ({
  useCollectionVersions: () => ({
    status: 'success',
    versions: collectionState.versions,
    error: null,
  }),
}));

describe('L1DashboardPage situation awareness controls', () => {
  it('uses a risk filter select instead of detector dispatch buttons', () => {
    const html = renderToStaticMarkup(
      createElement(ThemeProvider, null,
        createElement(MemoryRouter, null,
          createElement(L1DashboardPage),
        ),
      ),
    );

    expect(html).toContain('风险筛选');
    expect(html).toContain('全部风险');
    expect(html).toContain('高风险');
    expect(html).toContain('中风险');
    expect(html).toContain('低风险');
    expect(html).toContain('未知风险');
    expect(html).not.toContain('下发全部探测器');
  });
});
