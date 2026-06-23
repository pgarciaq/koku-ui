import { Flex, FlexItem } from '@patternfly/react-core';
import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import { useRecommendationTermOptions } from 'hooks/useRecommendationTermOptions';
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
  /** PVC/snapshot lists set false — term labels come from PVC settings, not Kruize 24h/7d/15d. */
  showEngine?: boolean;
  term?: string;
  /** Override term dropdown options. When omitted and showEngine is false, PVC settings are loaded. */
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
  const { isLoading: pvcTermsLoading, termOptions: pvcTermOptions } = useRecommendationTermOptions('pvc');

  const termOptions = useMemo(() => {
    if (termOptionsProp) {
      return termOptionsProp;
    }
    if (!showEngine) {
      return pvcTermOptions.map(option => ({ label: option.label, value: option.value }));
    }
    return CONTAINER_TERM_OPTIONS;
  }, [pvcTermOptions, showEngine, termOptionsProp]);

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

  const termSelectDisabled = isDisabled || (!showEngine && !termOptionsProp && pvcTermsLoading);

  return (
    <Flex style={styles.toolbarContainer}>
      <FlexItem>
        <PerspectiveSelect
          currentItem={term || ROS_LIST_TERM}
          isDisabled={termSelectDisabled}
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
