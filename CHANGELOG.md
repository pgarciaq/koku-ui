# Changelog

All notable changes to koku-ui are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- **ROS:** Read container notifications from engine level on detail (`recommendation_engines.<engine>.notifications`); list rows use `recommendations.notification_codes` for warning badges (ADR-0293 / performance audit A-2).
- **ROS:** Replaced the optimizations breakdown boxplot with a percentile-band chart (P50-P95, P95-P99 bands, median line, and daily max dots) for the digest-based plots API response.
- **H-3:** OCP breakdown optimizations tab now shares a single ROS list API fetch between `OptimizationsProjectsTable` and `OptimizationsContainersTable`, eliminating a duplicate request on page load.
- **H-2:** Removed ~370 lines of hardcoded mock data from `optimizationsProjectsTable.tsx`. The projects table on the ROS/Optimizations breakdown page previously always showed fake hardcoded data regardless of the API response; it now displays real data from the API.
- **H-1:** `OptimizationsBadge` and `OptimizationsSummary` now pass `limit=1` to the ROS list API, reducing wasted backend work by ~99% for count-only requests.
- **S4/H-4:** ROS list calls now pass explicit `term=short_term` and `engine=cost` query params for stable projection and cache keys.
- **H-5:** Optimizations tables prefer `after=<meta.next_cursor>` when advancing to the next page; offset remains the fallback for page-one and backward navigation.
- **H-6:** Badge and summary read `meta.count` from a shared Redux count cache populated by any list response, avoiding duplicate `limit=1` fetches when the table has already loaded.
