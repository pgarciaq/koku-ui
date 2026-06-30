import { axiosInstance } from 'api';

export interface VmHourlyActivityRow {
  report_date: string;
  hour: number;
  cpu_usage_p95_mc: number;
  mem_usage_p95_kib: number;
  sample_count: number;
  disk_read_iops_p95: number;
  disk_write_iops_p95: number;
}

export interface VmHourlyActivityMeta {
  count: number;
  days: number;
}

export interface VmHourlyActivityResponse {
  meta: VmHourlyActivityMeta;
  data: VmHourlyActivityRow[];
}

export interface VmHourlyActivityParams {
  cluster_uuid: string;
  namespace: string;
  vm_name: string;
  days?: number;
}

export function fetchVmHourlyActivity(params: VmHourlyActivityParams) {
  return axiosInstance.get<VmHourlyActivityResponse>('/recommendations/openshift/vm/hourly-activity', {
    params,
  });
}
