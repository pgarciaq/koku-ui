import type { OcpCloudFilters, OcpCloudQuery } from 'api/queries/ocpCloudQuery';
import { getQuery } from 'api/queries/ocpCloudQuery';
import type { DashboardWidget } from 'store/dashboard/common/dashboardCommon';

export const ocpOnPremiseDashboardStateKey = 'ocpOnPremiseDashboard';
export const ocpOnPremiseDashboardDefaultFilters: OcpCloudFilters = {
  time_scope_units: 'month',
  time_scope_value: -1,
  resolution: 'daily',
};
export const ocpOnPremiseDashboardTabFilters: OcpCloudFilters = {
  ...ocpOnPremiseDashboardDefaultFilters,
  limit: 3,
};

export const enum OcpOnPremiseDashboardTab {
  accounts = 'accounts',
  regions = 'regions',
  services = 'services',
}

// Todo: cluster, project, node
export function getGroupByForTab(widget: DashboardWidget): OcpCloudQuery['group_by'] {
  switch (widget.currentTab) {
    case OcpOnPremiseDashboardTab.accounts:
      return { account: '*' };
    case OcpOnPremiseDashboardTab.regions:
      return { region: '*' };
    case OcpOnPremiseDashboardTab.services:
      // Use group_by for service tab and filter for others -- https://github.com/project-koku/koku-ui/issues/846
      return {
        service: widget.tabsFilter && widget.tabsFilter.service ? widget.tabsFilter.service : '*',
      };
    default:
      return {};
  }
}

export function getQueryForWidget(filter: OcpCloudFilters = ocpOnPremiseDashboardDefaultFilters, props?) {
  const query: OcpCloudQuery = {
    filter,
    ...(props ? props : {}),
  };
  return getQuery(query);
}

export function getQueryForWidgetTabs(
  widget: DashboardWidget,
  filter: OcpCloudFilters = ocpOnPremiseDashboardDefaultFilters,
  props?
) {
  const group_by = getGroupByForTab(widget);
  const newFilter = {
    ...JSON.parse(JSON.stringify(filter)),
  };

  // Use group_by for service tab and filter for others -- https://github.com/project-koku/koku-ui/issues/846
  if (widget.currentTab === OcpOnPremiseDashboardTab.services && widget.tabsFilter && widget.tabsFilter.service) {
    newFilter.service = undefined;
  }
  const query: OcpCloudQuery = {
    filter: newFilter,
    group_by,
    ...(props ? props : {}),
  };
  return getQuery(query);
}

