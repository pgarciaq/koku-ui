# Changelog

All notable changes to koku-ui are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **ROS:** Container and namespace utilization Peak hours **chart mode**.
  All-hours charts stay 24×7 usage + 24×7 request/limit. A second Peak hours
  chart uses `business_hours_plots` with BH request/limit. Hide Peak hours
  charts when the nest is reason-only or BH plots are empty. Do not overlay
  dashed BH usage or BH rec on the all-hours series.
  ([Issue #496](https://github.com/pgarciaq/ros-ocp-backend/issues/496))

- **ROS:** Peak hours Visual Insights on node, GPU MIG, GPU time-slicing, VM, and
  container breakdown. Node/VM Peak hours usage charts use sibling
  `daily_digests_business_hours` with the Peak hours rec on that series only.
  MIG dual radar uses container `gpu.{term}.business_hours` (VRAM from parent
  `total_fb_mib`). Timeslicing Peak hours radar uses nest SM/VRAM. Hide Peak hours
  charts when the nest is reason-only. Do not draw BH recs on all-hours charts.
  ([Issue #494](https://github.com/pgarciaq/ros-ocp-backend/issues/494))

- **ROS:** Peak hours sizing on node, GPU MIG, GPU time-slicing, and VM
  breakdown pages. Detail stays all-hours by default; a Peak hours card (or MIG
  columns) appears only when the nest has sizing fields. Warning text comes from
  nest `message` for codes **79–82** and is not merged into parent notification
  lists. Lists stay all-hours. Timeslicing breakdown fetches
  `GET .../gpu/timeslicing/{node}`. MIG prefers list row `id` for Peak hours
  container detail ([#495](https://github.com/pgarciaq/ros-ocp-backend/issues/495));
  extra-fetch remains a fallback when `id` is absent.
  ([Issue #493](https://github.com/pgarciaq/ros-ocp-backend/issues/493))

- **ROS:** Container Recommendation History Chart in Visual Insights section. Renders
  two multi-line trend charts (CPU/Memory) showing how recommended request and limit
  values drift over time. CPU chart uses millicores, Memory chart uses MiB (converted
  from KiB). Includes legend, voronoi tooltips, responsive sizing via ResizeObserver,
  and empty state when no history data available.
  ([Issue #49](https://github.com/pgarciaq/ros-ocp-backend/issues/49))

- **ROS:** Node Request vs Usage Gap Chart in Visual Insights section. Renders
  two line charts (CPU/Memory) showing aggregate requests overlaid on P95 usage,
  with the gap between them shaded to highlight overcommitted resources. Uses
  `max_cpu_requests_mc` and `max_mem_requests_kib` from the daily digests response.
  Includes WCAG 2.1 AA accessibility (hidden data table, aria labels).
  ([Issue #23](https://github.com/pgarciaq/ros-ocp-backend/issues/23))

### Changed

- **ROS:** Consolidated 5 table federated module wrappers into a single
  `./OptimizationsTable` exposed module with a `type` prop (`containers`,
  `namespaces`, `nodes`, `projects`, `vms`). Follows the same pattern as the
  `./OptimizationsBreakdown` consolidation. Reduces boilerplate and simplifies
  adding new table types.
  ([Issue #93](https://github.com/pgarciaq/ros-ocp-backend/issues/93))

### Fixed

- **ROS:** Added missing `category`, `category_cpu`, and `category_memory` fields
  to the `RosData` TypeScript interface. These fields are returned by the backend
  container recommendation list endpoint and documented in the OpenAPI spec but
  were not present in the frontend types.
  ([Issue #118](https://github.com/pgarciaq/ros-ocp-backend/issues/118))

### Added

- **ROS:** Node recommendations cold-start empty state. When insufficient data is
  available (`meta.data_days_available < min_data_days`), the node recommendations
  table displays a `ColdStartState` component with a "Collecting data" message and
  dynamic day count pulled from the terms API (`GET .../settings/terms?recommendation_type=node`).
  ([Issue #84](https://github.com/pgarciaq/ros-ocp-backend/issues/84))
- **ROS:** GPU summary totals banner on MIG and Time-Slicing tabs. MIG shows
  recommendation count only; Time-Slicing shows total potential savings and count.
  ([Issue #113](https://github.com/pgarciaq/ros-ocp-backend/issues/113))
- **ROS:** Cross-tab navigation links. Entity names (cluster, namespace, node, PVC,
  container) are now clickable, navigating to the relevant tab with a pre-applied filter.
  ([Issue #110](https://github.com/pgarciaq/ros-ocp-backend/issues/110))
- **ROS:** Savings fallback sort. When all visible rows have null/zero savings, tables
  automatically fall back to sorting by the relevant variation field.
  ([Issue #114](https://github.com/pgarciaq/ros-ocp-backend/issues/114))
- **ROS:** GPU Time-Slicing `gpu_model` filter.
  ([Issue #109](https://github.com/pgarciaq/ros-ocp-backend/issues/109))
- **ROS:** VM filters: `is_idle`, `is_abandoned`, `is_oversized`, `is_network_bound`,
  `guest_os`, `node`, and `is_power_off_candidate`.
  ([Issue #108](https://github.com/pgarciaq/ros-ocp-backend/issues/108))
- **ROS:** GPU MIG `workload` filter.
  ([Issue #109](https://github.com/pgarciaq/ros-ocp-backend/issues/109))
- **ROS:** `group_by` support for Node, GPU MIG, GPU Time-Slicing, and VM tabs.
  Adds a group-by dropdown toolbar (reusing `OptimizationsStorageGroupByToolbar`)
  and grouped table rendering with drill-down navigation. Follows the existing
  Storage/Quota group-by pattern.
  ([Issue #112](https://github.com/pgarciaq/ros-ocp-backend/issues/112))

- **ROS:** Node Activity Heatmap on the node breakdown Visual Insights section.
  Reuses the generic `UtilizationHeatmap` component (24×7 hour-of-day × day-of-week
  grid) consuming the new backend
  `GET /recommendations/openshift/node/{id}/hourly-utilization` endpoint. Integrated
  into the existing `NodeVisualInsightsSection` below the utilization trends.
  ([Issue #16](https://github.com/pgarciaq/ros-ocp-backend/issues/16))
- **ROS:** VM Activity Heatmap on the VM breakdown Visual Insights section.
  Renders a 24-column × 7-row hour-of-day × day-of-week grid showing CPU
  utilization intensity. Cells are colored by utilization band using the shared
  `getCellStyle` utilities. Includes tooltips on hover, screen-reader accessible
  data table, sparse data handling, and empty state. Uses the generic
  `UtilizationHeatmap` component (reusable for future node heatmaps).
  Data fetched from the new backend
  `GET /recommendations/openshift/vm/hourly-activity` endpoint.
  ([Issue #13](https://github.com/pgarciaq/ros-ocp-backend/issues/13))
- **ROS:** Node Fleet Utilization Heatmap on the Efficiency tab. Renders all nodes
  as colored cells grouped by MachineSet, with each cell colored by utilization band
  (idle/low/moderate/healthy/hot). Includes CPU/Memory metric toggle, clickable cells
  linking to node breakdown, legend, screen-reader accessible data table, and "Show all"
  toggle for fleets with >100 nodes. Data fetched from the new backend
  `GET /recommendations/openshift/fleet-heatmap` endpoint.
  ([Issue #24](https://github.com/pgarciaq/ros-ocp-backend/issues/24))
- **ROS:** GPU Subsystem Utilization radar chart on MIG and timeslicing GPU
  breakdown pages. Renders a 4-axis polar area chart (Victory `VictoryChart` polar
  + `VictoryArea` + `VictoryPolarAxis`) showing SM Activity, Tensor Core Activity,
  DRAM Bandwidth, and VRAM Usage as percentages. VRAM is normalized from
  `fb_usage_max_mib / total_fb_mib`. Displayed side-by-side with the existing VRAM
  gauge in the Visual Insights section using a PatternFly Grid. Includes a
  visually-hidden accessibility data table.
  ([Issue #17](https://github.com/pgarciaq/ros-ocp-backend/issues/17))
- **ROS:** Quota Headroom Trend charts on the quota breakdown page. Two line charts
  (CPU request and memory request) show daily quota hard limit vs actual usage over
  time, with the gap representing headroom. Fetched lazily from the new backend
  `GET /recommendations/openshift/quota/:quota-id/trend` endpoint. Handles loading,
  empty, and error states. Uses PatternFly Charts (`ChartLine`).
  ([Issue #14](https://github.com/pgarciaq/ros-ocp-backend/issues/14))
- **ROS:** Container Inventory Table on the namespace breakdown page. Displays a
  paginated table of all container-level recommendations within the current
  namespace, fetched from the existing `GET /recommendations/openshift` API with
  `filter[exact:project]=<namespace>`. Columns include container name (linked to
  its container breakdown page), workload, workload type, current/recommended CPU
  and memory, estimated monthly savings, and last reported date. Includes a
  Popover explaining that container recommendations are computed independently
  from aggregated container-level data, not derived from the namespace-level
  recommendation.
  ([Issue #64](https://github.com/pgarciaq/ros-ocp-backend/issues/64))
- **ROS:** GPU VRAM Utilization gauge on the MIG breakdown page. Displays a
  `ChartDonutUtilization` donut chart showing peak VRAM usage (`fb_usage_max_mib`)
  as a percentage of total VRAM capacity (`total_fb_mib` from the GPU catalog).
  Color thresholds at 85% (amber) and 95% (red). Not rendered when the GPU model
  is unrecognized (null capacity). Integrated via a reusable `GpuVisualInsightsSection`
  component that can also be used on the timeslicing breakdown page when VRAM data
  becomes available.
  ([Issue #21](https://github.com/pgarciaq/ros-ocp-backend/issues/21))
- **ROS:** VM Resource Sizing bar chart in the Visual Insights section of the VM
  breakdown page. Displays a grouped bar chart comparing current vs recommended
  vCPU and memory (GiB) allocation, with value labels on each bar, legend, and
  an estimated monthly savings callout when savings data is available.
  ([Issue #7](https://github.com/pgarciaq/ros-ocp-backend/issues/7))
- **ROS:** Business-hours utilization overlay on container and namespace breakdown
  charts. When the backend provides `business_hours_plots`, an orange dashed P50
  line and translucent P50-P95 area band are rendered on top of the existing
  all-hours utilization chart. Legend entries toggle the overlay independently.
  No visual change when business hours are not configured.
  ([Issue #18](https://github.com/pgarciaq/ros-ocp-backend/issues/18))
- **ROS:** Added Snapshot Cost by Type donut chart to the snapshot list page
  (Visual Insights section). Displays a PatternFly `ChartDonut` showing proportional
  breakdown of snapshot storage costs by recommendation type (orphaned, stale, active,
  etc.). Includes color coding per type, formatted USD cost in center, legend with
  cost values, tooltip with count, and empty state handling.
  ([Issue #19](https://github.com/pgarciaq/ros-ocp-backend/issues/19))
- **ROS:** Added Node Pod Scheduling Headroom Gauge to the node breakdown page
  (Visual Insights section). Displays current pod count as a percentage of node
  pod capacity using a `ChartDonutUtilization` donut chart with color thresholds
  (amber at 80%, red at 90%). Includes staleness label when `last_reported` is
  available, accessible hidden data table, and over-capacity handling (caps visual
  at 100% but displays actual percentage).
  ([Issue #100](https://github.com/pgarciaq/ros-ocp-backend/issues/100))
- **ROS:** Added Snapshot Age Distribution Histogram to the snapshot list page
  (Visual Insights section). Displays a bar chart of volume snapshot counts grouped
  by age buckets (<7 days, 7-30 days, 30-90 days, 90+ days) using PatternFly Charts.
  Includes color-coded bars (green/amber/orange/red), accessible hidden data table,
  loading and error states, and i18n support.
  ([Issue #15](https://github.com/pgarciaq/ros-ocp-backend/issues/15))
- **ROS:** Added Cluster Quota Utilization Gauges to the cluster quota breakdown
  page (Visual Insights section). Displays up to three `ChartDonutUtilization`
  donut gauges (CPU, Memory, Pods) showing current usage as a percentage of the
  hard quota limit. Adapts dynamically to available resources — renders 1, 2, or
  3 gauges based on which quota limits are set. Includes amber/red color thresholds
  (default 85%/95%), over-quota handling (>100%), formatted value subtitles, and
  accessible hidden data tables.
- **ROS:** Added PVC Utilization Gauge to the PVC breakdown page (Visual Insights
  section). Displays current PVC usage as a percentage of provisioned capacity
  using a `ChartDonutUtilization` donut chart with color thresholds (green/amber/red)
  derived from the backend `near_full_threshold_basis_points` setting. Includes
  staleness label ("Data as of [date]") and accessible hidden data table.
- **ROS:** Added PVC storage growth projection line to the PVC breakdown usage
  chart. When the active term has sufficient data, a dashed projection line
  extends from the last historical average usage point, showing projected growth
  based on `growth_bytes_per_day`. Includes an exhaustion date tooltip when
  `days_to_full` is within the 90-day projection horizon.
- **ROS:** Added GPU Recommendations tab to the Optimizations page with MIG and
  Time-Slicing sub-views. MIG sub-tab shows container-level MIG profile
  recommendations (current/recommended profile, classification, confidence).
  Time-Slicing sub-tab shows node-level GPU time-slicing recommendations
  (recommended replicas, classification, estimated monthly savings). Both include
  detail/breakdown pages accessible by clicking a row.
- **ROS:** Added GPU MIG and GPU Time-Slicing breakdown (detail) pages. MIG
  breakdown displays all term recommendations for a container's GPU model.
  Time-Slicing breakdown displays node metadata, classification badge, and a
  candidate containers table.
- **ROS:** Added VM (Virtual Machine) tab to the Optimizations page. The new tab displays OpenShift Virtualization VM-level recommendations with columns for VM Name, Namespace, Cluster, Current/Recommended vCPU and Memory, Status badges (idle, abandoned, oversized, power-off candidate), Potential Savings, and Last Reported. Includes term/engine projection toolbar, filtering by cluster/namespace/vm_name/tag, sorting, and cursor-based pagination.
- **ROS:** Added Namespace tab to the Optimizations page (Phase 1 of the multi-tab architecture). The new tab displays namespace-level recommendations with columns for Namespace, Cluster, Memory/CPU current and change, State, and Last Reported. Includes filtering by cluster and project, sorting on all columns, and pagination with cursor-based navigation.
- **ROS:** Fleet summary stat cards on Efficiency tab showing container health
  aggregates and potential savings from the fleet-summary API as PatternFly stat
  cards. Exposed via Module Federation from koku-ui-ros.
  ([Issue #63](https://github.com/pgarciaq/ros-ocp-backend/issues/63))

### Changed

- **ROS:** Consolidated 9 separate Module Federation breakdown wrappers
  (`VmBreakdownWrapper`, `NamespaceBreakdownWrapper`, `NodeBreakdownWrapper`,
  `PvcBreakdownWrapper`, `QuotaBreakdownWrapper`, `ClusterQuotaBreakdownWrapper`,
  `OptimizationsOcpBreakdownWrapper`, plus new GPU wrappers) into a single
  `OptimizationsBreakdownWrapper` with a `type` prop that routes to the correct
  breakdown component via `React.lazy`. Reduces Module Federation surface area
  and eliminates per-entity exposed modules for breakdowns.
- **ROS:** Removed stale `onEngineSelect` prop from GPU table components — the
  prop was passed down but never consumed, causing React warnings.
- **ROS:** Renamed "Optimizations" tab to "Container" in the Efficiency/Optimizations tabbed view to better reflect that this tab shows container-level recommendations (first step of the multi-tab architecture: Efficiency, Container, Namespace, GPU, Storage, Node, Quota, VM).

### Fixed

- **ROS:** Fixed hardcoded test UUID in `OptimizationsProjectsDataTable` that prevented recommendation details from loading when the `namespace` feature flag was enabled — replaced with `item.id`.
- **ROS:** Fixed `formatBasisPoints()` applied to `confidence_level` in the explanation panel — `confidence_level` is a 0–1 ratio, not basis points; dividing by 100 produced `0.0%` for all recommendations. Now correctly displays e.g. `100.0%` for full-confidence recommendations.
- **On-prem:** Removed `cost-management.koku-ui-ros.namespace` and `cost-management.koku-ui-hccm.price-list` from `ONPREM_ENABLED_FLAGS` — these were proactively enabled by a previous commit but the features are not ready for on-prem use.

### Changed

- **ROS:** Read container notifications from engine level on detail (`recommendation_engines.<engine>.notifications`); list rows use `recommendations.notification_codes` for warning badges (ADR-0293 / performance audit A-2).
- **ROS:** Replaced the optimizations breakdown boxplot with a percentile-band chart (P50-P95, P95-P99 bands, median line, and daily max dots) for the digest-based plots API response.
- **H-3:** OCP breakdown optimizations tab now shares a single ROS list API fetch between `OptimizationsProjectsTable` and `OptimizationsContainersTable`, eliminating a duplicate request on page load.
- **H-2:** Removed ~370 lines of hardcoded mock data from `optimizationsProjectsTable.tsx`. The projects table on the ROS/Optimizations breakdown page previously always showed fake hardcoded data regardless of the API response; it now displays real data from the API.
- **H-1:** `OptimizationsBadge` and `OptimizationsSummary` now pass `limit=1` to the ROS list API, reducing wasted backend work by ~99% for count-only requests.
- **S4/H-4:** ROS list calls now pass explicit `term=short_term` and `engine=cost` query params for stable projection and cache keys.
- **H-5:** Optimizations tables prefer `after=<meta.next_cursor>` when advancing to the next page; offset remains the fallback for page-one and backward navigation.
- **H-6:** Badge and summary read `meta.count` from a shared Redux count cache populated by any list response, avoiding duplicate `limit=1` fetches when the table has already loaded.
