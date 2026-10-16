import { Flex, FlexItem } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { formatSavingsCellValue } from 'routes/optimizations/optimizationsTable/savingsCellUtils';

export interface HcpSummaryGroup {
  hosted_cluster_id?: string;
  count?: number;
  estimated_savings?: { value?: string; units?: string } | null;
}

interface HcpSummaryStripProps {
  groups?: HcpSummaryGroup[];
  onSelect: (hostedClusterId: string) => void;
}

/** Per-hosted-cluster totals above the flat list: count + savings per HC, click drills into the filtered list. */
export const HcpSummaryStrip: React.FC<HcpSummaryStripProps> = ({ groups, onSelect }) => {
  const intl = useIntl();
  if (!groups || groups.length === 0) {
    return null;
  }
  return (
    <Flex style={{ marginBottom: 16 }} spaceItems={{ default: 'spaceItemsLg' }}>
      {groups.map(group => {
        const hostedClusterId = group.hosted_cluster_id ?? '';
        const savings = formatSavingsCellValue(group.estimated_savings?.value, group.estimated_savings?.units) ?? '—';
        return (
          <FlexItem key={hostedClusterId || 'unassociated'}>
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                onSelect(hostedClusterId);
              }}
            >
              {hostedClusterId}
            </a>{' '}
            {intl.formatMessage(messages.storageRecommendationCount)}: {group.count ?? 0} · {savings}
          </FlexItem>
        );
      })}
    </Flex>
  );
};
