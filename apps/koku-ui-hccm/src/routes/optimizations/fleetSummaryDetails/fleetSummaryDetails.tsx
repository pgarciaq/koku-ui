import { PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

const FleetSummaryDetails: React.FC = () => {
  const intl = useIntl();

  return (
    <PageSection>
      <AsyncComponent scope="costManagementRos" module="./FleetSummaryCards" />
      <AsyncComponent
        scope="costManagementRos"
        module="./FleetHeatmap"
        linkPath={formatPath(routes.optimizationsNodeBreakdown.path)}
        breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizations)}
      />
      <AsyncComponent scope="costManagementRos" module="./SavingsWaterfallChart" />
    </PageSection>
  );
};

export { FleetSummaryDetails };
export default FleetSummaryDetails;
