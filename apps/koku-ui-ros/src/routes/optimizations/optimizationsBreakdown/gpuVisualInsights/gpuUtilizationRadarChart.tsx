import { chart_color_blue_300 } from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import { chart_color_blue_400 } from '@patternfly/react-tokens/dist/js/chart_color_blue_400';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  VictoryArea,
  VictoryChart,
  VictoryLabel,
  VictoryPolarAxis,
  VictoryTheme,
} from 'victory';

interface GpuUtilizationRadarChartOwnProps {
  dramActiveAvg?: number;
  fbUsageMaxMib?: number;
  smActiveAvg?: number;
  tensorPipeActiveAvg?: number;
  totalFbMib?: number | null;
}

type AxisKey = 'sm' | 'tensor' | 'dram' | 'vram';

const chartSize = 280;
const fillColor = chart_color_blue_300?.var ?? 'var(--pf-t--chart--color--blue--300, #0066CC)';
const strokeColor = chart_color_blue_400?.var ?? 'var(--pf-t--chart--color--blue--400, #004080)';

const GpuUtilizationRadarChart: React.FC<GpuUtilizationRadarChartOwnProps> = ({
  dramActiveAvg,
  fbUsageMaxMib,
  smActiveAvg,
  tensorPipeActiveAvg,
  totalFbMib,
}) => {
  const intl = useIntl();

  const axisLabels: Record<AxisKey, string> = useMemo(
    () => ({
      sm: intl.formatMessage(messages.visualInsightsGpuRadarAxisSm),
      tensor: intl.formatMessage(messages.visualInsightsGpuRadarAxisTensor),
      dram: intl.formatMessage(messages.visualInsightsGpuRadarAxisDram),
      vram: intl.formatMessage(messages.visualInsightsGpuRadarAxisVram),
    }),
    [intl]
  );

  const axisKeys: AxisKey[] = ['sm', 'tensor', 'dram', 'vram'];

  const fractions = useMemo(() => {
    const safe = (v?: number) => (v != null && isFinite(v) ? Math.max(0, Math.min(v, 1)) : 0);
    const fbFraction = totalFbMib && totalFbMib > 0 && fbUsageMaxMib != null
      ? Math.min(fbUsageMaxMib / totalFbMib, 1)
      : 0;

    return {
      sm: safe(smActiveAvg),
      tensor: safe(tensorPipeActiveAvg),
      dram: safe(dramActiveAvg),
      vram: Math.max(0, Math.min(fbFraction, 1)),
    };
  }, [smActiveAvg, tensorPipeActiveAvg, dramActiveAvg, fbUsageMaxMib, totalFbMib]);

  const chartData = useMemo(
    () => axisKeys.map((key, i) => ({ x: i + 1, y: fractions[key] })),
    [fractions]
  );

  const title = intl.formatMessage(messages.visualInsightsGpuRadarTitle);
  const desc = intl.formatMessage(messages.visualInsightsGpuRadarDesc);

  return (
    <div>
      <div style={{ height: chartSize, width: chartSize }} role="img" aria-label={title}>
        <VictoryChart
          polar
          theme={VictoryTheme.clean}
          domain={{ y: [0, 1] }}
          height={chartSize}
          width={chartSize}
          padding={{ top: 50, bottom: 50, left: 60, right: 60 }}
          title={title}
          desc={desc}
        >
          <VictoryArea
            data={chartData}
            style={{
              data: {
                fill: fillColor,
                fillOpacity: 0.25,
                stroke: strokeColor,
                strokeWidth: 2,
              },
            }}
          />
          {axisKeys.map((key, i) => (
            <VictoryPolarAxis
              key={key}
              dependentAxis
              axisValue={i + 1}
              label={axisLabels[key]}
              labelPlacement="perpendicular"
              tickValues={[0.25, 0.5, 0.75, 1.0]}
              tickFormat={t => `${Math.round(t * 100)}%`}
              tickLabelComponent={<VictoryLabel labelPlacement="vertical" style={{ fontSize: 7 }} />}
              style={{
                axisLabel: { padding: 20, fontSize: 9 },
                axis: { stroke: 'none' },
                grid: { stroke: 'grey', strokeWidth: 0.25, opacity: 0.5 },
              }}
            />
          ))}
          <VictoryPolarAxis
            labelPlacement="parallel"
            tickFormat={() => ''}
            style={{
              axis: { stroke: 'none' },
              grid: { stroke: 'grey', opacity: 0.5 },
            }}
          />
        </VictoryChart>
      </div>
      {/* Visually-hidden data table for screen readers */}
      <table
        aria-label={title}
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.visualInsightsGpuRadarSubsystem)}</th>
            <th>{intl.formatMessage(messages.visualInsightsGpuRadarUtilization)}</th>
          </tr>
        </thead>
        <tbody>
          {axisKeys.map(key => (
            <tr key={key}>
              <td>{axisLabels[key]}</td>
              <td>{`${Math.round(fractions[key] * 100)}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { GpuUtilizationRadarChart };
