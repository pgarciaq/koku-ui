import { Pagination, PaginationVariant } from '@patternfly/react-core';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { ROS_LIST_TERM } from 'api/ros/rosListParams';
import { useRecommendationTermOptions } from 'hooks/useRecommendationTermOptions';
import { ColdStartState } from 'routes/components/page/coldStart';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { NotConfigured } from 'routes/components/page/notConfigured';
import { LoadingState } from 'routes/components/state/loadingState';
import { INTERVAL_TO_TERM_NAME } from '../recommendationTermLabels';
import { OptimizationsTabSummaryBanner } from 'routes/optimizations/optimizationsTabSummary';
import { styles } from 'routes/optimizations/optimizationsBreakdown/optimizationsBreakdown.styles';
import * as queryUtils from 'routes/utils/query';
import { useUrlState } from 'routes/utils/useUrlState';
import { FetchStatus } from 'store/common';

import { useSavingsFallbackSort } from '../useSavingsFallbackSort';
import { nodeRecommendationsBaseQuery, useNodeRecommendationsReport } from '../useNodeRecommendationsReport';
import { getStorageGroupBy, type StorageGroupBy } from '../storageTableUtils';
import { getLinkState } from '../utils';
import { OptimizationsNodesDataTable } from './optimizationsNodesDataTable';
import { OptimizationsNodesToolbar } from './optimizationsNodesToolbar';

interface OptimizationsNodesTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

type OptimizationsNodesTableProps = OptimizationsNodesTableOwnProps;

