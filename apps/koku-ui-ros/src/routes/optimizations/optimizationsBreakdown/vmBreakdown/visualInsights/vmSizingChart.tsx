import { Chart, ChartAxis, ChartBar, ChartGroup, ChartLegend, ChartTooltip, ChartVoronoiContainer } from '@patternfly/react-charts/victory';
import { Icon, Split, SplitItem } from '@patternfly/react-core';
import { TrendDownIcon } from '@patternfly/react-icons/dist/esm/icons/trend-down-icon';
import type { MoneyAmount, VmRecommendedSizing, VmSizingBlock } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';

interface VmSizingChartProps {
  current?: VmSizingBlock;
  recommended?: VmRecommendedSizing;
  estimatedMonthlySavings?: MoneyAmount;
}

const CURRENT_COLOR = '#0066CC';
const RECOMMENDED_COLOR = '#009596';
const CHART_HEIGHT = 220;

const VmSizingChart: React.FC<VmSizingChartProps> = ({ current, recommended, estimatedMonthlySavings }) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const unobserve = getResizeObserver(containerRef.current, () => {
        if (containerRef.current) {
          setWidth(containerRef.current.clientWidth);
        }
      });
      return () => {
        if (unobserve) {
          unobserve();
        }
      };
    }
  }, []);

  const hasData = useMemo(() => {
    return (
      current?.vcpu != null &&
      current?.memory_gib != null &&
      recommended?.vcpu != null &&
      recommended?.memory_gib != null
    );
  }, [current, recommended]);

  const savingsCallout = useMemo(() => {
    if (!estimatedMonthlySavings?.value) {
      return null;
    }
    const savingsValue = parseFloat(estimatedMonthlySavings.value);
    if (isNaN(savingsValue) || savingsValue <= 0) {
      return null;
    }

    const currentTotal = (current?.vcpu ?? 0) + (current?.memory_gib ?? 0);
    const recommendedTotal = (recommended?.vcpu ?? 0) + (recommended?.memory_gib ?? 0);
    let percentReduction: number | null = null;
    if (currentTotal > 0 && recommendedTotal < currentTotal) {
      percentReduction = Math.round(((currentTotal - recommendedTotal) / currentTotal) * 100);
    }

    return { amount: `$${estimatedMonthlySavings.value}`, percent: percentReduction };
  }, [estimatedMonthlySavings, current, recommended]);

  if (!hasData) {
    return null;
  }

  const vcpuLabel = intl.formatMessage(messages.visualInsightsVmSizingVcpu);
  const memoryLabel = intl.formatMessage(messages.visualInsightsVmSizingMemoryGib);
  const currentLabel = intl.formatMessage(messages.current);
  const recommendedLabel = intl.formatMessage(messages.recommended);

  const currentData = [
    { x: vcpuLabel, y: current!.vcpu!, name: 'current' },
    { x: memoryLabel, y: current!.memory_gib!, name: 'current' },
  ];

  const recommendedData = [
    { x: vcpuLabel, y: recommended!.vcpu!, name: 'recommended' },
    { x: memoryLabel, y: recommended!.memory_gib!, name: 'recommended' },
  ];

  const legendData = [
    { childName: 'current', name: currentLabel, symbol: { fill: CURRENT_COLOR, type: 'square' } },
    { childName: 'recommended', name: recommendedLabel, symbol: { fill: RECOMMENDED_COLOR, type: 'square' } },
  ];

  const maxValue = Math.max(
    current!.vcpu!,
    current!.memory_gib!,
    recommended!.vcpu!,
    recommended!.memory_gib!,
    1
  );

  return (
    <div data-testid="vm-sizing-chart">
      <div ref={containerRef}>
        <div style={{ height: CHART_HEIGHT }}>
          <Chart
            ariaTitle={intl.formatMessage(messages.visualInsightsVmSizingTitle)}
            ariaDesc={intl.formatMessage(messages.visualInsightsVmSizingDesc)}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => `${datum.name === 'current' ? currentLabel : recommendedLabel}: ${datum.y}`}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
            }
            domain={{ y: [0, maxValue * 1.2] }}
            domainPadding={{ x: 80 }}
            height={CHART_HEIGHT}
            legendComponent={<ChartLegend data={legendData} gutter={40} />}
            legendPosition="bottom"
            padding={{ bottom: 70, left: 10, right: 30, top: 30 }}
            width={width > 0 ? width : 600}
          >
            <ChartAxis
              label={intl.formatMessage(messages.visualInsightsVmSizingResourceMetric)}
              fixLabelOverlap
            />
            <ChartAxis
              dependentAxis
              style={{ tickLabels: { fill: 'none' }, axis: { stroke: 'none' }, grid: { stroke: 'none' } }}
            />
            <ChartGroup offset={24}>
              <ChartBar
                data={currentData}
                name="current"
                barWidth={20}
                labels={({ datum }) => `${datum.y}`}
                labelComponent={<ChartTooltip renderInPortal={false} style={{ fontSize: 12, fill: '#151515' }} />}
                style={{ data: { fill: CURRENT_COLOR }, labels: { fontSize: 12, fill: '#151515' } }}
              />
              <ChartBar
                data={recommendedData}
                name="recommended"
                barWidth={20}
                labels={({ datum }) => `${datum.y}`}
                labelComponent={<ChartTooltip renderInPortal={false} style={{ fontSize: 12, fill: '#151515' }} />}
                style={{ data: { fill: RECOMMENDED_COLOR }, labels: { fontSize: 12, fill: '#151515' } }}
              />
            </ChartGroup>
          </Chart>
        </div>
      </div>
      {savingsCallout && (
        <div data-testid="vm-sizing-savings" style={{ marginTop: 8, fontSize: '0.875rem' }}>
          <Split hasGutter>
            <SplitItem>
              <Icon status="success">
                <TrendDownIcon />
              </Icon>
            </SplitItem>
            <SplitItem>
              {savingsCallout.percent != null
                ? intl.formatMessage(messages.visualInsightsVmSizingSavings, {
                    amount: savingsCallout.amount,
                    percent: savingsCallout.percent,
                  })
                : `${intl.formatMessage(messages.visualInsightsVmSizingSavings, {
                    amount: savingsCallout.amount,
                    percent: '—',
                  })}`}
            </SplitItem>
          </Split>
        </div>
      )}
    </div>
  );
};

export { VmSizingChart };
