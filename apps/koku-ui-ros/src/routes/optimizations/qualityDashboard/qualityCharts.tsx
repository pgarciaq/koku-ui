import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartBar,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  createContainer,
} from '@patternfly/react-charts/victory';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import type { QualityRow } from 'api/ros/quality';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';
import ChartTheme from 'routes/components/charts/theme';

interface QualityChartsProps {
  data: QualityRow[];
}

interface DayBucket {
  date: string;
  label: string;
  stabilitySum: number;
  stabilityCount: number;
  adoptedCount: number;
  totalCount: number;
  oomSum: number;
}

const STABILITY_COLOR = '#06C';
const ADOPTION_COLOR = '#3E8635';
const OOM_COLOR = '#C9190B';
const CHART_HEIGHT = 250;

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const QualityCharts: React.FC<QualityChartsProps> = ({ data }) => {
  const intl = useIntl();
  const stabilityRef = useRef<HTMLDivElement>(null);
  const adoptionRef = useRef<HTMLDivElement>(null);
  const oomRef = useRef<HTMLDivElement>(null);
  const [stabilityWidth, setStabilityWidth] = useState(0);
  const [adoptionWidth, setAdoptionWidth] = useState(0);
  const [oomWidth, setOomWidth] = useState(0);

  useEffect(() => {
    const observers: (() => void)[] = [];
    if (stabilityRef.current) {
      observers.push(
        getResizeObserver(stabilityRef.current, () => {
          if (stabilityRef.current) setStabilityWidth(stabilityRef.current.clientWidth);
        })
      );
    }
    if (adoptionRef.current) {
      observers.push(
        getResizeObserver(adoptionRef.current, () => {
          if (adoptionRef.current) setAdoptionWidth(adoptionRef.current.clientWidth);
        })
      );
    }
    if (oomRef.current) {
      observers.push(
        getResizeObserver(oomRef.current, () => {
          if (oomRef.current) setOomWidth(oomRef.current.clientWidth);
        })
      );
    }
    return () => observers.forEach(fn => fn?.());
  }, []);

  const buckets = useMemo(() => {
    const map = new Map<string, DayBucket>();
    for (const row of data) {
      const dateStr = row.measured_at.slice(0, 10);
      let bucket = map.get(dateStr);
      if (!bucket) {
        bucket = {
          date: dateStr,
          label: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          stabilitySum: 0,
          stabilityCount: 0,
          adoptedCount: 0,
          totalCount: 0,
          oomSum: 0,
        };
        map.set(dateStr, bucket);
      }
      if (row.stability_pct != null) {
        bucket.stabilitySum += row.stability_pct;
        bucket.stabilityCount++;
      }
      if (row.adoption_detected) {
        bucket.adoptedCount++;
      }
      bucket.totalCount++;
      bucket.oomSum += row.oom_events_after_rec ?? 0;
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const stabilityData = buckets.map(b => ({
    x: b.label,
    y: b.stabilityCount > 0 ? parseFloat(((b.stabilitySum / b.stabilityCount) * 100).toFixed(1)) : 0,
    name: 'stability',
  }));

  const adoptionData = buckets.map(b => ({
    x: b.label,
    y: b.totalCount > 0 ? parseFloat(((b.adoptedCount / b.totalCount) * 100).toFixed(1)) : 0,
    name: 'adoption',
  }));

  const oomData = buckets.map(b => ({
    x: b.label,
    y: b.oomSum,
    name: 'oom',
  }));

  const stabilityLegend = [
    { childName: 'stability', name: intl.formatMessage(messages.qualityChartStabilityLegend), symbol: { fill: STABILITY_COLOR, type: 'minus' } },
  ];
  const adoptionLegend = [
    { childName: 'adoption', name: intl.formatMessage(messages.qualityChartAdoptionLegend), symbol: { fill: ADOPTION_COLOR, type: 'square' } },
  ];
  const oomLegend = [
    { childName: 'oom', name: intl.formatMessage(messages.qualityChartOomLegend), symbol: { fill: OOM_COLOR, type: 'square' } },
  ];

  if (!buckets.length) {
    return null;
  }

  return (
    <Grid hasGutter style={{ marginBottom: 16 }}>
      <GridItem xl={6} lg={12}>
        <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>
          {intl.formatMessage(messages.qualityChartStabilityTitle)}
        </Title>
        <div ref={stabilityRef}>
          <div style={{ height: CHART_HEIGHT }}>
            <Chart
              ariaTitle={intl.formatMessage(messages.qualityChartStabilityTitle)}
              containerComponent={
                <CursorVoronoiContainer
                  cursorDimension="x"
                  labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                  mouseFollowTooltips
                  voronoiDimension="x"
                  labelComponent={<ChartLegendTooltip legendData={stabilityLegend} title={datum => datum.x} />}
                />
              }
              domain={{ y: [0, 100] }}
              height={CHART_HEIGHT}
              legendComponent={<ChartLegend data={stabilityLegend} height={20} gutter={20} responsive={false} />}
              legendPosition="bottom"
              padding={{ bottom: 60, left: 50, right: 20, top: 10 }}
              theme={ChartTheme}
              width={stabilityWidth}
            >
              <ChartAxis fixLabelOverlap />
              <ChartAxis dependentAxis showGrid tickFormat={t => `${t}%`} />
              <ChartLine
                data={stabilityData}
                interpolation="monotoneX"
                name="stability"
                style={{ data: { stroke: STABILITY_COLOR, strokeWidth: 2 } }}
              />
            </Chart>
          </div>
        </div>
      </GridItem>
      <GridItem xl={6} lg={12}>
        <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>
          {intl.formatMessage(messages.qualityChartAdoptionTitle)}
        </Title>
        <div ref={adoptionRef}>
          <div style={{ height: CHART_HEIGHT }}>
            <Chart
              ariaTitle={intl.formatMessage(messages.qualityChartAdoptionTitle)}
              containerComponent={
                <CursorVoronoiContainer
                  cursorDimension="x"
                  labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                  mouseFollowTooltips
                  voronoiDimension="x"
                  labelComponent={<ChartLegendTooltip legendData={adoptionLegend} title={datum => datum.x} />}
                />
              }
              domain={{ y: [0, 100] }}
              height={CHART_HEIGHT}
              legendComponent={<ChartLegend data={adoptionLegend} height={20} gutter={20} responsive={false} />}
              legendPosition="bottom"
              padding={{ bottom: 60, left: 50, right: 20, top: 10 }}
              theme={ChartTheme}
              width={adoptionWidth}
            >
              <ChartAxis fixLabelOverlap />
              <ChartAxis dependentAxis showGrid tickFormat={t => `${t}%`} />
              <ChartArea
                data={adoptionData}
                interpolation="monotoneX"
                name="adoption"
                style={{ data: { fill: ADOPTION_COLOR, fillOpacity: 0.3, stroke: ADOPTION_COLOR, strokeWidth: 2 } }}
              />
            </Chart>
          </div>
        </div>
      </GridItem>
      <GridItem xl={6} lg={12}>
        <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>
          {intl.formatMessage(messages.qualityChartOomTitle)}
        </Title>
        <div ref={oomRef}>
          <div style={{ height: CHART_HEIGHT }}>
            <Chart
              ariaTitle={intl.formatMessage(messages.qualityChartOomTitle)}
              containerComponent={
                <CursorVoronoiContainer
                  cursorDimension="x"
                  labels={({ datum }) => `${datum.y}`}
                  mouseFollowTooltips
                  voronoiDimension="x"
                  labelComponent={<ChartLegendTooltip legendData={oomLegend} title={datum => datum.x} />}
                />
              }
              height={CHART_HEIGHT}
              legendComponent={<ChartLegend data={oomLegend} height={20} gutter={20} responsive={false} />}
              legendPosition="bottom"
              padding={{ bottom: 60, left: 50, right: 20, top: 10 }}
              theme={ChartTheme}
              width={oomWidth}
            >
              <ChartAxis fixLabelOverlap />
              <ChartAxis dependentAxis showGrid />
              <ChartBar
                data={oomData}
                name="oom"
                style={{ data: { fill: OOM_COLOR } }}
              />
            </Chart>
          </div>
        </div>
      </GridItem>
    </Grid>
  );
};

export { QualityCharts };
