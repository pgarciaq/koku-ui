import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

const HcpBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./OptimizationsBreakdown"
      type="hcp"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routePaths.optimizationsHcpBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      containerBreakdownPath={formatPath(routePaths.optimizationsBreakdown.path)}
      projectPath={formatPath(routePaths.ocpBreakdown.path)}
      queryStateName="hcpDetailsState"
    />
  );
};

export default HcpBreakdown;
