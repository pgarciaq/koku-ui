import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

const PvcBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      module="./OptimizationsBreakdown"
      type="pvc"
      linkState={{
        ...(location?.state || {}),
        efficiencyState: {
          ...(location?.state?.efficiencyState || {}),
          activeTabKey: 4,
        },
        pvcDetailsState: {
          ...(location?.state?.pvcDetailsState || {}),
          breadcrumbPath: formatPath(`${routePaths.optimizations.path}${location.search}`),
        },
      }}
      queryStateName="pvcDetailsState"
    />
  );
};

export default PvcBreakdown;
