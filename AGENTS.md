# Koku UI – AI Agent Guide

This document captures architecture, development, and operational knowledge
for the koku-ui monorepo. Follow it precisely.

For backend setup (Koku API, Masu, workers, PostgreSQL, MinIO, nise data
generation), see `~/dev/koku/koku/AGENTS.md`.

---

## Overview

koku-ui is the React frontend for Red Hat Cost Management. It is a monorepo
managed with **npm workspaces** containing three applications and two shared
libraries.

---

## Monorepo Structure

```
koku-ui/
├── apps/
│   ├── koku-ui-hccm/           # Main Cost Management UI (cloud / console.redhat.com)
│   │   ├── src/
│   │   │   ├── api/            # Axios-based API clients (one file per resource)
│   │   │   ├── routes/         # Route-based code splitting
│   │   │   │   ├── components/ # Shared route components (data table, toolbar, etc.)
│   │   │   │   ├── details/    # Provider detail views (AWS, Azure, GCP, OCP)
│   │   │   │   ├── explorer/   # Cost Explorer
│   │   │   │   ├── optimizations/ # ROS integration
│   │   │   │   ├── overview/   # Dashboard / landing page
│   │   │   │   ├── settings/   # Settings (cost models, tags, currency)
│   │   │   │   └── utils/      # Route utilities (groupBy, paths, etc.)
│   │   │   └── locales/        # i18n message catalogs
│   │   ├── webpack-onprem.config.ts   # Webpack config for on-prem remote module
│   │   └── package.json
│   ├── koku-ui-ros/            # Resource Optimization Service UI
│   │   └── package.json
│   └── koku-ui-onprem/         # On-prem shell (webpack dev server + Module Federation host)
│       ├── src/
│       │   ├── index.html      # HTML entry point
│       │   ├── index.tsx       # JS entry point
│       │   └── bootstrap.tsx   # App bootstrap with Module Federation
│       ├── webpack.config.ts   # Webpack config (proxy, module federation, etc.)
│       └── package.json
├── libs/
│   ├── ui-lib/                 # Shared UI components across all apps
│   │   └── src/components/
│   └── onprem-cloud-deps/      # Shims for cloud-only dependencies (Unleash, etc.)
│       └── src/
│           ├── frontend-components/
│           ├── frontend-components-notifications/
│           └── unleash/
├── docs/                       # Architecture docs, design specs
├── build-tools/                # Build utilities
├── scripts/                    # Release scripts
└── package.json                # Root: workspace config + top-level scripts
```

---

## Tech Stack

| Layer          | Technology                                    |
|----------------|-----------------------------------------------|
| Framework      | React 18 + TypeScript                         |
| State          | Redux + Redux Toolkit + Redux Thunk           |
| UI Library     | PatternFly 6 (Red Hat design system)          |
| Routing        | react-router-dom v6                           |
| HTTP Client    | Axios                                         |
| i18n           | react-intl + FormatJS                         |
| Build (cloud)  | fec (frontend-components-config) / Webpack 5  |
| Build (on-prem)| Webpack 5 + ts-loader + Module Federation     |
| Feature Flags  | Unleash (@unleash/proxy-client-react)          |
| Testing        | Jest + React Testing Library                  |
| Linting        | ESLint                                        |
| Node           | v20.15+                                       |
| npm            | v10.8+                                        |

---

## Two Deployment Targets

### 1. Cloud (console.redhat.com) – `koku-ui-hccm`

- Uses `fec` (frontend-components-config) CLI for dev/build
- Runs as a Chrome micro-frontend on `console.redhat.com`
- Auth via Chrome/Keycloak SSO
- Dev URL: `https://stage.foo.redhat.com:1337/openshift/cost-management`
- Requires `/etc/hosts` entries for `prod.foo.redhat.com` and `stage.foo.redhat.com`

### 2. On-prem – `koku-ui-onprem`

- Standalone app using Webpack 5 + Module Federation
- `koku-ui-onprem` is the host; loads `koku-ui-hccm` and `koku-ui-ros` as remote modules
- Auth via `x-rh-identity` header (base64-encoded JSON)
- Dev URL: `http://localhost:9000/`
- API proxy configured in `apps/koku-ui-onprem/webpack.config.ts`

---

## Key Routes (HCCM)

| Path                              | Feature                |
|-----------------------------------|------------------------|
| `/`                               | Overview dashboard     |
| `/aws`, `/azure`, `/gcp`, `/ocp`  | Provider cost details  |
| `/{provider}/breakdown`           | Cost breakdown         |
| `/explorer`                       | Cost Explorer          |
| `/optimizations`                  | Optimizations (ROS)    |
| `/settings`                       | Settings               |

API base URL: `/api/cost-management/v1/` (defined in `api/api.ts`)

---

## Development Setup

### Prerequisites

```bash
# From the monorepo root
npm install
```

