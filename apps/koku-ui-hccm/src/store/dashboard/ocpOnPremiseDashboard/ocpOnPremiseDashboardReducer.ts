import type { DashboardWidget } from 'store/dashboard/common/dashboardCommon';
import type { ActionType } from 'typesafe-actions';
import { getType } from 'typesafe-actions';

import { setWidgetTab } from './ocpOnPremiseDashboardActions';
import { costSummaryWidget, storageWidget } from './ocpOnPremiseDashboardWidgets';

export type OcpOnPremiseDashboardAction = ActionType<typeof setWidgetTab>;

export type OcpOnPremiseDashboardState = Readonly<{
  widgets: Record<number, DashboardWidget>;
  currentWidgets: number[];
}>;

export const defaultState: OcpOnPremiseDashboardState = {
  currentWidgets: [costSummaryWidget.id, storageWidget.id],
  widgets: {
    [costSummaryWidget.id]: costSummaryWidget,
    [storageWidget.id]: storageWidget,
  },
};

export function ocpOnPremiseDashboardReducer(
  state = defaultState,
  action: OcpOnPremiseDashboardAction
): OcpOnPremiseDashboardState {
  switch (action.type) {
    case getType(setWidgetTab):
      return {
        ...state,
        widgets: {
          ...state.widgets,
          [action.payload.id]: {
            ...state.widgets[action.payload.id],
            currentTab: action.payload.tab,
          },
        },
      };
    default:
      return state;
  }
}



