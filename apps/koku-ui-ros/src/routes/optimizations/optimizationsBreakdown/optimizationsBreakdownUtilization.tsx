import './optimizationsBreakdown.scss';

import { Card, CardBody, CardTitle, Divider, Grid, GridItem, Title, TitleSizes } from '@patternfly/react-core';
import type { Recommendations } from 'api/ros/recommendations';
import { format } from 'date-fns';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import type { OptimizationType } from 'utils/commonTypes';
import { Interval, RecommendationType, ResourceType, UsageType } from 'utils/commonTypes';
import { getRecommendationTerm, hasRecommendation } from 'utils/recomendations';

import { OptimizationsBreakdownChart } from './optimizationsBreakdownChart';
import { chartStyles, styles } from './optimizationsBreakdownUtilization.styles';
import { PeakHoursChartCaption } from './shared/peakHoursChartCaption';

interface OptimizationsBreakdownUtilizationOwnProps {
  currentInterval?: Interval.short_term | Interval.medium_term | Interval.long_term;
  optimizationType?: OptimizationType;
  recommendations?: Recommendations;
}

type OptimizationsBreakdownUtilizationProps = OptimizationsBreakdownUtilizationOwnProps;

type RecSource = 'config' | 'business_hours';

const OptimizationsBreakdownUtilization: React.FC<OptimizationsBreakdownUtilizationProps> = ({
  currentInterval,
  optimizationType,
  recommendations,
}) => {
  const intl = useIntl();

  const createRecommendationDatum = (
    recommendationType: RecommendationType,
    resourceType: ResourceType,
    usageDatum,
    recSource: RecSource
  ) => {
    const term = getRecommendationTerm(recommendations, currentInterval);
    const engine = term?.recommendation_engines?.[optimizationType];
    const rec = recSource === 'business_hours' ? engine?.business_hours : engine?.config;
    const values = rec?.[resourceType]?.[recommendationType];

    const datum = [];
    usageDatum.forEach(data => {
      datum.push({
        ...data,
        name: resourceType === ResourceType.limits ? 'limit' : 'request',
        y: values?.amount,
        units: values?.format,
      });
    });
    return datum.length
      ? [
          {
            ...datum[0],
            key: undefined, // Don't use date here
            x: 0, // Extends threshold lines to chart edge
          },
          ...datum,
          {
            ...datum[0],
            key: undefined, // Don't use date here
            x: 100,
          },
        ]
      : [];
  };

  const buildPlotDatum = (plotsData: Record<string, any> | undefined, usageType: UsageType) => {
    if (!plotsData) {
      return [];
    }
    const datum = [];
    for (const key of Object.keys(plotsData)) {
      const data = plotsData?.[key]?.[usageType];
      const date = new Date(key);
      const xVal = currentInterval === Interval.short_term ? format(date, 'kk:mm') : format(date, 'MMM d');
      datum.push({
        key,
        name: usageType,
        units: data?.format,
        x: xVal,
        p50: data?.p50,
        p95: data?.p95,
        p99: data?.p99,
        max: data?.max,
        y: data?.p50 ?? null,
      });
    }
    return datum;
  };

  const createUsageDatum = (usageType: UsageType) => {
    const term = getRecommendationTerm(recommendations, currentInterval);
    const datum = buildPlotDatum(term?.plots?.plots_data, usageType);

    if (datum.length === 0 && recommendations?.monitoring_end_time) {
      if (currentInterval === Interval.short_term) {
        const today = new Date(recommendations?.monitoring_end_time);
        for (let hour = 24; hour > 0; hour -= 6) {
          today.setHours(today.getHours() - hour);
          datum.push({
            key: today.toDateString(),
            name: usageType,
            x: format(today, 'kk:mm'),
            y: null,
          });
        }
      } else {
        for (let day = currentInterval === Interval.long_term ? 15 : 7; day > 0; day--) {
          const today = new Date(recommendations?.monitoring_end_time);
          today.setDate(today.getDate() - day);
          datum.push({
            key: today.toDateString(),
            name: usageType,
            x: format(today, 'MMM d'),
            y: null,
          });
        }
      }
    }
    return datum;
  };

  const createBusinessHoursUsageDatum = (usageType: UsageType) => {
    const term = getRecommendationTerm(recommendations, currentInterval);
    return buildPlotDatum(term?.business_hours_plots?.plots_data, usageType);
  };

  const term = getRecommendationTerm(recommendations, currentInterval);
  const bh = term?.recommendation_engines?.[optimizationType]?.business_hours;
  const hasBhPlots = Boolean(
    term?.business_hours_plots?.plots_data && Object.keys(term.business_hours_plots.plots_data).length > 0
  );
  const showPeakHoursCharts = hasRecommendation(bh) && hasBhPlots;

  const renderChart = (
    name: string,
    usageType: UsageType,
    recommendationType: RecommendationType,
    usageDatum,
    recSource: RecSource
  ) => (
    <OptimizationsBreakdownChart
      baseHeight={chartStyles.chartHeight}
      limitData={createRecommendationDatum(recommendationType, ResourceType.limits, usageDatum, recSource)}
      name={name}
      requestData={createRecommendationDatum(recommendationType, ResourceType.requests, usageDatum, recSource)}
      usageData={usageDatum}
    />
  );

  const getAllHoursChart = (usageType: UsageType, recommendationType: RecommendationType) =>
    renderChart(`utilization-${usageType}`, usageType, recommendationType, createUsageDatum(usageType), 'config');

  const getPeakHoursChart = (usageType: UsageType, recommendationType: RecommendationType) =>
    renderChart(
      `utilization-peak-hours-${usageType}`,
      usageType,
      recommendationType,
      createBusinessHoursUsageDatum(usageType),
      'business_hours'
    );

  return (
    <Card>
      <Grid hasGutter>
        <GridItem xl={6}>
          <div style={styles.container}>
            <div style={styles.cardContainer}>
              <Card isPlain>
                <CardTitle>
                  <Title headingLevel="h2" size={TitleSizes.lg}>
                    {intl.formatMessage(messages.cpuUtilization)}
                  </Title>
                </CardTitle>
                <CardBody>{getAllHoursChart(UsageType.cpuUsage, RecommendationType.cpu)}</CardBody>
              </Card>
            </div>
            <Divider
              orientation={{
                default: 'vertical',
              }}
              style={styles.dividerContainer}
            />
          </div>
        </GridItem>
        <GridItem xl={6}>
          <Card isPlain>
            <CardTitle>
              <Title headingLevel="h2" size={TitleSizes.lg}>
                {intl.formatMessage(messages.memoryUtilization)}
              </Title>
            </CardTitle>
            <CardBody>{getAllHoursChart(UsageType.memoryUsage, RecommendationType.memory)}</CardBody>
          </Card>
        </GridItem>
      </Grid>
      {showPeakHoursCharts && (
        <div data-testid="utilization-peak-hours" style={{ padding: '0 16px 16px' }}>
          <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>
            {intl.formatMessage(messages.visualInsightsPeakHoursSectionTitle)}
          </Title>
          <PeakHoursChartCaption />
          <Grid hasGutter>
            <GridItem xl={6}>
              <Title headingLevel="h4" size="md">
                {intl.formatMessage(messages.cpuUtilization)}
              </Title>
              {getPeakHoursChart(UsageType.cpuUsage, RecommendationType.cpu)}
            </GridItem>
            <GridItem xl={6}>
              <Title headingLevel="h4" size="md">
                {intl.formatMessage(messages.memoryUtilization)}
              </Title>
              {getPeakHoursChart(UsageType.memoryUsage, RecommendationType.memory)}
            </GridItem>
          </Grid>
        </div>
      )}
    </Card>
  );
};

export { OptimizationsBreakdownUtilization };