### Running Cloud Mode (HCCM)

```bash
# Start the fec dev server
npm run start:hccm
# Follow prompts: select "stage" environment
# Open https://stage.foo.redhat.com:1337/openshift/cost-management
```

### Running On-Prem Mode (with local Koku backend)

This is the most common mode for local development and testing. It requires
the Koku backend to be running (see `~/dev/koku/koku/AGENTS.md` for full
backend setup).

**Step 1: Start the Koku backend**

```bash
cd ~/dev/koku/koku
docker compose up -d db valkey unleash koku-server masu-server koku-worker koku-beat
```

**Step 2: Generate the identity token**

The on-prem UI authenticates to the Koku API via the `x-rh-identity` header.
You need a base64-encoded identity matching the test customer:

```bash
IDENTITY=$(echo -n '{"identity":{"account_number":"10001","org_id":"1234567","type":"User","user":{"username":"user_dev","email":"user_dev@foo.com","is_org_admin":true,"access":{}}},"entitlements":{"cost_management":{"is_entitled":true}}}' | base64 -w0)
```

**IMPORTANT**: The `account_number` must be `"10001"` and `org_id` must be
`"1234567"` to match the test customer created by `create_test_customer.py`.
Using different values (e.g., `"12345"`) will result in `403 Forbidden`.

**Step 3: Start all three on-prem apps concurrently**

```bash
cd ~/dev/koku/koku-ui
API_PROXY_URL=http://localhost:8000 API_TOKEN=$IDENTITY npm run start:onprem
```

This runs three concurrent processes (via `concurrently`):
- `HOST` (yellow): `koku-ui-onprem` webpack dev server on port **9000**
- `HCCM` (cyan): `koku-ui-hccm` webpack in watch mode (remote module)
- `ROS` (magenta): `koku-ui-ros` webpack in watch mode (remote module)

**Step 4: Open the browser**

Navigate to `http://localhost:9000/`

---

## Webpack Proxy Configuration (On-Prem)

The on-prem webpack dev server proxies API requests to the Koku backend.
The configuration is in `apps/koku-ui-onprem/webpack.config.ts`:

```typescript
proxy: [
  {
    context: ['/api/cost-management/v1'],
    target: process.env.API_PROXY_URL,    // http://localhost:8000
    changeOrigin: true,
    secure: false,
    headers: {
      'x-rh-identity': process.env.API_TOKEN || '',
    },
  },
],
```

### Critical Gotchas

1. **Do NOT use `pathRewrite`** to strip the `/api/cost-management/v1` prefix.
   The Koku backend expects the full path including the prefix. Stripping it
   will result in `404 Not Found` from the backend.

2. **Use `x-rh-identity` header**, not `Authorization: Bearer`. The Koku
   backend in development mode (`DEVELOPMENT=True`) authenticates via the
   `x-rh-identity` header, not Bearer tokens.

3. **Port 9000 conflict**: Both the on-prem webpack dev server and MinIO
   default to port 9000. If you need to run MinIO for data ingestion, stop
   the frontend first (`lsof -ti :9000 | xargs kill`), run MinIO, ingest
   data, stop MinIO, then restart the frontend.

---

## API Integration Patterns

### API Client Structure

Each API resource has its own file in `apps/koku-ui-hccm/src/api/`:

| File              | Resource                     |
|-------------------|------------------------------|
| `api.ts`          | Axios instance, base config  |
| `costModels.ts`   | Cost model CRUD              |
| `rates.ts`        | Rate type definitions        |
| `metrics.ts`      | Available metrics            |
| `providers.ts`    | Provider/source management   |
| `reports/`        | Cost/usage report queries    |
| `tags/`           | Tag key/value queries        |
| `settings.ts`     | User settings                |
| `userAccess.ts`   | RBAC user access             |

### Type Pattern

API types follow this convention:
- **Request interfaces**: `FooRequest` — used for POST/PUT payloads
- **Response types**: `Foo` — returned from the API
- **Paged responses**: `PagedResponse<Foo>` — standard paginated wrapper

### Adding a New API Call

1. Define request/response types in the appropriate `api/` file
2. Add the API function using the Axios instance from `api.ts`
3. Create a Redux action/thunk if the data needs to be in the store
4. Use the data in components via `useSelector` + `useDispatch`

---

## State Management

Redux store is organized by feature. Key slices:

- **Reports**: Cost and usage report data
- **Cost Models**: Rate definitions and cost model configuration
- **Providers**: Cloud and OCP source/provider data
- **User Access**: RBAC permissions
- **Feature Flags**: Unleash feature toggles

Actions follow the thunk pattern: `fetchFoo` dispatches `pending` → calls API
→ dispatches `fulfilled` or `rejected`.

---

## i18n / Localization

