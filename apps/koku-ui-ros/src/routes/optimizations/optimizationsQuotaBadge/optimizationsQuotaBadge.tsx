import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

const OptimizationsQuotaBadge: React.FC = () => {
  const intl = useIntl();
  const { count: namespaceCount } = useRosCount({
    rosPathsType: RosPathsType.quotaRecommendations,
    rosType: RosType.ros,
  });
  const { count: clusterCount } = useRosCount({
    rosPathsType: RosPathsType.clusterQuotaRecommendations,
    rosType: RosType.ros,
  });
  const count = namespaceCount + clusterCount;

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

export { OptimizationsQuotaBadge };
