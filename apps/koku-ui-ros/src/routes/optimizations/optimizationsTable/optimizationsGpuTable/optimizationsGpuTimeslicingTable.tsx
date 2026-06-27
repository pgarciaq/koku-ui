import { Pagination, PaginationVariant } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { NotConfigured } from 'routes/components/page/notConfigured';
import { LoadingState } from 'routes/components/state/loadingState';
import { styles } from 'routes/optimizations/optimizationsBreakdown/optimizationsBreakdown.styles';
import * as queryUtils from 'routes/utils/query';
import { useUrlState } from 'routes/utils/useUrlState';
import { FetchStatus } from 'store/common';

import {
  gpuTimeslicingRecommendationsBaseQuery,
  useGpuTimeslicingRecommendationsReport,
} from '../useGpuTimeslicingRecommendationsReport';
import { OptimizationsGpuTimeslicingDataTable } from './optimizationsGpuTimeslicingDataTable';
import { OptimizationsGpuTimeslicingToolbar } from './optimizationsGpuTimeslicingToolbar';

interface OptimizationsGpuTimeslicingTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  queryStateName?: string;
}

type OptimizationsGpuTimeslicingTableProps = OptimizationsGpuTimeslicingTableOwnProps;

const OptimizationsGpuTimeslicingTable: React.FC<OptimizationsGpuTimeslicingTableProps> = () => {
  const intl = useIntl();

  const { query, setQuery } = useUrlState({
    baseQuery: gpuTimeslicingRecommendationsBaseQuery,
    prefix: 'gpu_ts_',
  });
  const { report, reportError, reportFetchStatus, reportQueryString } = useGpuTimeslicingRecommendationsReport({
    query,
  });

  const getPagination = (isDisabled = false, isBottom = false) => {
    const count = report?.meta?.count ?? 0;
    const limit = report?.meta?.limit ?? query.limit ?? gpuTimeslicingRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? gpuTimeslicingRecommendationsBaseQuery.offset;
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
        widgetId={`gpu-ts-pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const getTable = () => {
    return (
      <OptimizationsGpuTimeslicingDataTable
        filterBy={query.filter_by}
        isLoading={reportFetchStatus === FetchStatus.inProgress}
        onFilterAdded={filter => handleOnFilterAdded(filter)}
        onSort={(sortType, isSortAscending) => handleOnSort(sortType, isSortAscending)}
        orderBy={query.order_by}
        report={report}
        reportQueryString={reportQueryString}
      />
    );
  };

  const getToolbar = () => {
    const itemsPerPage = report?.meta?.limit ?? query.limit ?? gpuTimeslicingRecommendationsBaseQuery.limit;
    const itemsTotal = report?.meta?.count ?? 0;
    const isDisabled = itemsTotal === 0;

    return (
      <OptimizationsGpuTimeslicingToolbar
        isDisabled={isDisabled}
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
    setQuery({ ...newQuery, offset: 0 });
  };

  const handleOnFilterRemoved = filter => {
    const newQuery = queryUtils.handleOnFilterRemoved(query, filter);
    setQuery({ ...newQuery, offset: 0 });
  };

  const handleOnPerPageSelect = perPage => {
    const newQuery = queryUtils.handleOnPerPageSelect(query, perPage, true);
    setQuery({ ...newQuery, offset: 0 });
  };

  const handleOnSetPage = pageNumber => {
    const limit = report?.meta?.limit ?? query.limit ?? gpuTimeslicingRecommendationsBaseQuery.limit;
    const offset = (pageNumber - 1) * limit;
    setQuery({ ...query, offset });
  };

  const handleOnSort = (sortType, isSortAscending) => {
    const newQuery = queryUtils.handleOnSort(query, sortType, isSortAscending);
    setQuery({ ...newQuery, offset: 0 });
  };

  const handleOnTermSelect = (term: string) => {
    setQuery({ ...query, term, offset: 0 });
  };

  const handleOnEngineSelect = (engine: string) => {
    setQuery({ ...query, engine, offset: 0 });
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

export default OptimizationsGpuTimeslicingTable;
