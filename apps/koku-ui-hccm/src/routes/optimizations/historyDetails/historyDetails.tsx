import { Card, CardBody, PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import React from 'react';

interface HistoryDetailsOwnProps {
  activeTabKey?: number;
}

type HistoryDetailsProps = HistoryDetailsOwnProps;

const HistoryDetails: React.FC<HistoryDetailsProps> = () => {
  return (
    <PageSection>
      <Card>
        <CardBody>
          <AsyncComponent scope="costManagementRos" module="./HistoryExplorer" />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { HistoryDetails };
