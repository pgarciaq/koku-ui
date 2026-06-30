# Changelog

All notable changes to koku-ui are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

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
