import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import VersionViewModeSwitch from './VersionViewModeSwitch';

describe('VersionViewModeSwitch', () => {
  it('renders the three version module views with updated labels', () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, { initialEntries: ['/versions/overview'] },
        createElement(VersionViewModeSwitch),
      ),
    );

    expect(html).toContain('href="/versions/overview"');
    expect(html).toContain('态势感知');
    expect(html).toContain('href="/versions"');
    expect(html).toContain('版本列表');
    expect(html).toContain('href="/versions/road"');
    expect(html).toContain('版本轨迹');
    expect(html).not.toContain('版本态势');
  });
});
