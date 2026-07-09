import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import type { VersionDetail } from '../data/versionMock';
import { patchScores } from '../mocks/tedSbrain/fixtures';
import { mapPatchScoreToVersionDetail } from '../services/tedSbrain/versionViewModel';
import VersionDetailPage from './VersionDetailPage';

const detailState = vi.hoisted(() => ({
  current: {
    status: 'success',
    version: undefined as VersionDetail | undefined,
    error: null as string | null,
  },
}));

vi.mock('../services/tedSbrain/useTedSbrainVersions', () => ({
  usePatchDetail: () => detailState.current,
}));

const detailVersion = mapPatchScoreToVersionDetail(patchScores[0]);

describe('VersionDetailPage cockpit layout', () => {
  beforeEach(() => {
    detailState.current = {
      status: 'success',
      version: detailVersion,
      error: null,
    };
  });

  it('places the metric radar in the center cockpit area with side instruments', () => {
    const html = renderToStaticMarkup(
      createElement(ThemeProvider, null,
        createElement(MemoryRouter, { initialEntries: ['/versions/12345'] },
          createElement(Routes, null,
            createElement(Route, { path: '/versions/:patchId', element: createElement(VersionDetailPage) }),
          ),
        ),
      ),
    );

    expect(html).toContain('class="cockpit-core cockpit-motion-sequence"');
    expect(html).toContain('class="cockpit-wing cockpit-wing-left"');
    expect(html).toContain('class="cockpit-center"');
    expect(html).toContain('class="cockpit-wing cockpit-wing-right"');
    expect(html.indexOf('cockpit-wing cockpit-wing-left')).toBeLessThan(html.indexOf('cockpit-center'));
    expect(html.indexOf('cockpit-center')).toBeLessThan(html.indexOf('cockpit-wing cockpit-wing-right'));
    expect(html).toContain('metric-radar-chart');
    expect(html).toContain('查看');
    expect(html).toContain('metric-evidence-panel');
    expect(html).not.toContain('metric-evidence-popover');
    expect(html).toContain('EVIDENCE');
    expect(html).toContain('版本变更风险');
    expect(html).not.toContain('<h2>指标雷达</h2>');
    expect(html).not.toContain('<h2>责任链路</h2>');
    expect(html).not.toContain('class="identity-bar"');
    expect(html).not.toContain('经营报表中心 RPT');
    expect(html).not.toContain('snapshot-marker');
    expect(html).not.toContain('class="evidence-zone"');
    expect(html).toContain('class="detail-top-zone"');
    expect(html).not.toContain('OWNERS');
    expect(html).not.toContain('owner-inline-zone');
    expect(html).toContain('score-strip-owners');
    expect(html).toContain('版本负责人');
    expect(html).toContain('测试负责人');
    expect(html).toContain('开发负责人');
    expect(html).not.toContain('sbrain_owner');
    expect(html).not.toContain('sbrain_test_lead');
    expect(html).not.toContain('sbrain_dev_lead');
    expect(html).toContain('title="计划测试:');
    expect(html).toContain('title="实际测试:');
    expect(html).not.toContain('title="当前时间:');
    expect(html.indexOf('detail-top-zone')).toBeLessThan(html.indexOf('cockpit-core cockpit-motion-sequence'));
    expect(html.indexOf('score-strip-owners')).toBeLessThan(html.indexOf('timeline-zone'));
    expect(html.indexOf('timeline-zone')).toBeLessThan(html.indexOf('cockpit-core cockpit-motion-sequence'));
    expect(html.indexOf('metric-evidence-panel')).toBeLessThan(html.indexOf('cockpit-center'));
    expect(html).toContain('class="detail-header-actions"');
    expect(html).toContain('class="detail-return-link" href="/versions"');
    expect(html).not.toContain('class="back-link"');
  });

  it('uses route state to preserve the detail return target', () => {
    const html = renderToStaticMarkup(
      createElement(ThemeProvider, null,
        createElement(MemoryRouter, {
          initialEntries: [{
            pathname: '/versions/12345',
            state: { from: '/versions/overview', fromLabel: '返回态势感知' },
          }],
        },
          createElement(Routes, null,
            createElement(Route, { path: '/versions/:patchId', element: createElement(VersionDetailPage) }),
          ),
        ),
      ),
    );

    expect(html).toContain('class="detail-return-link" href="/versions/overview"');
    expect(html).toContain('返回态势感知');
  });

  it('renders a detail loading state while ted-sbrain data is loading', () => {
    detailState.current = {
      status: 'loading',
      version: undefined,
      error: null,
    };

    const html = renderToStaticMarkup(
      createElement(ThemeProvider, null,
        createElement(MemoryRouter, { initialEntries: ['/versions/12345'] },
          createElement(Routes, null,
            createElement(Route, { path: '/versions/:patchId', element: createElement(VersionDetailPage) }),
          ),
        ),
      ),
    );

    expect(html).toContain('版本详情加载中');
  });
});
