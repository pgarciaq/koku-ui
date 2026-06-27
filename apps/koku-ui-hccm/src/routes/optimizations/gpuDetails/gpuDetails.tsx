import { Card, CardBody, PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { routes } from 'routes';
import { formatPath } from 'utils/paths';

interface GpuDetailsOwnProps {
  activeTabKey?: number;
}

const GpuDetails: React.FC<GpuDetailsOwnProps> = ({ activeTabKey }) => {
  const intl = useIntl();
  const location = useLocation();

  return (
    <PageSection>
      <Card>
        <CardBody>
          <AsyncComponent
            scope="costManagementRos"
            module="./OptimizationsGpuDetails"
            breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizations)}
            breadcrumbPath={formatPath(`${routes.optimizations.path}${location.search}`)}
            linkState={{
              ...(location?.state || {}),
              efficiencyState: {
                ...(location?.state?.efficiencyState || {}),
                activeTabKey,
              },
            }}
            queryStateName="gpuDetailsState"
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { GpuDetails };
