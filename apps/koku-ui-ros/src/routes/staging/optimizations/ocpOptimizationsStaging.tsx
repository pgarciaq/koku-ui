import { PageSection } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { OptimizationsOcpBreakdown } from 'routes/optimizations/optimizationsOcpBreakdown';
import { formatPath } from 'utils/paths';

interface OcpOptimizationsStagingOwnProps {
  // TBD...
}

type OcpOptimizationsStagingProps = OcpOptimizationsStagingOwnProps;

const OcpOptimizationsStaging: React.FC<OcpOptimizationsStagingProps> = () => {
  const intl = useIntl();
  const location = useLocation();

  // Test filters
  const project = 'project-ros-A2';

  return (
    <PageSection>
      <OptimizationsOcpBreakdown
        breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizations)}
        breadcrumbPath={`${formatPath(routePaths.ocpOptimizations.path)}${location.search}`}
        linkPath={formatPath(routePaths.ocpOptimizationsBreakdown.path)}
        linkState={{
          ...(location?.state || {}),
        }}
        project={project}
        queryStateName="ocpOptimizationsState"
      />
    </PageSection>
  );
};

export default OcpOptimizationsStaging;
