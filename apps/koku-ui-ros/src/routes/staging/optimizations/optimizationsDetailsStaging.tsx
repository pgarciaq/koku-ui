import { PageSection } from '@patternfly/react-core';
import type { Query } from 'api/queries/query';
import { parseQuery } from 'api/queries/query';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { routePaths } from 'routePaths';
import { OptimizationsContainersTable } from 'routes/optimizations/optimizationsTable';
import { getGroupById, getGroupByValue } from 'routes/utils/groupBy';
import { formatPath } from 'utils/paths';

interface OptimizationsDetailsStagingOwnProps {
  // TBD...
}

type OptimizationsDetailsStagingProps = OptimizationsDetailsStagingOwnProps;

const useQueryFromRoute = () => {
  const location = useLocation();
  return parseQuery<Query>(location.search);
};

const OptimizationsDetailsStaging: React.FC<OptimizationsDetailsStagingProps> = () => {
  const intl = useIntl();
  const location = useLocation();
  const queryFromRoute = useQueryFromRoute();

  const groupBy = queryFromRoute?.group_by ? getGroupById(queryFromRoute) : undefined;
  const groupByValue = queryFromRoute?.group_by ? getGroupByValue(queryFromRoute) : 'openshift-kube-apiserver';

  const clusterFilter = 'aws';
  const projectFilter = 'openshift';

  return (
    <PageSection>
      <OptimizationsContainersTable
        breadcrumbLabel={
          intl.formatMessage(messages.breakdownBackToOptimizationsProject, { value: groupByValue }) as string
        }
        breadcrumbPath={formatPath(`${routePaths.optimizationsDetails.path}${location.search}`)}
        cluster={clusterFilter}
        isClusterHidden={groupBy === 'cluster'}
        isProjectHidden={groupBy === 'project'}
        linkPath={formatPath(routePaths.optimizationsDetailsBreakdown.path)}
        project={projectFilter}
        queryStateName="containerDetailsState"
      />
    </PageSection>
  );
};

export default OptimizationsDetailsStaging;
