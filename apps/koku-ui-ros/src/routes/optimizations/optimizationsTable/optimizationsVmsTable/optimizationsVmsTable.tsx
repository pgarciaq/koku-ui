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

import { useSavingsFallbackSort } from '../useSavingsFallbackSort';
import { vmRecommendationsBaseQuery, useVmRecommendationsReport } from '../useVmRecommendationsReport';
import { getStorageGroupBy, type StorageGroupBy } from '../storageTableUtils';
import { getLinkState } from '../utils';
import { OptimizationsVmsDataTable } from './optimizationsVmsDataTable';
import { OptimizationsVmsToolbar } from './optimizationsVmsToolbar';

interface OptimizationsVmsTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

type OptimizationsVmsTableProps = OptimizationsVmsTableOwnProps;

const OptimizationsVmsTable: React.FC<OptimizationsVmsTableProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkPath,
  linkState,
  queryStateName,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const [newLinkState, setNewLinkState] = useState();

  const { query, setQuery } = useUrlState({
    baseQuery: vmRecommendationsBaseQuery,
    prefix: 'vm_',
  });
  const { report, reportError, reportFetchStatus, reportQueryString } = useVmRecommendationsReport({
    query,
  });

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
    const limit = report?.meta?.limit ?? query.limit ?? vmRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? vmRecommendationsBaseQuery.offset;
    const page = Math.trunc(offset / limit + 1);

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
        widgetId={`vm-pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const getTable = () => {
    return (
      <OptimizationsVmsDataTable
        breadcrumbLabel={breadcrumbLabel}
        engine={query.engine}
        filterBy={query.filter_by}
        groupBy={vmGroupBy}
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
    const itemsPerPage = report?.meta?.limit ?? query.limit ?? vmRecommendationsBaseQuery.limit;
    const itemsTotal = report?.meta?.count ?? 0;
    const isDisabled = itemsTotal === 0;

    return (
      <OptimizationsVmsToolbar
        groupBy={vmGroupBy}
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
    const newQuery = queryUtils.handleOnFilterAdded(query, filter);
    setQuery(newQuery);
  };

  const handleOnFilterRemoved = filter => {
    const newQuery = queryUtils.handleOnFilterRemoved(query, filter);
    setQuery(newQuery);
  };

  const handleOnPerPageSelect = perPage => {
    setQuery({
      ...query,
      limit: perPage,
      offset: 0,
      after: undefined,
    });
  };

  const handleOnSetPage = pageNumber => {
    const limit = report?.meta?.limit ?? query.limit ?? vmRecommendationsBaseQuery.limit;
    const offset = pageNumber * limit - limit;
    setQuery({
      ...query,
      limit,
      offset,
      after: undefined,
    });
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

  const handleOnGroupBySelect = (groupBy: StorageGroupBy) => {
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

  const vmGroupBy = getStorageGroupBy(query);

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
      <OptimizationsTabSummaryBanner engine={query.engine} plugin="vm" term={query.term} />
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

export default OptimizationsVmsTable;
