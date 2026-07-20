import type { ToolbarChipGroupExt } from 'routes/components/dataToolbar/utils/common';
import type { RosQuery } from 'api/queries/rosQuery';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { BasicToolbar } from 'routes/components/dataToolbar';
import type { Filter } from 'routes/utils/filter';

import { OptimizationsStorageGroupByToolbar } from '../optimizationsStorageGroupByToolbar';
import type { StorageGroupBy } from '../storageTableUtils';

interface OptimizationsSnapshotsToolbarProps {
  groupBy?: StorageGroupBy;
  isDisabled?: boolean;
  itemsPerPage?: number;
  itemsTotal?: number;
  onFilterAdded(filter: Filter);
  onFilterRemoved(filter: Filter);
  onGroupBySelect?: (value: StorageGroupBy) => void;
  pagination?: React.ReactNode;
  query?: RosQuery;
}

const OptimizationsSnapshotsToolbar: React.FC<OptimizationsSnapshotsToolbarProps> = ({
  groupBy,
  isDisabled,
  itemsPerPage,
  itemsTotal,
  onFilterAdded,
  onFilterRemoved,
  onGroupBySelect,
  pagination,
  query,
}) => {
  const intl = useIntl();

  const categoryOptions: ToolbarChipGroupExt[] = [
    { name: intl.formatMessage(messages.filterByValues, { value: 'cluster' }), key: 'cluster' },
    { name: intl.formatMessage(messages.filterByValues, { value: 'project' }), key: 'project' },
    {
      name: intl.formatMessage(messages.filterByValues, { value: 'classification' }),
      key: 'classification',
      selectClassName: 'selectOverride',
      selectOptions: [
        { name: intl.formatMessage(messages.snapshotClassificationOrphaned), key: 'orphaned' },
        { name: intl.formatMessage(messages.snapshotClassificationStale), key: 'stale' },
        { name: intl.formatMessage(messages.snapshotClassificationNeverRestored), key: 'never_restored' },
        { name: intl.formatMessage(messages.snapshotClassificationRedundant), key: 'redundant' },
        { name: intl.formatMessage(messages.snapshotClassificationManaged), key: 'managed' },
      ],
    },
    { name: intl.formatMessage(messages.sourcePvc), key: 'pvc_name' },
  ];

  return (
    <BasicToolbar
      actions={
        <OptimizationsStorageGroupByToolbar
          groupBy={groupBy}
          isDisabled={isDisabled}
          onGroupBySelect={onGroupBySelect}
        />
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

export { OptimizationsSnapshotsToolbar };
