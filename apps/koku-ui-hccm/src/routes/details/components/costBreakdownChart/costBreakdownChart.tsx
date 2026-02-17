import 'routes/components/charts/common/chart.scss';

import { Charts, ThemeColor } from '@patternfly/react-charts/echarts';
import type { BreakdownEntry, Report } from 'api/reports/report';
import { SankeyChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import messages from 'locales/messages';
import React from 'react';
import type { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import { ComputedReportItemValueType, getResizeObserver } from 'routes/components/charts/common';
import { noop } from 'routes/utils/noop';
import type { reportActions } from 'store/reports';
import { formatCurrency } from 'utils/format';

import { chartStyles } from './costBreakdownChart.styles';

// Register required components
echarts.use([SankeyChart, SVGRenderer, TitleComponent, TooltipComponent]);

interface CostBreakdownChartOwnProps {
  costDistribution?: string;
  id?: string;
  report?: Report;
}

interface CostBreakdownChartStateProps {
  chartHeight?: number;
  data?: any[];
  links?: any[];
  units?: string;
  width?: number;
}

interface CostBreakdownChartDispatchProps {
  fetchReport?: typeof reportActions.fetchReport;
}

type CostBreakdownChartProps = CostBreakdownChartOwnProps &
  CostBreakdownChartStateProps &
  CostBreakdownChartDispatchProps &
  WrappedComponentProps;

class CostBreakdownChartBase extends React.Component<CostBreakdownChartProps, any> {
  private containerRef = React.createRef<HTMLDivElement>();
  private observer: any = noop;

  public state: CostBreakdownChartStateProps = {
    chartHeight: chartStyles.chartHeight,
    units: 'USD',
    width: 0,
  };

  public componentDidMount() {
    this.observer = getResizeObserver(this.containerRef?.current, this.handleResize);
    this.initDatum();
  }

  public componentDidUpdate(prevProps: CostBreakdownChartProps) {
    if (prevProps.costDistribution !== this.props.costDistribution || prevProps.report !== this.props.report) {
      this.initDatum();
    }
  }

  public componentWillUnmount() {
    if (this.observer) {
      this.observer();
    }
  }

  private getSkeleton = () => {
    const { costDistribution, id } = this.props;
    const { width } = this.state;
    const isDistributed = costDistribution === ComputedReportItemValueType.distributed;

    // Skeleton uses separate nodes per (rate, target) pair to match the real chart
    const data = isDistributed
      ? [
          { name: 'r1-u' }, // rate 1 → usage
          { name: 'r2-u' }, // rate 2 → usage
          { name: 'r3-u' }, // rate 3 → usage
          { name: 'r1-p' }, // rate 1 → platform distributed
          { name: 'r2-w' }, // rate 2 → worker unallocated
          { name: 'a1' },   // rawLabel
          { name: 'a2' },   // markupLabel
          { name: 'a3' },   // usageLabel
          { name: 'b1' },   // gpuUnallocatedLabel
          { name: 'b2' },   // networkUnattributedDistributedLabel
          { name: 'b3' },   // platformDistributedLabel
          { name: 'b4' },   // storageUnattributedDistributedLabel
          { name: 'b5' },   // workerUnallocatedLabel
          { name: 'c1' },   // workloadCostLabel
          { name: 'c2' },   // overheadCostLabel
          { name: 'd1' },   // totalCostLabel
        ]
      : [
          { name: 'a1' },   // rawLabel
          { name: 'a2' },   // markupLabel
          { name: 'a3' },   // usageLabel
          { name: 'd1' },   // totalCostLabel
        ];

    const links = isDistributed
      ? [
          { source: 'r1-u', target: 'a3', value: 10 },
          { source: 'r2-u', target: 'a3', value: 10 },
          { source: 'r3-u', target: 'a3', value: 10 },
          { source: 'r1-p', target: 'b3', value: 5 },
          { source: 'r2-w', target: 'b5', value: 5 },
          { source: 'a1', target: 'c1', value: 20 },
          { source: 'a2', target: 'c1', value: 10 },
          { source: 'a3', target: 'c1', value: 30 },
          { source: 'b1', target: 'c2', value: 60 },
          { source: 'b2', target: 'c2', value: 20 },
          { source: 'b3', target: 'c2', value: 15 },
          { source: 'b4', target: 'c2', value: 10 },
          { source: 'b5', target: 'c2', value: 15 },
          { source: 'c1', target: 'd1', value: 60 },
          { source: 'c2', target: 'd1', value: 120 },
        ]
      : [
          { source: 'a1', target: 'd1', value: 20 },
          { source: 'a2', target: 'd1', value: 10 },
          { source: 'a3', target: 'd1', value: 30 },
        ];

    return (
      <Charts
        height={chartStyles.chartHeight}
        id={`${id}-skeleton`}
        option={{
          series: [
            {
              bottom: 0,
              data,
              layoutIterations: 0,
              left: 0,
              links,
              right: 70,
              top: 20,
              type: 'sankey',
            },
          ],
        }}
        themeColor={ThemeColor.skeleton}
        width={width}
      />
    );
  };

  private handleResize = () => {
    const { width } = this.state;
    const { clientWidth = 0 } = this.containerRef?.current || {};

    if (clientWidth !== width) {
      this.setState({ width: clientWidth });
    }
  };

  private initDatum = () => {
    const { costDistribution, report, intl } = this.props;

    if (!report) {
      return;
    }

    const isDistributed = costDistribution === ComputedReportItemValueType.distributed;
    const hasCredit = report?.meta?.total?.cost?.credit !== undefined;

    const creditValue = hasCredit ? report.meta.total.cost.credit.value : 0;
    const gpuUnallocatedValue =
      report?.meta?.total?.cost?.gpu_unallocated_distributed && isDistributed
        ? report.meta.total.cost.gpu_unallocated_distributed.value
        : 0;
    const markupValue = report?.meta?.total?.cost?.markup ? report.meta.total.cost.markup.value : 0;
    const networkUnattributedDistributedValue =
      report?.meta?.total?.cost?.network_unattributed_distributed && isDistributed
        ? report.meta.total.cost.network_unattributed_distributed.value
        : 0;
    const platformDistributedValue =
      report?.meta?.total?.cost?.platform_distributed && isDistributed
        ? report.meta.total.cost.platform_distributed.value
        : 0;
    const rawValue = report?.meta?.total?.cost?.raw ? report.meta.total.cost.raw.value : 0;
    const storageUnattributedDistributedValue =
      report?.meta?.total?.cost?.storage_unattributed_distributed && isDistributed
        ? report.meta.total.cost.storage_unattributed_distributed.value
        : 0;
    const workerUnallocatedValue =
      report?.meta?.total?.cost?.worker_unallocated_distributed && isDistributed
        ? report.meta.total.cost.worker_unallocated_distributed.value
        : 0;
    const usageValue = report?.meta?.total?.cost?.usage ? report.meta.total.cost.usage.value : 0;

    // Only add positive values for Sankey node heights
    const overheadCostValue =
      Math.abs(gpuUnallocatedValue) +
      Math.abs(networkUnattributedDistributedValue) +
      Math.abs(platformDistributedValue) +
      Math.abs(storageUnattributedDistributedValue) +
      Math.abs(workerUnallocatedValue);
    // Actual value shown for labels and tooltips
    const _overheadCostValue =
      gpuUnallocatedValue +
      networkUnattributedDistributedValue +
      platformDistributedValue +
      storageUnattributedDistributedValue +
      workerUnallocatedValue;

    // Only add positive values for Sankey node heights
    const workloadCostValue = Math.abs(markupValue) + Math.abs(rawValue) + Math.abs(usageValue) + Math.abs(creditValue);
    // Actual value shown for labels and tooltips
    const _workloadCostValue = markupValue + rawValue + usageValue + creditValue;

    const creditLabel = intl.formatMessage(messages.credit);
    const gpuUnallocatedLabel = intl.formatMessage(messages.gpuUnallocated);
    const markupLabel = intl.formatMessage(messages.markupTitle);
    const networkUnattributedDistributedLabel = intl.formatMessage(messages.networkUnattributedDistributed);
    const overheadCostLabel = intl.formatMessage(messages.costDistributionLabel);
    const platformDistributedLabel = intl.formatMessage(messages.platformDistributed);
    const rawLabel = intl.formatMessage(messages.rawCostTitle);
    const storageUnattributedDistributedLabel = intl.formatMessage(messages.storageUnattributedDistributed);
    const totalCostLabel = intl.formatMessage(messages.totalCost);
    const usageLabel = intl.formatMessage(messages.usageCostTitle);
    const workerUnallocatedLabel = intl.formatMessage(messages.workerUnallocated);
    const workloadCostLabel = intl.formatMessage(messages.allOtherProjectCosts);

    const reportItemValue = costDistribution ? costDistribution : 'total';
    const units = report.meta.total.cost?.[reportItemValue] ? report.meta.total.cost[reportItemValue].units : 'USD';

    // Build breakdown nodes and links — one node per (rate_name, target) pair so each
    // rate appears as a separate bar for each cost category it flows into.
    // Node IDs are made unique by appending invisible zero-width spaces; the visible
    // label is stored in _displayName and rendered by the label formatter.
    const breakdownNodeData: Array<{ name: string; _displayName: string; _value: number }> = [];
    const breakdownLinkData: Array<{ source: string; target: string; value: number; _value: number }> = [];
    let uniqueIdCounter = 0;

    if (isDistributed) {
      const breakdownSources: Array<{ label: string; entries?: BreakdownEntry[] }> = [
        { label: usageLabel, entries: report?.meta?.total?.cost?.usage?.breakdown },
        { label: platformDistributedLabel, entries: report?.meta?.total?.cost?.platform_distributed?.breakdown },
        {
          label: workerUnallocatedLabel,
          entries: report?.meta?.total?.cost?.worker_unallocated_distributed?.breakdown,
        },
        {
          label: storageUnattributedDistributedLabel,
          entries: report?.meta?.total?.cost?.storage_unattributed_distributed?.breakdown,
        },
        {
          label: networkUnattributedDistributedLabel,
          entries: report?.meta?.total?.cost?.network_unattributed_distributed?.breakdown,
        },
        {
          label: gpuUnallocatedLabel,
          entries: report?.meta?.total?.cost?.gpu_unallocated_distributed?.breakdown,
        },
      ];

      for (const { label, entries } of breakdownSources) {
        if (entries && entries.length > 0) {
          for (const entry of entries) {
            uniqueIdCounter++;
            // Unique, invisibly-padded ID so ECharts treats each as a distinct node
            const nodeId = entry.name + '\u200B'.repeat(uniqueIdCounter);
            breakdownNodeData.push({
              name: nodeId,
              _displayName: entry.name,
              _value: entry.value,
            });
            breakdownLinkData.push({
              source: nodeId,
              target: label,
              value: Math.abs(entry.value),
              _value: entry.value,
            });
          }
        }
      }
    }

    const data = isDistributed
      ? [
          ...breakdownNodeData,
          { name: rawLabel, _value: rawValue },
          { name: markupLabel, _value: markupValue },
          { name: usageLabel, _value: usageValue },
          { name: gpuUnallocatedLabel, _value: gpuUnallocatedValue },
          { name: networkUnattributedDistributedLabel, _value: networkUnattributedDistributedValue },
          { name: platformDistributedLabel, _value: platformDistributedValue },
          { name: storageUnattributedDistributedLabel, _value: storageUnattributedDistributedValue },
          { name: workerUnallocatedLabel, _value: workerUnallocatedValue },
          { name: workloadCostLabel, _value: _workloadCostValue },
          { name: overheadCostLabel, _value: _overheadCostValue },
          { name: totalCostLabel, _value: _overheadCostValue + _workloadCostValue },
        ]
      : hasCredit
        ? [
            { name: creditLabel, _value: creditValue },
            { name: rawLabel, _value: rawValue },
            { name: markupLabel, _value: markupValue },
            { name: usageLabel, _value: usageValue },
            { name: totalCostLabel, _value: _workloadCostValue },
          ]
        : [
            { name: rawLabel, _value: rawValue },
            { name: markupLabel, _value: markupValue },
            { name: usageLabel, _value: usageValue },
            { name: totalCostLabel, _value: _workloadCostValue },
          ];

    const links = isDistributed
      ? [
          ...breakdownLinkData,
          {
            source: rawLabel,
            target: workloadCostLabel,
            value: Math.abs(rawValue),
            _value: rawValue,
          },
          {
            source: markupLabel,
            target: workloadCostLabel,
            value: Math.abs(markupValue),
            _value: markupValue,
          },
          {
            source: usageLabel,
            target: workloadCostLabel,
            value: Math.abs(usageValue),
            _value: usageValue,
          },
          {
            source: gpuUnallocatedLabel,
            target: overheadCostLabel,
            value: Math.abs(gpuUnallocatedValue),
            _value: gpuUnallocatedValue,
          },
          {
            source: networkUnattributedDistributedLabel,
            target: overheadCostLabel,
            value: Math.abs(networkUnattributedDistributedValue),
            _value: networkUnattributedDistributedValue,
          },
          {
            source: platformDistributedLabel,
            target: overheadCostLabel,
            value: Math.abs(platformDistributedValue),
            _value: platformDistributedValue,
          },
          {
            source: storageUnattributedDistributedLabel,
            target: overheadCostLabel,
            value: Math.abs(storageUnattributedDistributedValue),
            _value: storageUnattributedDistributedValue,
          },
          {
            source: workerUnallocatedLabel,
            target: overheadCostLabel,
            value: Math.abs(workerUnallocatedValue),
            _value: workerUnallocatedValue,
          },
          {
            source: workloadCostLabel,
            target: totalCostLabel,
            value: workloadCostValue,
            _value: _workloadCostValue,
          },
          {
            source: overheadCostLabel,
            target: totalCostLabel,
            value: overheadCostValue,
            _value: _overheadCostValue,
          },
          {
            source: totalCostLabel,
            value: overheadCostValue + workloadCostValue,
            _value: _overheadCostValue + _workloadCostValue,
          },
        ]
      : hasCredit
        ? [
            {
              source: creditLabel,
              target: totalCostLabel,
              value: Math.abs(creditValue),
              _value: creditValue,
            },
            {
              source: rawLabel,
              target: totalCostLabel,
              value: Math.abs(rawValue),
              _value: rawValue,
            },
            {
              source: markupLabel,
              target: totalCostLabel,
              value: Math.abs(markupValue),
              _value: markupValue,
            },
            {
              source: usageLabel,
              target: totalCostLabel,
              value: Math.abs(usageValue),
              _value: usageValue,
            },
            {
              source: totalCostLabel,
              value: workloadCostValue,
              _value: _workloadCostValue,
            },
          ]
        : [
            {
              source: rawLabel,
              target: totalCostLabel,
              value: Math.abs(rawValue),
              _value: rawValue,
            },
            {
              source: markupLabel,
              target: totalCostLabel,
              value: Math.abs(markupValue),
              _value: markupValue,
            },
            {
              source: usageLabel,
              target: totalCostLabel,
              value: Math.abs(usageValue),
              _value: usageValue,
            },
            {
              source: totalCostLabel,
              value: workloadCostValue,
              _value: _workloadCostValue,
            },
          ];

    // Ensure every link.value is unique so the PatternFly tooltip valueFormatter
    // can map rendered values back to _value for correct currency formatting
    const usedValues = new Set<number>();
    for (const link of links) {
      let v = link.value;
      while (usedValues.has(v)) {
        v += 1e-10;
      }
      link.value = v;
      usedValues.add(v);
    }

    const chartHeight = breakdownNodeData.length > 0
      ? chartStyles.chartHeight + breakdownNodeData.length * 28
      : chartStyles.chartHeight;

    this.setState({ chartHeight, data, links, units });
  };

  public render() {
    const { id, intl } = this.props;
    const { chartHeight: currentChartHeight, data, links, units, width } = this.state;

    const isSkeleton = !(data && links) || !links.find(link => link.value !== 0);
    const height = currentChartHeight || chartStyles.chartHeight;

    return (
      <div className="chartOverride" data-testid="cost-breakdown-chart-wrapper" ref={this.containerRef}>
        <div style={{ height }}>
          {isSkeleton ? (
            this.getSkeleton()
          ) : (
            <Charts
              height={height}
              id={id}
              option={{
                series: [
                  {
                    bottom: 20,
                    data,
                    label: {
                      formatter: params => {
                        const node = data[params.dataIndex];
                        const value = formatCurrency(node?._value ?? 0, units);
                        const displayName = node?._displayName || params.name;
                        return `{a|${value}}\n${displayName}`;
                      },
                      lineHeight: 12,
                      rich: {
                        a: {
                          fontWeight: 'bold',
                          fontSize: 12,
                        },
                      },
                    },
                    layoutIterations: 0,
                    links,
                    left: 0,
                    nodeGap: 26,
                    right: 110,
                    top: 20,
                    type: 'sankey',
                  },
                ],
                tooltip: {
                  destinationLabel: intl.formatMessage(messages.chartDestination),
                  sourceLabel: intl.formatMessage(messages.chartSource),
                  valueFormatter: (value: number) => {
                    const link = links.find(val => val.value === value);
                    return `&nbsp;${formatCurrency(link ? link._value : value, units)}`;
                  },
                },
              }}
              themeColor={ThemeColor.green}
              width={width}
            />
          )}
        </div>
      </div>
    );
  }
}

const CostBreakdownChart = injectIntl(CostBreakdownChartBase);

export default CostBreakdownChart;
