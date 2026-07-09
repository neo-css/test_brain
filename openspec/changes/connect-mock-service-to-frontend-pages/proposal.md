## Why

The project now has a local ted-sbrain mock service and typed API client, but the React pages still render from local `versionMock` fixtures and do not expose the full quality-monitoring meaning of the backend fields. The integration should connect the mock-compatible API while preserving the existing L1/L2/L3 visual controls that already define the product experience.

## What Changes

- Add a frontend data integration path that fetches dashboard, list, road, and detail data through the existing ted-sbrain API client.
- Preserve the current core controls: L1 global topology/exhibition, L2 version list, L2 snake-road view, and L3 hex/radar scoring cockpit.
- Add a focused adapter layer that maps ted-sbrain `ScoreSnapshot` and `PatchScoreVO` payloads into stable frontend view models without losing backend field meaning.
- Enrich existing controls with API-backed information through badges, hover detail, drill-in behavior, compact metadata, and collapsible audit sections instead of replacing the page structure.
- Bind the six metric scores in the L3 hex/radar control to `MetricVO` records and expose metric judgment evidence from `features`, `description`, and `detailUrl`.
- Normalize scores only for bounded visual geometry while preserving and displaying raw API values in labels, hover detail, evidence rows, history trends, and audit or diagnostic surfaces.
- Add support for the `UNKNOWN` risk enum throughout statistics, filters, badges, topology, road rendering, and detail views.
- Add detail-page support for patch score history and recalculation by using the existing `score/history` and `score/calculate` endpoints.
- Use schedule fields such as `planedIssueTime` and `planedOnlineTime` in the version road and detail timeline where they better express release-monitoring intent than test-end fallbacks.
- Add asynchronous loading, empty, not-found, recalculation, and error states for API-backed pages.
- Use `/ted-sbrain/...` request paths through `VITE_TED_SBRAIN_API_BASE_URL` or the Vite proxy so the same page code can target the local mock service or the real backend.

## Capabilities

### New Capabilities

- `frontend-mock-api-integration`: Frontend pages load ted-sbrain scoring and snapshot data through the shared API client, preserve existing quality-monitoring controls, and surface API field meaning through control-level enrichment and progressive disclosure.

### Modified Capabilities

- None.

## Impact

- Affects `src/pages/L1DashboardPage.tsx`, `src/pages/VersionListPage.tsx`, `src/pages/VersionRoadPage.tsx`, and `src/pages/VersionDetailPage.tsx`.
- Affects existing visualization components such as `DynamicTopology`, `VersionRowCard`, `RoadSnakeCanvas`/`RoadCar`, and `MetricScoreCards` through additive metadata, hover, and unknown-risk handling.
- Adds or updates frontend data loading, adapter, and view-model modules near `src/services/tedSbrain` or another local data boundary.
- Uses existing mock service endpoints under `src/mocks/tedSbrain` without changing the mock service contract.
- Uses existing API client/configuration files under `src/services/tedSbrain`.
- Adds tests for adapter mapping, preserved core-control behavior, metric evidence hover data, unknown-risk handling, history loading, recalculation behavior, and service-based rendering.
