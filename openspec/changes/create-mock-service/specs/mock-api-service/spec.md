## ADDED Requirements

### Requirement: Mock service exposes documented ted-sbrain routes
The system SHALL provide a local mock HTTP service that implements every endpoint listed in `docs/api/ted-sbrain-api-doc.md`.

#### Scenario: Score endpoint route coverage
- **WHEN** a client requests `GET /metric/patches/{patchId}/score`, `POST /metric/patches/{patchId}/score/calculate`, or `GET /metric/patches/{patchId}/score/history`
- **THEN** the mock service returns a documented response for the requested patch score operation

#### Scenario: Snapshot endpoint route coverage
- **WHEN** a client requests `GET /scoreSnapshot/get/{id}`, `GET /scoreSnapshot/list`, `GET /scoreSnapshot/page`, or `GET /scoreSnapshot/queryLatestToday`
- **THEN** the mock service returns a documented response for the requested score snapshot operation

#### Scenario: Health endpoint route coverage
- **WHEN** a client requests `GET /health`
- **THEN** the mock service returns an HTTP 200 health response

#### Scenario: Ted-sbrain prefixed routes
- **WHEN** a client requests a documented endpoint with the `/ted-sbrain` prefix
- **THEN** the mock service handles it the same way as the corresponding unprefixed endpoint

#### Scenario: Real-compatible preferred paths
- **WHEN** frontend code builds a request to the ted-sbrain API
- **THEN** the request path uses the real-service-compatible `/ted-sbrain/...` prefix

### Requirement: Mock responses use documented wrapper shape
The system SHALL wrap successful business responses with `result`, `message`, `data`, and `criticalProcess` fields.

#### Scenario: Successful wrapped response
- **WHEN** a client requests a score or snapshot endpoint successfully
- **THEN** the response body includes `result: true`, a success `message`, a `data` payload matching the endpoint, and a `criticalProcess` object

#### Scenario: Missing resource response
- **WHEN** a client requests a patch or snapshot identifier that is not present in the mock fixtures
- **THEN** the service returns HTTP `404` and the response body includes `result: false`, a useful `message`, `data: null`, and a `criticalProcess` object

### Requirement: Frontend API access is configurable between mock and real services
The system SHALL route frontend ted-sbrain API calls through a shared API access layer that can target either the local mock service or the real backend through configuration.

#### Scenario: Mock target selected by environment
- **WHEN** `VITE_TED_SBRAIN_API_BASE_URL` points at the local mock service
- **THEN** frontend API calls use the mock service without component-level code changes

#### Scenario: Real target selected by environment
- **WHEN** `VITE_TED_SBRAIN_API_BASE_URL` points at the real ted-sbrain backend
- **THEN** frontend API calls use the real service without component-level code changes

#### Scenario: API client handles documented wrapper
- **WHEN** the API client receives a successful documented response wrapper
- **THEN** it exposes the endpoint data to callers without requiring each component to parse the wrapper

#### Scenario: API client surfaces wrapped failures
- **WHEN** the API client receives a documented failure wrapper
- **THEN** it exposes the failure message and status in a consistent error shape

### Requirement: Patch score mock data follows documented models
The system SHALL return patch score payloads that include documented `PatchScoreVO`, `MetricVO`, and `GroupVO` fields.

#### Scenario: Get patch score detail
- **WHEN** a client requests `GET /metric/patches/{patchId}/score` for a known patch
- **THEN** the response `data` contains patch identity, score totals, risk level, owner fields, schedule fields, metric details, and grouped metric views

#### Scenario: Recalculate patch score
- **WHEN** a client requests `POST /metric/patches/{patchId}/score/calculate` for a known patch
- **THEN** the response `data` contains the same documented shape as the patch score detail endpoint

#### Scenario: Get patch score history
- **WHEN** a client requests `GET /metric/patches/{patchId}/score/history` for a known patch
- **THEN** the response `data` is an array of score snapshots ordered by snapshot time

### Requirement: Snapshot mock data supports lookup, filtering, and pagination
The system SHALL return score snapshot payloads that follow the documented `ScoreSnapshot` and pagination models.

#### Scenario: Get snapshot by id
- **WHEN** a client requests `GET /scoreSnapshot/get/{id}` for a known snapshot
- **THEN** the response `data` contains the documented snapshot fields including audit fields

#### Scenario: List snapshots with filters
- **WHEN** a client requests `GET /scoreSnapshot/list` with query parameters matching `ScoreSnapshot` fields
- **THEN** the response `data` contains only snapshots matching all provided filter values

#### Scenario: Page snapshots with defaults
- **WHEN** a client requests `GET /scoreSnapshot/page` without `page` or `pageSize`
- **THEN** the response `data` uses page `1`, size `10`, and includes `records`, `total`, `size`, `current`, and `pages`

#### Scenario: Page snapshots with explicit paging
- **WHEN** a client requests `GET /scoreSnapshot/page?page=2&pageSize=5`
- **THEN** the response `data.records` contains the second page of filtered snapshots and reports the requested current page and size

#### Scenario: Latest today default paging
- **WHEN** a client requests `GET /scoreSnapshot/queryLatestToday` without `pageSize`
- **THEN** the response `data` uses the documented default page size of `200`

### Requirement: Mock service is runnable and testable locally
The system SHALL provide a documented local command to start the mock service and automated tests for the mock handlers.

#### Scenario: Start mock service
- **WHEN** a developer runs the mock service command
- **THEN** the service listens on a configurable local port and logs the local base URL

#### Scenario: Browser development access
- **WHEN** browser-based frontend development calls the mock service directly
- **THEN** the mock service allows the local development request through basic CORS headers

#### Scenario: Proxy development access
- **WHEN** browser-based frontend development uses a Vite proxy for `/ted-sbrain`
- **THEN** the frontend request path remains the same as the real service path

#### Scenario: Verify mock service behavior
- **WHEN** the test suite runs
- **THEN** tests cover route matching, wrapped response shape, score data, snapshot filtering, pagination, missing resource behavior, and configuration-based service switching
