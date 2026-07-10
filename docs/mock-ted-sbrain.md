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

Use the direct browser mock when CORS-friendly local calls are acceptable:

```bash
VITE_TED_SBRAIN_API_BASE_URL=http://localhost:49152 npm run dev
```

Use same-origin proxy mode when browser requests should stay on `/ted-sbrain/...`:

```bash
VITE_TED_SBRAIN_API_BASE_URL= VITE_TED_SBRAIN_PROXY_TARGET=http://localhost:49152 npm run dev
```

Use the real backend by changing only the base URL when the backend itself is CORS-friendly:

```bash
VITE_TED_SBRAIN_API_BASE_URL=http://172.21.126.221:49152 npm run dev
```

When the frontend is deployed behind Nginx, prefer same-origin requests and let Nginx proxy `/ted-sbrain/...` to the real backend. Build with an empty API base URL so the browser keeps calling the current origin:

```bash
VITE_TED_SBRAIN_API_BASE_URL= npm run build
```

Example Nginx location blocks:

```nginx
location / {
    root /srv/test_brain/dist;
    try_files $uri $uri/ /index.html;
}

location /ted-sbrain/ {
    proxy_pass http://172.21.126.221:49152;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

With that setup the browser requests `http://<your-frontend-host>/ted-sbrain/...`, so no browser CORS negotiation is needed.

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
