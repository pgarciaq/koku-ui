import { axiosInstance } from 'api';

// W4 fleet-capacity advisory (#392): the serving contract of
// GET /recommendations/openshift/hcp/fleet-capacity and /history. Null is
// the absence signal everywhere (unknown QPS, absent MCE gauge, withheld
// headroom) — never zero.

export interface HcpCapacityScenario {
  name: string;
  max_hcs: number;
  limiting_resource: string;
  headroom: number | null;
  status: string;
}

export interface HcpCapacityWarnings {
  stale?: boolean;
  below_version_floor?: boolean;
  pressured?: boolean;
  pressure_unknown?: boolean;
  mce_may_be_stale?: boolean | null;
}

export interface HcpCapacityRow {
  cluster_uuid: string;
  observed_at: string;
  mce_sampled_at?: string | null;
  native_model_version: string;
  source_versions?: { operator?: string; ocp?: string; mce?: string | null };
  collection_interval_minutes: number;
  upload_cycle_minutes: number;
  sample_age_seconds: number;
  inventory_complete: boolean;
  worker_placement_known: boolean;
  current_hc_count: number;
  ready_hcp_count: number;
  average_ready_hcp_qps?: number | null;
  ready_hcp_qps_known: boolean;
  hosted_availability_basis: string;
  pressure_state: string;
  eligible_workers?: {
    cpu_allocatable_millicores?: number;
    memory_allocatable_bytes?: number;
    max_pods?: number;
  };
  scenarios: HcpCapacityScenario[];
  mce_references?: Record<string, number | null>;
  warnings?: HcpCapacityWarnings;
}

export interface HcpCapacityListResponse {
  data?: HcpCapacityRow[];
  meta?: { count?: number; limit?: number; offset?: number };
}

export function fetchHcpCapacityLatest(cluster?: string) {
  const params = new URLSearchParams();
  if (cluster) {
    params.set('filter[cluster_uuid]', cluster);
  }
  const query = params.toString();
  return axiosInstance.get<HcpCapacityListResponse>(
    `recommendations/openshift/hcp/fleet-capacity${query ? `?${query}` : ''}`
  );
}

export function fetchHcpCapacityHistory(cluster: string, limit = 20, offset = 0) {
  const params = new URLSearchParams();
  params.set('filter[cluster_uuid]', cluster);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return axiosInstance.get<HcpCapacityListResponse>(
    `recommendations/openshift/hcp/fleet-capacity/history?${params.toString()}`
  );
}

export function getScenarioByName(row: HcpCapacityRow, name: string): HcpCapacityScenario | undefined {
  return row.scenarios?.find(scenario => scenario.name === name);
}

// An empty limiting resource means the scenario has no estimate (unknown
// placement or unknown average QPS). A genuine zero maximum with a
// limiting resource (zero-worker fleet) is a value, not an absence.
export function isScenarioUnavailable(scenario?: HcpCapacityScenario): boolean {
  return !scenario || scenario.limiting_resource === '';
}

// Signed headroom display: positive is '+N', over-capacity stays negative.
// Null (unknown or withheld under affirmed pressure) stays null — callers
// must render the unavailable marker, never derive max - current locally.
export function formatHeadroom(headroom: number | null): string | null {
  if (headroom === null || headroom === undefined) {
    return null;
  }
  return headroom > 0 ? `+${headroom}` : `${headroom}`;
}
