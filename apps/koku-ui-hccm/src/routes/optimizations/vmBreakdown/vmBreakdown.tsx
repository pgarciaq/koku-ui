import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

const VmBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./OptimizationsBreakdown"
      type="vm"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routePaths.optimizationsVmBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      projectPath={formatPath(routePaths.ocpBreakdown.path)}
      queryStateName="vmDetailsState"
    />
  );
};

export default VmBreakdown;
