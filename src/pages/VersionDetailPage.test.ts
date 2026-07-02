import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import VersionDetailPage from './VersionDetailPage';

describe('VersionDetailPage cockpit layout', () => {
  it('places the metric radar in the center cockpit area with side instruments', () => {
    const html = renderToStaticMarkup(
      createElement(ThemeProvider, null,
        createElement(MemoryRouter, { initialEntries: ['/versions/64460'] },
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
    expect(html).toContain('class="metric-radar-chart"');
    expect(html).toContain('class="detail-header-actions"');
    expect(html).toContain('class="detail-return-link" href="/versions"');
    expect(html).not.toContain('class="back-link"');
  });
});
