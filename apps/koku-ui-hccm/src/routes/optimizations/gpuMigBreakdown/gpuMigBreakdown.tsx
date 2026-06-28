import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

const GpuMigBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./OptimizationsBreakdown"
      type="gpu-mig"
      linkState={{
        ...(location?.state || {}),
        gpuMigDetailsState: {
          ...(location?.state?.gpuMigDetailsState || {}),
          breadcrumbPath: formatPath(`${routes.optimizations.path}${location.search}`),
        },
      }}
      queryStateName="gpuMigDetailsState"
    />
  );
};

export default GpuMigBreakdown;
