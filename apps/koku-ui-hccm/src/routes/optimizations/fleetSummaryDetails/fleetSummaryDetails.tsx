import { PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';

const FleetSummaryDetails: React.FC = () => {
  return (
    <PageSection>
      <AsyncComponent scope="costManagementRos" module="./FleetSummaryCards" />
      <AsyncComponent scope="costManagementRos" module="./FleetHeatmap" />
      <AsyncComponent scope="costManagementRos" module="./SavingsWaterfallChart" />
    </PageSection>
  );
};

export { FleetSummaryDetails };
export default FleetSummaryDetails;
