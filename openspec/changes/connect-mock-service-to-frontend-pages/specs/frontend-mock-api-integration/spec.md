## ADDED Requirements

### Requirement: Frontend pages load collection data through ted-sbrain API
The system SHALL load version collection data for dashboard, list, and road pages through the shared ted-sbrain API access layer instead of directly rendering static version fixtures.

#### Scenario: Version list loads API records
- **WHEN** the version list page is opened and the ted-sbrain API returns snapshot records
- **THEN** the page displays rows derived from the returned snapshot records using the existing list-card control

#### Scenario: L1 dashboard loads API records
- **WHEN** the L1 dashboard page is opened and the ted-sbrain API returns snapshot records
- **THEN** the dashboard summary, priority list, and topology use data derived from the returned snapshot records without replacing the existing L1 topology/exhibition control

#### Scenario: Version road loads API records
- **WHEN** the version road page is opened and the ted-sbrain API returns snapshot records
- **THEN** the road grouping and canvas use data derived from the returned snapshot records without replacing the existing snake-road control

### Requirement: Existing core monitoring controls remain intact
The system SHALL preserve the current L1 topology/exhibition, L2 list cards, L2 snake-road canvas, and L3 hex/radar score control while integrating API data.

#### Scenario: L1 topology is enriched in place
- **WHEN** API-backed L1 data is rendered
- **THEN** the existing topology control remains the primary visual surface and exposes API-derived details through labels, state, hover, or drill-in behavior

#### Scenario: L2 list cards are enriched in place
- **WHEN** API-backed list data is rendered
- **THEN** the existing list-card pattern remains and displays only monitoring-relevant summary metadata by default

#### Scenario: L2 snake road is enriched in place
- **WHEN** API-backed road data is rendered
- **THEN** the existing snake-road visual remains and uses release-monitoring date semantics for placement

#### Scenario: L3 hex/radar control is enriched in place
- **WHEN** API-backed patch score data is rendered
- **THEN** the existing hex/radar score control remains the primary metric visualization and uses metric records from the API

### Requirement: API payloads map to stable enriched page view models
The system SHALL map ted-sbrain `ScoreSnapshot` and `PatchScoreVO` payloads into frontend view models that preserve existing page compatibility and carry backend decision, evidence, coordination, and audit fields.

#### Scenario: Snapshot maps to collection view model
- **WHEN** a `ScoreSnapshot` record is received for a collection page
- **THEN** the mapped version contains identifiers, scores, risk level, status, release type, system identity, ownership fields, release schedule fields, snapshot freshness fields, and summary needed by existing list, dashboard, road, filter, and grouping logic

#### Scenario: Patch score maps to detail view model
- **WHEN** a `PatchScoreVO` payload is received for a detail page
- **THEN** the mapped version contains metric items, phase groups, data-dimension groups, eval-target groups, ownership fields, release schedule fields, score fields, description, and evidence fields needed by existing and enriched detail visualizations

#### Scenario: Audit fields remain available without crowding primary views
- **WHEN** a snapshot payload includes audit fields such as id, create/update timestamps, creator, updater, wrapper message, or critical process data
- **THEN** the mapped detail view can expose those fields through a collapsible audit or diagnostic section rather than primary monitoring surfaces

#### Scenario: Response wrapper metadata remains available
- **WHEN** a ted-sbrain API response includes wrapper fields such as `message` or `criticalProcess`
- **THEN** the API access layer or mapped view model preserves those fields for diagnostic, audit, or error-context display where relevant

#### Scenario: UI-only fields use safe derived values
- **WHEN** a ted-sbrain payload omits a UI-only field used by existing components
- **THEN** the mapped version provides a deterministic derived value or safe default so rendering and calculations do not fail

### Requirement: Displayed values preserve raw API values
The system SHALL use normalization only for bounded visual geometry and SHALL display real API values anywhere values are shown as text, evidence, history, or diagnostics.

#### Scenario: Normalized score drives geometry only
- **WHEN** a score must be normalized to fit a radar point, hex point, progress bar, or compact chart
- **THEN** the normalized value is used only for geometry or visual ratio while labels and hover details show the raw API score value

#### Scenario: Metric evidence shows raw score values
- **WHEN** metric evidence is shown for a `MetricVO`
- **THEN** the evidence displays raw `actualScore` and raw `calcScore` values from the API and may optionally include visual scale context separately

#### Scenario: History trend labels show raw score values
- **WHEN** a score history trend renders points or tooltip labels
- **THEN** the labels show raw API score values rather than normalized chart coordinates

#### Scenario: Expanded feature evidence preserves original values
- **WHEN** open-ended `features` values are summarized for compact display
- **THEN** the expanded evidence view preserves the original API-provided field names and values