const OptimizationsNodesTable: React.FC<OptimizationsNodesTableProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkPath,
  linkState,
  queryStateName,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const [cursorPage, setCursorPage] = useState(1);
  const [newLinkState, setNewLinkState] = useState();

  const { query, setQuery } = useUrlState({
    baseQuery: nodeRecommendationsBaseQuery,
    prefix: 'node_',
  });
  const { report, reportError, reportFetchStatus, reportQueryString } = useNodeRecommendationsReport({
    query,
  });
  const { termSettings } = useRecommendationTermOptions('node');

  const currentOrderBy = query.order_by ? Object.keys(query.order_by)[0] : undefined;
  useSavingsFallbackSort({
    data: report?.data,
    currentOrderBy,
    fallbackOrderBy: 'cpu_variation_short_cost',
    onSort: (orderBy, isAscending) => handleOnSort(orderBy, isAscending),
  });

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
    const limit = report?.meta?.limit ?? query.limit ?? nodeRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? nodeRecommendationsBaseQuery.offset;
    const page = query.after ? cursorPage : Math.trunc(offset / limit + 1);

    return (
      <Pagination
        isCompact={!isBottom}
        isDisabled={isDisabled}
        itemCount={count}
        onPerPageSelect={(_event, perPage) => handleOnPerPageSelect(perPage)}
        onSetPage={(_event, pageNumber) => handleOnSetPage(pageNumber)}
        page={page}
        perPage={limit}
        titles={{
          paginationAriaLabel: intl.formatMessage(messages.paginationTitle, {
            title: intl.formatMessage(messages.openShift),
            placement: isBottom ? 'bottom' : 'top',
          }),
        }}
        variant={isBottom ? PaginationVariant.bottom : PaginationVariant.top}
        widgetId={`node-pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const getTable = () => {
    return (
      <OptimizationsNodesDataTable
        breadcrumbLabel={breadcrumbLabel}
        engine={query.engine}
        filterBy={query.filter_by}
        groupBy={nodeGroupBy}
        isLoading={reportFetchStatus === FetchStatus.inProgress}
        linkPath={linkPath}
        linkState={newLinkState}
        onDrillDownFromGroup={handleDrillDownFromGroup}
        onFilterAdded={filter => handleOnFilterAdded(filter)}
        onSort={(sortType, isSortAscending) => handleOnSort(sortType, isSortAscending)}
        orderBy={query.order_by}
        report={report}
        reportQueryString={reportQueryString}
        term={query.term}
      />
    );
  };

  const getToolbar = () => {
    const itemsPerPage = report?.meta?.limit ?? query.limit ?? nodeRecommendationsBaseQuery.limit;
    const itemsTotal = report?.meta?.count ?? 0;
    const isDisabled = itemsTotal === 0;

    return (
      <OptimizationsNodesToolbar
        groupBy={nodeGroupBy}
        isDisabled={isDisabled}
        itemsPerPage={itemsPerPage}
        itemsTotal={itemsTotal}
        onEngineSelect={handleOnEngineSelect}
        onFilterAdded={filter => handleOnFilterAdded(filter)}
        onFilterRemoved={filter => handleOnFilterRemoved(filter)}
        onGroupBySelect={handleOnGroupBySelect}
        onTermSelect={handleOnTermSelect}
        pagination={getPagination(isDisabled)}
        query={query}
      />
    );
  };

  const handleOnFilterAdded = filter => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnFilterAdded(query, filter);
    setQuery(newQuery);
  };

  const handleOnFilterRemoved = filter => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnFilterRemoved(query, filter);
    setQuery(newQuery);
  };

  const handleOnPerPageSelect = perPage => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnPerPageSelect(query, perPage, true);
    setQuery(newQuery);
  };

  const handleOnSetPage = pageNumber => {
    const isNextPage = pageNumber === cursorPage + 1;
    if (isNextPage && report?.meta?.has_next && report?.meta?.next_cursor) {
      setCursorPage(pageNumber);
      const newQuery = queryUtils.handleOnSetPage(query, report, pageNumber, true);
      setQuery(newQuery);
    } else {
      setCursorPage(pageNumber);
      const limit = report?.meta?.limit ?? query.limit ?? nodeRecommendationsBaseQuery.limit;
      const offset = (pageNumber - 1) * limit;
      setQuery({
        ...query,
        after: undefined,
        offset: pageNumber === 1 ? 0 : offset,
        limit,
      });
    }
  };

  const handleOnSort = (sortType, isSortAscending) => {
    setCursorPage(1);
    const newQuery = queryUtils.handleOnSort(query, sortType, isSortAscending);
    setQuery({ ...newQuery, offset: 0, after: undefined });
  };

  const handleOnTermSelect = (term: string) => {
    setCursorPage(1);
    setQuery({ ...query, term, offset: 0, after: undefined });
  };

  const handleOnEngineSelect = (engine: string) => {
    setCursorPage(1);
    setQuery({ ...query, engine, offset: 0, after: undefined });
  };

  const handleOnGroupBySelect = (groupBy: StorageGroupBy) => {
    setCursorPage(1);
    if (!groupBy) {
      const { group_by: _removed, ...rest } = query;
      setQuery({ ...rest, offset: 0, after: undefined });
      return;
    }
    setQuery({
      ...query,
      group_by: { [groupBy]: '*' },
      offset: 0,
      after: undefined,
    });
  };

  const handleDrillDownFromGroup = (filter: { key: string; value: string }) => {
    setCursorPage(1);
    const { group_by: _removed, ...rest } = query;
    setQuery({
      ...rest,
      filter_by: {
        ...query.filter_by,
        [filter.key]: filter.value,
      },
      offset: 0,
      after: undefined,
    });
  };

  const nodeGroupBy = getStorageGroupBy(query);

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
    const dataDaysAvailable = report?.meta?.data_days_available ?? 0;
    const activeTerm = query.term ?? ROS_LIST_TERM;
    const termName = INTERVAL_TO_TERM_NAME[activeTerm];
    const matchedTerm = termSettings.find(t => t.name === termName);
    const minDataDays = matchedTerm?.min_data_days ?? 3;
    if (dataDaysAvailable < minDataDays) {
      return <ColdStartState currentDays={dataDaysAvailable} minDays={minDataDays} />;
    }
    return <NotConfigured />;
  }
  return (
    <>
      <OptimizationsTabSummaryBanner engine={query.engine} plugin="node" term={query.term} />
      {getToolbar()}
      {reportFetchStatus !== FetchStatus.complete ? (
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

export default OptimizationsNodesTable;
