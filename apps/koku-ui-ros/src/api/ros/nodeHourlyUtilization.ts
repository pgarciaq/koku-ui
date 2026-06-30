import { axiosInstance } from 'api';

export interface NodeHourlyUtilizationRow {
  report_date: string;
  hour: number;
  cpu_usage_p95_mc: number;
  mem_usage_p95_kib: number;
  sample_count: number;
  max_pod_count: number;
}

export interface NodeHourlyUtilizationMeta {
  count: number;
  days: number;
}

export interface NodeHourlyUtilizationResponse {
  meta: NodeHourlyUtilizationMeta;
  data: NodeHourlyUtilizationRow[];
}

export interface NodeHourlyUtilizationParams {
  cluster_uuid: string;
  node_name: string;
  days?: number;
}

export function fetchNodeHourlyUtilization(params: NodeHourlyUtilizationParams) {
  const { node_name, ...queryParams } = params;
  return axiosInstance.get<NodeHourlyUtilizationResponse>(
    `/recommendations/openshift/node/${encodeURIComponent(node_name)}/hourly-utilization`,
    { params: queryParams }
  );
}
