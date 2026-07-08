## 1. Mock Data Model

- [x] 1.1 Define TypeScript types for response wrappers, patch scores, metrics, grouped metrics, score snapshots, and paginated snapshot responses.
- [x] 1.2 Create deterministic fixture data covering multiple patches, score histories, snapshot audit fields, and HIGH, MEDIUM, LOW, and UNKNOWN risk levels.
- [x] 1.3 Add helper functions for looking up patch scores by `patchId`, looking up snapshots by `id`, and deriving score history arrays.

## 2. Route And Response Handling

- [x] 2.1 Implement a lightweight Node HTTP mock service entry point with configurable host and port.
- [x] 2.2 Add route normalization so `/ted-sbrain/...` is the preferred path and unprefixed documented paths resolve to the same handlers for local tooling.
- [x] 2.3 Implement score handlers for detail, recalculation, and history endpoints.
- [x] 2.4 Implement snapshot handlers for get-by-id, list, page, and latest-today endpoints.
- [x] 2.5 Implement shared query filtering across documented `ScoreSnapshot` fields.
- [x] 2.6 Implement shared pagination with defaults of `page=1`, `pageSize=10` for `/scoreSnapshot/page`, and `pageSize=200` for `/scoreSnapshot/queryLatestToday`.
- [x] 2.7 Implement health and missing-resource responses using HTTP status semantics plus the documented success or failure wrapper shape.
- [x] 2.8 Add basic development CORS headers so browser clients can call the mock service directly when not using a proxy.

## 3. Configurable API Access

- [x] 3.1 Add a shared ted-sbrain API client that builds real-compatible `/ted-sbrain/...` requests from a configurable base URL.
- [x] 3.2 Add response wrapper handling so callers receive endpoint data on success and a consistent error shape on wrapper or HTTP failures.
- [x] 3.3 Add `VITE_TED_SBRAIN_API_BASE_URL` support for selecting the mock service or real backend without component-level code changes.
- [x] 3.4 Add optional Vite proxy configuration for `/ted-sbrain` so local browser requests can stay same-origin when needed.
- [x] 3.5 Keep existing frontend fixture imports intact unless a page is intentionally migrated to the new API client in this change.

## 4. Developer Integration

- [x] 4.1 Add an npm script to start the mock service locally.
- [x] 4.2 Document mock and real base URL examples near the mock service source or in an existing project doc.
- [x] 4.3 Document the supported endpoints and note that unprefixed routes are local mock conveniences while `/ted-sbrain/...` is the frontend contract.

## 5. Verification

- [x] 5.1 Add Vitest coverage for route normalization and all documented endpoints.
- [x] 5.2 Add Vitest coverage for wrapped success responses and HTTP `404` missing-resource failure responses.
- [x] 5.3 Add Vitest coverage for patch score details, recalculation shape, and ordered history responses.
- [x] 5.4 Add Vitest coverage for snapshot filtering, pagination defaults, explicit pagination, and latest-today default page size.
- [x] 5.5 Add Vitest coverage for API client wrapper parsing, error shaping, and base URL switching between mock and real targets.
- [x] 5.6 Add Vitest coverage or config assertions for `/ted-sbrain` proxy behavior if Vite proxy configuration is introduced.
- [x] 5.7 Run `npm test` and `npm run build` to verify the repository remains healthy.
