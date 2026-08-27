import {
  Chart,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  ChartThreshold,
  createContainer,
} from '@patternfly/react-charts/victory';
import type { NodeDailyDigestItem } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';

interface NodePeakHoursUsageChartProps {
  dailyDigests: NodeDailyDigestItem[];
  metricKey: 'cpu' | 'memory';
  /** Absolute cores (CPU) or GiB (memory) — Peak hours recommendation only. */
  recommendedValue?: number | null;
}

const P95_COLOR = '#0066CC';
const P50_COLOR = '#8BC1F7';
const RECOMMENDED_COLOR = '#EC7A08';
const CHART_HEIGHT = 220;

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const NodePeakHoursUsageChart: React.FC<NodePeakHoursUsageChartProps> = ({
  dailyDigests,
  metricKey,
  recommendedValue,
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

  const isCpu = metricKey === 'cpu';
  const title = intl.formatMessage(
    isCpu ? messages.visualInsightsNodePeakHoursCpuTitle : messages.visualInsightsNodePeakHoursMemoryTitle
  );
  const ariaDesc = intl.formatMessage(
    isCpu ? messages.visualInsightsNodePeakHoursCpuDesc : messages.visualInsightsNodePeakHoursMemoryDesc
  );
  const p95Label = intl.formatMessage(messages.visualInsightsVmTrendP95Usage);
  const p50Label = intl.formatMessage(messages.visualInsightsPeakHoursP50Usage);
  const recLabel = intl.formatMessage(messages.visualInsightsVmTrendRecommended);
  const unitLabel = isCpu ? 'cores' : 'GiB';

  const { p95Data, p50Data, thresholdData, maxValue } = useMemo(() => {
    const sorted = [...dailyDigests].sort(
      (a, b) => new Date(a.bucket_date).getTime() - new Date(b.bucket_date).getTime()
    );

    const p95: { x: string; y: number }[] = [];
    const p50: { x: string; y: number }[] = [];
    let peak = 0;

    for (const d of sorted) {
      const label = new Date(d.bucket_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const rawP95 = isCpu ? d.cpu_usage_p95_mc : d.mem_usage_p95_kib;
      const rawP50 = isCpu ? d.cpu_usage_p50_mc : d.mem_usage_p50_kib;
      const displayP95 = isCpu ? (rawP95 ?? 0) / 1000 : (rawP95 ?? 0) / 1024 / 1024;
      const displayP50 = isCpu ? (rawP50 ?? 0) / 1000 : (rawP50 ?? 0) / 1024 / 1024;
      p95.push({ x: label, y: parseFloat(displayP95.toFixed(4)) });
      p50.push({ x: label, y: parseFloat(displayP50.toFixed(4)) });
      peak = Math.max(peak, displayP95, displayP50);
    }

    const threshold: { x: string; y: number }[] = [];
    if (recommendedValue != null) {
      const recDisplay = parseFloat(recommendedValue.toFixed(4));
      for (const pt of p95) {
        threshold.push({ x: pt.x, y: recDisplay });
      }
      peak = Math.max(peak, recDisplay);
    }

    return { p95Data: p95, p50Data: p50, thresholdData: threshold, maxValue: peak };
  }, [dailyDigests, recommendedValue, isCpu]);

  if (!p95Data.length) {
    return null;
  }

  const legendData = [
    { childName: 'p95', name: p95Label, symbol: { fill: P95_COLOR, type: 'minus' } },
    { childName: 'p50', name: p50Label, symbol: { fill: P50_COLOR, type: 'minus' } },
    ...(thresholdData.length
      ? [{ childName: 'threshold', name: recLabel, symbol: { fill: RECOMMENDED_COLOR, type: 'minus' } }]
      : []),
  ];

  const formatValue = (v: number) => `${v.toFixed(2)} ${unitLabel}`;

  return (
    <div data-testid={`node-peak-hours-usage-${metricKey}`} ref={containerRef}>
      <div style={{ height: CHART_HEIGHT }}>
        <Chart
          ariaTitle={title}
          ariaDesc={ariaDesc}
          containerComponent={
            <CursorVoronoiContainer
              cursorDimension="x"
              labels={({ datum }) => formatValue(datum.y)}
              mouseFollowTooltips
              voronoiDimension="x"
              labelComponent={<ChartLegendTooltip legendData={legendData} title={datum => datum.x} />}
            />
          }
          domain={{ y: [0, maxValue * 1.2 || 1] }}
          height={CHART_HEIGHT}
          legendComponent={<ChartLegend data={legendData} height={20} gutter={20} responsive={false} />}
          legendPosition="bottom"
          padding={{ bottom: 60, left: 60, right: 20, top: 10 }}
          width={width}
        >
          <ChartAxis fixLabelOverlap />
          <ChartAxis dependentAxis showGrid tickFormat={t => `${t}`} />
          <ChartLine
            data={p95Data}
            interpolation="monotoneX"
            name="p95"
            style={{ data: { stroke: P95_COLOR, strokeWidth: 2 } }}
          />
          <ChartLine
            data={p50Data}
            interpolation="monotoneX"
            name="p50"
            style={{ data: { stroke: P50_COLOR, strokeWidth: 1.5, strokeDasharray: '6,3' } }}
          />
          {thresholdData.length > 0 && (
            <ChartThreshold
              data={thresholdData}
              name="threshold"
              style={{
                data: { stroke: RECOMMENDED_COLOR, strokeDasharray: '8,4', strokeWidth: 2 },
              }}
            />
          )}
        </Chart>
      </div>
      <table className="pf-v6-screen-reader" aria-label={title}>
        <thead>
          <tr>
            <th>Date</th>
            <th>{p50Label}</th>
            <th>{p95Label}</th>
            {thresholdData.length > 0 && <th>{recLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {p95Data.map((pt, idx) => (
            <tr key={idx}>
              <td>{pt.x}</td>
              <td>{formatValue(p50Data[idx]?.y ?? 0)}</td>
              <td>{formatValue(pt.y)}</td>
              {thresholdData.length > 0 && <td>{formatValue(thresholdData[idx]?.y ?? 0)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { NodePeakHoursUsageChart };
