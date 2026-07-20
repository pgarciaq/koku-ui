import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

const OptimizationsStorageBadge: React.FC = () => {
  const intl = useIntl();
  const { count: pvcCount } = useRosCount({
    rosPathsType: RosPathsType.pvcRecommendations,
    rosType: RosType.ros,
  });
  const { count: snapshotCount } = useRosCount({
    rosPathsType: RosPathsType.snapshotRecommendations,
    rosType: RosType.ros,
  });
  const count = pvcCount + snapshotCount;

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

export { OptimizationsStorageBadge };
