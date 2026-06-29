import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import type { PvcHistoricalUsagePoint } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { formatStorageBytes } from 'routes/optimizations/optimizationsTable/storageTableUtils';

const PROJECTION_HORIZON_DAYS = 90;

interface PvcBreakdownUsageChartOwnProps {
  growthBytesPerDay?: number | null;
  daysToFull?: number | null;
  historicalUsage?: PvcHistoricalUsagePoint[];
  showProjection?: boolean;
}

const toGiB = (bytes?: number): number | null => {
  if (bytes == null) {
    return null;
  }
  return bytes / 1024 ** 3;
};

export interface ProjectionPoint {
  x: string;
  y: number;
}

/**
 * Compute projected usage data points starting from the last historical average,
 * extending forward by growth rate up to a capped horizon.
 */
export function computeProjectionPoints(
  historicalUsage: PvcHistoricalUsagePoint[],
  growthBytesPerDay: number,
  daysToFull: number | null | undefined
): ProjectionPoint[] {
  if (!historicalUsage.length || growthBytesPerDay <= 0) {
    return [];
  }

  const lastPoint = historicalUsage[historicalUsage.length - 1];
  const lastAvgGiB = toGiB(lastPoint.usage_bytes_avg) ?? 0;
  const growthGiBPerDay = growthBytesPerDay / 1024 ** 3;
  const horizonDays = daysToFull != null ? Math.min(daysToFull, PROJECTION_HORIZON_DAYS) : PROJECTION_HORIZON_DAYS;

  const lastDate = new Date(lastPoint.date);
  const points: ProjectionPoint[] = [];

  for (let i = 0; i <= horizonDays; i++) {
    const d = new Date(lastDate);
    d.setDate(lastDate.getDate() + i);
    points.push({
      x: d.toISOString().slice(0, 10),
      y: lastAvgGiB + growthGiBPerDay * i,
    });
  }
  return points;
}

const PvcBreakdownUsageChart: React.FC<PvcBreakdownUsageChartOwnProps> = ({
  growthBytesPerDay,
  daysToFull,
  historicalUsage,
  showProjection = false,
}) => {
  const intl = useIntl();

  const chartData = useMemo(() => {
    if (!historicalUsage?.length) {
      return null;
    }

    const capacity = historicalUsage.map(point => ({
      x: point.date,
      y: toGiB(point.capacity_bytes) ?? 0,
    }));
    const usageMax = historicalUsage.map(point => ({
      x: point.date,
      y: toGiB(point.usage_bytes_max) ?? 0,
    }));
    const usageAvg = historicalUsage.map(point => ({
      x: point.date,
      y: toGiB(point.usage_bytes_avg) ?? 0,
    }));

    return { capacity, usageAvg, usageMax };
  }, [historicalUsage]);

  const projectionData = useMemo(() => {
    if (!showProjection || !historicalUsage?.length || !growthBytesPerDay || growthBytesPerDay <= 0) {
      return null;
    }
    const points = computeProjectionPoints(historicalUsage, growthBytesPerDay, daysToFull);
    return points.length > 1 ? points : null;
  }, [showProjection, historicalUsage, growthBytesPerDay, daysToFull]);

  const exhaustionLabel = useMemo(() => {
    if (!projectionData || daysToFull == null || daysToFull <= 0) {
      return undefined;
    }
    if (daysToFull > PROJECTION_HORIZON_DAYS) {
      return undefined;
    }
    const lastHistDate = new Date(historicalUsage![historicalUsage!.length - 1].date);
    const exhaustionDate = new Date(lastHistDate);
    exhaustionDate.setDate(lastHistDate.getDate() + daysToFull);
    return intl.formatMessage(messages.pvcProjectionExhaustionDate, {
      date: exhaustionDate.toLocaleDateString(),
    });
  }, [projectionData, daysToFull, historicalUsage, intl]);

  if (!chartData) {
    return null;
  }

  return (
    <Card>
      <CardTitle>{intl.formatMessage(messages.pvcUsageHistoryTitle)}</CardTitle>
      <CardBody>
        <div style={{ height: 280 }}>
          <Chart
            ariaDesc={intl.formatMessage(messages.pvcUsageHistoryTitle)}
            ariaTitle={intl.formatMessage(messages.pvcUsageHistoryTitle)}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  const label = `${datum.x}: ${datum.y?.toFixed(2)} GiB`;
                  if (datum._isExhaustion && exhaustionLabel) {
                    return `${label}\n${exhaustionLabel}`;
                  }
                  return label;
                }}
              />
            }
            domainPadding={{ x: [20, 20] }}
            height={260}
            padding={{ bottom: 60, left: 70, right: 30, top: 20 }}
            themeColor={ChartThemeColor.multiUnordered}
            width={800}
          >
            <ChartAxis tickFormat={tick => tick} />
            <ChartAxis dependentAxis showGrid tickFormat={tick => `${tick} GiB`} />
            <ChartGroup>
              <ChartArea
                data={chartData.usageMax}
                interpolation="monotoneX"
                name={intl.formatMessage(messages.pvcUsageMax)}
              />
              <ChartLine
                data={chartData.capacity}
                interpolation="monotoneX"
                name={intl.formatMessage(messages.pvcCapacity)}
              />
              <ChartLine
                data={chartData.usageAvg}
                interpolation="monotoneX"
                name={intl.formatMessage(messages.pvcUsageAvg)}
              />
              {projectionData && (
                <ChartLine
                  data={
                    daysToFull != null && daysToFull > 0 && daysToFull <= PROJECTION_HORIZON_DAYS
                      ? projectionData.map((pt, idx) => ({
                          ...pt,
                          _isExhaustion: idx === projectionData.length - 1,
                        }))
                      : projectionData
                  }
                  interpolation="linear"
                  name={intl.formatMessage(messages.pvcProjectionLine)}
                  style={{
                    data: {
                      strokeDasharray: '6,4',
                      strokeWidth: 2,
                    },
                  }}
                />
              )}
            </ChartGroup>
          </Chart>
        </div>
        <div style={{ fontSize: 'var(--pf-t--global--font--size--sm)', marginTop: 8 }}>
          {intl.formatMessage(messages.pvcUsageHistoryCaption, {
            capacity: formatStorageBytes(historicalUsage?.[historicalUsage.length - 1]?.capacity_bytes),
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export { PvcBreakdownUsageChart };
