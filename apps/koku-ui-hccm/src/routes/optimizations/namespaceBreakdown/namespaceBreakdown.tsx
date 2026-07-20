import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

const NamespaceBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./OptimizationsBreakdown"
      type="namespace"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routePaths.optimizationsNamespaceBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      containerBreakdownPath={formatPath(routePaths.optimizationsBreakdown.path)}
      projectPath={formatPath(routePaths.ocpBreakdown.path)}
      queryStateName="namespaceDetailsState"
    />
  );
};

export default NamespaceBreakdown;
