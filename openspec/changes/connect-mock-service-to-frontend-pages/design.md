## Context

The repository is a Vite/React frontend for a version quality cockpit. The existing product experience is built around three monitoring layers:

- L1: a global quality command page with summary cards, priority versions, and an animated topology/exhibition.
- L2: version collection views, including a card-based list and a snake-road release timeline.
- L3: a version cockpit centered on a hex/radar metric scoring visualization and supporting diagnostic sections.

The prior `create-mock-service` change added a Node-based ted-sbrain mock service, documented `/ted-sbrain/...` endpoints, a typed API client under `src/services/tedSbrain`, environment-driven base URL selection, and Vite proxy support. That service returns backend-shaped `ScoreSnapshot`, `ScoreSnapshotPage`, and `PatchScoreVO` payloads wrapped in `{ result, message, data, criticalProcess }`.

The integration must not turn the UI into a raw API field browser. It should preserve the current core controls and attach backend meaning to them: risk badges, hover detail, metric evidence, release schedule semantics, history trend, recalculation, and collapsible audit information. Some fields are decision fields and should be visible in the monitoring flow; some fields are evidence fields and should appear on hover or drill-in; some fields are audit/debug fields and should remain available without overwhelming the main view.

## Goals / Non-Goals

**Goals:**

- Load L1 dashboard, version list, version road, and version detail data through the shared ted-sbrain API client.
- Preserve the core L1 topology/exhibition, L2 list cards, L2 snake-road canvas, and L3 hex/radar score control.
- Keep page rendering centered on stable frontend view models while retaining backend field semantics.
- Surface decision-level fields in the main controls: score, risk, status, system, owner, snapshot freshness, and release schedule.
- Surface evidence-level fields through hover, focused detail, links, and expandable sections.
- Bind the L3 hex/radar six metric points to `MetricVO` records and expose each metric's scoring basis.
- Use normalization only to fit scores into bounded visual controls; whenever a value is displayed as text or evidence, show the real API value rather than the normalized value.
- Support `UNKNOWN` as a first-class risk state across filters, counts, badges, topology, road, and detail views.
- Use `score/history` to show score trend in L3 and `score/calculate` to refresh the current detail score.
- Use `planedIssueTime` and `planedOnlineTime` for release-monitoring semantics in the snake-road and detail timeline.
- Add loading, empty, not-found, recalculating, and error states for API-backed pages.
- Cover adapter mapping, enriched controls, history, recalculation, and unknown-risk behavior with focused tests.

**Non-Goals:**

- Redesign or replace the existing L1/L2/L3 visual controls.
- Convert the list into a dense data table.
- Show every audit/debug field by default in primary monitoring surfaces.
- Redesign the mock service endpoints or response wrapper.
- Add a global query/cache library dependency.
- Implement authentication, authorization, retry policy, polling, or production observability.
- Remove all `versionMock` test fixtures in this change.

## Decisions

1. Preserve core controls and enrich them in place.

   Rationale: The current topology, list cards, snake road, and hex/radar score are the product's recognizable monitoring surfaces. The backend integration should increase their decision value rather than replace them with generic tables or panels.

   Alternative considered: Add new full-width API information panels for every field. This would expose data quickly, but it would dilute the monitoring flow and crowd the cockpit.

2. Classify ted-sbrain fields by use rather than by raw visibility.

   Rationale: Version quality monitoring needs fast answers first, evidence second, and audit/debug details only when needed. The view model should carry all meaningful fields, but the UI should place them by purpose:

   - Decision fields: scores, risk, status, system, owner, snapshot time, release schedule.
   - Evidence fields: metrics, metric groups, feature values, descriptions, detail links, history points.
   - Coordination fields: owner IDs/accounts, test owner, test owner group.
   - Audit/debug fields: snapshot ID, create/update metadata, wrapper message, critical process.

   Alternative considered: Display all fields in the main detail page. This would satisfy field coverage literally, but it would harm scanning and make the page less useful as a monitoring cockpit.

3. Keep a frontend adapter from ted-sbrain models to richer page view models.

   Rationale: The UI already uses `VersionDetail` heavily, but the backend has additional fields and `UNKNOWN` risk. A dedicated adapter/view-model boundary can preserve existing consumers while extending the model for release schedule, snapshot audit, metric evidence, and history.

   Alternative considered: Update every component to consume raw `ScoreSnapshot` and `PatchScoreVO` directly. This would avoid one mapping step, but it would couple visual components to backend response details and create broad churn.

4. Use collection snapshot endpoints for L1/L2 and full patch score endpoints for L3.

   Rationale: L1 dashboard, list, and road need collections and should stay lightweight. L3 needs complete metric evidence and should fetch `PatchScoreVO`, plus history only for the selected patch.

   Alternative considered: Fetch full `PatchScoreVO` for every collection row. That would make all data available everywhere, but it would create many requests and slow collection views.

5. Treat `UNKNOWN` risk as a first-class monitoring state.

   Rationale: `UNKNOWN` often means unscored, pending, stale, or failed evaluation. In a quality-monitoring product this is not an edge case; it is a state users need to find and act on. Sorting and severity grouping should use a stable order such as `HIGH`, `UNKNOWN`, `MEDIUM`, `LOW` so unknown assessments do not disappear below known low-risk items.

   Alternative considered: Map `UNKNOWN` to low risk or hide it from counts. That would make the UI simpler, but it would misrepresent unassessed versions.

