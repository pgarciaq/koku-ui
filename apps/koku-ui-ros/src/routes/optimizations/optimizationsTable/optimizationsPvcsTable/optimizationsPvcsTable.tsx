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
import { OptimizationsTabSummaryBanner } from 'routes/optimizations/optimizationsTabSummary';
import { styles } from 'routes/optimizations/optimizationsBreakdown/optimizationsBreakdown.styles';
import * as queryUtils from 'routes/utils/query';
import { useUrlState } from 'routes/utils/useUrlState';
import { FetchStatus } from 'store/common';

import { INTERVAL_TO_TERM_NAME } from '../recommendationTermLabels';

import { useSavingsFallbackSort } from '../useSavingsFallbackSort';
import { pvcRecommendationsBaseQuery, usePvcRecommendationsReport } from '../usePvcRecommendationsReport';
import { getLinkState } from '../utils';
import { getStorageGroupBy, type StorageGroupBy } from '../storageTableUtils';
import { OptimizationsPvcsDataTable } from './optimizationsPvcsDataTable';
import { OptimizationsPvcsToolbar } from './optimizationsPvcsToolbar';

interface OptimizationsPvcsTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

const OptimizationsPvcsTable: React.FC<OptimizationsPvcsTableOwnProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkPath,
  linkState,
  queryStateName,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const { termSettings } = useRecommendationTermOptions('pvc');
  const [cursorPage, setCursorPage] = useState(1);
  const [newLinkState, setNewLinkState] = useState();

  const { query, setQuery } = useUrlState({
    baseQuery: pvcRecommendationsBaseQuery,
    prefix: 'pvc_',
  });
  const { report, reportError, reportFetchStatus } = usePvcRecommendationsReport({ query });

  const currentOrderBy = query.order_by ? Object.keys(query.order_by)[0] : undefined;
  useSavingsFallbackSort({
    data: report?.data,
    currentOrderBy,
    fallbackOrderBy: 'usage_ratio',
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
    const limit = report?.meta?.limit ?? query.limit ?? pvcRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? pvcRecommendationsBaseQuery.offset;
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
        widgetId={`pvc-pagination${isBottom ? '-bottom' : ''}`}
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
      const limit = report?.meta?.limit ?? query.limit ?? pvcRecommendationsBaseQuery.limit;
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

  const storageGroupBy = getStorageGroupBy(query);
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
      <OptimizationsTabSummaryBanner plugin="pvc" term={query.term} />
      <OptimizationsPvcsToolbar
        groupBy={storageGroupBy}
        isDisabled={isDisabled}
        itemsPerPage={report?.meta?.limit ?? query.limit ?? pvcRecommendationsBaseQuery.limit}
        itemsTotal={itemsTotal}
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
          <OptimizationsPvcsDataTable
            breadcrumbLabel={breadcrumbLabel}
            filterBy={query.filter_by}
            groupBy={storageGroupBy}
            isLoading={false}
            linkPath={linkPath}
            linkState={newLinkState}
            onDrillDownFromGroup={handleDrillDownFromGroup}
            onFilterAdded={handleOnFilterAdded}
            onSort={handleOnSort}
            orderBy={query.order_by}
            report={report}
            term={query.term}
          />
          <div style={styles.paginationContainer}>{getPagination(isDisabled, true)}</div>
        </>
      )}
    </>
  );
};

export default OptimizationsPvcsTable;
