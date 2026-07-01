import { Card, CardBody, PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';

interface QualityDetailsOwnProps {
  activeTabKey?: number;
}

type QualityDetailsProps = QualityDetailsOwnProps;

const QualityDetails: React.FC<QualityDetailsProps> = () => {
  return (
    <PageSection>
      <Card>
        <CardBody>
          <AsyncComponent
            scope="costManagementRos"
            module="./QualityDashboard"
            fallback={<div>Loading...</div>}
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { QualityDetails };
