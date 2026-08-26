# koku-ui-ros — Agent Guide

Resource Optimization Service UI (Module Federation **remote**). HCCM is the host;
top-level Optimizations tabs live in `koku-ui-hccm`, data tables and toolbars
live here.

## Module Federation

- Expose new list/detail components via `webpack-onprem.config.ts` `exposedModules`
- Wrap fed-modules in `src/fed-modules/` with `<OptimizationsWrapper>` (Redux)
- Build with `npm run build:onprem`, not plain `build`

## Recommendation List Tabs — Term/Engine Projection

**Every recommendations list tab must include term and engine dropdowns** on the
list page, matching Container, Namespace, and Node. Detail pages read projection
from URL state; they do not duplicate the dropdowns.

### Reference tabs

| Tab | Table | Toolbar | URL prefix |
|-----|-------|---------|------------|
| Container | `optimizationsContainersTable/` | `optimizationsContainersToolbar.tsx` | `ctr_` |
| Namespace | `optimizationsNamespacesTable/` | `optimizationsNamespacesToolbar.tsx` | `ns_` |
| Node | `optimizationsNodesTable/` | `optimizationsNodesToolbar.tsx` | `node_` |
| Storage (PVC) | `optimizationsPvcsTable/` | `optimizationsPvcsToolbar.tsx` | `pvc_` |
| VM | `optimizationsVmsTable/` | `optimizationsVmsToolbar.tsx` | `vm_` |
| Quota | `optimizationsQuotasTable/` | `optimizationsQuotasToolbar.tsx` | `quota_` |

### Checklist for a new recommendation tab

1. **Table + toolbar** under `src/routes/optimizations/optimizationsTable/`
2. **`OptimizationsProjectionToolbar`** in the toolbar (term + engine selects)
3. **`useUrlState({ prefix: '<unique>_', baseQuery })`** for deep-linkable state
4. **`withRosListProjection(query)`** on all list API calls
5. **Column formatters** use active `term`/`engine` from query — never hardcode
   `short_term` or `cost` in render paths
6. **Detail/breakdown** — pass projection via `encodeRosDetailFetchQuery()`;
   use `useBreakdownProjection`; no term/engine controls on breakdown toolbars
7. **Fed-module + HCCM tab** — register component; add `<Tab>` in HCCM
   `optimizations.tsx` (tabs live in the host, not ROS internal toggles)
8. **Do not use** legacy `OptimizationsTable` / `OptimizationsToolbar` as the
   sole list implementation for a top-level tab

### Defaults

```typescript
// api/ros/rosListParams.ts
ROS_LIST_TERM = Interval.short_term;
ROS_LIST_ENGINE = OptimizationType.cost;
```

### PVC / Storage term labels

Container tabs use fixed Kruize-aligned labels (24h / 7d / 15d) from
`messages.optimizations*Term`. **PVC list and breakdown must not reuse those.**
Use `useRecommendationTermOptions('pvc')`, which loads
`GET /recommendations/openshift/settings/terms?recommendation_type=pvc` and
renders labels from each term's `window_days` (fallback: 7 / 30 / 90 days).
Pass the resulting options to `OptimizationsProjectionToolbar` via `termOptions`.

**PVC trend display:** On breakdown term cards, use `getPvcTrendDisplayState()` /
`PvcTrendSummary` — show **Trend unavailable** when `data_days` is below the term's
growth threshold; show **No growth detected** when enough data exists but slope is
non-positive; do not render `growth_bytes_per_day` = 0 as if it were a measured rate
when projection was skipped.

### Container tab

HCCM loads `./OptimizationsTable` with `type="containers"` for the Container tab
(via `containerDetails.tsx`), matching Namespace/Node/VM tabs. All table types
use the single consolidated `./OptimizationsTable` federated module with a `type`
prop.

## Shared display components

Reuse these for any list tab that shows Kubernetes labels or workload state — do not build
one-off tag popovers or state badges.

### `RecommendationTagsLink`

Path: `optimizationsTable/recommendationTagsLink.tsx`

- Props: `tags?: Record<string, string>`
- Renders tag icon + clickable count; PatternFly **Popover** lists key/value pairs
- Shows "—" when `tags` is empty or absent (common when `ROS_TAGS_ENABLED=false` or tag sync has not run)
- Backend: top-level `tags` on container and namespace list rows (`enrichContainerTags` /
  `enrichNamespaceTags` in ros-ocp-backend)

### `OptimizationStateCell`

Path: `optimizationsTable/optimizationStateCell.tsx`

- Props: `idleState`, `idleDays`, `analyticsIncomplete`, `ingestHooksFailed`
- Renders green **Active** badge when row is healthy; orange/red idle/zombie badges; yellow data-quality badges
- Backend fields (from `clusters` table, copied to list rows):
  - `idle_state` / `idle_duration_days` — idle detection (codes **5**, **8**, **15**)
  - `analytics_incomplete` — cluster analytics pipeline could not complete; savings may be stale
  - `ingest_hooks_failed` — post-ingest hooks failed; investigate ROS processor logs
- Does **not** suppress savings columns; surface badges so users know when dollar amounts may be unreliable

### Quota list — savings column omitted

Quota and ClusterResourceQuota list tables intentionally **omit** estimated monthly savings: API
returns `estimated_savings` only for `tighten` rows; most rows are `raise`/`optimal` with null values.
Detail views and API clients may still display savings when present.

### Peak hours sizing (node / GPU / timeslicing / VM)

Path: `optimizationsBreakdown/shared/peakHoursSizing.tsx`, `peakHoursUtils.ts`

- **Do not** reuse container YAML Peak hours (`optimizationsBreakdownConfiguration` request/limit).
- Show Peak hours only when the nest has **sizing fields**. Reason-only `{reason}` (no 79–82) → hide.
- Warning text is the nest `message` for **79** (node), **80** (GPU), **81** (timeslicing), **82** (VM).
  Do not merge those codes into parent `notifications` / `notification_codes` arrays.
- Lists stay all-hours (no BH columns). No BH charts here (that is backend/UI issue #494).
- **Node / VM:** card on the existing breakdown from the detail payload.
- **Timeslicing:** `GET .../gpu/timeslicing/{node}` with `gpu_model` + `term` in the URL; pick the matching row.
- **MIG:** extra-fetch container detail `gpu.{short|medium|long}.business_hours` (GPU keys are not `short_term`).
  If lookup is not exactly one container `id`, omit Peak hours. After backend #495, use row `id`.

## Backend pairing (ros-ocp-backend)

List and detail endpoints must accept `filter[term]` and `filter[engine]`.
When both are explicit, list responses exclude rows with no matching
recommendation data. See `internal/api/queryparams/projection.go` and
`internal/api/list_projection_filter.go`.

## Tests

- `rosListParams.test.ts` — projection helpers
- `useUrlState.test.ts` — prefix serialization
- Add tests when introducing new URL prefixes or detail fetch encoding
