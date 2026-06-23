import { Alert, Skeleton } from '@patternfly/react-core';
import type { TabSummaryPlugin } from 'api/ros/savingsSummary';
import { useOptimizationsTabSummary } from 'hooks/useOptimizationsTabSummary';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { FetchStatus } from 'store/common';

export interface OptimizationsTabSummaryBannerProps {
  engine?: string;
  plugin: TabSummaryPlugin;
  term?: string;
  variant?: 'savings' | 'waste';
}

const formatMoney = (value?: string, units?: string) => {
  if (value == null || value === '' || Number(value) === 0) {
    return null;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return `$${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${units ?? 'USD'}`;
};

const OptimizationsTabSummaryBanner: React.FC<OptimizationsTabSummaryBannerProps> = ({
  engine,
  plugin,
  term,
  variant = plugin === 'snapshot' ? 'waste' : 'savings',
}) => {
  const intl = useIntl();
  const { count, savingsUnits, savingsValue, summaryFetchStatus, countFetchStatus } = useOptimizationsTabSummary({
    engine,
    plugin,
    term,
  });

  const isLoading =
    summaryFetchStatus === FetchStatus.inProgress || countFetchStatus === FetchStatus.inProgress;

  if (isLoading) {
    return (
      <div style={{ marginBottom: 16 }}>
        <Skeleton width="40%" />
      </div>
    );
  }

  const money = formatMoney(savingsValue, savingsUnits);
  const showSavings = variant === 'savings' && money;
  const showWaste = variant === 'waste' && money;

  let message: React.ReactNode;
  if (showWaste) {
    message = intl.formatMessage(messages.optimizationsTabSummaryWaste, { amount: money, count });
  } else if (showSavings) {
    message = intl.formatMessage(messages.optimizationsTabSummarySavings, { amount: money, count });
  } else {
    message = intl.formatMessage(messages.optimizationsTabSummaryCount, { count });
  }

  return (
    <Alert
      isInline
      variant={variant === 'waste' ? 'warning' : 'info'}
      title={message}
      style={{ marginBottom: 16 }}
    />
  );
};

export { OptimizationsTabSummaryBanner };
