import { Card, CardBody, PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

interface NamespaceDetailsOwnProps {
  activeTabKey?: number;
}

type NamespaceDetailsProps = NamespaceDetailsOwnProps;

const NamespaceDetails: React.FC<NamespaceDetailsProps> = ({ activeTabKey }: NamespaceDetailsOwnProps) => {
  const intl = useIntl();
  const location = useLocation();

  return (
    <PageSection>
      <Card>
        <CardBody>
          <AsyncComponent
            scope="costManagementRos"
            module="./OptimizationsTable"
            type="namespaces"
            breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizations)}
            breadcrumbPath={formatPath(`${routePaths.optimizations.path}${location.search}`)}
            linkPath={formatPath(routePaths.optimizationsNamespaceBreakdown.path)}
            linkState={{
              ...(location?.state || {}),
              efficiencyState: {
                ...(location?.state?.efficiencyState || {}),
                activeTabKey,
              },
            }}
            queryStateName="namespaceDetailsState"
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { NamespaceDetails };
