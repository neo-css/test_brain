## 1. Data Boundary And View Models

- [ ] 1.1 Extend shared frontend risk handling to include `UNKNOWN` in types, labels, weights, filters, counts, and stable CSS class names.
- [ ] 1.2 Define score view-model fields that separate raw API values from derived visual ratios so normalization can drive geometry without replacing displayed values.
- [ ] 1.3 Add or extend a frontend view-model boundary that maps `ScoreSnapshot` records to collection-ready versions while preserving decision, coordination, release schedule, freshness, and audit fields.
- [ ] 1.4 Add or extend adapter support for mapping `PatchScoreVO` payloads to detail-ready versions with metric evidence, description, schedule fields, owner chain, grouped metric views, raw scores, and display ratios.
- [ ] 1.5 Add deterministic fallbacks for UI-only fields such as `subNamedSystemName`, owner accounts, actual schedule fields, missing metric slots, extra metric evidence, and missing metric feature values.
- [ ] 1.6 Add focused tests for snapshot-to-version and patch-score-to-version mapping, including low, medium, high, unknown, missing schedule fields, missing optional evidence cases, and raw-value versus normalized-ratio separation.

## 2. API Loading Helpers

- [ ] 2.1 Add loader functions or hooks that call the existing ted-sbrain API client for collection records and return mapped versions for L1 and L2 pages.
- [ ] 2.2 Add a detail loader that fetches a patch score by route `patchId` and returns a mapped detail version.
- [ ] 2.3 Preserve useful ted-sbrain response wrapper metadata such as `message` and `criticalProcess` for diagnostic/audit display and error context where available.
- [ ] 2.4 Add history loading for `GET /metric/patches/{patchId}/score/history` and map returned points into a compact trend model that tolerates partial score records.
- [ ] 2.5 Add recalculation support for `POST /metric/patches/{patchId}/score/calculate`, including recalculating, success, unchanged, and failure result states.
- [ ] 2.6 Normalize loading, empty, not-found, recalculating, and error result shapes so pages do not duplicate API error handling.
- [ ] 2.7 Add tests for successful load, empty load, missing patch, API failure, envelope metadata preservation, partial history loading, and recalculation behavior.

## 3. Preserve And Enrich L1 Dashboard

- [ ] 3.1 Migrate `L1DashboardPage` from `versionDetails` to the collection loader while preserving summary cards, priority list, risk controls, and topology behavior.
- [ ] 3.2 Add unknown-risk counts or equivalent unknown-state signal to L1 summaries and legends.
- [ ] 3.3 Enrich topology node hover/focus details with system name, patch id, score, risk, status, owner, snapshot time, and planned online or issue time.
- [ ] 3.4 Add tests or assertions that the topology remains the primary L1 visual surface after API-backed rendering.

## 4. Preserve And Enrich L2 Collection Views

- [ ] 4.1 Migrate `VersionListPage` from `versionDetails` to the collection loader while preserving list cards, search, risk filter, status filter, sort, summary counts, and empty state behavior.
- [ ] 4.2 Add unknown risk as a list and road filter option.
- [ ] 4.3 Enrich version list cards with compact release-monitoring metadata such as planned issue time, planned online time, and latest snapshot time without showing raw audit fields by default.
- [ ] 4.4 Expand list and road search matching to useful coordination fields such as owner account, test owner, test owner group, system id, and snapshot id.
- [ ] 4.5 Migrate `VersionRoadPage` from `versionDetails` to the collection loader while preserving date-window controls, filters, grouping, and road empty state behavior.
- [ ] 4.6 Update road placement and date-window evaluation to use the same selected release date, preferring planned online time, then planned issue time, then test-end fallback.
- [ ] 4.7 Enrich road item hover/focus details with current score, risk, status, owner, planned issue time, planned online time, and snapshot time.
- [ ] 4.8 Add tests or assertions that list cards and snake-road rendering remain structurally compatible after enrichment and that date filtering includes records by the selected release date basis.

## 5. Preserve And Enrich L3 Detail Cockpit

- [ ] 5.1 Migrate `VersionDetailPage` from `getVersionByPatchId` to the detail loader while preserving the current cockpit structure and hex/radar score control.
- [ ] 5.2 Add loading, not-found, and error states to `VersionDetailPage`.
- [ ] 5.3 Display `description` as version-understanding context near the primary detail identity.
- [ ] 5.4 Extend the responsibility chain to include test owner, test owner group, and account/user identifiers through compact text or hover detail.
- [ ] 5.5 Extend the detail timeline with planned test, planned issue, planned online, and snapshot milestones while preserving the existing timeline section.
- [ ] 5.6 Add a compact score history trend or timeline using the history endpoint, including stable empty, single-point, and partial-record states while displaying raw score values in labels and hover.
- [ ] 5.7 Add a controlled refresh/recalculate score action near the score area using the calculate endpoint.
- [ ] 5.8 Add a collapsible audit/diagnostic section for snapshot id, create/update metadata, creator/updater, wrapper message, and critical-process information when available.

## 6. Metric Evidence On Existing Hex/Radar Control

- [ ] 6.1 Bind each L3 hex/radar score point to its corresponding expected `MetricVO` by `metricCode`, preserving six visible slots even when an API metric is missing.
- [ ] 6.2 Keep additional API metrics available in evidence sections without adding extra points to the existing six-point hex/radar control.
- [ ] 6.3 Add hover/focus detail for metric points showing metric name, raw actual score, raw calculated score, risk, phase, data dimension, evaluation target, description, and summarized features.
- [ ] 6.4 Expose `detailUrl` from metric evidence when present.
- [ ] 6.5 Allow selecting or focusing a metric point to highlight or locate the corresponding evidence row or section.
- [ ] 6.6 Ensure open-ended metric `features` render safely as concise summaries with expandable full evidence where appropriate.
- [ ] 6.7 Add tests for metric-to-point mapping, missing metric slots, extra metric evidence, unknown-risk metric styling, hover evidence data construction with raw values, and evidence-row highlighting behavior.

## 7. Compatibility And Tests

- [ ] 7.1 Update or add page tests that verify API-backed rendering for list, dashboard, road, and detail pages.
- [ ] 7.2 Update tests that assumed synchronous fixture data so they wait for loaded content or assert loading/error states.
- [ ] 7.3 Keep existing helper and visualization tests passing without requiring network access.
- [ ] 7.4 Confirm route links remain `/`, `/versions`, `/versions/road`, and `/versions/:patchId`.
- [ ] 7.5 Confirm primary views do not show raw audit/debug fields by default.
- [ ] 7.6 Confirm text labels, hover content, evidence rows, and history tooltips display raw API values even when visual shapes use normalized ratios.

## 8. Verification

- [ ] 8.1 Run `npm test` and resolve failures related to adapter, unknown risk, enriched controls, or page async behavior.
- [ ] 8.2 Run `npm run build` and resolve TypeScript or bundle errors.
- [ ] 8.3 Run the mock service and frontend dev server locally, then manually verify L1 topology, L2 list, L2 snake road, and L3 hex/radar score remain intact while displaying mock service data.
- [ ] 8.4 Verify detail history, recalculation, metric hover evidence, release timeline, and audit collapse behavior against mock service data, checking that displayed numeric values match the API response.
- [ ] 8.5 Verify both direct mock mode and same-origin proxy mode use `/ted-sbrain/...` request paths without page-level code changes.
