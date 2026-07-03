import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import type { QuotaRecommendationHistoryEntry } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';

import {
  formatRecordedAt,
  getChartYAxisLabel,
  type QuotaHistoryResource,
  toChartValue,
} from './quotaHistoryUtils';

interface QuotaBreakdownHistoryChartOwnProps {
  entries: QuotaRecommendationHistoryEntry[];
  resource: QuotaHistoryResource;
  resourceLabel: string;
}

const QuotaBreakdownHistoryChart: React.FC<QuotaBreakdownHistoryChartOwnProps> = ({
  entries,
  resource,
  resourceLabel,
}) => {
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

  const chartData = useMemo(() => {
    if (!entries.length) {
      return null;
    }

    const hard = entries.map(entry => ({
      x: formatRecordedAt(entry.recorded_at),
      y: toChartValue(resource, entry.current_hard) ?? 0,
    }));
    const used = entries.map(entry => ({
      x: formatRecordedAt(entry.recorded_at),
      y: toChartValue(resource, entry.current_used) ?? 0,
    }));
    const recommended = entries.map(entry => ({
      x: formatRecordedAt(entry.recorded_at),
      y: toChartValue(resource, entry.recommended_hard) ?? 0,
    }));
    const utilization = entries.map(entry => ({
      x: formatRecordedAt(entry.recorded_at),
      y: entry.utilization_percent ?? 0,
    }));

    return { hard, recommended, used, utilization };
  }, [entries, resource]);

  if (!chartData) {
    return null;
  }

  const yAxisLabel = getChartYAxisLabel(resource);
  const utilizationTitle = intl.formatMessage(messages.quotaHistoryUtilizationTitle);

  const chartWidth = width > 0 ? width : 800;

  return (
    <div ref={containerRef}>
      <Card style={{ marginBottom: 24 }}>
        <CardTitle>{resourceLabel}</CardTitle>
        <CardBody>
          <div style={{ height: 280 }}>
            <Chart
              ariaDesc={resourceLabel}
              ariaTitle={resourceLabel}
              containerComponent={
                <ChartVoronoiContainer
                  labels={({ datum }) => {
                    const yValue = typeof datum.y === 'number' ? datum.y.toFixed(2) : datum.y;
                    return `${datum.x}: ${yValue} ${yAxisLabel}`;
                  }}
                />
              }
              domainPadding={{ x: [20, 20] }}
              height={260}
              padding={{ bottom: 60, left: 70, right: 30, top: 20 }}
              themeColor={ChartThemeColor.multiUnordered}
              width={chartWidth}
            >
              <ChartAxis tickFormat={tick => tick} />
              <ChartAxis dependentAxis showGrid tickFormat={tick => `${tick} ${yAxisLabel}`} />
              <ChartGroup>
                <ChartLine
                  data={chartData.hard}
                  interpolation="monotoneX"
                  name={intl.formatMessage(messages.quotaHardLimit)}
                />
                <ChartLine
                  data={chartData.used}
                  interpolation="monotoneX"
                  name={intl.formatMessage(messages.quotaUsed)}
                />
                <ChartLine
                  data={chartData.recommended}
                  interpolation="monotoneX"
                  name={intl.formatMessage(messages.quotaRecommended)}
                />
              </ChartGroup>
            </Chart>
          </div>
        </CardBody>
      </Card>
      <Card style={{ marginBottom: 24 }}>
        <CardTitle>{utilizationTitle}</CardTitle>
        <CardBody>
          <div style={{ height: 220 }}>
            <Chart
              ariaDesc={utilizationTitle}
              ariaTitle={utilizationTitle}
              containerComponent={
                <ChartVoronoiContainer labels={({ datum }) => `${datum.x}: ${datum.y?.toFixed?.(0) ?? datum.y}%`} />
              }
              domain={{ y: [0, 100] }}
              domainPadding={{ x: [20, 20] }}
              height={200}
              padding={{ bottom: 60, left: 70, right: 30, top: 20 }}
              themeColor={ChartThemeColor.blue}
              width={chartWidth}
            >
              <ChartAxis tickFormat={tick => tick} />
              <ChartAxis dependentAxis showGrid tickFormat={tick => `${tick}%`} />
              <ChartGroup>
                <ChartLine
                  data={chartData.utilization}
                  interpolation="monotoneX"
                  name={intl.formatMessage(messages.quotaHistoryUtilization)}
                />
              </ChartGroup>
            </Chart>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export { QuotaBreakdownHistoryChart };
