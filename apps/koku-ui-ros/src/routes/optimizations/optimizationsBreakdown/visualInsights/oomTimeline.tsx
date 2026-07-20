import { Chart, ChartAxis, ChartLegendTooltip, ChartScatter, createContainer } from '@patternfly/react-charts/victory';
import { EmptyState, EmptyStateBody, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import type { OomTimelineEntry } from 'api/ros/recommendations';
import { fetchOomTimeline } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';
import ChartTheme from 'routes/components/charts/theme';

interface OomTimelineProps {
  recommendationId: string;
  onDataResolved?: (hasData: boolean) => void;
}

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const OomTimeline: React.FC<OomTimelineProps> = ({ recommendationId, onDataResolved }) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [data, setData] = useState<OomTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!recommendationId) {
      setIsLoading(false);
      onDataResolved?.(false);
      return;
    }
    setIsLoading(true);
    setHasError(false);
    fetchOomTimeline(recommendationId)
      .then(response => {
        const entries = response?.data?.data ?? [];
        setData(entries);
        onDataResolved?.(entries.length > 0 && entries.some(d => d.oom_kill_count > 0));
      })
      .catch(() => {
        setHasError(true);
        onDataResolved?.(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [recommendationId]);

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

  const hasOomData = useMemo(() => data.length > 0 && data.some(d => d.oom_kill_count > 0), [data]);

  if (isLoading) {
    return <Spinner size="lg" aria-label={intl.formatMessage(messages.visualInsightsOomTimeline)} />;
  }

  if (hasError || !hasOomData) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsOomTimeline)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsOomTimelineEmpty)}</EmptyStateBody>
      </EmptyState>
    );
  }

  const chartData = data
    .filter(d => d.oom_kill_count > 0)
    .map(d => ({
      x: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      y: d.oom_kill_count,
      date: d.date,
      name: 'oomKills',
    }));

  const legendData = [{ childName: 'oomKills', name: 'OOM Kills', symbol: { fill: '#0066CC', type: 'circle' } }];

  const container = (
    <CursorVoronoiContainer
      cursorDimension="x"
      labels={({ datum }) =>
        intl.formatMessage(messages.visualInsightsOomTimelineTooltip, {
          date: new Date(datum.date).toLocaleDateString(),
          count: datum.y,
        })
      }
      mouseFollowTooltips
      voronoiDimension="x"
      labelComponent={<ChartLegendTooltip legendData={legendData} title={datum => datum.x} />}
    />
  );

  const chartHeight = 200;

  return (
    <div ref={containerRef}>
      <div style={{ height: chartHeight }}>
        <Chart
          ariaTitle={intl.formatMessage(messages.visualInsightsOomTimeline)}
          ariaDesc={intl.formatMessage(messages.visualInsightsOomTimeline)}
          containerComponent={container}
          height={chartHeight}
          padding={{ bottom: 50, left: 50, right: 30, top: 20 }}
          theme={ChartTheme}
          width={width}
        >
          <ChartAxis fixLabelOverlap />
          <ChartAxis dependentAxis showGrid label="OOM Kill Count" />
          <ChartScatter
            data={chartData}
            name="oomKills"
            style={{
              data: {
                fill: '#0066CC',
                stroke: '#0066CC',
                strokeWidth: 1,
              },
            }}
            size={5}
          />
        </Chart>
      </div>
    </div>
  );
};

export { OomTimeline };
