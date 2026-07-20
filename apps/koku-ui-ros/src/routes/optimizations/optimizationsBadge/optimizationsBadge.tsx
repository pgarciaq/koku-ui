import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

export interface OptimizationsBadgeOwnProps {
  cluster?: string | string[]; // Cluster name to filter by
  project?: string | string[]; // Project name to filter by
}

export interface OptimizationsBadgeStateProps {
  count: number;
}

type OptimizationsBadgeProps = OptimizationsBadgeOwnProps & OptimizationsBadgeStateProps;

const reportPathsType = RosPathsType.recommendations;
const reportType = RosType.ros;

const OptimizationsBadge: React.FC<OptimizationsBadgeProps> = ({ cluster, project }: OptimizationsBadgeOwnProps) => {
  const { count } = useMapToProps({ cluster, project });
  const intl = useIntl();

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

const useMapToProps = ({ cluster, project }: OptimizationsBadgeOwnProps): OptimizationsBadgeStateProps => {
  const { count } = useRosCount({
    cluster,
    project,
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return { count };
};

export default OptimizationsBadge;
