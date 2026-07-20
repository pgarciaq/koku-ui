import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

export interface OptimizationsVmsBadgeOwnProps {
  cluster?: string | string[];
}

export interface OptimizationsVmsBadgeStateProps {
  count: number;
}

type OptimizationsVmsBadgeProps = OptimizationsVmsBadgeOwnProps & OptimizationsVmsBadgeStateProps;

const reportPathsType = RosPathsType.vmRecommendations;
const reportType = RosType.ros;

const OptimizationsVmsBadge: React.FC<OptimizationsVmsBadgeProps> = ({
  cluster,
}: OptimizationsVmsBadgeOwnProps) => {
  const { count } = useMapToProps({ cluster });
  const intl = useIntl();

  if (count <= 0) {
    return null;
  }

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

const useMapToProps = ({ cluster }: OptimizationsVmsBadgeOwnProps): OptimizationsVmsBadgeStateProps => {
  const { count } = useRosCount({
    cluster,
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return { count };
};

export default OptimizationsVmsBadge;
