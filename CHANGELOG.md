# Changelog

All notable changes to koku-ui are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- **H-3:** OCP breakdown optimizations tab now shares a single ROS list API fetch between `OptimizationsProjectsTable` and `OptimizationsContainersTable`, eliminating a duplicate request on page load.
- **H-2:** Removed ~370 lines of hardcoded mock data from `optimizationsProjectsTable.tsx`. The projects table on the ROS/Optimizations breakdown page previously always showed fake hardcoded data regardless of the API response; it now displays real data from the API.
- **H-1:** `OptimizationsBadge` and `OptimizationsSummary` now pass `limit=1` to the ROS list API, reducing wasted backend work by ~99% for count-only requests.
