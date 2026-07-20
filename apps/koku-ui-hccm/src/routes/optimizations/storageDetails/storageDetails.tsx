import { Card, CardBody, PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

interface StorageDetailsOwnProps {
  activeTabKey?: number;
}

const StorageDetails: React.FC<StorageDetailsOwnProps> = ({ activeTabKey }) => {
  const intl = useIntl();
  const location = useLocation();

  return (
    <PageSection>
      <Card>
        <CardBody>
          <AsyncComponent
            scope="costManagementRos"
            module="./OptimizationsStorageDetails"
            breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizations)}
            breadcrumbPath={formatPath(`${routePaths.optimizations.path}${location.search}`)}
            linkPath={formatPath(routePaths.optimizationsPvcBreakdown.path)}
            linkState={{
              ...(location?.state || {}),
              efficiencyState: {
                ...(location?.state?.efficiencyState || {}),
                activeTabKey,
              },
            }}
            queryStateName="pvcDetailsState"
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { StorageDetails };
