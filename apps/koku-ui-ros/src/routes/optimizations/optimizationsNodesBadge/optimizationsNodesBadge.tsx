import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

export interface OptimizationsNodesBadgeOwnProps {
  cluster?: string | string[];
}

export interface OptimizationsNodesBadgeStateProps {
  count: number;
}

type OptimizationsNodesBadgeProps = OptimizationsNodesBadgeOwnProps & OptimizationsNodesBadgeStateProps;

const reportPathsType = RosPathsType.nodeRecommendations;
const reportType = RosType.ros;

const OptimizationsNodesBadge: React.FC<OptimizationsNodesBadgeProps> = ({
  cluster,
}: OptimizationsNodesBadgeOwnProps) => {
  const { count } = useMapToProps({ cluster });
  const intl = useIntl();

  if (count <= 0) {
    return null;
  }

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

const useMapToProps = ({ cluster }: OptimizationsNodesBadgeOwnProps): OptimizationsNodesBadgeStateProps => {
  const { count } = useRosCount({
    cluster,
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return { count };
};

export default OptimizationsNodesBadge;
