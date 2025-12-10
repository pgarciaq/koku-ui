import { ForecastPathsType, ForecastType } from 'api/forecasts/forecast';
import { ReportPathsType, ReportType } from 'api/reports/report';
import messages from 'locales/messages';
import {
  ComputedReportItemType,
  ComputedReportItemValueType,
  DatumType,
} from 'routes/components/charts/common/chartDatum';
import { ComputedForecastItemType } from 'routes/components/charts/common/chartDatumForecast';
import { DashboardChartType, type DashboardWidget } from 'store/dashboard/common/dashboardCommon';
import { formatCurrency, formatUnits } from 'utils/format';

import { OcpOnPremiseDashboardTab } from './ocpOnPremiseDashboardCommon';

let currrentId = 0;
const getId = () => currrentId++;

export const costSummaryWidget: DashboardWidget = {
  availableTabs: [OcpOnPremiseDashboardTab.services, OcpOnPremiseDashboardTab.accounts, OcpOnPremiseDashboardTab.regions],
  chartFormatter: formatCurrency,
  chartName: 'ocpOnPremiseCostChart',
  chartType: DashboardChartType.dailyTrend,
  currentTab: OcpOnPremiseDashboardTab.services,
  id: getId(),
  titleKey: messages.ocpOnPremiseDashboardCostTitle,
  forecastPathsType: ForecastPathsType.ocpOnPremise,
  forecastType: ForecastType.cost,
  reportPathsType: ReportPathsType.ocpOnPremise,
  reportType: ReportType.cost,
  details: {
    costKey: messages.cost,
    showHorizontal: true,
  },
  tabsFilter: {
    limit: 3,
  },
  trend: {
    computedForecastItem: ComputedForecastItemType.cost,
    computedReportItem: ComputedReportItemType.cost,
    computedReportItemValue: ComputedReportItemValueType.total,
    dailyTitleKey: messages.ocpOnPremiseDashboardDailyCostTrendTitle,
    datumType: DatumType.cumulative,
    titleKey: messages.ocpOnPremiseDashboardCostTrendTitle,
  },
};

export const storageWidget: DashboardWidget = {
  chartFormatter: formatUnits,
  chartName: 'ocpOnPremiseStorageChart',
  chartType: DashboardChartType.trend,
  id: getId(),
  titleKey: messages.dashboardStorageTitle,
  reportPathsType: ReportPathsType.ocpOnPremise,
  reportType: ReportType.storage,
  details: {
    costKey: messages.cost,
    showUnits: true,
    showUsageFirst: true,
    showUsageLegendLabel: true,
    usageKey: messages.usage,
  },
  trend: {
    computedReportItem: ComputedReportItemType.usage,
    computedReportItemValue: ComputedReportItemValueType.total,
    datumType: DatumType.rolling,
    titleKey: messages.dashboardDailyUsageComparison,
  },
};



