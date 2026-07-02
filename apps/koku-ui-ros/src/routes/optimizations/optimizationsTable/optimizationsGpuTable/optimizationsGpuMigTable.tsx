import { Pagination, PaginationVariant } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { ROS_LIST_TERM } from 'api/ros/rosListParams';
import { useRecommendationTermOptions } from 'hooks/useRecommendationTermOptions';
import { ColdStartState } from 'routes/components/page/coldStart';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { NotConfigured } from 'routes/components/page/notConfigured';
import { LoadingState } from 'routes/components/state/loadingState';
import { OptimizationsTabSummaryBanner } from 'routes/optimizations/optimizationsTabSummary';
import { styles } from 'routes/optimizations/optimizationsBreakdown/optimizationsBreakdown.styles';
import * as queryUtils from 'routes/utils/query';
import { useUrlState } from 'routes/utils/useUrlState';
import { FetchStatus } from 'store/common';

import { INTERVAL_TO_TERM_NAME } from '../recommendationTermLabels';

import { gpuMigRecommendationsBaseQuery, useGpuMigRecommendationsReport } from '../useGpuMigRecommendationsReport';
import { getStorageGroupBy, type StorageGroupBy } from '../storageTableUtils';
import { OptimizationsGpuMigDataTable } from './optimizationsGpuMigDataTable';
import { OptimizationsGpuMigToolbar } from './optimizationsGpuMigToolbar';

interface OptimizationsGpuMigTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  breakdownPath?: string;
  queryStateName?: string;
}

type OptimizationsGpuMigTableProps = OptimizationsGpuMigTableOwnProps;

const OptimizationsGpuMigTable: React.FC<OptimizationsGpuMigTableProps> = ({
  breakdownPath: breakdownPathProp,
}) => {
  const intl = useIntl();
  const { termSettings } = useRecommendationTermOptions('gpu');

  const { query, setQuery } = useUrlState({
    baseQuery: gpuMigRecommendationsBaseQuery,
    prefix: 'gpu_mig_',
  });
  const { report, reportError, reportFetchStatus, reportQueryString } = useGpuMigRecommendationsReport({
    query,
  });

  const getPagination = (isDisabled = false, isBottom = false) => {
    const count = report?.meta?.count ?? 0;
    const limit = report?.meta?.limit ?? query.limit ?? gpuMigRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? gpuMigRecommendationsBaseQuery.offset;
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
        widgetId={`gpu-mig-pagination${isBottom ? '-bottom' : ''}`}
      />
    );
  };

  const getTable = () => {
    return (
      <OptimizationsGpuMigDataTable
        breakdownPath={breakdownPathProp ?? '/optimizations/gpu-mig-breakdown'}
        filterBy={query.filter_by}
        groupBy={gpuMigGroupBy}
        isLoading={reportFetchStatus === FetchStatus.inProgress}
        onDrillDownFromGroup={handleDrillDownFromGroup}
        onSort={(sortType, isSortAscending) => handleOnSort(sortType, isSortAscending)}
        orderBy={query.order_by}
        report={report}
        reportQueryString={reportQueryString}
      />
    );
  };

  const getToolbar = () => {
    const itemsPerPage = report?.meta?.limit ?? query.limit ?? gpuMigRecommendationsBaseQuery.limit;
    const itemsTotal = report?.meta?.count ?? 0;
    const isDisabled = itemsTotal === 0;

    return (
      <OptimizationsGpuMigToolbar
        groupBy={gpuMigGroupBy}
        isDisabled={isDisabled}
        itemsPerPage={itemsPerPage}
        itemsTotal={itemsTotal}
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
    const limit = report?.meta?.limit ?? query.limit ?? gpuMigRecommendationsBaseQuery.limit;
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

  const handleOnGroupBySelect = (groupBy: StorageGroupBy) => {
    if (!groupBy) {
      const { group_by: _removed, ...rest } = query;
      setQuery({ ...rest, offset: 0 });
      return;
    }
    setQuery({
      ...query,
      group_by: { [groupBy]: '*' },
      offset: 0,
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
    });
  };

  const gpuMigGroupBy = getStorageGroupBy(query);

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
    const minDataDays = report?.meta?.min_data_days ?? (() => {
      const activeTerm = query.term ?? ROS_LIST_TERM;
      const termName = INTERVAL_TO_TERM_NAME[activeTerm];
      const matchedTerm = termSettings.find(t => t.name === termName);
      return matchedTerm?.min_data_days ?? 3;
    })();
    if (dataDaysAvailable < minDataDays) {
      return <ColdStartState currentDays={dataDaysAvailable} minDays={minDataDays} />;
    }
    return <NotConfigured />;
  }
  return (
    <>
      <OptimizationsTabSummaryBanner plugin="gpu-mig" term={query.term} />
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

export default OptimizationsGpuMigTable;