### Requirement: UNKNOWN risk is first-class
The system SHALL support `UNKNOWN` risk anywhere ted-sbrain risk levels are displayed, filtered, summarized, sorted, or styled.

#### Scenario: UNKNOWN appears in collection summaries
- **WHEN** collection data includes versions with `riskLevel: "UNKNOWN"`
- **THEN** dashboard and list summaries include an unknown-risk count or equivalent unknown-state signal

#### Scenario: UNKNOWN can be filtered
- **WHEN** the user filters collection views by risk
- **THEN** `UNKNOWN` is available as a selectable risk filter option

#### Scenario: UNKNOWN has stable visual treatment
- **WHEN** a version or metric has `riskLevel: "UNKNOWN"`
- **THEN** badges, topology nodes, road items, score labels, and metric evidence render with a stable unknown-state label and style

#### Scenario: UNKNOWN has stable severity order
- **WHEN** collection or detail items are sorted or grouped by risk severity
- **THEN** risk severity uses a stable order such as `HIGH`, `UNKNOWN`, `MEDIUM`, `LOW`

### Requirement: L1 dashboard surfaces monitoring-level API information
The system SHALL keep the L1 dashboard focused on global quality monitoring while exposing API-derived context through compact metadata and hover or drill-in details.

#### Scenario: L1 topology hover shows version context
- **WHEN** the user hovers or focuses a topology node
- **THEN** the node detail includes system name, patch id, score, risk level, status, owner, snapshot time, and planned online or issue time when available

#### Scenario: L1 summary indicates data freshness
- **WHEN** API data includes snapshot or update timestamps
- **THEN** the L1 summary communicates latest snapshot freshness without exposing raw audit metadata by default

### Requirement: L2 collection views use release-monitoring semantics
The system SHALL preserve the existing L2 list and snake-road controls while using ted-sbrain schedule fields for release-quality monitoring.

#### Scenario: List cards show release schedule summary
- **WHEN** a list card renders an API-backed version
- **THEN** the card includes monitoring-relevant schedule metadata such as planned issue time, planned online time, or latest snapshot time without showing raw audit metadata by default

#### Scenario: List search covers coordination fields
- **WHEN** the user searches the list or road page
- **THEN** matching considers visible fields plus useful coordination fields such as owner account, test owner, test owner group, system id, and snapshot id

#### Scenario: Snake road prefers release date placement
- **WHEN** a version has planned online or planned issue time
- **THEN** the snake-road placement uses planned online time first, planned issue time second, and test-end time only as a fallback

#### Scenario: Snake road date window includes selected release dates
- **WHEN** API-backed versions are placed on the snake road by planned online, planned issue, or fallback test-end time
- **THEN** quick and custom date windows evaluate the same selected release date used for placement so records are not hidden by a different date basis

#### Scenario: Snake road hover shows release risk context
- **WHEN** the user hovers or focuses a road item
- **THEN** the detail includes current score, risk, status, owner, planned issue time, planned online time, and snapshot time

### Requirement: L3 detail loads patch score through ted-sbrain API
The system SHALL load version detail data through the shared ted-sbrain API access layer using the route patch identifier.

#### Scenario: Detail page loads known patch
- **WHEN** the version detail page is opened for a patch identifier present in the ted-sbrain API
- **THEN** the page displays the patch score, identity, metric groups, timeline, focus items, and evidence rows derived from the returned patch score payload

#### Scenario: Detail page handles missing patch
- **WHEN** the version detail page is opened for a patch identifier that the ted-sbrain API reports as missing
- **THEN** the page displays a not-found state instead of rendering stale fixture data

#### Scenario: Detail page shows version description
- **WHEN** a patch score payload includes `description`
- **THEN** the detail page displays the description as version-understanding context near the primary version identity

### Requirement: L3 metric score control exposes metric evidence
The system SHALL bind the L3 hex/radar scoring control to `MetricVO` records and expose scoring evidence without replacing the control.

#### Scenario: Metric point maps to API metric
- **WHEN** the L3 hex/radar control renders six metric score points
- **THEN** each point corresponds to a `MetricVO` record by `metricCode` when that metric exists in the API response

#### Scenario: Missing metric slot remains visible
- **WHEN** an expected metric code is missing from the API response
- **THEN** the corresponding hex/radar point remains in the six-point control with an unavailable or unknown evidence state

#### Scenario: Extra metrics remain available as evidence
- **WHEN** the API response includes metrics beyond the six expected hex/radar dimensions
- **THEN** those metrics remain available in the evidence list or expandable evidence area without adding extra hex/radar points

