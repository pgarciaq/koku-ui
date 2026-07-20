import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { InfrastructureIcon } from '@patternfly/react-icons/dist/esm/icons/infrastructure-icon';
import { MoneyBillIcon } from '@patternfly/react-icons/dist/esm/icons/money-bill-icon';
import { TimesCircleIcon } from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';
import { useFleetSummary } from 'hooks/useFleetSummary';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { FetchStatus } from 'store/common';

import { styles } from './fleetSummaryCards.styles';

const formatCurrency = (value?: string, units?: string): string | null => {
  if (value == null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  const formatted = numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${formatted} ${units ?? 'USD'}`;
};

const formatPercent = (count: number | undefined, total: number | undefined): string | null => {
  if (count == null || total == null || total === 0) {
    return null;
  }
  const pct = ((count / total) * 100).toFixed(1);
  return pct;
};

const FleetSummaryCards: React.FC = () => {
  const intl = useIntl();
  const { data, fetchStatus } = useFleetSummary();

  if (fetchStatus === FetchStatus.inProgress) {
    return (
      <div style={styles.container}>
        <Grid hasGutter>
          {[0, 1, 2, 3, 4].map(i => (
            <GridItem key={i} md={6} lg={4} xl2={2}>
              <Card isCompact>
                <CardBody>
                  <Skeleton width="60%" height="20px" style={{ marginBottom: 8 }} />
                  <Skeleton width="40%" height="32px" />
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </div>
    );
  }

  if (fetchStatus === FetchStatus.none || !data) {
    return null;
  }

  const { total_containers, idle_containers, abandoned_containers, total_monthly_savings, cluster_count } = data;

  const hasData = total_containers != null && total_containers > 0;
  if (!hasData) {
    return null;
  }

  const idlePercent = formatPercent(idle_containers, total_containers);
  const abandonedPercent = formatPercent(abandoned_containers, total_containers);
  const savingsFormatted = formatCurrency(total_monthly_savings?.value, total_monthly_savings?.units);

  return (
    <div style={styles.container}>
      <Grid hasGutter>
        <GridItem md={6} lg={4} xl2={2}>
          <Card isCompact>
            <CardTitle>
              <Icon size="md" style={styles.iconDefault}>
                <CubesIcon />
              </Icon>{' '}
              {intl.formatMessage(messages.fleetSummaryTotalContainers)}
            </CardTitle>
            <CardBody>
              <Title headingLevel="h3" size={TitleSizes['2xl']}>
                {total_containers?.toLocaleString() ?? '—'}
              </Title>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem md={6} lg={4} xl2={2}>
          <Card isCompact>
            <CardTitle>
              <Icon size="md" status="warning">
                <ExclamationTriangleIcon />
              </Icon>{' '}
              {intl.formatMessage(messages.fleetSummaryIdleContainers)}
            </CardTitle>
            <CardBody>
              <Title headingLevel="h3" size={TitleSizes['2xl']}>
                {idle_containers?.toLocaleString() ?? '—'}
              </Title>
              {idlePercent && (
                <span style={styles.subtitle}>
                  {intl.formatMessage(messages.fleetSummaryPercentOfTotal, { percent: idlePercent })}
                </span>
              )}
            </CardBody>
          </Card>
        </GridItem>

        <GridItem md={6} lg={4} xl2={2}>
          <Card isCompact>
            <CardTitle>
              <Icon size="md" status="danger">
                <TimesCircleIcon />
              </Icon>{' '}
              {intl.formatMessage(messages.fleetSummaryAbandonedContainers)}
            </CardTitle>
            <CardBody>
              <Title headingLevel="h3" size={TitleSizes['2xl']}>
                {abandoned_containers?.toLocaleString() ?? '—'}
              </Title>
              {abandonedPercent && (
                <span style={styles.subtitle}>
                  {intl.formatMessage(messages.fleetSummaryPercentOfTotal, { percent: abandonedPercent })}
                </span>
              )}
            </CardBody>
          </Card>
        </GridItem>

        <GridItem md={6} lg={4} xl2={2}>
          <Card isCompact>
            <CardTitle>
              <Icon size="md" style={styles.iconSuccess}>
                <MoneyBillIcon />
              </Icon>{' '}
              {intl.formatMessage(messages.fleetSummaryPotentialSavings)}
            </CardTitle>
            <CardBody>
              <Title headingLevel="h3" size={TitleSizes['2xl']}>
                {savingsFormatted ?? '—'}
              </Title>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem md={6} lg={4} xl2={2}>
          <Card isCompact>
            <CardTitle>
              <Icon size="md" style={styles.iconDefault}>
                <InfrastructureIcon />
              </Icon>{' '}
              {intl.formatMessage(messages.fleetSummaryClusters)}
            </CardTitle>
            <CardBody>
              <Title headingLevel="h3" size={TitleSizes['2xl']}>
                {cluster_count?.toLocaleString() ?? '—'}
              </Title>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export { FleetSummaryCards };
