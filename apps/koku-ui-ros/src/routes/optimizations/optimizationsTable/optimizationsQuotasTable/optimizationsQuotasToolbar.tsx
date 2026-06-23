import type { ToolbarChipGroupExt } from 'routes/components/dataToolbar/utils/common';
import type { RosQuery } from 'api/queries/rosQuery';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { Filter } from 'routes/utils/filter';

import { OptimizationsProjectionToolbar } from '../optimizationsProjectionToolbar';
import { OptimizationsStorageGroupByToolbar } from '../optimizationsStorageGroupByToolbar';
import type { QuotaGroupBy } from '../quotaTableUtils';

interface OptimizationsQuotasToolbarProps {
  groupBy?: QuotaGroupBy;
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onEngineSelect?: (value: string) => void;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onGroupBySelect?: (value: QuotaGroupBy) => void;
  onTermSelect?: (value: string) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

const OptimizationsQuotasToolbar: React.FC<OptimizationsQuotasToolbarProps> = ({
  groupBy,
  isDisabled,
  itemsPerPage,
  itemsTotal,
  onEngineSelect,
  onFilterAdded,
  onFilterRemoved,
  onGroupBySelect,
  onTermSelect,
  pagination,
  query,
}) => {
  const intl = useIntl();

  const categoryOptions: ToolbarChipGroupExt[] = [
    { name: intl.formatMessage(messages.filterByValues, { value: 'cluster' }), key: 'cluster' },
    { name: intl.formatMessage(messages.filterByValues, { value: 'project' }), key: 'project' },
    { name: intl.formatMessage(messages.quotaName), key: 'quota_name' },
    {
      name: intl.formatMessage(messages.filterByValues, { value: 'classification' }),
      key: 'classification',
      selectClassName: 'selectOverride',
      selectOptions: [
        { name: intl.formatMessage(messages.quotaRecommendationTypeTighten), key: 'tighten' },
        { name: intl.formatMessage(messages.quotaRecommendationTypeRaise), key: 'raise' },
        { name: intl.formatMessage(messages.quotaRecommendationTypeOptimal), key: 'optimal' },
      ],
    },
    {
      name: intl.formatMessage(messages.quotaRiskLevel),
      key: 'risk_level',
      selectClassName: 'selectOverride',
      selectOptions: [
        { name: intl.formatMessage(messages.quotaRiskLevelHigh), key: 'high' },
        { name: intl.formatMessage(messages.quotaRiskLevelMedium), key: 'medium' },
        { name: intl.formatMessage(messages.quotaRiskLevelLow), key: 'low' },
      ],
    },
  ];

  return (
    <BasicToolbar
      actions={
        <>
          <OptimizationsStorageGroupByToolbar
            groupBy={groupBy}
            isDisabled={isDisabled}
            onGroupBySelect={onGroupBySelect}
          />
          <OptimizationsProjectionToolbar
            engine={query?.engine}
            onEngineSelect={onEngineSelect}
            onTermSelect={onTermSelect}
            term={query?.term}
          />
        </>
      }
      categoryOptions={categoryOptions}
      isDisabled={isDisabled}
      itemsPerPage={itemsPerPage}
      itemsTotal={itemsTotal}
      onFilterAdded={onFilterAdded}
      onFilterRemoved={onFilterRemoved}
      pagination={pagination}
      query={query}
      showFilter
      useActiveFilters
    />
  );
};

export { OptimizationsQuotasToolbar };
