import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

const ClusterQuotaBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      module="./OptimizationsBreakdown"
      type="cluster-quota"
      linkState={{
        ...(location?.state || {}),
        efficiencyState: {
          ...(location?.state?.efficiencyState || {}),
          activeTabKey: 5,
        },
        clusterQuotaDetailsState: {
          ...(location?.state?.clusterQuotaDetailsState || {}),
          breadcrumbPath: formatPath(`${routePaths.optimizations.path}?tab=quota&sub=cluster`),
        },
      }}
      queryStateName="clusterQuotaDetailsState"
    />
  );
};

export default ClusterQuotaBreakdown;
