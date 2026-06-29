import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  createContainer,
} from '@patternfly/react-charts/victory';
import { EmptyState, EmptyStateBody, EmptyStateVariant, Title } from '@patternfly/react-core';
import messages from 'locales/messages';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';
import ChartTheme from 'routes/components/charts/theme';

interface PlotsDataBucket {
  cpuThrottle?: {
    p95?: number;
    max?: number;
    format?: string;
  };
  cpuUsage?: {
    p50?: number;
    p95?: number;
    p99?: number;
    max?: number;
    format?: string;
  };
}

interface CpuThrottleTrendProps {
  plotsData?: Record<string, PlotsDataBucket>;
}

const THROTTLE_P95_COLOR = '#F4B678';
const THROTTLE_MAX_COLOR = '#C9190B';
const CPU_USAGE_P95_COLOR = '#0066CC';

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const CpuThrottleTrend: React.FC<CpuThrottleTrendProps> = ({ plotsData }) => {
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

  if (!plotsData) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsCpuThrottleTrend)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsCpuThrottleEmpty)}</EmptyStateBody>
      </EmptyState>
    );
  }

  const sortedDates = Object.keys(plotsData).sort();

  const hasThrottleData = sortedDates.some(date => {
    const bucket = plotsData[date];
    return bucket?.cpuThrottle && (bucket.cpuThrottle.p95 > 0 || bucket.cpuThrottle.max > 0);
  });

  if (!hasThrottleData) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsCpuThrottleTrend)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsCpuThrottleEmpty)}</EmptyStateBody>
      </EmptyState>
    );
  }

  const throttleP95Data = sortedDates.map(date => ({
    x: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    y: plotsData[date]?.cpuThrottle?.p95 ?? 0,
    date,
    name: 'throttleP95',
  }));

  const throttleMaxData = sortedDates.map(date => ({
    x: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    y: plotsData[date]?.cpuThrottle?.max ?? 0,
    date,
    name: 'throttleMax',
  }));

  const cpuUsageP95Data = sortedDates.map(date => ({
    x: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    y: plotsData[date]?.cpuUsage?.p95 ?? 0,
    date,
    name: 'cpuUsageP95',
  }));

  const legendData = [
    {
      childName: 'throttleP95',
      name: intl.formatMessage(messages.visualInsightsCpuThrottleP95),
      symbol: { fill: THROTTLE_P95_COLOR, type: 'square' },
    },
    {
      childName: 'throttleMax',
      name: intl.formatMessage(messages.visualInsightsCpuThrottleMax),
      symbol: { fill: THROTTLE_MAX_COLOR, type: 'minus' },
    },
    {
      childName: 'cpuUsageP95',
      name: intl.formatMessage(messages.visualInsightsCpuUsageP95),
      symbol: { fill: CPU_USAGE_P95_COLOR, type: 'minus' },
    },
  ];

  const container = (
    <CursorVoronoiContainer
      cursorDimension="x"
      labels={({ datum }) => `${datum.y?.toFixed(3)} cores`}
      mouseFollowTooltips
      voronoiDimension="x"
      labelComponent={<ChartLegendTooltip legendData={legendData} title={datum => datum.x} />}
    />
  );

  const chartHeight = 250;

  return (
    <div ref={containerRef}>
      <div style={{ height: chartHeight }}>
        <Chart
          ariaTitle={intl.formatMessage(messages.visualInsightsCpuThrottleTrend)}
          ariaDesc={intl.formatMessage(messages.visualInsightsCpuThrottleTrend)}
          containerComponent={container}
          height={chartHeight}
          legendComponent={<ChartLegend data={legendData} height={25} gutter={20} responsive={false} />}
          legendPosition="bottom"
          padding={{ bottom: 75, left: 60, right: 30, top: 20 }}
          theme={ChartTheme}
          width={width}
        >
          <ChartAxis fixLabelOverlap />
          <ChartAxis dependentAxis showGrid label="Cores" />
          <ChartArea
            data={throttleP95Data}
            interpolation="monotoneX"
            name="throttleP95"
            style={{
              data: {
                fill: THROTTLE_P95_COLOR,
                fillOpacity: 0.3,
                stroke: THROTTLE_P95_COLOR,
                strokeWidth: 1,
              },
            }}
          />
          <ChartLine
            data={throttleMaxData}
            interpolation="monotoneX"
            name="throttleMax"
            style={{
              data: {
                stroke: THROTTLE_MAX_COLOR,
                strokeWidth: 2,
                strokeDasharray: '4,2',
              },
            }}
          />
          <ChartLine
            data={cpuUsageP95Data}
            interpolation="monotoneX"
            name="cpuUsageP95"
            style={{
              data: {
                stroke: CPU_USAGE_P95_COLOR,
                strokeWidth: 2,
              },
            }}
          />
        </Chart>
      </div>
    </div>
  );
};

export { CpuThrottleTrend };
