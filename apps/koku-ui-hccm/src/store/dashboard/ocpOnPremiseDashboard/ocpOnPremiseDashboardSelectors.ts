import type { RootState } from 'store/rootReducer';
import { getCurrency } from 'utils/sessionStorage';

import {
  getQueryForWidget,
  getQueryForWidgetTabs,
  ocpOnPremiseDashboardDefaultFilters,
  ocpOnPremiseDashboardStateKey,
  ocpOnPremiseDashboardTabFilters,
} from './ocpOnPremiseDashboardCommon';

export const selectOcpOnPremiseDashboardState = (state: RootState) => state[ocpOnPremiseDashboardStateKey];

export const selectWidgets = (state: RootState) => selectOcpOnPremiseDashboardState(state).widgets;

export const selectWidget = (state: RootState, id: number) => selectWidgets(state)[id];

export const selectCurrentWidgets = (state: RootState) => selectOcpOnPremiseDashboardState(state).currentWidgets;

export const selectWidgetQueries = (state: RootState, id: number) => {
  const widget = selectWidget(state, id);

  const defaultFilter = {
    ...ocpOnPremiseDashboardDefaultFilters,
    ...(widget.filter ? widget.filter : {}),
  };
  const tabsFilter = {
    ...ocpOnPremiseDashboardTabFilters,
    ...(widget.tabsFilter ? widget.tabsFilter : {}),
  };
  const props = {
    currency: getCurrency(),
  };

  return {
    previous: getQueryForWidget(
      {
        ...defaultFilter,
        time_scope_value: -2,
      } as any,
      props
    ),
    current: getQueryForWidget(defaultFilter, props),
    forecast: getQueryForWidget({}, { limit: 31, ...props }),
    tabs: getQueryForWidgetTabs(
      widget,
      {
        ...(tabsFilter as any),
        resolution: 'monthly',
      },
      props
    ),
  };
};

