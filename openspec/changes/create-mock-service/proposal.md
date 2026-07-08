## Why

Frontend development and local verification currently depend on the real ted-sbrain backend or hand-maintained mock data. A mock service generated from the documented API surface will let developers exercise version score, snapshot, and health workflows consistently without needing access to the remote environment, while keeping the future switch to the real service configuration-only.

## What Changes

- Add a local mock API service that implements the endpoints documented in `docs/api`.
- Add a stable API access layer so frontend code can target the same ted-sbrain contract for mock and real services.
- Add environment-driven service selection through an API base URL instead of hard-coding mock-specific paths in business components.
- Return responses using the documented wrapper shape: `result`, `message`, `data`, and `criticalProcess`.
- Provide realistic deterministic data for patch scores, score histories, snapshot lists, paginated snapshots, latest-today snapshots, and health checks.
- Support documented path and query parameters for lookup, filtering, and pagination behavior.
- Prefer real-service-compatible `/ted-sbrain/...` paths, with local compatibility for unprefixed paths only where useful for development tooling.
- Keep mock data easy to extend so UI scenarios can cover high, medium, low, and unknown risk states.

## Capabilities

### New Capabilities

- `mock-api-service`: A local mock service and API access contract for the ted-sbrain scoring and snapshot APIs described in `docs/api`.

### Modified Capabilities

- None.

## Impact

- Adds mock service source files, data fixtures, and request handlers for the documented ted-sbrain endpoints.
- Adds or updates local development scripts so the mock service can be started alongside the frontend.
- Adds API client/configuration code for selecting mock or real ted-sbrain service targets through environment configuration.
- May update Vite development proxy configuration to keep browser calls on stable `/ted-sbrain/...` paths.
- Adds tests for response shapes, route coverage, filtering, pagination semantics, and mock/real contract compatibility.
