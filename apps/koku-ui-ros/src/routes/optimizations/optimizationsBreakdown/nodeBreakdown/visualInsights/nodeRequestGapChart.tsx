import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  createContainer,
} from '@patternfly/react-charts/victory';
import type { NodeDailyDigestItem } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';

interface NodeRequestGapChartProps {
  dailyDigests: NodeDailyDigestItem[];
  metricKey: 'cpu' | 'memory';
}

const REQUEST_COLOR = '#C9190B';
const USAGE_COLOR = '#0066CC';
const GAP_COLOR = '#F4B678';
const CHART_HEIGHT = 220;

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const NodeRequestGapChart: React.FC<NodeRequestGapChartProps> = ({ dailyDigests, metricKey }) => {
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
    isCpu ? messages.visualInsightsNodeRequestGapCpuTitle : messages.visualInsightsNodeRequestGapMemTitle
  );
  const ariaDesc = intl.formatMessage(messages.visualInsightsNodeRequestGapDesc);
  const requestLabel = intl.formatMessage(messages.visualInsightsNodeRequestGapRequest);
  const usageLabel = intl.formatMessage(messages.visualInsightsNodeRequestGapUsage);

  const { requestData, usageData, gapData } = useMemo(() => {
    const sorted = [...dailyDigests].sort(
      (a, b) => new Date(a.bucket_date).getTime() - new Date(b.bucket_date).getTime()
    );

    const requests: { x: string; y: number; name: string }[] = [];
    const usage: { x: string; y: number; name: string }[] = [];
    const gap: { x: string; y0: number; y: number; name: string }[] = [];

    for (const d of sorted) {
      const label = new Date(d.bucket_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const allocatable = isCpu ? d.max_cpu_allocatable_mc : d.max_mem_allocatable_kib;

      if (!allocatable || allocatable <= 0) {
        continue;
      }

      const requestValue = isCpu ? d.max_cpu_requests_mc : d.max_mem_requests_kib;
      const usageValue = isCpu ? d.cpu_usage_p95_mc : d.mem_usage_p95_kib;

      const requestPct = parseFloat(((requestValue / allocatable) * 100).toFixed(1));
      const usagePct = parseFloat(((usageValue / allocatable) * 100).toFixed(1));

      requests.push({ x: label, y: requestPct, name: 'requests' });
      usage.push({ x: label, y: usagePct, name: 'usage' });

      if (requestPct > usagePct) {
        gap.push({ x: label, y0: usagePct, y: requestPct, name: 'gap' });
      }
    }

    return { requestData: requests, usageData: usage, gapData: gap };
  }, [dailyDigests, isCpu]);

  if (!requestData.length) {
    return null;
  }

  const legendData = [
    { childName: 'requests', name: requestLabel, symbol: { fill: REQUEST_COLOR, type: 'minus' } },
    { childName: 'usage', name: usageLabel, symbol: { fill: USAGE_COLOR, type: 'minus' } },
  ];

  const formatValue = (v: number) => `${v.toFixed(1)}%`;

  return (
    <div data-testid={`node-request-gap-chart-${metricKey}`} ref={containerRef}>
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
          domain={{ y: [0, Math.max(120, ...requestData.map(d => d.y), ...usageData.map(d => d.y))] }}
          height={CHART_HEIGHT}
          legendComponent={<ChartLegend data={legendData} height={20} gutter={20} responsive={false} />}
          legendPosition="bottom"
          padding={{ bottom: 60, left: 50, right: 20, top: 10 }}
          width={width}
        >
          <ChartAxis fixLabelOverlap />
          <ChartAxis dependentAxis showGrid tickFormat={t => `${t}%`} />
          {gapData.length > 0 && (
            <ChartArea
              data={gapData}
              interpolation="monotoneX"
              name="gap"
              style={{ data: { fill: GAP_COLOR, opacity: 0.3, stroke: 'none' } }}
            />
          )}
          <ChartLine
            data={requestData}
            interpolation="monotoneX"
            name="requests"
            style={{ data: { stroke: REQUEST_COLOR, strokeWidth: 2 } }}
          />
          <ChartLine
            data={usageData}
            interpolation="monotoneX"
            name="usage"
            style={{ data: { stroke: USAGE_COLOR, strokeWidth: 2 } }}
          />
        </Chart>
      </div>
      <table className="pf-v6-screen-reader" aria-label={title}>
        <thead>
          <tr>
            <th>Date</th>
            <th>{requestLabel}</th>
            <th>{usageLabel}</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          {requestData.map((pt, idx) => (
            <tr key={idx}>
              <td>{pt.x}</td>
              <td>{formatValue(pt.y)}</td>
              <td>{formatValue(usageData[idx]?.y ?? 0)}</td>
              <td>{formatValue(Math.max(0, pt.y - (usageData[idx]?.y ?? 0)))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { NodeRequestGapChart };
