import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  ChartThreshold,
  createContainer,
} from '@patternfly/react-charts/victory';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';
import { generateDecayCurvePoints } from 'utils/decayWeighting';

interface DecayCurveChartProps {
  halfLifeHours: number;
  height?: number;
  windowDays: number;
}

const CURVE_COLOR = '#0066CC';
const HALFLIFE_COLOR = '#C9190B';

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const DecayCurveChart: React.FC<DecayCurveChartProps> = ({ halfLifeHours, height = 200, windowDays }) => {
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

  const curvePoints = useMemo(() => generateDecayCurvePoints(halfLifeHours, windowDays), [halfLifeHours, windowDays]);

  const chartData = useMemo(
    () =>
      curvePoints.map(pt => ({
        x: pt.day,
        y: parseFloat((pt.weight * 100).toFixed(1)),
        name: 'weight',
      })),
    [curvePoints]
  );

  const halfLineData = useMemo(() => {
    if (windowDays <= 0) {
      return [];
    }
    return [
      { x: 0, y: 50, name: 'halfLine' },
      { x: windowDays, y: 50, name: 'halfLine' },
    ];
  }, [windowDays]);

  const isUniform = halfLifeHours <= 0;
  const title = intl.formatMessage(messages.decayCurveChartTitle);
  const desc = intl.formatMessage(messages.decayCurveChartDesc);

  if (windowDays <= 0) {
    return null;
  }

  if (isUniform) {
    return (
      <div
        data-testid="decay-curve-chart-uniform"
        style={{ textAlign: 'center', padding: '16px 0', color: 'var(--pf-t--global--text--color--subtle)' }}
      >
        {intl.formatMessage(messages.decayCurveNoDecay)}
      </div>
    );
  }

  const legendData = [
    { childName: 'weight', name: intl.formatMessage(messages.decayCurveChartWeight), symbol: { fill: CURVE_COLOR } },
    {
      childName: 'halfLine',
      name: intl.formatMessage(messages.decayCurveChartHalfLife),
      symbol: { fill: HALFLIFE_COLOR, type: 'minus' },
    },
  ];

  return (
    <div data-testid="decay-curve-chart" ref={containerRef}>
      <div style={{ height }}>
        <Chart
          ariaTitle={title}
          ariaDesc={desc}
          containerComponent={
            <CursorVoronoiContainer
              cursorDimension="x"
              labels={({ datum }) => `${datum.y.toFixed(1)}%`}
              mouseFollowTooltips
              voronoiDimension="x"
              labelComponent={
                <ChartLegendTooltip
                  legendData={legendData}
                  title={datum => `${parseFloat(datum.x.toFixed(1))} ${intl.formatMessage(messages.decayCurveChartDaysAgo)}`}
                />
              }
            />
          }
          domain={{ x: [0, windowDays], y: [0, 100] }}
          height={height}
          legendComponent={<ChartLegend data={legendData} height={20} gutter={20} responsive={false} />}
          legendPosition="bottom"
          padding={{ bottom: 55, left: 50, right: 20, top: 10 }}
          width={width}
        >
          <ChartAxis
            label={intl.formatMessage(messages.decayCurveChartDaysAgo)}
            fixLabelOverlap
            style={{ axisLabel: { padding: 30 } }}
          />
          <ChartAxis dependentAxis showGrid tickFormat={t => `${t}%`} />
          <ChartArea
            data={chartData}
            interpolation="monotoneX"
            name="weight"
            style={{ data: { fill: CURVE_COLOR, fillOpacity: 0.15, stroke: CURVE_COLOR, strokeWidth: 2 } }}
          />
          <ChartThreshold
            data={halfLineData}
            name="halfLine"
            style={{
              data: { stroke: HALFLIFE_COLOR, strokeDasharray: '6,4', strokeWidth: 1.5 },
            }}
          />
        </Chart>
      </div>
    </div>
  );
};

export { DecayCurveChart };
