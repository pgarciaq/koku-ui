import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import type { DashboardWidgetOwnProps, DashboardWidgetStateProps } from 'routes/overview/components';
import { DashboardWidgetBase } from 'routes/overview/components';
import type { ComputedOcpCloudReportItemsParams } from 'routes/utils/computedReport/getComputedOcpCloudReportItems';
import { createMapStateToProps } from 'store/common';
import {
  ocpOnPremiseDashboardActions,
  ocpOnPremiseDashboardSelectors,
  OcpOnPremiseDashboardTab,
} from 'store/dashboard/ocpOnPremiseDashboard';
import { forecastSelectors } from 'store/forecasts';
import { reportSelectors } from 'store/reports';
import { getCurrency } from 'utils/sessionStorage';

interface OcpOnPremiseDashboardWidgetDispatchProps {
  fetchForecasts: typeof ocpOnPremiseDashboardActions.fetchWidgetForecasts;
  fetchReports: typeof ocpOnPremiseDashboardActions.fetchWidgetReports;
  updateTab: typeof ocpOnPremiseDashboardActions.changeWidgetTab;
}

export const getIdKeyForTab = (tab: OcpOnPremiseDashboardTab): ComputedOcpCloudReportItemsParams['idKey'] => {
  switch (tab) {
    case OcpOnPremiseDashboardTab.accounts:
      return 'account';
    case OcpOnPremiseDashboardTab.regions:
      return 'region';
    case OcpOnPremiseDashboardTab.services:
      return 'service';
  }
};

const mapStateToProps = createMapStateToProps<DashboardWidgetOwnProps, DashboardWidgetStateProps>(
  (state, { widgetId }) => {
    const widget = ocpOnPremiseDashboardSelectors.selectWidget(state, widgetId);
    const queries = ocpOnPremiseDashboardSelectors.selectWidgetQueries(state, widgetId);
    return {
      ...widget,
      currency: getCurrency(),
      getIdKeyForTab,
      ...(widget.forecastPathsType &&
        widget.forecastType && {
          forecast: forecastSelectors.selectForecast(
            state,
            widget.forecastPathsType,
            widget.forecastType,
            queries.forecast
          ),
          forecastError: forecastSelectors.selectForecastError(
            state,
            widget.forecastPathsType,
            widget.forecastType,
            queries.forecast
          ),
          forecastFetchStatus: forecastSelectors.selectForecastFetchStatus(
            state,
            widget.forecastPathsType,
            widget.forecastType,
            queries.forecast
          ),
        }),
      ...(widget.reportPathsType &&
        widget.reportType && {
          currentReport: reportSelectors.selectReport(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.current
          ),
          currentReportError: reportSelectors.selectReportError(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.current
          ),
          currentReportFetchStatus: reportSelectors.selectReportFetchStatus(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.current
          ),
          previousReport: reportSelectors.selectReport(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.previous
          ),
          previousReportError: reportSelectors.selectReportError(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.previous
          ),
          previousReportFetchStatus: reportSelectors.selectReportFetchStatus(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.previous
          ),
          tabsReport: reportSelectors.selectReport(state, widget.reportPathsType, widget.reportType, queries.tabs),
          tabsReportError: reportSelectors.selectReportError(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.tabs
          ),
          tabsReportFetchStatus: reportSelectors.selectReportFetchStatus(
            state,
            widget.reportPathsType,
            widget.reportType,
            queries.tabs
          ),
        }),
    };
  }
);

const mapDispatchToProps: OcpOnPremiseDashboardWidgetDispatchProps = {
  fetchForecasts: ocpOnPremiseDashboardActions.fetchWidgetForecasts,
  fetchReports: ocpOnPremiseDashboardActions.fetchWidgetReports,
  updateTab: ocpOnPremiseDashboardActions.changeWidgetTab,
};

const OcpOnPremiseDashboardWidget = injectIntl(connect(mapStateToProps, mapDispatchToProps)(DashboardWidgetBase));

export { OcpOnPremiseDashboardWidget };

