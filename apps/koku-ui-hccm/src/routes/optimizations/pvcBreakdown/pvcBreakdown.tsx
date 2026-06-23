import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

const PvcBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      module="./PvcBreakdown"
      linkState={{
        ...(location?.state || {}),
        efficiencyState: {
          ...(location?.state?.efficiencyState || {}),
          activeTabKey: 4,
        },
        pvcDetailsState: {
          ...(location?.state?.pvcDetailsState || {}),
          breadcrumbPath: formatPath(`${routes.optimizations.path}${location.search}`),
        },
      }}
      queryStateName="pvcDetailsState"
    />
  );
};

export default PvcBreakdown;
