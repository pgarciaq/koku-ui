import { Card, CardBody, PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

interface QuotaDetailsOwnProps {
  activeTabKey?: number;
}

const QuotaDetails: React.FC<QuotaDetailsOwnProps> = ({ activeTabKey }) => {
  const intl = useIntl();
  const location = useLocation();

  return (
    <PageSection>
      <Card>
        <CardBody>
          <AsyncComponent
            scope="costManagementRos"
            module="./OptimizationsQuotaDetails"
            breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizations)}
            breadcrumbPath={formatPath(`${routePaths.optimizations.path}${location.search}`)}
            clusterLinkPath={formatPath(routePaths.optimizationsClusterQuotaBreakdown.path)}
            clusterQueryStateName="clusterQuotaDetailsState"
            linkPath={formatPath(routePaths.optimizationsQuotaBreakdown.path)}
            linkState={{
              ...(location?.state || {}),
              efficiencyState: {
                ...(location?.state?.efficiencyState || {}),
                activeTabKey,
              },
            }}
            queryStateName="quotaDetailsState"
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { QuotaDetails };
