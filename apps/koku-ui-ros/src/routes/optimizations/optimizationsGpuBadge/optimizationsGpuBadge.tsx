import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

export interface OptimizationsGpuBadgeOwnProps {
  cluster?: string | string[];
}

interface OptimizationsGpuBadgeStateProps {
  count: number;
}

const reportPathsType = RosPathsType.gpuMigRecommendations;
const reportType = RosType.ros;

const OptimizationsGpuBadge: React.FC<OptimizationsGpuBadgeOwnProps> = ({ cluster }) => {
  const { count } = useMapToProps({ cluster });
  const intl = useIntl();

  if (count <= 0) {
    return null;
  }

  return <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count })}>{count}</Badge>;
};

const useMapToProps = ({ cluster }: OptimizationsGpuBadgeOwnProps): OptimizationsGpuBadgeStateProps => {
  const { count } = useRosCount({
    cluster,
    rosPathsType: reportPathsType,
    rosType: reportType,
  });

  return { count };
};

export default OptimizationsGpuBadge;
