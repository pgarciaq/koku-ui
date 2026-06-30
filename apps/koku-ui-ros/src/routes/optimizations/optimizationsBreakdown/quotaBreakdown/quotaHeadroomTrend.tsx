import { Card, CardBody, CardTitle, Title } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartLine,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { EmptyState, EmptyStateBody, EmptyStateVariant, Spinner } from '@patternfly/react-core';
import type { QuotaTrendEntry } from 'api/ros/recommendations';
import { fetchQuotaTrend } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';

interface QuotaHeadroomTrendProps {
  quotaId?: string;
}

const formatMillicores = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} cores`;
  }
  return `${value} m`;
};

const formatBytes = (value: number) => {
  const mib = value / (1024 * 1024);
  if (mib >= 1024) {
    return `${(mib / 1024).toFixed(1)} GiB`;
  }
  return `${mib.toFixed(0)} MiB`;
};

const QuotaHeadroomTrend: React.FC<QuotaHeadroomTrendProps> = ({ quotaId }) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [data, setData] = useState<QuotaTrendEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!quotaId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setHasError(false);
    fetchQuotaTrend(quotaId)
      .then(response => {
        setData(response?.data?.data ?? []);
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [quotaId]);

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

  const hasCpuData = useMemo(
    () => data.some(d => d.cpu_request_hard_millicores != null || d.cpu_request_used_millicores != null),
    [data]
  );

  const hasMemoryData = useMemo(
    () => data.some(d => d.memory_request_hard_bytes != null || d.memory_request_used_bytes != null),
    [data]
  );

  if (isLoading) {
    return <Spinner size="lg" aria-label={intl.formatMessage(messages.visualInsightsQuotaTrendTitle)} />;
  }

  if (hasError) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsQuotaTrendTitle)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsQuotaTrendError)}</EmptyStateBody>
      </EmptyState>
    );
  }

  if (!hasCpuData && !hasMemoryData) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsQuotaTrendTitle)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsQuotaTrendEmpty)}</EmptyStateBody>
      </EmptyState>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const chartHeight = 260;
  const hardLabel = intl.formatMessage(messages.visualInsightsQuotaTrendHardLimit);
  const usedLabel = intl.formatMessage(messages.visualInsightsQuotaTrendUsed);
  const legendData = [
    { name: hardLabel, symbol: { fill: '#06c', type: 'minus' } },
    { name: usedLabel, symbol: { fill: '#f4c145', type: 'minus' } },
  ];

  return (
    <div ref={containerRef}>
      <Title headingLevel="h3" size="md" style={{ marginBottom: 16 }}>
        {intl.formatMessage(messages.visualInsightsQuotaTrendTitle)}
      </Title>
      {hasCpuData && (
        <Card style={{ marginBottom: 24 }}>
          <CardTitle>{intl.formatMessage(messages.visualInsightsQuotaTrendCpuTitle)}</CardTitle>
          <CardBody>
            <div style={{ height: chartHeight }}>
              <Chart
                ariaDesc={intl.formatMessage(messages.visualInsightsQuotaTrendCpuDesc)}
                ariaTitle={intl.formatMessage(messages.visualInsightsQuotaTrendCpuTitle)}
                containerComponent={
                  <ChartVoronoiContainer
                    labels={({ datum }) => `${datum.x}: ${formatMillicores(datum.y)}`}
                  />
                }
                domainPadding={{ x: [20, 20] }}
                height={chartHeight}
                legendComponent={<ChartLegend data={legendData} />}
                legendPosition="bottom"
                padding={{ bottom: 70, left: 80, right: 30, top: 20 }}
                themeColor={ChartThemeColor.multiUnordered}
                width={width || 800}
              >
                <ChartAxis fixLabelOverlap />
                <ChartAxis dependentAxis showGrid tickFormat={tick => formatMillicores(tick)} />
                <ChartGroup>
                  <ChartLine
                    data={data
                      .filter(d => d.cpu_request_hard_millicores != null)
                      .map(d => ({ x: formatDate(d.date), y: d.cpu_request_hard_millicores }))}
                    interpolation="monotoneX"
                    name={hardLabel}
                    style={{ data: { stroke: '#06c', strokeDasharray: '8,4' } }}
                  />
                  <ChartLine
                    data={data
                      .filter(d => d.cpu_request_used_millicores != null)
                      .map(d => ({ x: formatDate(d.date), y: d.cpu_request_used_millicores }))}
                    interpolation="monotoneX"
                    name={usedLabel}
                    style={{ data: { stroke: '#f4c145' } }}
                  />
                </ChartGroup>
              </Chart>
            </div>
          </CardBody>
        </Card>
      )}
      {hasMemoryData && (
        <Card style={{ marginBottom: 24 }}>
          <CardTitle>{intl.formatMessage(messages.visualInsightsQuotaTrendMemoryTitle)}</CardTitle>
          <CardBody>
            <div style={{ height: chartHeight }}>
              <Chart
                ariaDesc={intl.formatMessage(messages.visualInsightsQuotaTrendMemoryDesc)}
                ariaTitle={intl.formatMessage(messages.visualInsightsQuotaTrendMemoryTitle)}
                containerComponent={
                  <ChartVoronoiContainer
                    labels={({ datum }) => `${datum.x}: ${formatBytes(datum.y)}`}
                  />
                }
                domainPadding={{ x: [20, 20] }}
                height={chartHeight}
                legendComponent={<ChartLegend data={legendData} />}
                legendPosition="bottom"
                padding={{ bottom: 70, left: 80, right: 30, top: 20 }}
                themeColor={ChartThemeColor.multiUnordered}
                width={width || 800}
              >
                <ChartAxis fixLabelOverlap />
                <ChartAxis dependentAxis showGrid tickFormat={tick => formatBytes(tick)} />
                <ChartGroup>
                  <ChartLine
                    data={data
                      .filter(d => d.memory_request_hard_bytes != null)
                      .map(d => ({ x: formatDate(d.date), y: d.memory_request_hard_bytes }))}
                    interpolation="monotoneX"
                    name={hardLabel}
                    style={{ data: { stroke: '#06c', strokeDasharray: '8,4' } }}
                  />
                  <ChartLine
                    data={data
                      .filter(d => d.memory_request_used_bytes != null)
                      .map(d => ({ x: formatDate(d.date), y: d.memory_request_used_bytes }))}
                    interpolation="monotoneX"
                    name={usedLabel}
                    style={{ data: { stroke: '#f4c145' } }}
                  />
                </ChartGroup>
              </Chart>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export { QuotaHeadroomTrend };
