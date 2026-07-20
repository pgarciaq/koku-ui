import { PageSection } from '@patternfly/react-core';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { OptimizationsLink } from 'routes/optimizations/optimizationsLink';
import { getBreakdownPath } from 'routes/utils/paths';
import { formatPath } from 'utils/paths';

interface OptimizationsLinkStagingOwnProps {
  // TBD...
}

type OptimizationsLinkStagingProps = OptimizationsLinkStagingOwnProps;

const OptimizationsLinkStaging: React.FC<OptimizationsLinkStagingProps> = () => {
  const location = useLocation();

  // Test filters
  const clusterFilter = 'aws';
  const projectFilter = 'openshift';

  const state = {
    ...(location?.state || {}),
  };

  const linkPath = getBreakdownPath({
    basePath: formatPath(routePaths.ocpOptimizations.path),
    groupBy: 'project',
    id: 'openshift', // groupByValue
  });

  return (
    <PageSection>
      <OptimizationsLink cluster={clusterFilter} project={projectFilter} linkPath={linkPath} linkState={state} count={0} />
    </PageSection>
  );
};

export default OptimizationsLinkStaging;
