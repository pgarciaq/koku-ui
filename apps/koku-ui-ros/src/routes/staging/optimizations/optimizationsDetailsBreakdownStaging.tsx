import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { OptimizationsBreakdown } from 'routes/optimizations/optimizationsBreakdown';
import { formatPath } from 'utils/paths';

interface OptimizationsBreakdownStagingOwnProps {
  // TBD...
}

type OptimizationsBreakdownStagingProps = OptimizationsBreakdownStagingOwnProps;

const OptimizationsDetailsBreakdownStaging: React.FC<OptimizationsBreakdownStagingProps> = () => {
  const location = useLocation();

  return (
    <OptimizationsBreakdown
      breadcrumbPath={`${formatPath(routePaths.optimizationsDetails.path)}${location.search}`}
      projectPath={formatPath(routePaths.ocpOptimizations.path)} // Path for optimizations breakdown project link
      linkState={{
        ...(location?.state || {}),
        ocpOptimizationsState: undefined, // Clear state, to reinitialize optimizations tab in OCP breakdown
      }}
      queryStateName="containerDetailsState"
    />
  );
};

export default OptimizationsDetailsBreakdownStaging;
