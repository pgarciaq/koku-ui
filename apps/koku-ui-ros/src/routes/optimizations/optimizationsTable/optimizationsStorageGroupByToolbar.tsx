import messages from 'locales/messages';
import React from 'react';
import { PerspectiveSelect } from 'routes/components/perspective/perspectiveSelect';

import type { StorageGroupBy } from './storageTableUtils';

interface OptimizationsStorageGroupByToolbarProps {
  groupBy?: StorageGroupBy;
  isDisabled?: boolean;
  onGroupBySelect?: (value: StorageGroupBy) => void;
  /** When true, hide the project group-by option (e.g. cluster-quota list). */
  projectGroupByDisabled?: boolean;
}

const OptimizationsStorageGroupByToolbar: React.FC<OptimizationsStorageGroupByToolbarProps> = ({
  groupBy = '',
  isDisabled,
  onGroupBySelect,
  projectGroupByDisabled = false,
}) => {
  const options = [
    {
      label: messages.storageGroupByNone,
      value: '',
    },
    {
      label: messages.storageGroupByCluster,
      value: 'cluster',
    },
    ...(projectGroupByDisabled
      ? []
      : [
          {
            label: messages.storageGroupByProject,
            value: 'project',
          },
        ]),
  ];

  return (
    <PerspectiveSelect
      currentItem={groupBy}
      isDisabled={isDisabled}
      onSelect={onGroupBySelect}
      options={options}
      title={messages.storageGroupBy}
    />
  );
};

export { OptimizationsStorageGroupByToolbar };
