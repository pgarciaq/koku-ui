import { Chart, ChartAxis, ChartBar, ChartGroup, ChartTooltip, ChartVoronoiContainer } from '@patternfly/react-charts/victory';
import { Card, CardBody, CardTitle, EmptyState, EmptyStateBody, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import type { SnapshotAgeBucket } from 'api/ros/recommendations';
import { fetchSnapshotAgeDistribution } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { getResizeObserver } from 'routes/components/charts/common/chartUtils';

const BUCKET_COLORS = ['#3E8635', '#F0AB00', '#EC7A08', '#C9190B'];

const SnapshotAgeDistributionChart: React.FC = () => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [buckets, setBuckets] = useState<SnapshotAgeBucket[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    fetchSnapshotAgeDistribution()
      .then(response => {
        const data = response?.data;
        setBuckets(data?.buckets ?? []);
        setTotal(data?.total ?? 0);
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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

  const title = intl.formatMessage(messages.visualInsightsSnapshotAgeDistribution);

  if (isLoading) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <Spinner size="lg" aria-label={title} />
        </CardBody>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <EmptyState variant={EmptyStateVariant.sm}>
            <Title headingLevel="h4" size="md">
              {title}
            </Title>
            <EmptyStateBody>{intl.formatMessage(messages.visualInsightsSnapshotAgeDistributionError)}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <EmptyState variant={EmptyStateVariant.sm}>
            <Title headingLevel="h4" size="md">
              {title}
            </Title>
            <EmptyStateBody>{intl.formatMessage(messages.visualInsightsSnapshotAgeDistributionEmpty)}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const chartData = buckets.map((bucket, idx) => ({
    x: bucket.label,
    y: bucket.count,
    name: `bucket-${idx}`,
  }));

  const chartHeight = 250;
  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <div ref={containerRef}>
          <div style={{ height: chartHeight }}>
            <Chart
              ariaTitle={title}
              ariaDesc={intl.formatMessage(messages.visualInsightsSnapshotAgeDistributionDesc)}
              containerComponent={
                <ChartVoronoiContainer
                  labels={({ datum }) =>
                    intl.formatMessage(messages.visualInsightsSnapshotAgeDistributionTooltip, {
                      label: datum.x,
                      count: datum.y,
                    })
                  }
                  labelComponent={<ChartTooltip constrainToVisibleArea />}
                />
              }
              domain={{ y: [0, maxCount * 1.1] }}
              domainPadding={{ x: 50 }}
              height={chartHeight}
              padding={{ bottom: 60, left: 60, right: 30, top: 20 }}
              width={width > 0 ? width : 600}
            >
              <ChartAxis fixLabelOverlap />
              <ChartAxis
                dependentAxis
                showGrid
                label={intl.formatMessage(messages.visualInsightsSnapshotAgeDistributionYAxis)}
                tickFormat={t => (Number.isInteger(t) ? t : '')}
              />
              <ChartGroup>
                {chartData.map((d, idx) => (
                  <ChartBar
                    key={d.name}
                    data={[d]}
                    name={d.name}
                    barWidth={40}
                    style={{
                      data: {
                        fill: BUCKET_COLORS[idx % BUCKET_COLORS.length],
                      },
                    }}
                  />
                ))}
              </ChartGroup>
            </Chart>
          </div>
        </div>
        <table
          aria-label={title}
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
        >
          <caption>{title}</caption>
          <thead>
            <tr>
              <th>{intl.formatMessage(messages.visualInsightsSnapshotAgeDistributionBucketHeader)}</th>
              <th>{intl.formatMessage(messages.visualInsightsSnapshotAgeDistributionCountHeader)}</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map(bucket => (
              <tr key={bucket.label}>
                <td>{bucket.label}</td>
                <td>{bucket.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

export { SnapshotAgeDistributionChart };
