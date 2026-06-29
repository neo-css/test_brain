# Version Cockpit Frontend Design

## Goal

Build a React + Vite + TypeScript frontend from the existing version detail mock data in `版本详情.txt`. The product scope is intentionally narrow: one entry page for all in-test versions and one version detail page. There is no overview/dashboard page.

## Data Source

`版本详情.txt` represents the backend detail response for one version. The frontend will parse this structure into typed mock data.

The entry page represents all in-test versions. Because the current mock contains one detail record, the list will derive several realistic in-test version rows from the same schema. Each row has enough fields for scanning: version summary, system, team, owner, status, risk level, total score, quality score, behavior score, test window, and snapshot time. Selecting a row opens the detail page for that version.

## Pages

### In-Test Version Entry Page

This page uses a situation-list layout instead of a traditional grid table. Each version appears as a horizontal row card with consistent columns, but without heavy table borders.

Content per row:

- Prominent total score.
- Version summary and system name.
- Team, owner, test leader, and status.
- Planned and actual test time window.
- Risk level badge.
- Small quality and behavior score indicators.

Expected behavior:

- Rows are clickable and navigate to the detail page.
- The layout keeps table-like scan efficiency while reading visually as a cockpit-style status list.
- No aggregate overview blocks are added above the list.

### Version Detail Page

The detail page uses a management cockpit visual style. It emphasizes decision-level status over raw metric debugging.

Primary regions:

- Header: version summary, status, risk level, snapshot time, system name, and navigation back to the list.
- Main score area: total score as the dominant focal point, with quality score and behavior score nearby.
- Responsibility and timing area: patch owner, test leader, dev leader, submit time, planned window, actual window, and audit time.
- Polygon metric chart: a radar/spider chart using phase scores from `byPhase` as the main axes: admission, pre-test, test execution, and release.
- Phase score panel: horizontal score bars for each phase.
- Risk metric panel: metric list grouped by risk level and phase, showing metric name, actual score, and target category.
- Operational summary panel: defect, coverage, smart test, and review timeliness details extracted from metric `features`.

## Visual Direction

The UI should feel like a restrained enterprise digital cockpit, not a decorative landing page. Use a dark base, structured panels, fine borders, and data-focused hierarchy.

Color roles:

- Cyan/blue for structural lines and neutral data emphasis.
- Green for low risk and healthy scores.
- Amber for medium risk and attention states.
- Red only for high risk if derived mock rows need it.

The entry page and detail page should share the same visual language so navigation feels continuous.

## Components

- `VersionListPage`: renders the in-test version situation list.
- `VersionRowCard`: clickable row-like card for one version.
- `VersionDetailPage`: cockpit detail composition.
- `ScoreHero`: dominant score and risk presentation.
- `RadarChart`: SVG polygon chart for phase scores.
- `PhaseScoreBars`: phase score bar list.
- `MetricRiskList`: metric-level score/risk list.
- `InfoPanel`: reusable cockpit panel container.
- `data/versionMock.ts`: typed mock data and derived list data.

## Data Flow

The app will use client-side routing. The list page links to `/versions/:patchId`. The detail page reads the route parameter and looks up the matching mock record. If the route does not match a record, it shows a compact not-found state with a link back to the list.

No backend calls are required for this build. The mock is local and shaped to match the backend detail response.

## Error Handling

- Missing detail record: show a not-found state and a back link.
- Missing optional metric features: show `--` or omit the specific derived value, without breaking the panel.
- Unknown risk level: render a neutral badge.

## Testing And Verification

Manual verification should cover:

- The app starts with Vite.
- The entry page shows multiple in-test version rows and no overview dashboard.
- Clicking a row opens a detail page.
- The detail page renders the radar chart, score hero, phase scores, and metric panels.
- The layout remains readable on desktop and a narrower viewport.

If the project includes a test setup after scaffolding, add focused tests for mock data lookup and route fallback. Otherwise, use TypeScript checking and Vite build as baseline verification.
