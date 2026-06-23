import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

const QuotaBreakdown: React.FC = () => {
  const location = useLocation();

  return (
    <AsyncComponent
      scope="costManagementRos"
      module="./QuotaBreakdown"
      linkState={{
        ...(location?.state || {}),
        efficiencyState: {
          ...(location?.state?.efficiencyState || {}),
          activeTabKey: 5,
        },
        quotaDetailsState: {
          ...(location?.state?.quotaDetailsState || {}),
          breadcrumbPath: formatPath(`${routes.optimizations.path}?tab=quota&sub=namespace`),
        },
      }}
      queryStateName="quotaDetailsState"
    />
  );
};

export default QuotaBreakdown;
