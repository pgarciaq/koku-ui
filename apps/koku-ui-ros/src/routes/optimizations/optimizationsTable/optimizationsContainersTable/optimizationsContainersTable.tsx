import { Pagination, PaginationVariant } from '@patternfly/react-core';
import type { RosQuery } from 'api/queries/rosQuery';
import type { RosReport } from 'api/ros/ros';
import type { AxiosError } from 'axios';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { NotConfigured } from 'routes/components/page/notConfigured';
import { LoadingState } from 'routes/components/state/loadingState';
import { OptimizationsTabSummaryBanner } from 'routes/optimizations/optimizationsTabSummary';
import { styles } from 'routes/optimizations/optimizationsBreakdown/optimizationsBreakdown.styles';
import * as queryUtils from 'routes/utils/query';
import { useUrlState } from 'routes/utils/useUrlState';
import { FetchStatus } from 'store/common';

import {
  optimizationsNamespacesBaseQuery,
  useOptimizationsNamespacesReport,
} from '../useOptimizationsNamespacesReport';
import { getLinkState } from '../utils';
import { OptimizationsContainersDataTable } from './optimizationsContainersDataTable';
import { OptimizationsContainersToolbar } from './optimizationsContainersToolbar';

interface OptimizationsContainersTableOwnProps {
  breadcrumbLabel?: string; // Breadcrumb label displayed in the page defined by linkPath
  breadcrumbPath?: string; // Breadcrumb path used in the page defined by linkPath
  cluster?: string | string[]; // Cluster name to filter by
  isClusterHidden?: boolean; // Hides cluster filter and column
  isProjectHidden?: boolean; // Hides project filter and column
  linkPath?: string; // Path used by the link displayed in each table row
  linkState?: any; // Link state used by the link displayed in each table row
  onQueryChange?: (query: RosQuery) => void;
  project?: string | string[]; // Project name to filter by
  query?: RosQuery;
  queryStateName: string; // Name used to store query state
  report?: RosReport;
  reportError?: AxiosError;
  reportFetchStatus?: FetchStatus;
  reportQueryString?: string;
}

type OptimizationsContainersTableProps = OptimizationsContainersTableOwnProps;

