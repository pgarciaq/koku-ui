import { axiosInstance } from 'api';

export interface FleetHeatmapMeta {
  count: number;
  metric: 'cpu' | 'memory';
  term: string;
  engine: string;
  latest_update: string | null;
  data_window: string;
}

export interface FleetHeatmapNode {
  node: string;
  cluster_uuid: string;
  cluster_alias: string;
  machineset_name: string;
  instance_type: string;
  cpu_util_p95: number;
  mem_util_p95: number;
  idle_state: string;
  utilization_band: 'idle' | 'low' | 'moderate' | 'healthy' | 'hot';
  node_count_reduction: number;
  estimated_savings_cents: number;
}

export interface FleetHeatmapResponse {
  meta: FleetHeatmapMeta;
  data: FleetHeatmapNode[];
}

export interface FleetHeatmapParams {
  metric?: 'cpu' | 'memory';
  'filter[term]'?: string;
  'filter[engine]'?: string;
  'filter[cluster]'?: string;
}

export function fetchFleetHeatmap(params?: FleetHeatmapParams) {
  return axiosInstance.get<FleetHeatmapResponse>('/recommendations/openshift/fleet-heatmap', {
    params,
  });
}
