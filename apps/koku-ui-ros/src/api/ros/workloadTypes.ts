import { axiosInstance } from 'api';

import { RosType } from './ros';
import { RosTypePaths } from './recommendations';

export interface WorkloadTypesResponse {
  data: string[];
}

export function fetchWorkloadTypes(): Promise<WorkloadTypesResponse> {
  const path = RosTypePaths[RosType.ros];
  return axiosInstance.get<WorkloadTypesResponse>(`${path}/workload-types`).then(res => res.data);
}
