import { Chart, ChartArea, ChartLegend, ChartLegendTooltip, createContainer } from '@patternfly/react-charts/victory';
import { EmptyState, EmptyStateBody, EmptyStateVariant, Split, SplitItem, Title } from '@patternfly/react-core';
import type { VmDailyDigestItem } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';
import ChartTheme from 'routes/components/charts/theme';

interface VmIoSparklineProps {
  dailyDigests?: VmDailyDigestItem[];
}

const READ_COLOR = '#0066CC';
const WRITE_COLOR = '#EC7A08';
const CHART_HEIGHT = 60;

const CursorVoronoiContainer: any = createContainer('voronoi', 'cursor');

const VmIoSparkline: React.FC<VmIoSparklineProps> = ({ dailyDigests }) => {
  const intl = useIntl();
  const iopsRef = useRef<HTMLDivElement>(null);
  const throughputRef = useRef<HTMLDivElement>(null);
  const [iopsWidth, setIopsWidth] = useState(0);
  const [throughputWidth, setThroughputWidth] = useState(0);

  useEffect(() => {
    if (iopsRef.current) {
      const unobserve = getResizeObserver(iopsRef.current, () => {
        if (iopsRef.current) {
          setIopsWidth(iopsRef.current.clientWidth);
        }
      });
      return () => {
        if (unobserve) {
          unobserve();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (throughputRef.current) {
      const unobserve = getResizeObserver(throughputRef.current, () => {
        if (throughputRef.current) {
          setThroughputWidth(throughputRef.current.clientWidth);
        }
      });
      return () => {
        if (unobserve) {
          unobserve();
        }
      };
    }
  }, []);

  const { hasIoData, iopsReadData, iopsWriteData, bpsReadData, bpsWriteData } = useMemo(() => {
    if (!dailyDigests || dailyDigests.length === 0) {
      return { hasIoData: false, iopsReadData: [], iopsWriteData: [], bpsReadData: [], bpsWriteData: [] };
    }

    const sorted = [...dailyDigests].sort(
      (a, b) => new Date(a.bucket_date).getTime() - new Date(b.bucket_date).getTime()
    );

    let anyNonZero = false;
    const iopsRead: { x: string; y: number; date: string }[] = [];
    const iopsWrite: { x: string; y: number; date: string }[] = [];
    const bpsRead: { x: string; y: number; date: string }[] = [];
    const bpsWrite: { x: string; y: number; date: string }[] = [];

    for (const d of sorted) {
      const label = new Date(d.bucket_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const rIOPS = d.disk_read_iops_p95 ?? 0;
      const wIOPS = d.disk_write_iops_p95 ?? 0;
      const rBPS = d.disk_read_bps_p95 ?? 0;
      const wBPS = d.disk_write_bps_p95 ?? 0;

      if (rIOPS > 0 || wIOPS > 0 || rBPS > 0 || wBPS > 0) {
        anyNonZero = true;
      }

      iopsRead.push({ x: label, y: rIOPS, date: d.bucket_date });
      iopsWrite.push({ x: label, y: wIOPS, date: d.bucket_date });
      bpsRead.push({ x: label, y: rBPS, date: d.bucket_date });
      bpsWrite.push({ x: label, y: wBPS, date: d.bucket_date });
    }

    return {
      hasIoData: anyNonZero,
      iopsReadData: iopsRead,
      iopsWriteData: iopsWrite,
      bpsReadData: bpsRead,
      bpsWriteData: bpsWrite,
    };
  }, [dailyDigests]);

  if (!hasIoData) {
    return (
      <EmptyState variant={EmptyStateVariant.sm}>
        <Title headingLevel="h4" size="md">
          {intl.formatMessage(messages.visualInsightsVmDiskIo)}
        </Title>
        <EmptyStateBody>{intl.formatMessage(messages.visualInsightsVmIoEmpty)}</EmptyStateBody>
      </EmptyState>
    );
  }

  const readLabel = intl.formatMessage(messages.visualInsightsVmIoRead);
  const writeLabel = intl.formatMessage(messages.visualInsightsVmIoWrite);

  const legendData = [
    { childName: 'read', name: readLabel, symbol: { fill: READ_COLOR, type: 'square' } },
    { childName: 'write', name: writeLabel, symbol: { fill: WRITE_COLOR, type: 'square' } },
  ];

  const formatBPS = (value: number): string => {
    if (value >= 1_073_741_824) {
      return `${(value / 1_073_741_824).toFixed(1)} GiB/s`;
    }
    if (value >= 1_048_576) {
      return `${(value / 1_048_576).toFixed(1)} MiB/s`;
    }
    if (value >= 1024) {
      return `${(value / 1024).toFixed(1)} KiB/s`;
    }
    return `${value} B/s`;
  };

  const iopsContainer = (
    <CursorVoronoiContainer
      cursorDimension="x"
      labels={({ datum }) => `${datum.y.toLocaleString()} IOPS`}
      mouseFollowTooltips
      voronoiDimension="x"
      labelComponent={<ChartLegendTooltip legendData={legendData} title={datum => datum.x} />}
    />
  );

  const throughputContainer = (
    <CursorVoronoiContainer
      cursorDimension="x"
      labels={({ datum }) => formatBPS(datum.y)}
      mouseFollowTooltips
      voronoiDimension="x"
      labelComponent={<ChartLegendTooltip legendData={legendData} title={datum => datum.x} />}
    />
  );

  const areaStyle = (color: string) => ({
    data: {
      fill: color,
      fillOpacity: 0.25,
      stroke: color,
      strokeWidth: 1.5,
    },
  });

  return (
    <Split hasGutter>
      <SplitItem isFilled>
        <Title headingLevel="h4" size="sm">
          {intl.formatMessage(messages.visualInsightsVmIopsTitle)}
        </Title>
        <div ref={iopsRef}>
          <div style={{ height: CHART_HEIGHT + 40 }}>
            <Chart
              ariaTitle={intl.formatMessage(messages.visualInsightsVmIopsTitle)}
              ariaDesc={intl.formatMessage(messages.visualInsightsVmIopsDesc)}
              containerComponent={iopsContainer}
              height={CHART_HEIGHT + 40}
              legendComponent={<ChartLegend data={legendData} height={20} gutter={15} responsive={false} />}
              legendPosition="bottom"
              padding={{ bottom: 35, left: 5, right: 5, top: 5 }}
              theme={ChartTheme}
              width={iopsWidth}
            >
              <ChartArea data={iopsReadData} interpolation="monotoneX" name="read" style={areaStyle(READ_COLOR)} />
              <ChartArea data={iopsWriteData} interpolation="monotoneX" name="write" style={areaStyle(WRITE_COLOR)} />
            </Chart>
          </div>
        </div>
      </SplitItem>
      <SplitItem isFilled>
        <Title headingLevel="h4" size="sm">
          {intl.formatMessage(messages.visualInsightsVmThroughputTitle)}
        </Title>
        <div ref={throughputRef}>
          <div style={{ height: CHART_HEIGHT + 40 }}>
            <Chart
              ariaTitle={intl.formatMessage(messages.visualInsightsVmThroughputTitle)}
              ariaDesc={intl.formatMessage(messages.visualInsightsVmThroughputDesc)}
              containerComponent={throughputContainer}
              height={CHART_HEIGHT + 40}
              legendComponent={<ChartLegend data={legendData} height={20} gutter={15} responsive={false} />}
              legendPosition="bottom"
              padding={{ bottom: 35, left: 5, right: 5, top: 5 }}
              theme={ChartTheme}
              width={throughputWidth}
            >
              <ChartArea data={bpsReadData} interpolation="monotoneX" name="read" style={areaStyle(READ_COLOR)} />
              <ChartArea data={bpsWriteData} interpolation="monotoneX" name="write" style={areaStyle(WRITE_COLOR)} />
            </Chart>
          </div>
        </div>
      </SplitItem>
    </Split>
  );
};

export { VmIoSparkline };
