import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

const NodeBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./OptimizationsBreakdown"
      type="node"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routePaths.optimizationsNodeBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      projectPath={formatPath(routePaths.ocpBreakdown.path)}
      queryStateName="nodeDetailsState"
    />
  );
};

export default NodeBreakdown;