- Message descriptors in `apps/koku-ui-hccm/src/locales/messages.ts`
- Compiled catalogs in `apps/koku-ui-hccm/locales/`
- Use `intl.formatMessage(messages.foo)` in components
- Run `npm run translations` in the hccm workspace to extract/compile

### Common Pitfall

`textHelpers.required` and similar i18n utilities return `MessageDescriptor`
objects, not strings. Do NOT cast them to `string` or `string | null` in
TypeScript code. If a form error field holds either a `MessageDescriptor`
(when invalid) or `null` (when valid), the type should be
`MessageDescriptor | null`, not `string | null`.

---

## Cost Models & Rates

### Key Types (`api/rates.ts`)

```typescript
interface RateRequest {
  name?: string;            // Optional display name for the rate
  metric: { name: string }; // e.g., "cpu_core_usage_per_hour"
  tiered_rates?: TieredRate[];
  tag_rates?: TagRates;
  cost_type: string;        // "Infrastructure" or "Supplementary"
}
```

**Note**: The `name` field is optional in the TypeScript interface but the
backend API **requires** it when creating/updating cost models via PUT.
Always include a descriptive `name` when calling the cost model API.

### Rate Form (`routes/settings/costModels/components/rateForm/`)

- `utils.tsx` — Initial state, form data generation, metric helpers
- `rateForm.tsx` — Main form component
- The form `errors` object uses `MessageDescriptor | null` for validation
  messages (see i18n pitfall above)

---

## Testing

```bash
# Run all tests
npm test

# Run tests for a specific workspace
npm test -w @koku-ui/koku-ui-hccm

# With coverage
npm run test:coverage -w @koku-ui/koku-ui-hccm

# Update snapshots
npm run test:update -w @koku-ui/koku-ui-hccm
```

Tests use **Jest** + **React Testing Library**. Test files are co-located
with source files using the `*.test.ts` / `*.test.tsx` naming convention.

For Cypress E2E tests (on-prem):
```bash
npm run test:cypress:open -w @koku-ui/koku-ui-onprem
```

---

## Building

```bash
# Build all workspaces
npm run build

# Build on-prem bundle specifically
npm run build:onprem
```

The on-prem build produces:
1. `koku-ui-hccm` remote module (via `webpack-onprem.config.ts`)
2. `koku-ui-ros` remote module
3. `koku-ui-onprem` host application

---

## Common npm Scripts

| Script                | Description                                    |
|-----------------------|------------------------------------------------|
| `npm run start:hccm`  | Start cloud dev server (fec)                  |
| `npm run start:onprem` | Start all on-prem apps concurrently           |
| `npm run start:ros`   | Start ROS dev server                           |
| `npm run build`       | Build all workspaces                           |
| `npm run build:onprem`| Build on-prem bundles                          |
| `npm run lint`        | Lint all workspaces                            |
| `npm run lint:fix`    | Lint and auto-fix all workspaces               |
| `npm test`            | Run tests across all workspaces                |
| `npm run clean`       | Remove dist/.cache/.swc in all workspaces      |

---

## Module Federation (On-Prem)

The on-prem deployment uses Webpack 5 Module Federation:

- **Host**: `koku-ui-onprem` — exposes `onprem` container
- **Remotes**: `koku-ui-hccm` and `koku-ui-ros` — built via their
  `webpack-onprem.config.ts` configs
- **Shared singletons**: react, react-dom, react-redux, react-router-dom,
  @openshift/dynamic-plugin-sdk, @scalprum/react-core

The host serves static files from the remote dist directories:
- `/costManagement/` → `apps/koku-ui-hccm/dist/`
- `/costManagementRos/` → `apps/koku-ui-ros/dist/`

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `404 Not Found` from API proxy | `pathRewrite` strips the API prefix | Remove `pathRewrite` from `webpack.config.ts` |
| `403 Forbidden` from Koku API | Wrong identity in `API_TOKEN` | Use `account_number: "10001"`, `org_id: "1234567"` |
| Port 9000 already in use | MinIO or another process on 9000 | `lsof -ti :9000 \| xargs kill` then restart |
| Remote module not loading | HCCM/ROS webpack not running | Ensure `npm run start:onprem` starts all three processes |
| TypeScript errors in rate form | `MessageDescriptor` cast to `string` | Use `MessageDescriptor \| null` type, not `string \| null` |
| `TS2322` in cost model components | `name` not optional in `RateRequest` | Ensure `name?: string` (optional) in `api/rates.ts` |
| Stale build artifacts | Old cache/dist files | Run `npm run clean` then `npm install` |
| HMR not working | Missing `HMR=true` env var | Use `HMR=true npm run start:hccm` for cloud mode |

---

## Cross-References

- **Backend setup & data pipeline**: `~/dev/koku/koku/AGENTS.md`
- **Architecture docs**: `docs/architecture/` in this repo
- **Cloud README**: `apps/koku-ui-hccm/README.md`
- **Release process**: `apps/koku-ui-hccm/RELEASE.md`
