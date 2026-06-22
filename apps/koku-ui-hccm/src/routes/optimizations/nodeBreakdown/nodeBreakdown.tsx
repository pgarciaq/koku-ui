import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

interface NodeBreakdownOwnProps {
  // TBD...
}

type NodeBreakdownProps = NodeBreakdownOwnProps;

const NodeBreakdown: React.FC<NodeBreakdownProps> = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./NodeBreakdown"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routes.optimizationsNodeBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      projectPath={formatPath(routes.ocpBreakdown.path)}
      queryStateName="nodeDetailsState"
    />
  );
};

export default NodeBreakdown;
