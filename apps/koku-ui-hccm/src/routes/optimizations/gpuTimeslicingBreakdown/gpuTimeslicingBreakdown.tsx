import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

const GpuTimeslicingBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      appName="cost-management-ros"
      module="./OptimizationsBreakdown"
      type="gpu-timeslicing"
      linkState={{
        ...(location?.state || {}),
        gpuTimeslicingDetailsState: {
          ...(location?.state?.gpuTimeslicingDetailsState || {}),
          breadcrumbPath: formatPath(`${routes.optimizations.path}${location.search}`),
        },
      }}
      queryStateName="gpuTimeslicingDetailsState"
    />
  );
};

export default GpuTimeslicingBreakdown;
