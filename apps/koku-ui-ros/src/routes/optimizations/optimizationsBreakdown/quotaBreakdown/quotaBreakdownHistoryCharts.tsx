import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import type { QuotaRecommendationHistoryEntry } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { QuotaBreakdownHistoryChart } from './quotaBreakdownHistoryChart';
import {
  groupHistoryByResource,
  isQuotaHistoryResource,
  QUOTA_HISTORY_RESOURCES,
  type QuotaHistoryResource,
} from './quotaHistoryUtils';

interface QuotaBreakdownHistoryChartsOwnProps {
  history?: QuotaRecommendationHistoryEntry[];
}

const resourceMessageKey: Record<QuotaHistoryResource, keyof typeof messages> = {
  cpu_request: 'quotaResourceCpuRequest',
  memory_request: 'quotaResourceMemoryRequest',
  storage_request: 'quotaResourceStorageRequest',
  pods: 'quotaResourcePods',
};

const QuotaBreakdownHistoryCharts: React.FC<QuotaBreakdownHistoryChartsOwnProps> = ({ history }) => {
  const intl = useIntl();
  const grouped = groupHistoryByResource(history);

  const resourcesWithData = QUOTA_HISTORY_RESOURCES.filter(resource => grouped.has(resource));

  if (resourcesWithData.length === 0) {
    return (
      <>
        <h3 style={{ marginBottom: 16 }}>{intl.formatMessage(messages.quotaHistorySectionTitle)}</h3>
        <EmptyState>
          <EmptyStateBody>{intl.formatMessage(messages.quotaHistoryEmpty)}</EmptyStateBody>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <h3 style={{ marginBottom: 16 }}>{intl.formatMessage(messages.quotaHistorySectionTitle)}</h3>
      {resourcesWithData.map(resource => {
        const entries = grouped.get(resource) ?? [];
        if (!isQuotaHistoryResource(resource)) {
          return null;
        }
        return (
          <QuotaBreakdownHistoryChart
            entries={entries}
            key={resource}
            resource={resource}
            resourceLabel={intl.formatMessage(messages[resourceMessageKey[resource]])}
          />
        );
      })}
    </>
  );
};

export { QuotaBreakdownHistoryCharts };
