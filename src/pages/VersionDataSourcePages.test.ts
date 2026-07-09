import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import type { VersionDetail } from '../data/versionMock';
import { patchScores } from '../mocks/tedSbrain/fixtures';
import { mapPatchScoreToVersionDetail } from '../services/tedSbrain/versionViewModel';
import VersionListPage from './VersionListPage';
import VersionRoadPage from './VersionRoadPage';

const collectionState = vi.hoisted(() => ({
  current: {
    status: 'success',
    versions: [] as VersionDetail[],
    error: null as string | null,
  },
}));

vi.mock('../services/tedSbrain/useTedSbrainVersions', () => ({
  useCollectionVersions: () => collectionState.current,
}));

const versions = patchScores.map(mapPatchScoreToVersionDetail);
const unknownCount = versions.filter((version) => version.riskLevel === 'UNKNOWN').length;

function renderPage(element: React.ReactElement) {
  return renderToStaticMarkup(
    createElement(ThemeProvider, null,
      createElement(MemoryRouter, null, element),
    ),
  );
}

describe('version pages data source', () => {
  beforeEach(() => {
    collectionState.current = {
      status: 'success',
      versions,
      error: null,
    };
  });

  it('renders version list summary from mock service data', () => {
    const html = renderPage(createElement(VersionListPage));

    expect(html).toContain(`<span>当前在测</span><strong>${versions.length}</strong>`);
    expect(html).toContain(`<span>未知风险</span><strong>${unknownCount}</strong>`);
  });

  it('renders version road summary from mock service data', () => {
    const html = renderPage(createElement(VersionRoadPage));

    expect(html).toContain(`<span>当前在测</span><strong>${versions.length}</strong>`);
    expect(html).toContain(`<span>未知风险</span><strong>${unknownCount}</strong>`);
  });

  it('renders a collection loading state while ted-sbrain data is loading', () => {
    collectionState.current = {
      status: 'loading',
      versions: [],
      error: null,
    };

    const html = renderPage(createElement(VersionListPage));

    expect(html).toContain('版本数据加载中');
  });
});
