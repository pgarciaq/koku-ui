import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

export interface OptimizationsNamespacesBadgeOwnProps {
  cluster?: string | string[]; // Cluster name to filter by
}

export interface OptimizationsNamespacesBadgeStateProps {
  count: number;
}

type OptimizationsNamespacesBadgeProps = OptimizationsNamespacesBadgeOwnProps & OptimizationsNamespacesBadgeStateProps;

const reportPathsType = RosPathsType.namespaceRecommendations;
const reportType = RosType.ros;

const OptimizationsNamespacesBadge: React.FC<OptimizationsNamespacesBadgeProps> = ({
  cluster,
}: OptimizationsNamespacesBadgeOwnProps) => {
  const { count } = useMapToProps({ cluster });
  const intl = useIntl();

  if (count <= 0) {
    return null;
  }

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

const useMapToProps = ({ cluster }: OptimizationsNamespacesBadgeOwnProps): OptimizationsNamespacesBadgeStateProps => {
  const { count } = useRosCount({
    cluster,
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return { count };
};

export default OptimizationsNamespacesBadge;
