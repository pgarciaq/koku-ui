import { PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';

const DecaySettingsPage: React.FC = () => {
  return (
    <PageSection>
      <AsyncComponent scope="costManagementRos" module="./DecaySettings" />
    </PageSection>
  );
};

export { DecaySettingsPage };
