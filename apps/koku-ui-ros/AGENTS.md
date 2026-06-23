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

### Container tab pitfall

When the namespace feature flag is off, `optimizationsDetails.tsx` must render
`OptimizationsContainersTable` (with projection), not legacy `OptimizationsTable`.

## Backend pairing (ros-ocp-backend)

List and detail endpoints must accept `filter[term]` and `filter[engine]`.
When both are explicit, list responses exclude rows with no matching
recommendation data. See `internal/api/queryparams/projection.go` and
`internal/api/list_projection_filter.go`.

## Tests

- `rosListParams.test.ts` — projection helpers
- `useUrlState.test.ts` — prefix serialization
- Add tests when introducing new URL prefixes or detail fetch encoding
