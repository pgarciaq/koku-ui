import { Flex, FlexItem } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { PerspectiveSelect } from 'routes/components/perspective/perspectiveSelect';

import type { StorageGroupBy } from './storageTableUtils';
import { styles } from '../optimizationsDetails/optimizationsDetailsToolbar.styles';

interface OptimizationsStorageGroupByToolbarProps {
  groupBy?: StorageGroupBy;
  isDisabled?: boolean;
  onGroupBySelect?: (value: StorageGroupBy) => void;
}

const OptimizationsStorageGroupByToolbar: React.FC<OptimizationsStorageGroupByToolbarProps> = ({
  groupBy = '',
  isDisabled,
  onGroupBySelect,
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
    {
      label: messages.storageGroupByProject,
      value: 'project',
    },
  ];

  return (
    <Flex style={styles.toolbarContainer}>
      <FlexItem>
        <PerspectiveSelect
          currentItem={groupBy}
          isDisabled={isDisabled}
          onSelect={onGroupBySelect}
          options={options}
          title={messages.storageGroupBy}
        />
      </FlexItem>
    </Flex>
  );
};

export { OptimizationsStorageGroupByToolbar };
