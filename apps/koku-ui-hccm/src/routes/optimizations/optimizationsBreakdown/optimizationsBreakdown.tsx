import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

interface OptimizationsBreakdownOwnProps {
  // TBD...
}

type OptimizationsBreakdownProps = OptimizationsBreakdownOwnProps;

const OptimizationsBreakdown: React.FC<OptimizationsBreakdownProps> = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./OptimizationsBreakdown"
      type="container"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routePaths.optimizationsBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      projectPath={formatPath(routePaths.ocpBreakdown.path)}
      queryStateName="containerDetailsState"
    />
  );
};

export default OptimizationsBreakdown;
