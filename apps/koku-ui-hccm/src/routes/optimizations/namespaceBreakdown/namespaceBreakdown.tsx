import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

interface NamespaceBreakdownOwnProps {
  // TBD...
}

type NamespaceBreakdownProps = NamespaceBreakdownOwnProps;

const NamespaceBreakdown: React.FC<NamespaceBreakdownProps> = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./NamespaceBreakdown"
      linkState={{
        ...(location?.state || {}),
        detailsState: {
          ...(location?.state?.detailsState || {}),
          breadcrumbPath: formatPath(`${routes.optimizationsNamespaceBreakdown.path}${location.search}`),
        },
        ocpOptimizationsState: undefined,
      }}
      projectPath={formatPath(routes.ocpBreakdown.path)}
      queryStateName="namespaceDetailsState"
    />
  );
};

export default NamespaceBreakdown;
