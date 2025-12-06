import { axiosInstance } from 'api';

import type { Report, ReportData, ReportItem, ReportItemValue, ReportMeta, ReportValue } from './report';
import { ReportType } from './report';

// Todo: Remove capacity, limit, & request?
export interface OcpOnPremiseReportItem extends ReportItem {
  account?: string;
  account_alias?: string;
  capacity?: ReportValue;
  cluster?: string;
  clusters?: string[];
  limit?: ReportValue;
  node?: string;
  project?: string;
  region?: string;
  request?: ReportValue;
  service?: string;
}

export interface GroupByAccountData extends Omit<OcpOnPremiseReportData, 'accounts'> {
  account: string;
}

export interface GroupByClusterData extends Omit<OcpOnPremiseReportData, 'clusters'> {
  service: string;
}

export interface GroupByNodeData extends Omit<OcpOnPremiseReportData, 'nodes'> {
  region: string;
}

export interface GroupByProjectData extends Omit<OcpOnPremiseReportData, 'projects'> {
  account: string;
}

export interface GroupByRegionData extends Omit<OcpOnPremiseReportData, 'regions'> {
  region: string;
}

export interface GroupByServiceData extends Omit<OcpOnPremiseReportData, 'services'> {
  service: string;
}

export interface OcpOnPremiseReportData extends ReportData {
  accounts?: GroupByAccountData[];
  clusters?: GroupByClusterData[];
  nodes?: GroupByNodeData[];
  projects?: GroupByProjectData[];
  regions?: GroupByRegionData[];
  services?: GroupByServiceData[];
}

export interface OcpOnPremiseReportMeta extends ReportMeta {
  total?: {
    capacity?: ReportValue;
    cost?: ReportItemValue;
    infrastructure?: ReportItemValue;
    limit?: ReportValue;
    request?: ReportValue;
    supplementary?: ReportItemValue;
    usage?: ReportValue;
  };
}

export interface OcpOnPremiseReport extends Report {
  meta: OcpOnPremiseReportMeta;
  data: OcpOnPremiseReportData[];
}

export const ReportTypePaths: Partial<Record<ReportType, string>> = {
  [ReportType.cost]: 'reports/openshift/infrastructures/on-premise/costs/',
  [ReportType.cpu]: 'reports/openshift/compute/',
  [ReportType.database]: 'reports/openshift/infrastructures/on-premise/costs/',
  [ReportType.instanceType]: 'reports/openshift/infrastructures/on-premise/instance-types/',
  [ReportType.memory]: 'reports/openshift/memory/',
  [ReportType.network]: 'reports/openshift/infrastructures/on-premise/costs/',
  [ReportType.storage]: 'reports/openshift/infrastructures/on-premise/storage/',
  [ReportType.volume]: 'reports/openshift/volumes/',
};

export function runReport(reportType: ReportType, query: string) {
  const path = ReportTypePaths[reportType];
  return axiosInstance.get<OcpOnPremiseReport>(`${path}?${query}`);
}

