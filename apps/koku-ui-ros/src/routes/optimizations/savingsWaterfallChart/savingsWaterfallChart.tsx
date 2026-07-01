import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Skeleton,
  Title,
} from '@patternfly/react-core';
import type { FleetSavingsByPlugin } from 'api/ros/savingsSummary';
import { fetchFleetSavingsSummary } from 'api/ros/savingsSummary';
import { useIsVisualInsightsToggleEnabled } from 'components/featureToggle';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

interface BarDatum {
  x: string;
  y: number;
  label: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  container: 'Container',
  gpu: 'GPU',
  node: 'Node',
  pvc: 'PVC',
  snapshot: 'Snapshot',
  vm: 'VM',
};

const POSITIVE_COLOR = '#06C';
const NEGATIVE_COLOR = '#C9190B';

function parseSavingsValue(value?: string): number {
  if (!value) {
    return 0;
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function formatDollar(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

function buildChartData(byPlugin: FleetSavingsByPlugin | undefined): BarDatum[] {
  if (!byPlugin) {
    return [];
  }
  const entries = Object.entries(byPlugin)
    .map(([key, amount]) => ({
      category: key,
      value: parseSavingsValue(amount?.value),
    }))
    .filter(entry => entry.value !== 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return entries.map(entry => ({
    x: CATEGORY_LABELS[entry.category] ?? entry.category,
    y: entry.value,
    label: `${CATEGORY_LABELS[entry.category] ?? entry.category}: ${formatDollar(entry.value)}/mo`,
  }));
}

const SavingsWaterfallChart: React.FC = () => {
  const intl = useIntl();
  const isVisualInsightsEnabled = useIsVisualInsightsToggleEnabled();
  const [byPlugin, setByPlugin] = useState<FleetSavingsByPlugin | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [totalSavings, setTotalSavings] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    if (!isVisualInsightsEnabled) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);

    fetchFleetSavingsSummary()
      .then(response => {
        if (cancelled) {
          return;
        }
        setByPlugin(response.data?.by_plugin);
        setTotalSavings(response.data?.estimated_monthly_savings?.value);
        setCurrency(response.data?.currency ?? 'USD');
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isVisualInsightsEnabled]);

  if (!isVisualInsightsEnabled) {
    return null;
  }

  const title = intl.formatMessage(messages.savingsWaterfallTitle);

  if (isLoading) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <Skeleton width="100%" height="200px" />
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
            <EmptyStateBody>{intl.formatMessage(messages.savingsWaterfallError)}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const chartData = buildChartData(byPlugin);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <EmptyState variant={EmptyStateVariant.sm}>
            <Title headingLevel="h4" size="md">
              {title}
            </Title>
            <EmptyStateBody>{intl.formatMessage(messages.savingsWaterfallEmpty)}</EmptyStateBody>
          </EmptyState>
        </CardBody>
      </Card>
    );
  }

  const colorScale = chartData.map(d => (d.y >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR));
  const maxAbsValue = Math.max(...chartData.map(d => Math.abs(d.y)));
  const domainPadding = maxAbsValue * 0.1;
  const hasNegatives = chartData.some(d => d.y < 0);
  const domainMin = hasNegatives ? -(maxAbsValue + domainPadding) : 0;

  const totalValue = parseSavingsValue(totalSavings);
  const subtitle = intl.formatMessage(messages.savingsWaterfallSubtitle, {
    total: formatDollar(totalValue),
    currency,
  });

  const chartHeight = Math.max(200, chartData.length * 50 + 60);

  return (
    <Card>
      <CardTitle>
        {title}
        <div style={{ fontSize: '0.85em', fontWeight: 'normal', color: 'var(--pf-t--global--text--color--subtle)' }}>
          {subtitle}
        </div>
      </CardTitle>
      <CardBody>
        <div style={{ height: chartHeight, width: '100%' }}>
          <Chart
            ariaTitle={title}
            ariaDesc={intl.formatMessage(messages.savingsWaterfallAriaDesc)}
            containerComponent={
              <ChartVoronoiContainer labels={({ datum }) => datum.label} constrainToVisibleArea />
            }
            domainPadding={{ x: [20, 20], y: [0, 20] }}
            domain={{ y: [domainMin, maxAbsValue + domainPadding] }}
            height={chartHeight}
            horizontal
            padding={{ bottom: 40, left: 100, right: 60, top: 20 }}
            width={600}
          >
            <ChartAxis />
            <ChartAxis
              dependentAxis
              tickFormat={t => {
                const abs = Math.abs(t);
                if (abs >= 1000) {
                  return `$${(abs / 1000).toFixed(0)}k`;
                }
                return `$${abs.toFixed(0)}`;
              }}
            />
            <ChartGroup>
              <ChartBar
                colorScale={colorScale}
                data={chartData}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
                style={{
                  data: {
                    fill: ({ index }) => colorScale[index as number] ?? POSITIVE_COLOR,
                  },
                }}
              />
            </ChartGroup>
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

export { SavingsWaterfallChart };
