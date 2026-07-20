import { Badge } from '@patternfly/react-core';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

export interface OptimizationsGpuBadgeOwnProps {
  cluster?: string | string[];
}

const reportType = RosType.ros;

const OptimizationsGpuBadge: React.FC<OptimizationsGpuBadgeOwnProps> = ({ cluster }) => {
  const intl = useIntl();
  const { count: migCount } = useRosCount({
    cluster,
    rosPathsType: RosPathsType.gpuMigRecommendations,
    rosType: reportType,
  });
  const { count: timeslicingCount } = useRosCount({
    cluster,
    rosPathsType: RosPathsType.gpuTimeslicingRecommendations,
    rosType: reportType,
  });

  const totalCount = migCount + timeslicingCount;

  if (totalCount <= 0) {
    return null;
  }

  return (
    <Badge screenReaderText={intl.formatMessage(messages.optimizationsDetails, { count: totalCount })}>
      {totalCount}
    </Badge>
  );
};

export default OptimizationsGpuBadge;
