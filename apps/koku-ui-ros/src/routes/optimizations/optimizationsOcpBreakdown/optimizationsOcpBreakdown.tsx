import { Card, CardBody, Divider } from '@patternfly/react-core';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { OptimizationsContainersTable, OptimizationsProjectsTable } from 'routes/optimizations/optimizationsTable';
import {
  optimizationsNamespacesBaseQuery,
  useOptimizationsNamespacesReport,
} from 'routes/optimizations/optimizationsTable/useOptimizationsNamespacesReport';
import { getQueryState } from 'routes/utils/queryState';
import { Interval, OptimizationType } from 'utils/commonTypes';

import { styles } from './optimizationsOcpBreakdown.styles';
import { OptimizationsOcpBreakdownToolbar } from './optimizationsOcpBreakdownToolbar';

interface OptimizationsOcpBreakdownOwnProps {
  breadcrumbLabel?: string; // Breadcrumb label displayed in the page defined by linkPath
  breadcrumbPath?: string; // Breadcrumb path used in the page defined by linkPath
  cluster?: string | string[]; // Cluster name to filter by
  isClusterHidden?: boolean; // Hides cluster filter and column
  linkPath?: string; // Path used by the link displayed in each table row
  linkState?: any; // Link state used by the link displayed in each table row
  project?: string | string[]; // Project name to filter by
  queryStateName: string; // Name used to store query state
}

type OptimizationsOcpBreakdownProps = OptimizationsOcpBreakdownOwnProps;

const OptimizationsOcpBreakdown: React.FC<OptimizationsOcpBreakdownProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  cluster,
  isClusterHidden,
  linkPath,
  linkState,
  project,
  queryStateName,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const [, setCurrentInterval] = useState(Interval.short_term);
  const [, setOptimizationType] = useState(OptimizationType.performance);
  const queryState = getQueryState(location, queryStateName);
  const [query, setQuery] = useState({ ...optimizationsNamespacesBaseQuery, ...(queryState && queryState) });
  const { report, reportError, reportFetchStatus, reportQueryString } = useOptimizationsNamespacesReport({
    cluster,
    project,
    query,
  });

  const sharedTableProps = {
    onQueryChange: setQuery,
    query,
    report,
    reportError,
    reportFetchStatus,
    reportQueryString,
  };

  const handleOnIntervalSelect = (value: Interval) => {
    setCurrentInterval(value);
  };

  const handleOnOptimizationTypeSelect = (value: OptimizationType) => {
    setOptimizationType(value);
  };

  return (
    <>
      <div style={styles.toolbarContainer}>
        <OptimizationsOcpBreakdownToolbar
          currentInterval={query?.interval}
          onIntervalSelect={handleOnIntervalSelect}
          onOptimizationTypeSelect={handleOnOptimizationTypeSelect}
          optimizationType={query?.optimizationType}
        />
      </div>
      <Divider style={styles.divider} />
      <div style={styles.title}>{intl.formatMessage(messages.optimizationsProject)}</div>
      <Card style={styles.card}>
        <CardBody>
          <OptimizationsProjectsTable
            breadcrumbLabel={breadcrumbLabel}
            breadcrumbPath={breadcrumbPath}
            cluster={cluster}
            isClusterHidden={isClusterHidden}
            isPaginationHidden
            isToolbarHidden
            linkPath={linkPath}
            linkState={linkState}
            project={project}
            queryStateName={queryStateName}
            {...sharedTableProps}
          />
        </CardBody>
      </Card>
      <Divider style={styles.divider} />
      <div style={styles.title}>{intl.formatMessage(messages.optimizableContainers)}</div>
      <Card style={styles.card}>
        <CardBody>
          <OptimizationsContainersTable
            breadcrumbLabel={breadcrumbLabel}
            breadcrumbPath={breadcrumbPath}
            cluster={cluster}
            isClusterHidden={isClusterHidden}
            isProjectHidden
            linkPath={linkPath}
            linkState={linkState}
            project={project}
            queryStateName={queryStateName}
            {...sharedTableProps}
          />
        </CardBody>
      </Card>
    </>
  );
};

export default OptimizationsOcpBreakdown;
