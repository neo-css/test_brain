import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PhaseScoreBars from './PhaseScoreBars';

describe('PhaseScoreBars', () => {
  it('renders each phase score as an accessible meter with an animated target width', () => {
    const html = renderToStaticMarkup(
      <PhaseScoreBars
        groups={[
          { key: 'ADMISSION', displayName: '准入阶段', groupScore: 4, metrics: [] },
          { key: 'RELEASE', displayName: '发布阶段', groupScore: 8, metrics: [] },
        ]}
      />,
    );

    expect(html).toContain('role="meter"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="8"');
    expect(html).toContain('aria-valuenow="4"');
    expect(html).toContain('--target-width:50%');
  });
});
