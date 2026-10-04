import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

export interface OptimizationsHcpBadgeOwnProps {
  cluster?: string | string[]; // Cluster name to filter by
}

export interface OptimizationsHcpBadgeStateProps {
  count: number;
}

type OptimizationsHcpBadgeProps = OptimizationsHcpBadgeOwnProps & OptimizationsHcpBadgeStateProps;

const reportPathsType = RosPathsType.hcpRecommendations;
const reportType = RosType.ros;

const OptimizationsHcpBadge: React.FC<OptimizationsHcpBadgeProps> = ({ cluster }: OptimizationsHcpBadgeOwnProps) => {
  const { count } = useMapToProps({ cluster });
  const intl = useIntl();

  if (count <= 0) {
    return null;
  }

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

const useMapToProps = ({ cluster }: OptimizationsHcpBadgeOwnProps): OptimizationsHcpBadgeStateProps => {
  const { count } = useRosCount({
    cluster,
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return { count };
};

export default OptimizationsHcpBadge;