#### Scenario: Metric hover shows scoring basis
- **WHEN** the user hovers or focuses a metric point
- **THEN** the detail includes metric name, raw actual score, raw calculated score, risk level, phase, data dimension, evaluation target, description, and summarized feature values

#### Scenario: Metric detail link is available
- **WHEN** a metric includes `detailUrl`
- **THEN** the metric evidence affordance provides a way to open or navigate to that detail URL

#### Scenario: Metric selection highlights evidence
- **WHEN** the user selects or focuses a metric point
- **THEN** the corresponding evidence row or evidence section is highlighted or made easy to locate

### Requirement: L3 detail exposes score history and recalculation
The system SHALL use ted-sbrain history and recalculation endpoints as explicit version-quality monitoring interactions on the detail page.

#### Scenario: Score history trend loads
- **WHEN** the detail page loads a known patch
- **THEN** the page requests patch score history and displays a compact trend or timeline derived from historical score points

#### Scenario: Score history handles missing or short history
- **WHEN** the history endpoint returns zero or one score point
- **THEN** the page displays a stable empty or single-point trend state without failing

#### Scenario: Score history handles partial points
- **WHEN** the history endpoint returns score points without full metric evidence
- **THEN** the page renders the trend from available raw patch id, score, quality score, behavior score, risk level, and timestamp fields without requiring metric arrays

#### Scenario: User recalculates score
- **WHEN** the user triggers the recalculation action for the current patch
- **THEN** the page calls the patch score calculate endpoint and displays a recalculating state

#### Scenario: Recalculation refreshes detail data
- **WHEN** recalculation succeeds
- **THEN** the page refreshes current patch score and history data and communicates success or unchanged results

#### Scenario: Recalculation failure is surfaced
- **WHEN** recalculation fails
- **THEN** the page displays a recoverable error state without losing the last loaded score

### Requirement: Detail timeline uses release schedule fields
The system SHALL represent planned test, planned issue, planned online, and snapshot timing in the L3 detail timeline when those fields are available.

#### Scenario: Timeline includes release milestones
- **WHEN** a patch score includes planned test, issue, online, and snapshot times
- **THEN** the detail timeline shows those milestones without replacing the existing timeline section

#### Scenario: Timeline handles missing schedule fields
- **WHEN** one or more schedule fields are missing
- **THEN** the detail timeline omits or marks those milestones without breaking layout

### Requirement: Pages expose asynchronous states
The system SHALL render explicit asynchronous states for API-backed page data and actions.

#### Scenario: Loading collection data
- **WHEN** a collection page has started an API request and data has not resolved
- **THEN** the page displays a loading state appropriate to that page instead of rendering static fixture rows

#### Scenario: Empty collection data
- **WHEN** a collection page receives zero API records after loading
- **THEN** the page displays an empty state and keeps filtering controls usable where applicable

#### Scenario: Collection API failure
- **WHEN** a collection page API request fails
- **THEN** the page displays an error state with a retry or recovery path suitable for local development

#### Scenario: Detail API failure
- **WHEN** the detail page API request fails for a reason other than a missing patch
- **THEN** the page displays an error state instead of the normal cockpit content

### Requirement: Existing page behavior remains compatible
The system SHALL preserve existing filtering, sorting, grouping, routing, formatting, and visualization behavior when data is supplied by the ted-sbrain API.

#### Scenario: Filters and sorting operate on API data
- **WHEN** a user searches, filters by risk or status, or changes sort order on an API-backed collection page
- **THEN** the result set updates using the same behavior as the previous fixture-backed page plus the added unknown-risk and coordination-field behavior

#### Scenario: Road date window operates on API data
- **WHEN** a user changes quick or custom date ranges on the API-backed road page
- **THEN** the visible road rows update using release-oriented date placement and the same date-window behavior as the previous fixture-backed page

#### Scenario: Routes remain stable
- **WHEN** a user navigates between L1, list, road, and detail pages
- **THEN** the route paths and link targets remain compatible with the existing application routes

### Requirement: Service selection remains configuration-driven
The system SHALL use existing ted-sbrain environment configuration to target either the local mock service or the real service without page-level code changes.

#### Scenario: Mock service target
- **WHEN** `VITE_TED_SBRAIN_API_BASE_URL` points at the local mock service
- **THEN** API-backed pages display data returned by the local mock service

#### Scenario: Same-origin proxy target
- **WHEN** `VITE_TED_SBRAIN_API_BASE_URL` is empty and the Vite `/ted-sbrain` proxy is configured
- **THEN** API-backed pages request `/ted-sbrain/...` paths from the browser origin

#### Scenario: Real service target
- **WHEN** `VITE_TED_SBRAIN_API_BASE_URL` points at the real ted-sbrain backend
- **THEN** API-backed pages use the real service without changing component code
