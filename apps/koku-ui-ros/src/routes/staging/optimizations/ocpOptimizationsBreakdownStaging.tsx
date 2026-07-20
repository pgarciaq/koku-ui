import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { OptimizationsBreakdown } from 'routes/optimizations/optimizationsBreakdown';
import { formatPath } from 'utils/paths';

interface OcpOptimizationsBreakdownStagingOwnProps {
  // TBD...
}

type OcpOptimizationsBreakdownStagingProps = OcpOptimizationsBreakdownStagingOwnProps;

const OcpOptimizationsBreakdownStaging: React.FC<OcpOptimizationsBreakdownStagingProps> = () => {
  const location = useLocation();

  return (
    <OptimizationsBreakdown
      breadcrumbPath={formatPath(`${routePaths.ocpOptimizations.path}${location.search}`)}
      linkState={{
        ...(location?.state || {}),
      }}
      queryStateName="ocpOptimizationsState"
    />
  );
};

export default OcpOptimizationsBreakdownStaging;
