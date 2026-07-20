import { Card, CardBody, PageSection } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { formatPath } from 'utils/paths';

interface NodeDetailsOwnProps {
  activeTabKey?: number;
}

type NodeDetailsProps = NodeDetailsOwnProps;

const NodeDetails: React.FC<NodeDetailsProps> = ({ activeTabKey }: NodeDetailsOwnProps) => {
  const intl = useIntl();
  const location = useLocation();

  return (
    <PageSection>
      <Card>
        <CardBody>
          <AsyncComponent
            scope="costManagementRos"
            module="./OptimizationsTable"
            type="nodes"
            breadcrumbLabel={intl.formatMessage(messages.breakdownBackToOptimizations)}
            breadcrumbPath={formatPath(`${routePaths.optimizations.path}${location.search}`)}
            linkPath={formatPath(routePaths.optimizationsNodeBreakdown.path)}
            linkState={{
              ...(location?.state || {}),
              efficiencyState: {
                ...(location?.state?.efficiencyState || {}),
                activeTabKey,
              },
            }}
            queryStateName="nodeDetailsState"
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export { NodeDetails };
