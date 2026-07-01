import {
  Chart,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  createContainer,
} from '@patternfly/react-charts/victory';
import { EmptyState, EmptyStateBody, EmptyStateVariant, Grid, GridItem, Title } from '@patternfly/react-core';
import type { HistoryRow } from 'api/ros/recommendationHistory';
import messages from 'locales/messages';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';
import ChartTheme from 'routes/components/charts/theme';

interface ContainerHistoryChartProps {
  data: HistoryRow[];
}

const CPU_REQUEST_COLOR = '#0066CC';
const CPU_LIMIT_COLOR = '#004B95';
const MEM_REQUEST_COLOR = '#3E8635';
const MEM_LIMIT_COLOR = '#1E4D2B';

const CHART_HEIGHT = 250;

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const ContainerHistoryChart: React.FC<ContainerHistoryChartProps> = ({ data }) => {
  const intl = useIntl();
  const cpuContainerRef = useRef<HTMLDivElement>(null);
  const memContainerRef = useRef<HTMLDivElement>(null);
  const [cpuWidth, setCpuWidth] = useState(0);
  const [memWidth, setMemWidth] = useState(0);

  useEffect(() => {
    if (cpuContainerRef.current) {
      const unobserve = getResizeObserver(cpuContainerRef.current, () => {
        if (cpuContainerRef.current) {
          setCpuWidth(cpuContainerRef.current.clientWidth);
        }
      });
      return () => {
        if (unobserve) {
          unobserve();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (memContainerRef.current) {
      const unobserve = getResizeObserver(memContainerRef.current, () => {
        if (memContainerRef.current) {
          setMemWidth(memContainerRef.current.clientWidth);
        }
      });
      return () => {
        if (unobserve) {
          unobserve();
        }
      };
    }
  }, []);

  if (!data || data.length === 0) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.historyChartTitle)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.historyChartEmpty)}</EmptyStateBody>
      </EmptyState>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const cpuRequestData = sortedData.map(row => ({
    x: formatDate(row.recorded_at),
    y: row.rec_cpu_request_millicores ?? 0,
    name: 'cpuRequest',
  }));

  const cpuLimitData = sortedData.map(row => ({
    x: formatDate(row.recorded_at),
    y: row.rec_cpu_limit_millicores ?? 0,
    name: 'cpuLimit',
  }));

  const memRequestData = sortedData.map(row => ({
    x: formatDate(row.recorded_at),
    y: row.rec_memory_request_kib != null ? Math.round(row.rec_memory_request_kib / 1024) : 0,
    name: 'memRequest',
  }));

  const memLimitData = sortedData.map(row => ({
    x: formatDate(row.recorded_at),
    y: row.rec_memory_limit_kib != null ? Math.round(row.rec_memory_limit_kib / 1024) : 0,
    name: 'memLimit',
  }));

  const cpuLegendData = [
    {
      childName: 'cpuRequest',
      name: intl.formatMessage(messages.historyChartCpuRequest),
      symbol: { fill: CPU_REQUEST_COLOR, type: 'minus' },
    },
    {
      childName: 'cpuLimit',
      name: intl.formatMessage(messages.historyChartCpuLimit),
      symbol: { fill: CPU_LIMIT_COLOR, type: 'minus' },
    },
  ];

  const memLegendData = [
    {
      childName: 'memRequest',
      name: intl.formatMessage(messages.historyChartMemRequest),
      symbol: { fill: MEM_REQUEST_COLOR, type: 'minus' },
    },
    {
      childName: 'memLimit',
      name: intl.formatMessage(messages.historyChartMemLimit),
      symbol: { fill: MEM_LIMIT_COLOR, type: 'minus' },
    },
  ];

  const cpuContainer = (
    <CursorVoronoiContainer
      cursorDimension="x"
      labels={({ datum }) => `${datum.y} mc`}
      mouseFollowTooltips
      voronoiDimension="x"
      labelComponent={<ChartLegendTooltip legendData={cpuLegendData} title={datum => datum.x} />}
    />
  );

  const memContainer = (
    <CursorVoronoiContainer
      cursorDimension="x"
      labels={({ datum }) => `${datum.y} MiB`}
      mouseFollowTooltips
      voronoiDimension="x"
      labelComponent={<ChartLegendTooltip legendData={memLegendData} title={datum => datum.x} />}
    />
  );

  return (
    <Grid hasGutter>
      <GridItem md={6}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.historyChartCpuTitle)}
        </Title>
        <div ref={cpuContainerRef}>
          <div style={{ height: CHART_HEIGHT }}>
            <Chart
              ariaTitle={intl.formatMessage(messages.historyChartCpuTitle)}
              ariaDesc={intl.formatMessage(messages.historyChartCpuDesc)}
              containerComponent={cpuContainer}
              height={CHART_HEIGHT}
              legendComponent={<ChartLegend data={cpuLegendData} height={25} gutter={20} responsive={false} />}
              legendPosition="bottom"
              padding={{ bottom: 75, left: 70, right: 30, top: 20 }}
              theme={ChartTheme}
              width={cpuWidth}
            >
              <ChartAxis fixLabelOverlap />
              <ChartAxis dependentAxis showGrid label={intl.formatMessage(messages.historyChartCpuYAxis)} />
              <ChartLine
                data={cpuRequestData}
                interpolation="monotoneX"
                name="cpuRequest"
                style={{ data: { stroke: CPU_REQUEST_COLOR, strokeWidth: 2 } }}
              />
              <ChartLine
                data={cpuLimitData}
                interpolation="monotoneX"
                name="cpuLimit"
                style={{ data: { stroke: CPU_LIMIT_COLOR, strokeWidth: 2, strokeDasharray: '6,3' } }}
              />
            </Chart>
          </div>
        </div>
      </GridItem>
      <GridItem md={6}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.historyChartMemTitle)}
        </Title>
        <div ref={memContainerRef}>
          <div style={{ height: CHART_HEIGHT }}>
            <Chart
              ariaTitle={intl.formatMessage(messages.historyChartMemTitle)}
              ariaDesc={intl.formatMessage(messages.historyChartMemDesc)}
              containerComponent={memContainer}
              height={CHART_HEIGHT}
              legendComponent={<ChartLegend data={memLegendData} height={25} gutter={20} responsive={false} />}
              legendPosition="bottom"
              padding={{ bottom: 75, left: 70, right: 30, top: 20 }}
              theme={ChartTheme}
              width={memWidth}
            >
              <ChartAxis fixLabelOverlap />
              <ChartAxis dependentAxis showGrid label={intl.formatMessage(messages.historyChartMemYAxis)} />
              <ChartLine
                data={memRequestData}
                interpolation="monotoneX"
                name="memRequest"
                style={{ data: { stroke: MEM_REQUEST_COLOR, strokeWidth: 2 } }}
              />
              <ChartLine
                data={memLimitData}
                interpolation="monotoneX"
                name="memLimit"
                style={{ data: { stroke: MEM_LIMIT_COLOR, strokeWidth: 2, strokeDasharray: '6,3' } }}
              />
            </Chart>
          </div>
        </div>
      </GridItem>
    </Grid>
  );
};

export { ContainerHistoryChart };
