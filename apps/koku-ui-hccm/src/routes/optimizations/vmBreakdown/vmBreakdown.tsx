import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

interface VmBreakdownOwnProps {
  // TBD...
}

type VmBreakdownProps = VmBreakdownOwnProps;

const VmBreakdown: React.FC<VmBreakdownProps> = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./VmBreakdown"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routes.optimizationsVmBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      projectPath={formatPath(routes.ocpBreakdown.path)}
      queryStateName="vmDetailsState"
    />
  );
};

export default VmBreakdown;
