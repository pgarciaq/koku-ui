import {
  Chart,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  ChartThreshold,
  createContainer,
} from '@patternfly/react-charts/victory';
import type { VmDailyDigestItem } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';

interface VmUtilizationTrendChartProps {
  dailyDigests: VmDailyDigestItem[];
  metricKey: 'cpu' | 'memory';
  recommendedValue: number | null;
}

const USAGE_COLOR = '#0066CC';
const RECOMMENDED_COLOR = '#EC7A08';
const CHART_HEIGHT = 200;

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const VmUtilizationTrendChart: React.FC<VmUtilizationTrendChartProps> = ({
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
    isCpu ? messages.visualInsightsVmCpuTrendTitle : messages.visualInsightsVmMemoryTrendTitle
  );
  const ariaDesc = intl.formatMessage(
    isCpu ? messages.visualInsightsVmCpuTrendDesc : messages.visualInsightsVmMemoryTrendDesc
  );
  const p95Label = intl.formatMessage(messages.visualInsightsVmTrendP95Usage);
  const recLabel = intl.formatMessage(messages.visualInsightsVmTrendRecommended);
  const unitLabel = isCpu ? 'cores' : 'GiB';

  const { usageData, thresholdData, maxValue } = useMemo(() => {
    const sorted = [...dailyDigests].sort(
      (a, b) => new Date(a.bucket_date).getTime() - new Date(b.bucket_date).getTime()
    );

    const usage: { x: string; y: number }[] = [];
    let peak = 0;

    for (const d of sorted) {
      const label = new Date(d.bucket_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const raw = isCpu ? d.cpu_usage_p95_mc : d.mem_usage_p95_kib;
      const displayValue = isCpu ? (raw ?? 0) / 1000 : (raw ?? 0) / 1024 / 1024;
      usage.push({ x: label, y: parseFloat(displayValue.toFixed(4)) });
      if (displayValue > peak) {
        peak = displayValue;
      }
    }

    const recDisplay =
      recommendedValue != null ? (isCpu ? recommendedValue / 1000 : recommendedValue / 1024 / 1024) : null;

    const threshold: { x: string; y: number }[] = [];
    if (recDisplay != null) {
      for (const pt of usage) {
        threshold.push({ x: pt.x, y: parseFloat(recDisplay.toFixed(4)) });
      }
      if (recDisplay > peak) {
        peak = recDisplay;
      }
    }

    return { usageData: usage, thresholdData: threshold, maxValue: peak };
  }, [dailyDigests, recommendedValue, isCpu]);

  if (!usageData.length) {
    return null;
  }

  const legendData = [
    { childName: 'usage', name: p95Label, symbol: { fill: USAGE_COLOR, type: 'minus' } },
    ...(thresholdData.length
      ? [{ childName: 'threshold', name: recLabel, symbol: { fill: RECOMMENDED_COLOR, type: 'minus' } }]
      : []),
  ];

  const formatValue = (v: number) => `${v.toFixed(2)} ${unitLabel}`;

  return (
    <div data-testid={`vm-utilization-trend-${metricKey}`} ref={containerRef}>
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
            data={usageData}
            interpolation="monotoneX"
            name="usage"
            style={{ data: { stroke: USAGE_COLOR, strokeWidth: 2 } }}
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
            <th>{p95Label}</th>
            {thresholdData.length > 0 && <th>{recLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {usageData.map((pt, idx) => (
            <tr key={idx}>
              <td>{pt.x}</td>
              <td>{formatValue(pt.y)}</td>
              {thresholdData.length > 0 && <td>{formatValue(thresholdData[idx]?.y ?? 0)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { VmUtilizationTrendChart };
