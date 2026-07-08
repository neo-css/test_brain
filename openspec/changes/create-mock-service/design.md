## Context

The repository is a Vite/React frontend with Vitest tests and documented ted-sbrain backend APIs under `docs/api`. Current UI development uses local TypeScript mock data, while the documented backend surface exposes HTTP endpoints for patch scores, score histories, score snapshots, latest snapshots, and health checks. The current Vite config has no API proxy and the frontend has no shared API client boundary, so switching from local data to real HTTP calls needs an explicit contract layer.

The mock service should serve local development and automated verification without requiring the remote backend at `http://172.21.126.221:49152/ted-sbrain`. It must follow the documented response wrapper and make the later switch to the real backend possible by changing environment configuration or proxy target rather than rewriting business components.

## Goals / Non-Goals

**Goals:**

- Provide a local HTTP mock service for all endpoints listed in `docs/api`.
- Provide a frontend API access layer that uses the same request paths and response types for mock and real services.
- Allow service target selection through `VITE_TED_SBRAIN_API_BASE_URL`, with a local mock default for development.
- Keep responses deterministic, realistic, and broad enough to exercise high, medium, low, and unknown risk states.
- Support documented path parameters, query filtering, pagination defaults, and response wrapper shape.
- Keep browser-facing request paths compatible with the real `/ted-sbrain/...` API prefix.
- Make the mock service easy to run from npm scripts and easy to test with Vitest.
- Keep implementation lightweight and consistent with the existing dependency profile.

**Non-Goals:**

- Persist mock data across restarts.
- Recreate backend authentication, authorization, database behavior, or scheduler behavior.
- Implement undocumented endpoints or production-grade latency/error simulation.
- Implement production authentication, request signing, or cross-service retry policies.
- Guarantee parity for undocumented backend fields or behaviors outside `docs/api`.

## Decisions

1. Build the mock service with Node's built-in HTTP APIs.

   Rationale: the repo does not currently include Express, Fastify, MSW, or other server dependencies. A small Node HTTP service keeps setup lightweight and avoids adding framework decisions for a local-only mock.

   Alternative considered: add Express. This would simplify routing, but it adds a dependency for a small documented surface and is unnecessary for the initial mock.

2. Store fixture data in TypeScript modules shared by handlers and tests.

   Rationale: the current codebase already keeps version mock data in typed source files, and typed fixtures make response shape drift easier to catch. The fixtures should include multiple patches, score histories, snapshot audit fields, and grouped metric data.

   Alternative considered: store raw JSON fixtures. JSON is easy to inspect, but TypeScript gives stronger local validation and reusable helpers for deriving pages and histories.

3. Add a shared ted-sbrain API client boundary.

   Rationale: seamless switching requires frontend components to depend on typed functions rather than mock fixtures or hard-coded fetch URLs. The API client should build requests from one base URL, call real-service-compatible `/ted-sbrain/...` paths, unwrap or validate the documented response wrapper, and expose stable methods such as fetching patch scores, score history, and snapshots.

   Alternative considered: let components call `fetch` directly. That is faster initially, but it spreads switching logic and response handling across the UI and makes real-service migration brittle.

4. Select mock versus real service through environment configuration.

   Rationale: `VITE_TED_SBRAIN_API_BASE_URL` gives developers and deployment environments a single switch. Local development can point to the mock service or a Vite proxy, while real integration can point to the deployed backend without code changes.

   Alternative considered: separate build-time branches or mock-specific imports. That would couple implementation to environment and make the switch less transparent.

5. Normalize route handling around the real API prefix.

   Rationale: one doc lists paths relative to `/ted-sbrain`, while the v3 generated doc includes `/ted-sbrain` in each path. The mock service should accept both `/metric/...` when mounted behind a proxy and `/ted-sbrain/metric/...` when called directly.

   Alternative considered: only implement `/ted-sbrain/...`. That matches the generated docs, but makes Vite proxy and local direct calls less flexible.

6. Keep `/ted-sbrain/...` as the preferred browser-facing path.

   Rationale: the real backend base address includes `/ted-sbrain`, so local development should use that same path shape. Unprefixed paths are a mock convenience for tooling, not the primary frontend contract.

   Alternative considered: use unprefixed frontend paths and rewrite through Vite proxy. That works locally, but it makes direct real-service calls less obvious and increases proxy-specific coupling.

7. Implement query filtering and pagination in handler helpers.

   Rationale: `/scoreSnapshot/list`, `/scoreSnapshot/page`, and `/scoreSnapshot/queryLatestToday` all depend on consistent filtering across `ScoreSnapshot` fields. Shared helpers reduce divergent behavior and make tests clearer.

   Alternative considered: return all fixture data regardless of query. That would be simpler, but it would not exercise UI filtering or client request construction.

8. Use real-compatible HTTP status plus documented wrapper for errors.

   Rationale: missing patch or snapshot resources should return HTTP `404` and a wrapper body with `result: false`, a useful `message`, `data: null`, and `criticalProcess: {}`. This keeps HTTP semantics useful without breaking clients that rely on the documented wrapper.

   Alternative considered: always return HTTP `200` with `result: false`. Some Java backends use this style, but it hides transport-level failures from client code and tests.

9. Support basic CORS and optional Vite proxy usage.

   Rationale: developers may call the mock service directly from the browser or through Vite. The mock service should support development-safe CORS headers, while Vite proxy can be configured to keep frontend requests same-origin on `/ted-sbrain/...`.

   Alternative considered: require Vite proxy only. That is clean for the browser, but less convenient for direct API inspection and external local clients.

10. Keep mock scripts separate from the frontend dev server.

   Rationale: developers may want to run the frontend, the mock service, or both. A dedicated `mock` script and a documented base URL avoid coupling Vite startup to API startup.

   Alternative considered: start both services through one script. That is convenient, but this project currently has no process orchestration dependency.

## Risks / Trade-offs

- Fixture data diverges from `docs/api` over time -> Keep tests focused on documented fields and add a short implementation note pointing maintainers back to `docs/api`.
- API client hides backend wrapper changes too aggressively -> Keep wrapper handling explicit and covered by contract tests instead of silently swallowing unexpected shapes.
- Real backend behavior differs from mock for errors or filtering -> Document the mock interpretation, test the contract against docs, and keep the API client tolerant of wrapper failures.
- Node built-in routing can become hard to maintain if the API grows -> Keep route matching table-driven and revisit a server framework only if route count or middleware needs expand.
- Accepting both prefixed and unprefixed paths can hide integration mistakes -> Treat `/ted-sbrain/...` as the preferred frontend path, test both forms, and document unprefixed paths as local convenience only.
- Environment misconfiguration points frontend at the wrong service -> Log the resolved mock base URL on mock startup and document expected env examples for mock and real service.
- Local mock data may create false confidence about real backend edge cases -> Scope the service to deterministic development scenarios and keep real integration testing separate.

## Migration Plan

Add the mock service, API client boundary, environment configuration, and tests behind new files and scripts, so existing frontend behavior can migrate incrementally. Developers can run the mock script and point `VITE_TED_SBRAIN_API_BASE_URL` or Vite proxy traffic at the local mock. Switching to the real service should only require changing the base URL or proxy target. Rollback is removing the added mock/API client files, scripts, and optional proxy configuration because no persistent data or production backend configuration is changed.

## Open Questions

- Should the first implementation migrate existing pages to the API client immediately, or introduce the client and mock service first with page migration as a follow-up?
- Should real-service integration require a Vite proxy in development, or allow direct browser calls when the backend CORS policy permits it?