const OptimizationsContainersTable: React.FC<OptimizationsContainersTableProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  cluster,
  isClusterHidden,
  isProjectHidden,
  linkPath,
  linkState,
  onQueryChange,
  project,
  query: sharedQuery,
  queryStateName,
  report: sharedReport,
  reportError: sharedReportError,
  reportFetchStatus: sharedReportFetchStatus,
  reportQueryString: sharedReportQueryString,
}) => {
  const intl = useIntl();
  const location = useLocation();

  const [newLinkState, setNewLinkState] = useState();
  const { query: urlQuery, setQuery: setUrlQuery } = useUrlState({
    baseQuery: optimizationsNamespacesBaseQuery,
    prefix: 'ctr_',
  });
  const usesSharedReport = onQueryChange !== undefined;
  const query = sharedQuery ?? urlQuery;
  const setQuery = onQueryChange ?? setUrlQuery;
  const fetchedReport = useOptimizationsNamespacesReport({
    cluster,
    project,
    query,
    skipFetch: usesSharedReport,
  });
  const report = usesSharedReport ? sharedReport : fetchedReport.report;
  const reportError = usesSharedReport ? sharedReportError : fetchedReport.reportError;
  const reportFetchStatus = usesSharedReport ? sharedReportFetchStatus : fetchedReport.reportFetchStatus;
  const reportQueryString = usesSharedReport ? sharedReportQueryString : fetchedReport.reportQueryString;

  // This table component is used in multiple pages; Optimizations and OCP breakdown. Each table instance has
  // a unique state for when users return to the OCP breakdown and then back to the Optimizations page.
  //
  // Path 1: From OCP details, user navigates to the OCP breakdown (i.e., the "optimizations tab").
  // Within the Optimizations tab, users may navigate to the Optimizations breakdown.
  //
  // Path 2: From Optimizations, user navigates to the Optimizations breakdown and chooses the "project" link.
  // The project link navigates to the OCP breakdown, where users may navigate to the Optimizations breakdown.
  useEffect(() => {
    setNewLinkState(
      getLinkState({
        breadcrumbPath,
        linkState,
        location,
        query,
        queryStateName,
      })
    );
  }, [query]);

  const getPagination = (isDisabled = false, isBottom = false) => {
    const count = report?.meta?.count ?? 0;
    const limit = report?.meta?.limit ?? query.limit ?? optimizationsNamespacesBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? optimizationsNamespacesBaseQuery.offset;
    const page = Math.trunc(offset / limit + 1);

    return (
      <Pagination
        isCompact={!isBottom}
        isDisabled={isDisabled}
        itemCount={count}
        onPerPageSelect={(event, perPage) => handleOnPerPageSelect(perPage)}
        onSetPage={(event, pageNumber) => handleOnSetPage(pageNumber)}
        page={page}
        perPage={limit}
        titles={{
          paginationAriaLabel: intl.formatMessage(messages.paginationTitle, {
            title: intl.formatMessage(messages.openShift),
            placement: isBottom ? 'bottom' : 'top',
          }),
        }}
        variant={isBottom ? PaginationVariant.bottom : PaginationVariant.top}
        widgetId={`exports-pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const getTable = () => {
    return (
      <OptimizationsContainersDataTable
        breadcrumbLabel={breadcrumbLabel}
        engine={query.engine}
        filterBy={query.filter_by}
        isClusterHidden={isClusterHidden}
        isLoading={reportFetchStatus === FetchStatus.inProgress}
        isProjectHidden={isProjectHidden}
        linkPath={linkPath}
        linkState={newLinkState}
        onSort={(sortType, isSortAscending) => handleOnSort(sortType, isSortAscending)}
        orderBy={query.order_by}
        report={report}
        reportQueryString={reportQueryString}
        term={query.term}
      />
    );
  };

  const getToolbar = () => {
    const itemsPerPage = report?.meta?.limit ?? query.limit ?? optimizationsNamespacesBaseQuery.limit;
    const itemsTotal = report?.meta?.count ?? 0;
    const isDisabled = itemsTotal === 0;

    return (
      <OptimizationsContainersToolbar
        isClusterHidden={isClusterHidden}
        isDisabled={isDisabled}
        isProjectHidden={isProjectHidden}
        itemsPerPage={itemsPerPage}
        itemsTotal={itemsTotal}
        onEngineSelect={handleOnEngineSelect}
        onFilterAdded={filter => handleOnFilterAdded(filter)}
        onFilterRemoved={filter => handleOnFilterRemoved(filter)}
        onTermSelect={handleOnTermSelect}
        pagination={getPagination(isDisabled)}
        query={query}
      />
    );
  };

  const handleOnFilterAdded = filter => {
    const newQuery = queryUtils.handleOnFilterAdded(query, filter);
    setQuery(newQuery);
  };

  const handleOnFilterRemoved = filter => {
    const newQuery = queryUtils.handleOnFilterRemoved(query, filter);
    setQuery(newQuery);
  };

  const handleOnPerPageSelect = perPage => {
    const newQuery = queryUtils.handleOnPerPageSelect(query, perPage, true);
    setQuery(newQuery);
  };

  const handleOnSetPage = pageNumber => {
    const newQuery = queryUtils.handleOnSetPage(query, report, pageNumber, true);
    setQuery(newQuery);
  };

  const handleOnSort = (sortType, isSortAscending) => {
    const newQuery = queryUtils.handleOnSort(query, sortType, isSortAscending);
    setQuery(newQuery);
  };

  const handleOnTermSelect = (term: string) => {
    setQuery({ ...query, term, offset: 0, after: undefined });
  };

  const handleOnEngineSelect = (engine: string) => {
    setQuery({ ...query, engine, offset: 0, after: undefined });
  };

  const itemsTotal = report?.meta ? report.meta.count : 0;
  const isDisabled = itemsTotal === 0;
  const hasOptimizations = report?.meta && report.meta.count > 0;

  const isNoDataResponse =
    reportError && (reportError.response?.status === 404 || reportError.response?.status === 501);

  if (reportError && !isNoDataResponse) {
    return <NotAvailable title={intl.formatMessage(messages.optimizations)} />;
  }
  if (isNoDataResponse) {
    return <NotConfigured />;
  }
  if (!query.filter_by && !hasOptimizations && reportFetchStatus === FetchStatus.complete) {
    return <NotConfigured />;
  }
  return (
    <>
      <OptimizationsTabSummaryBanner engine={query.engine} plugin="container" term={query.term} />
      {getToolbar()}
      {reportFetchStatus === FetchStatus.inProgress ? (
        <LoadingState
          body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
          heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
        />
      ) : (
        <>
          {getTable()}
          <div style={styles.paginationContainer}>{getPagination(isDisabled, true)}</div>
        </>
      )}
    </>
  );
};

export default OptimizationsContainersTable;
