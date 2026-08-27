import 'routes/components/charts/common/chart.scss';

import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartLegendTooltip,
  ChartLine,
  ChartScatter,
  createContainer,
  getInteractiveLegendEvents,
} from '@patternfly/react-charts/victory';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { getDateRangeString } from 'routes/components/charts/common';
import type { ChartSeries } from 'routes/components/charts/common/chartUtils';
import {
  getDomain,
  getLegendData,
  getResizeObserver,
  initHiddenSeries,
  isDataAvailable,
  isSeriesHidden,
} from 'routes/components/charts/common/chartUtils';
import ChartTheme from 'routes/components/charts/theme';
import { unitsLookupKey } from 'utils/format';

import { chartStyles } from './optimizationsBreakdownChart.styles';

const USAGE_CHILD_NAMES = ['usageP50P95', 'usageP95P99', 'usageP50', 'usageMax'] as const;

interface OptimizationsBreakdownChartOwnProps {
  baseHeight?: number;
  limitData?: any;
  name?: string;
  padding?: any;
  requestData?: any;
  usageData?: any;
}

type OptimizationsBreakdownChartProps = OptimizationsBreakdownChartOwnProps;

const OptimizationsBreakdownChart: React.FC<OptimizationsBreakdownChartProps> = ({
  baseHeight,
  name,
  limitData,
  padding,
  requestData,
  usageData,
}) => {
  // eslint-disable-next-line
  const [containerRef] = useState(React.createRef<HTMLDivElement>());
  const [cursorVoronoiContainer, setCursorVoronoiContainer] = useState<any>();
  const [extraHeight, setExtraHeight] = useState(0);
  const [hiddenSeries, setHiddenSeries] = useState(new Set<number>());
  const [series, setSeries] = useState<ChartSeries[]>();
  const [width, setWidth] = useState(0);
  const intl = useIntl();

  const isUsageSeriesHidden = () =>
    series?.some(
      (s, i) => USAGE_CHILD_NAMES.includes(s.childName as (typeof USAGE_CHILD_NAMES)[number]) && hiddenSeries.has(i)
    ) ?? false;

  // Clone original container. See https://redhat.atlassian.net/browse/COST-762
  const cloneContainer = () => {
    const legendData = getLegendData(series, hiddenSeries, true);
    // Force extra space for line wrapping
    legendData?.push(
      {
        childName: 'usageP50P95',
        name: '',
        symbol: {
          fill: 'none',
        },
      },
      {
        childName: 'usageP50P95',
        name: '',
        symbol: {
          fill: 'none',
        },
      }
    );
    return cursorVoronoiContainer
      ? React.cloneElement(cursorVoronoiContainer, {
          disable: !isDataAvailable(series, hiddenSeries),
          labelComponent: <ChartLegendTooltip legendData={legendData} title={datum => datum.x} />,
        } as any)
      : undefined;
  };

  const getLimitChart = () => {
    return series?.map((serie, index) => {
      if (serie.childName === 'limit') {
        return (
          <ChartArea
            data={!hiddenSeries.has(index) ? serie.data : [{ y: null }]}
            interpolation="monotoneX"
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
    });
  };

  const getRequestChart = () => {
    return series?.map((serie, index) => {
      if (serie.childName === 'request') {
        return (
          <ChartArea
            data={!hiddenSeries.has(index) ? serie.data : [{ y: null }]}
            interpolation="monotoneX"
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
    });
  };

  const getUsageCharts = () => {
    const hidden = isUsageSeriesHidden();
    return series?.map(serie => {
      const emptyData = [{ y: null }];
      const data = hidden ? emptyData : serie.data;

      if (serie.childName === 'usageP50P95' || serie.childName === 'usageP95P99') {
        return (
          <ChartArea
            data={data}
            interpolation="monotoneX"
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
      if (serie.childName === 'usageP50') {
        return (
          <ChartLine
            data={data}
            interpolation="monotoneX"
            key={serie.childName}
            name={serie.childName}
            style={serie.style}
          />
        );
      }
      if (serie.childName === 'usageMax') {
        return <ChartScatter data={data} key={serie.childName} name={serie.childName} style={serie.style} />;
      }
    });
  };

  // Returns groups of chart names associated with each data series
  const getChartNames = () => {
    const result = [];
    const usageGroup = [...USAGE_CHILD_NAMES];

    if (series) {
      series.map(serie => {
        if (serie.childName === 'usageP50P95') {
          result.push(usageGroup);
        } else if (!USAGE_CHILD_NAMES.includes(serie.childName as (typeof USAGE_CHILD_NAMES)[number])) {
          result.push(serie.childName);
        } else if (serie.childName !== 'usageP50P95') {
          result.push(usageGroup);
        }
      });
    }
    return result as any;
  };

  // Returns CursorVoronoiContainer component
  const getCursorVoronoiContainer = () => {
    // Note: Container order is important
    const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

    const labelFormatter = datum => {
      const formatValue = val => (val !== undefined && val !== null ? val : '');
      let units = datum.units;

      /**
       * The recommendations API intentionally omits CPU request and limit units when "cores".
       *
       * The yaml format for the resource units needs to adhere to the Kubernetes standard that is outlined here
       * https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
       *
       * Example. "45 millicores" is represented as "45m", 64 MiB is represented as "64Mi",
       * 2.3 cores is represented as "2.3" (Note cores is not specified)
       */
      if (
        (datum.childName === 'limit' || datum.childName === 'request' || USAGE_CHILD_NAMES.includes(datum.childName)) &&
        datum.units === ''
      ) {
        units = unitsLookupKey('cores');
      }

      if (USAGE_CHILD_NAMES.includes(datum.childName)) {
        if (datum.p50 !== undefined || datum.p95 !== undefined || datum.p99 !== undefined || datum.max !== undefined) {
          return intl.formatMessage(messages.chartUsageTooltip, {
            br: '\n',
            p50: formatValue(datum.p50),
            p95: formatValue(datum.p95),
            p99: formatValue(datum.p99),
            max: formatValue(datum.max),
            units: intl.formatMessage(messages.units, { units: unitsLookupKey(units) }),
          });
        }
        return intl.formatMessage(messages.chartNoData);
      }

      const yVal = datum.y;

      return yVal !== null && yVal !== undefined
        ? intl.formatMessage(messages.valueUnits, {
            value: yVal,
            units: intl.formatMessage(messages.units, { units: unitsLookupKey(units) }),
          })
        : intl.formatMessage(messages.chartNoData);
    };

    return (
      <CursorVoronoiContainer
        cursorDimension="x"
        labels={({ datum }) => labelFormatter(datum)}
        mouseFollowTooltips
        voronoiDimension="x"
        voronoiPadding={getPadding()}
      />
    );
  };

  // Returns onMouseOver, onMouseOut, and onClick events for the interactive legend
  const getEvents = () => {
    const result = getInteractiveLegendEvents({
      chartNames: getChartNames(),
      isHidden: index => isSeriesHidden(hiddenSeries, index),
      legendName: `${name}-legend`,
      onLegendClick: props => handleOnLegendClick(props.index),
    });
    return result;
  };

  const getHeight = () => {
    return baseHeight + extraHeight;
  };

  const getLegend = () => {
    return (
      <ChartLegend
        data={getLegendData(series, hiddenSeries)}
        height={25}
        gutter={20}
        name={`${name}-legend`}
        responsive={false}
      />
    );
  };

  const getPadding = () => {
    return padding
      ? padding
      : {
          bottom: 75 + extraHeight, // Maintain chart aspect ratio
          left: 50,
          right: 50,
          top: 10,
        };
  };

  const handleLegendAllowWrap = value => {
    if (value !== extraHeight) {
      setExtraHeight(value);
    }
  };

  const toggleGroup = (groupNames: readonly string[]) => () => {
    const groupIndices =
      series?.map((s, i) => (groupNames.includes(s.childName) ? i : null)).filter((i): i is number => i !== null) ?? [];
    const anyHidden = groupIndices.some(i => hiddenSeries.has(i));
    const newHiddenSeries = new Set(hiddenSeries);
    if (anyHidden) {
      groupIndices.forEach(i => newHiddenSeries.delete(i));
    } else {
      groupIndices.forEach(i => newHiddenSeries.add(i));
    }
    setHiddenSeries(newHiddenSeries);
  };

  const handleOnLegendClick = (index: number) => {
    const clickedChild = series?.[index]?.childName;
    if (clickedChild && USAGE_CHILD_NAMES.includes(clickedChild as (typeof USAGE_CHILD_NAMES)[number])) {
      toggleGroup(USAGE_CHILD_NAMES)(index);
      return;
    }
    const newHiddenSeries = initHiddenSeries(series, hiddenSeries, index);
    setHiddenSeries(newHiddenSeries);
  };

  const handleOnResize = () => {
    const { clientWidth = 0 } = containerRef?.current || {};
    if (clientWidth !== width) {
      setWidth(clientWidth);
    }
  };

  const initDatum = () => {
    // Show all legends, regardless of data size

    const newSeries: ChartSeries[] = [];
    if (requestData && requestData.length) {
      newSeries.push({
        childName: 'request',
        data: requestData,
        legendItem: {
          name: getDateRangeString(requestData, messages.recommendedRequest, true),
          symbol: {
            fill: chartStyles.requestColorScale[0],
            type: 'square',
          },
          tooltip: intl.formatMessage(messages.request),
        },
        style: {
          data: {
            ...chartStyles.request,
            stroke: chartStyles.requestColorScale[0],
          },
        },
      });
    }
    if (limitData && limitData.length) {
      newSeries.push({
        childName: 'limit',
        data: limitData,
        legendItem: {
          name: getDateRangeString(limitData, messages.recommendedLimit, true),
          symbol: {
            fill: chartStyles.limitColorScale[0],
            type: 'square',
          },
          tooltip: intl.formatMessage(messages.limit),
        },
        style: {
          data: {
            ...chartStyles.limit,
            stroke: chartStyles.limitColorScale[0],
          },
        },
      });
    }
    if (usageData && usageData.length) {
      const p50P95Data = usageData.map(datum => ({
        ...datum,
        childName: 'usageP50P95',
        y: datum.p95 ?? null,
        y0: datum.p50 ?? null,
      }));
      const p95P99Data = usageData.map(datum => ({
        ...datum,
        childName: 'usageP95P99',
        y: datum.p99 ?? null,
        y0: datum.p95 ?? null,
      }));
      const p50LineData = usageData.map(datum => ({
        ...datum,
        childName: 'usageP50',
        y: datum.p50 ?? null,
      }));
      const maxScatterData = usageData.map(datum => ({
        ...datum,
        childName: 'usageMax',
        y: datum.max ?? null,
      }));

      newSeries.push({
        childName: 'usageP50P95',
        data: p50P95Data as any,
        legendItem: {
          name: intl.formatMessage(messages.chartUsageP50P95Legend),
          symbol: {
            fill: chartStyles.usageP50P95ColorScale[0],
            type: 'square',
          },
          tooltip: intl.formatMessage(messages.chartUsageP50P95Legend),
        },
        style: {
          data: {
            fill: chartStyles.usageP50P95ColorScale[0],
            stroke: chartStyles.usageP50P95ColorScale[0],
          },
        },
      });
      newSeries.push({
        childName: 'usageP95P99',
        data: p95P99Data as any,
        legendItem: {
          name: intl.formatMessage(messages.chartUsageP95P99Legend),
          symbol: {
            fill: chartStyles.usageP95P99ColorScale[0],
            type: 'square',
          },
          tooltip: intl.formatMessage(messages.chartUsageP95P99Legend),
        },
        style: {
          data: {
            fill: chartStyles.usageP95P99ColorScale[0],
            stroke: chartStyles.usageP95P99ColorScale[0],
          },
        },
      });
      newSeries.push({
        childName: 'usageP50',
        data: p50LineData as any,
        legendItem: {
          name: intl.formatMessage(messages.chartUsageMedianLegend),
          symbol: {
            fill: chartStyles.usageP50ColorScale[0],
            type: 'minus',
          },
          tooltip: intl.formatMessage(messages.chartUsageMedianLegend),
        },
        style: {
          data: {
            stroke: chartStyles.usageP50ColorScale[0],
            strokeWidth: 2,
          },
        },
      });
      newSeries.push({
        childName: 'usageMax',
        data: maxScatterData as any,
        legendItem: {
          name: intl.formatMessage(messages.chartUsageMaxLegend),
          symbol: {
            fill: chartStyles.usageMaxColorScale[0],
            type: 'circle',
          },
          tooltip: intl.formatMessage(messages.chartUsageMaxLegend),
        },
        style: {
          data: {
            fill: chartStyles.usageMaxColorScale[0],
          },
        },
      });
    }
    setSeries(newSeries);
    setCursorVoronoiContainer(getCursorVoronoiContainer());
    setHiddenSeries(new Set());
  };

  useEffect(() => {
    initDatum();
  }, [limitData, requestData, usageData]);

  useEffect(() => {
    if (containerRef?.current) {
      const unobserve = getResizeObserver(containerRef?.current, handleOnResize);
      return () => {
        if (unobserve) {
          unobserve();
        }
      };
    }
  }, [containerRef, handleOnResize]);

  const chartHeight = getHeight();

  return (
    <div className="chartOverride" ref={containerRef}>
      <div style={{ height: chartHeight }}>
        <Chart
          containerComponent={cloneContainer()}
          domain={getDomain(series, hiddenSeries, USAGE_CHILD_NAMES.length - 1)}
          domainPadding={{ x: [30, 30] }}
          events={getEvents()}
          height={chartHeight}
          legendAllowWrap={handleLegendAllowWrap}
          legendComponent={getLegend()}
          legendPosition="bottom"
          name={name}
          padding={getPadding()}
          theme={ChartTheme}
          width={width}
        >
          <ChartAxis fixLabelOverlap />
          <ChartAxis dependentAxis showGrid />
          {getRequestChart()}
          {getLimitChart()}
          {getUsageCharts()}
        </Chart>
      </div>
    </div>
  );
};

export { OptimizationsBreakdownChart };
