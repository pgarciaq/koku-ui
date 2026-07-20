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

interface NodeUtilizationTrendProps {
  dailyDigests: NodeDailyDigestItem[];
  metricKey: 'cpu' | 'memory';
  /** Target utilization in basis points (e.g. 7000 = 70%) from explanation.target_utilization_basis_points */
  targetUtilizationBP?: number;
}

const P95_COLOR = '#0066CC';
const P50_COLOR = '#8BC1F7';
const MAX_COLOR = '#EC7A08';
const THRESHOLD_COLOR = '#C9190B';
const CHART_HEIGHT = 220;

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const NodeUtilizationTrend: React.FC<NodeUtilizationTrendProps> = ({
  dailyDigests,
  metricKey,
  targetUtilizationBP,
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
    isCpu ? messages.visualInsightsNodeCpuTrendTitle : messages.visualInsightsNodeMemoryTrendTitle
  );
  const ariaDesc = intl.formatMessage(
    isCpu ? messages.visualInsightsNodeCpuTrendDesc : messages.visualInsightsNodeMemoryTrendDesc
  );
  const p95Label = intl.formatMessage(messages.visualInsightsNodeTrendP95);
  const p50Label = intl.formatMessage(messages.visualInsightsNodeTrendP50);
  const maxLabel = intl.formatMessage(messages.visualInsightsNodeTrendMax);

  const thresholdPct = targetUtilizationBP != null ? targetUtilizationBP / 100 : null;
  const thresholdLabel = intl.formatMessage(messages.visualInsightsNodeTrendThreshold, {
    pct: thresholdPct != null ? thresholdPct : '—',
  });

  const { p95Data, p50Data, maxData, thresholdData } = useMemo(() => {
    const sorted = [...dailyDigests].sort(
      (a, b) => new Date(a.bucket_date).getTime() - new Date(b.bucket_date).getTime()
    );

    const p95: { x: string; y: number; name: string }[] = [];
    const p50: { x: string; y: number; name: string }[] = [];
    const max: { x: string; y: number; name: string }[] = [];
    const threshold: { x: string; y: number; name: string }[] = [];

    for (const d of sorted) {
      const label = new Date(d.bucket_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const allocatable = isCpu ? d.max_cpu_allocatable_mc : d.max_mem_allocatable_kib;

      if (!allocatable || allocatable <= 0) {
        continue;
      }

      const p95Value = isCpu ? d.cpu_usage_p95_mc : d.mem_usage_p95_kib;
      const p50Value = isCpu ? d.cpu_usage_p50_mc : d.mem_usage_p50_kib;
      const maxValue = isCpu ? d.cpu_usage_max_mc : d.mem_usage_max_kib;

      const p95Pct = parseFloat(((p95Value / allocatable) * 100).toFixed(1));
      const p50Pct = parseFloat(((p50Value / allocatable) * 100).toFixed(1));

      p95.push({ x: label, y: p95Pct, name: 'p95' });
      p50.push({ x: label, y: p50Pct, name: 'p50' });

      if (maxValue != null) {
        const maxPct = parseFloat(((maxValue / allocatable) * 100).toFixed(1));
        max.push({ x: label, y: maxPct, name: 'max' });
      }

      if (thresholdPct != null) {
        threshold.push({ x: label, y: thresholdPct, name: 'threshold' });
      }
    }

    return { p95Data: p95, p50Data: p50, maxData: max, thresholdData: threshold };
  }, [dailyDigests, thresholdPct, isCpu]);

  if (!p95Data.length) {
    return null;
  }

  const legendData = [
    { childName: 'p95', name: p95Label, symbol: { fill: P95_COLOR, type: 'minus' } },
    { childName: 'p50', name: p50Label, symbol: { fill: P50_COLOR, type: 'minus' } },
    ...(maxData.length
      ? [{ childName: 'max', name: maxLabel, symbol: { fill: MAX_COLOR, type: 'minus' } }]
      : []),
    ...(thresholdData.length
      ? [{ childName: 'threshold', name: thresholdLabel, symbol: { fill: THRESHOLD_COLOR, type: 'minus' } }]
      : []),
  ];

  const formatValue = (v: number) => `${v.toFixed(1)}%`;

  return (
    <div data-testid={`node-utilization-trend-${metricKey}`} ref={containerRef}>
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
          domain={{ y: [0, 100] }}
          height={CHART_HEIGHT}
          legendComponent={<ChartLegend data={legendData} height={20} gutter={20} responsive={false} />}
          legendPosition="bottom"
          padding={{ bottom: 60, left: 50, right: 20, top: 10 }}
          width={width}
        >
          <ChartAxis fixLabelOverlap />
          <ChartAxis dependentAxis showGrid tickFormat={t => `${t}%`} />
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
          {maxData.length > 0 && (
            <ChartLine
              data={maxData}
              interpolation="monotoneX"
              name="max"
              style={{ data: { stroke: MAX_COLOR, strokeWidth: 1.5, strokeDasharray: '3,3' } }}
            />
          )}
          {thresholdData.length > 0 && (
            <ChartThreshold
              data={thresholdData}
              name="threshold"
              style={{
                data: { stroke: THRESHOLD_COLOR, strokeDasharray: '8,4', strokeWidth: 2 },
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
            {thresholdData.length > 0 && <th>{thresholdLabel}</th>}
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

export { NodeUtilizationTrend };
