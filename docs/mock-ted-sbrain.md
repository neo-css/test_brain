# ted-sbrain Mock Service

The local ted-sbrain mock service implements the frontend contract used by the API client and returns the documented response wrapper:

```json
{
  "result": true,
  "message": "success",
  "data": {},
  "criticalProcess": {}
}
```

## Start the mock

Run the mock service:

```bash
npm run mock
```

By default, it listens at:

```text
http://localhost:49152/ted-sbrain
```

Override the port when needed:

```bash
MOCK_PORT=49153 npm run mock
```

## Frontend data source switching

The frontend loads version collection and detail data through `src/services/tedSbrain/api.ts`.
Runtime page code does not import mock fixtures directly.

By default, browser requests stay same-origin on `/ted-sbrain/...`, and Vite proxies them to the real backend:

```bash
npm run dev
```

Use a local mock service by changing the proxy target:

```bash
VITE_TED_SBRAIN_PROXY_TARGET=http://localhost:49152 npm run dev
```

Use a different backend by changing the proxy target. Avoid setting `VITE_TED_SBRAIN_API_BASE_URL` to a remote absolute URL unless that backend explicitly enables browser CORS.

```bash
VITE_TED_SBRAIN_PROXY_TARGET=http://172.21.126.221:49152 npm run dev
```

## Supported endpoints

The preferred frontend contract is the `/ted-sbrain/...` path form:

- `GET /ted-sbrain/health`
- `GET /ted-sbrain/metric/patches/{patchId}/score`
- `POST /ted-sbrain/metric/patches/{patchId}/score/calculate`
- `GET /ted-sbrain/metric/patches/{patchId}/score/history`
- `GET /ted-sbrain/scoreSnapshot/get/{id}`
- `GET /ted-sbrain/scoreSnapshot/list`
- `GET /ted-sbrain/scoreSnapshot/page`
- `GET /ted-sbrain/scoreSnapshot/queryLatestToday`

The mock service also accepts the same routes without the `/ted-sbrain` prefix, such as `/health` and `/scoreSnapshot/list`. Those unprefixed routes are local mock conveniences for tools and direct inspection; `/ted-sbrain/...` is the frontend contract and should be used by browser-facing code.

## Missing resources

Missing patch scores, snapshots, or routes return HTTP `404` plus the documented failure wrapper:

```json
{
  "result": false,
  "message": "patch score not found",
  "data": null,
  "criticalProcess": {}
}
```
