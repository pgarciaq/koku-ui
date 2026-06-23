import type { ToolbarChipGroupExt } from 'routes/components/dataToolbar/utils/common';
import type { RosQuery } from 'api/queries/rosQuery';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { Filter } from 'routes/utils/filter';

import { OptimizationsProjectionToolbar } from '../optimizationsProjectionToolbar';
import { OptimizationsStorageGroupByToolbar } from '../optimizationsStorageGroupByToolbar';
import type { StorageGroupBy } from '../storageTableUtils';

interface OptimizationsPvcsToolbarProps {
  groupBy?: StorageGroupBy;
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onGroupBySelect?: (value: StorageGroupBy) => void;
  onTermSelect?: (value: string) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

const OptimizationsPvcsToolbar: React.FC<OptimizationsPvcsToolbarProps> = ({
  groupBy,
  isDisabled,
  itemsPerPage,
  itemsTotal,
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
    { name: intl.formatMessage(messages.optimizationsNames, { value: 'pvc_name' }), key: 'pvc_name' },
    {
      name: intl.formatMessage(messages.filterByValues, { value: 'storage_class' }),
      key: 'storageclass',
    },
    {
      name: intl.formatMessage(messages.filterByValues, { value: 'classification' }),
      key: 'classification',
      selectClassName: 'selectOverride',
      selectOptions: [
        { name: intl.formatMessage(messages.pvcClassificationOversized), key: 'oversized' },
        { name: intl.formatMessage(messages.pvcClassificationNearFull), key: 'near_full' },
        { name: intl.formatMessage(messages.pvcClassificationOrphaned), key: 'orphaned' },
        { name: intl.formatMessage(messages.pvcClassificationHealthy), key: 'healthy' },
      ],
    },
    {
      name: intl.formatMessage(messages.filterByValues, { value: 'tag' }),
      key: 'tag',
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
            isDisabled={isDisabled}
            onTermSelect={onTermSelect}
            showEngine={false}
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

export { OptimizationsPvcsToolbar };
