import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts/victory';
import { Card, CardBody, CardTitle, EmptyState, EmptyStateBody, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import type { SnapshotCostByTypeItem } from 'api/ros/recommendations';
import { fetchSnapshotCostByType } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

const TYPE_COLORS: Record<string, string> = {
  orphaned: '#C9190B',
  stale: '#F0AB00',
  never_restored: '#EC7A08',
  redundant: '#8481DD',
  managed: '#3E8635',
  active: '#06C',
};

function getColorForType(type: string): string {
  return TYPE_COLORS[type] ?? '#6A6E73';
}

function formatCostUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTypeLabel(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const SnapshotCostByTypeChart: React.FC = () => {
  const intl = useIntl();
  const [data, setData] = useState<SnapshotCostByTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    fetchSnapshotCostByType()
      .then(response => {
        setData(response?.data?.data ?? []);
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const title = intl.formatMessage(messages.visualInsightsSnapshotCostByType);

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
            <EmptyStateBody>{intl.formatMessage(messages.visualInsightsSnapshotCostByTypeError)}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const totalCost = data.reduce((sum, item) => sum + item.total_cost_cents, 0);

  if (data.length === 0 || totalCost === 0) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <EmptyState variant={EmptyStateVariant.sm}>
            <Title headingLevel="h4" size="md">
              {title}
            </Title>
            <EmptyStateBody>{intl.formatMessage(messages.visualInsightsSnapshotCostByTypeEmpty)}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    x: formatTypeLabel(item.recommendation_type),
    y: item.total_cost_cents,
  }));

  const legendData = data.map(item => ({
    name: `${formatTypeLabel(item.recommendation_type)}: ${formatCostUSD(item.total_cost_cents)}`,
  }));

  const colorScale = data.map(item => getColorForType(item.recommendation_type));

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <div style={{ height: 275, width: 450 }}>
          <ChartDonut
            ariaTitle={title}
            ariaDesc={intl.formatMessage(messages.visualInsightsSnapshotCostByTypeDesc)}
            colorScale={colorScale}
            constrainToVisibleArea
            data={chartData}
            height={275}
            labels={({ datum }) => {
              const item = data.find(d => formatTypeLabel(d.recommendation_type) === datum.x);
              if (!item) {
                return `${datum.x}: ${formatCostUSD(datum.y)}`;
              }
              return intl.formatMessage(messages.visualInsightsSnapshotCostByTypeTooltip, {
                type: datum.x,
                cost: formatCostUSD(datum.y),
                count: item.count,
              });
            }}
            legendData={legendData}
            legendOrientation="vertical"
            legendPosition="right"
            padding={{ bottom: 20, left: 20, right: 180, top: 20 }}
            subTitle={intl.formatMessage(messages.visualInsightsSnapshotCostByType)}
            themeColor={ChartThemeColor.multiOrdered}
            title={formatCostUSD(totalCost)}
            width={450}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export { SnapshotCostByTypeChart };
