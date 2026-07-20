import { Pagination, PaginationVariant } from '@patternfly/react-core';
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

import { getQuotaGroupBy, type QuotaGroupBy } from '../quotaTableUtils';
import {
  clusterQuotaRecommendationsBaseQuery,
  useClusterQuotaRecommendationsReport,
} from '../useClusterQuotaRecommendationsReport';
import { getLinkState } from '../utils';
import { OptimizationsClusterQuotasDataTable } from './optimizationsClusterQuotasDataTable';
import { OptimizationsClusterQuotasToolbar } from './optimizationsClusterQuotasToolbar';

interface OptimizationsClusterQuotasTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

const OptimizationsClusterQuotasTable: React.FC<OptimizationsClusterQuotasTableOwnProps> = ({
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
    baseQuery: clusterQuotaRecommendationsBaseQuery,
    prefix: 'crq_',
  });
  const { report, reportError, reportFetchStatus } = useClusterQuotaRecommendationsReport({ query });

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
    const limit = report?.meta?.limit ?? query.limit ?? clusterQuotaRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? clusterQuotaRecommendationsBaseQuery.offset;
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
        widgetId={`crq-pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const handleOnFilterAdded = filter => {
    setCursorPage(1);
    setQuery(queryUtils.handleOnFilterAdded(query, filter));
  };

  const handleOnFilterRemoved = filter => {
    setCursorPage(1);
    setQuery(queryUtils.handleOnFilterRemoved(query, filter));
  };

  const handleOnPerPageSelect = perPage => {
    setCursorPage(1);
    setQuery(queryUtils.handleOnPerPageSelect(query, perPage, true));
  };

  const handleOnSetPage = pageNumber => {
    const isNextPage = pageNumber === cursorPage + 1;
    if (isNextPage && report?.meta?.has_next && report?.meta?.next_cursor) {
      setCursorPage(pageNumber);
      setQuery(queryUtils.handleOnSetPage(query, report, pageNumber, true));
    } else {
      setCursorPage(pageNumber);
      const limit = report?.meta?.limit ?? query.limit ?? clusterQuotaRecommendationsBaseQuery.limit;
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

  const handleOnGroupBySelect = (groupBy: QuotaGroupBy) => {
    setCursorPage(1);
    if (!groupBy) {
      const { group_by: _removed, ...rest } = query;
      setQuery({ ...rest, offset: 0, after: undefined });
      return;
    }
    setQuery({
      ...query,
      group_by: { cluster: '*' },
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

  const handleOnTermSelect = (term: string) => {
    setCursorPage(1);
    setQuery({ ...query, term, offset: 0, after: undefined });
  };

  const handleOnEngineSelect = (engine: string) => {
    setCursorPage(1);
    setQuery({ ...query, engine, offset: 0, after: undefined });
  };

  const quotaGroupBy = getQuotaGroupBy(query);
  const itemsTotal = report?.meta?.count ?? 0;
  const isDisabled = itemsTotal === 0;
  const hasOptimizations = itemsTotal > 0;
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
      <OptimizationsTabSummaryBanner
        engine={query.engine}
        plugin="cluster-quota"
        term={query.term}
        variant="savings"
      />
      <OptimizationsClusterQuotasToolbar
        groupBy={quotaGroupBy}
        isDisabled={isDisabled}
        itemsPerPage={report?.meta?.limit ?? query.limit ?? clusterQuotaRecommendationsBaseQuery.limit}
        itemsTotal={itemsTotal}
        onEngineSelect={handleOnEngineSelect}
        onFilterAdded={handleOnFilterAdded}
        onFilterRemoved={handleOnFilterRemoved}
        onGroupBySelect={handleOnGroupBySelect}
        onTermSelect={handleOnTermSelect}
        pagination={getPagination(isDisabled)}
        query={query}
      />
      {reportFetchStatus !== FetchStatus.complete ? (
        <LoadingState
          body={intl.formatMessage(messages.optimizationsLoadingStateDesc)}
          heading={intl.formatMessage(messages.optimizationsLoadingStateTitle)}
        />
      ) : (
        <>
          <OptimizationsClusterQuotasDataTable
            breadcrumbLabel={breadcrumbLabel}
            filterBy={query.filter_by}
            groupBy={quotaGroupBy}
            isLoading={false}
            linkPath={linkPath}
            linkState={newLinkState}
            onDrillDownFromGroup={handleDrillDownFromGroup}
            onFilterAdded={handleOnFilterAdded}
            onSort={handleOnSort}
            orderBy={query.order_by}
            queryStateName={queryStateName}
            report={report}
          />
          <div style={styles.paginationContainer}>{getPagination(isDisabled, true)}</div>
        </>
      )}
    </>
  );
};

export default OptimizationsClusterQuotasTable;