6. Bind the L3 hex/radar points directly to `MetricVO` evidence.

   Rationale: The six expected metric codes in `MetricVO` correspond to the six scoring dimensions already rendered by the cockpit. Users should be able to hover or focus a score point to see raw `actualScore`, raw `calcScore`, risk, phase, dimension, target, `features`, `description`, and `detailUrl`. If a known metric is missing, the point should render an unavailable/unknown state; if the API returns additional metrics, they should remain available in the evidence list rather than forcing extra radar points.

   Alternative considered: Keep metric evidence only in the lower evidence table. That hides the "why" behind the primary scoring control and forces extra scanning.

7. Normalize only visual geometry, never business values.

   Rationale: Some backend score fields may exceed the current visual scale used by the existing hex/radar and compact bars. The adapter should carry both raw API values and derived display ratios, for example raw `actualScore`/`calcScore` plus a bounded `displayRatio`. The ratio may drive point distance, bar width, or color thresholds, but text labels, hover panels, evidence rows, history labels, comparison copy, audit sections, and exported/debug views must show the real API values.

   Alternative considered: Convert score fields into normalized numbers in the shared view model. This would simplify rendering, but it would make the UI misleading and make it harder to reconcile the page with backend responses.

8. Preserve response envelope metadata where it is meaningful.

   Rationale: The ted-sbrain wrapper includes `{ result, message, data, criticalProcess }`. Primary components should consume mapped `data`, but loaders or view models should retain `message` and `criticalProcess` for diagnostic/audit affordances and error context where available.

   Alternative considered: Discard the wrapper at the API client boundary. That keeps call sites simple, but it prevents the L3 audit section from showing useful integration context.

9. Use release schedule fields in release-oriented surfaces.

   Rationale: The snake-road view is a release-monitoring visualization. Its placement should prefer `planedOnlineTime`, then `planedIssueTime`, then test-end fallback, and its visible date window should include records based on that selected release date so API records do not silently fall outside the road. The L3 timeline should include planned test, planned issue, planned online, and snapshot markers.

   Alternative considered: Continue using test end time only. That preserves existing behavior but does not match release-quality monitoring semantics.

10. Make recalculation a controlled L3 action.

   Rationale: `score/calculate` changes or refreshes the score for a specific patch. It belongs near the detail score, with recalculating state, success/failure feedback, and a follow-up reload of current score and history.

   Alternative considered: Add recalculation to list rows. That would be powerful but risks accidental bulk-like use and visual clutter.

11. Keep audit/debug fields in collapsible detail affordances.

   Rationale: Snapshot ID, create/update metadata, wrapper message, and critical-process information are useful for trust and troubleshooting, but they are not primary monitoring facts. They should be available in L3 without crowding the cockpit.

   Alternative considered: Hide them entirely. That would keep the UI clean, but it would make local/mock integration and backend debugging harder.

12. Use local React state/effects for this integration instead of adding a data-fetching library.

   Rationale: The project currently has no query/cache dependency, and the immediate requirement is deterministic local mock integration. Small loader hooks or modules keep the change lightweight.

   Alternative considered: Add TanStack Query or SWR. Those libraries are useful for caching and revalidation, but they add dependency and pattern decisions beyond this change.

## Risks / Trade-offs

- Core controls may become crowded if too many fields are added directly -> Use badges, hover/focus detail, compact metadata, and collapsible sections.
- API-backed fixture set is smaller than the old generated `versionDetails` array -> Ensure empty and low-count states render well and keep tests focused on behavior rather than large row counts.
- `UNKNOWN` risk may lack current CSS affordances -> Add explicit labels, counts, filters, and neutral/stale visual treatment.
- Metric `features` are open-ended objects -> Render concise hover summaries and full expandable evidence rather than assuming fixed keys.
- Normalized geometry can be mistaken for real score values -> Keep raw values and derived display ratios as separate fields and add tests that labels, hovers, evidence, and history render raw API values.
- History endpoint payloads may be lighter than full patch-score payloads -> Map history trends from available raw score, risk, patch, and timestamp fields without requiring full metrics.
- Recalculation can fail or return unchanged values -> Show loading, success, unchanged, and failure states without leaving stale UI ambiguous.
- Real backend filtering semantics may differ from the mock -> Keep current client-side filters for UI controls initially and only pass server filters when intentionally required.
- Snapshot collection payloads do not include complete metrics -> Use collection payloads for overview pages and fetch full `PatchScoreVO` only on detail.
- Keeping `versionMock` types can make the data layer name misleading -> Treat it as a temporary view-model/types fixture and consider a later cleanup to move shared UI types.

## Migration Plan

1. Extend frontend view models and adapters to carry backend decision, evidence, coordination, and audit fields while preserving current component consumers.
2. Add separate raw-value and display-ratio fields for scores that need visual scaling, and ensure rendered text uses raw API values.
3. Add first-class `UNKNOWN` risk handling in shared types, labels, weights, filters, counts, and CSS class usage.
4. Migrate collection pages to API-backed snapshot loaders while preserving L1 topology, L2 list cards, and L2 snake-road controls.
5. Enrich L1 topology and L2 list/road hover or compact metadata with snapshot freshness, release schedule, and owner details.
6. Migrate L3 detail to API-backed patch score loading, metric evidence hover, score history, recalculation, release timeline, and collapsible audit details.
7. Add tests for adapters, raw-versus-normalized score rendering, unknown risk, preserved controls, metric evidence, history, recalculation, and async states.
8. Verify with `npm test` and `npm run build`, then run the mock plus frontend dev server for manual local inspection.

Rollback is restoring the page data imports to `versionDetails` and `getVersionByPatchId`, leaving the mock service and API client in place.

## Open Questions

- Should recalculation show only the refreshed current score, or also show before/after score deltas when a score changes?
- Should the snake-road date anchor default to `planedOnlineTime` or should the UI let users switch between online, issue, and test time modes later?
