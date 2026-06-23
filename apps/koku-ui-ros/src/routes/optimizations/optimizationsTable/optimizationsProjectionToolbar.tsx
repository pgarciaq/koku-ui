import { Flex, FlexItem } from '@patternfly/react-core';
import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import type { PerspectiveSelectOptionLabel } from 'routes/components/perspective/perspectiveSelect';
import { PerspectiveSelect } from 'routes/components/perspective/perspectiveSelect';
import { Interval, OptimizationType } from 'utils/commonTypes';

import { styles } from '../optimizationsDetails/optimizationsDetailsToolbar.styles';

export interface OptimizationsProjectionTermOption {
  label: PerspectiveSelectOptionLabel;
  value: string;
}

const CONTAINER_TERM_OPTIONS: OptimizationsProjectionTermOption[] = [
  {
    label: messages.optimizationsShortTerm,
    value: Interval.short_term,
  },
  {
    label: messages.optimizationsMediumTerm,
    value: Interval.medium_term,
  },
  {
    label: messages.optimizationsLongTerm,
    value: Interval.long_term,
  },
];

interface OptimizationsProjectionToolbarOwnProps {
  engine?: string;
  isDisabled?: boolean;
  onEngineSelect?: (value: string) => void;
  onTermSelect?: (value: string) => void;
  showEngine?: boolean;
  term?: string;
  termOptions?: OptimizationsProjectionTermOption[];
}

type OptimizationsProjectionToolbarProps = OptimizationsProjectionToolbarOwnProps;

const OptimizationsProjectionToolbar: React.FC<OptimizationsProjectionToolbarProps> = ({
  engine,
  isDisabled,
  onEngineSelect,
  onTermSelect,
  showEngine = true,
  term,
  termOptions: termOptionsProp,
}) => {
  const termOptions = useMemo(
    () => termOptionsProp ?? CONTAINER_TERM_OPTIONS,
    [termOptionsProp]
  );

  const engineOptions = [
    {
      label: messages.cost,
      value: OptimizationType.cost,
    },
    {
      label: messages.performance,
      value: OptimizationType.performance,
    },
  ];

  return (
    <Flex style={styles.toolbarContainer}>
      <FlexItem>
        <PerspectiveSelect
          currentItem={term || ROS_LIST_TERM}
          isDisabled={isDisabled}
          onSelect={onTermSelect}
          options={termOptions}
          title={messages.optimizationsType}
        />
      </FlexItem>
      {showEngine && (
        <FlexItem>
          <PerspectiveSelect
            currentItem={engine || ROS_LIST_ENGINE}
            isDisabled={isDisabled}
            onSelect={onEngineSelect}
            options={engineOptions}
            title={messages.optimizeFor}
          />
        </FlexItem>
      )}
    </Flex>
  );
};

export { OptimizationsProjectionToolbar };
