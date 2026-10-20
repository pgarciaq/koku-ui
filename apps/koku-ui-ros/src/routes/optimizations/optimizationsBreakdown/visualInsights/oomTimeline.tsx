import { Chart, ChartAxis, ChartLegendTooltip, ChartScatter, createContainer } from '@patternfly/react-charts/victory';
import { EmptyState, EmptyStateBody, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import type { OomTimelineEntry } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';
import ChartTheme from 'routes/components/charts/theme';

// Presentational OOM tile (#696): the owning section fetches the data so it
// can decide visibility without mounting/unmounting the chart (which is what
// produced the flash-then-hide). An error state is distinct from an empty
// result so a failed fetch never reads as "no OOM events".
interface OomTimelineProps {
  entries?: OomTimelineEntry[];
  isLoading: boolean;
  hasError: boolean;
}

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const OomTimeline: React.FC<OomTimelineProps> = ({ entries, isLoading, hasError }) => {
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

  const hasOomData = useMemo(
    () => !!entries && entries.length > 0 && entries.some(d => d.oom_kill_count > 0),
    [entries]
  );

  if (isLoading) {
    return <Spinner size="lg" aria-label={intl.formatMessage(messages.visualInsightsOomTimeline)} />;
  }

  if (hasError) {
    // #696: a failed fetch renders an error state — it must never read as
    // "no OOM events", which is what made the section collapse.
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsOomTimeline)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsOomTimelineError)}</EmptyStateBody>
      </EmptyState>
    );
  }

  if (!hasOomData) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsOomTimeline)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsOomTimelineEmpty)}</EmptyStateBody>
      </EmptyState>
    );
  }

  const chartData = (entries ?? [])
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
