import { Pagination, PaginationVariant } from '@patternfly/react-core';
import type { SnapshotRecommendationData } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotAvailable } from 'routes/components/page/notAvailable';
import { NotConfigured } from 'routes/components/page/notConfigured';
import { LoadingState } from 'routes/components/state/loadingState';
import { OptimizationsTabSummaryBanner } from 'routes/optimizations/optimizationsTabSummary';
import { buildStoragePvcListPath } from 'routes/optimizations/storageNavigation';
import { styles } from 'routes/optimizations/optimizationsBreakdown/optimizationsBreakdown.styles';
import * as queryUtils from 'routes/utils/query';
import { useUrlState } from 'routes/utils/useUrlState';
import { FetchStatus } from 'store/common';

import {
  snapshotRecommendationsBaseQuery,
  useSnapshotRecommendationsReport,
} from '../useSnapshotRecommendationsReport';
import { getStorageGroupBy, type StorageGroupBy } from '../storageTableUtils';
import { OptimizationsSnapshotsDataTable } from './optimizationsSnapshotsDataTable';
import { OptimizationsSnapshotsToolbar } from './optimizationsSnapshotsToolbar';
import { SnapshotDetailModal } from './snapshotDetailModal';

const OptimizationsSnapshotsTable: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const [cursorPage, setCursorPage] = useState(1);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotRecommendationData>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { query, setQuery } = useUrlState({
    baseQuery: snapshotRecommendationsBaseQuery,
    prefix: 'snap_',
  });
  const { report, reportError, reportFetchStatus } = useSnapshotRecommendationsReport({ query });

  const getPagination = (isDisabled = false, isBottom = false) => {
    const count = report?.meta?.count ?? 0;
    const limit = report?.meta?.limit ?? query.limit ?? snapshotRecommendationsBaseQuery.limit;
    const offset = report?.meta?.offset ?? query.offset ?? snapshotRecommendationsBaseQuery.offset;
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
        widgetId={`snapshot-pagination${isBottom ? '-bottom' : ''}`}
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
      const limit = report?.meta?.limit ?? query.limit ?? snapshotRecommendationsBaseQuery.limit;
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

  const handleOpenDetail = (item: SnapshotRecommendationData) => {
    setSelectedSnapshot(item);
    setIsDetailOpen(true);
  };

  const handleNavigateToSourcePvc = (item: SnapshotRecommendationData) => {
    if (!item.source_pvc_name) {
      return;
    }
    navigate(
      buildStoragePvcListPath(location.pathname, location.search, {
        cluster: item.cluster_uuid,
        project: item.namespace,
        pvc_name: item.source_pvc_name,
      }),
      { state: location.state }
    );
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
    return <NotConfigured />;
  }

  return (
    <>
      <OptimizationsTabSummaryBanner plugin="snapshot" variant="waste" />
      <OptimizationsSnapshotsToolbar
        groupBy={storageGroupBy}
        isDisabled={isDisabled}
        itemsPerPage={report?.meta?.limit ?? query.limit ?? snapshotRecommendationsBaseQuery.limit}
        itemsTotal={itemsTotal}
        onFilterAdded={handleOnFilterAdded}
        onFilterRemoved={handleOnFilterRemoved}
        onGroupBySelect={handleOnGroupBySelect}
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
          <OptimizationsSnapshotsDataTable
            filterBy={query.filter_by}
            groupBy={storageGroupBy}
            isLoading={false}
            onDrillDownFromGroup={handleDrillDownFromGroup}
            onFilterAdded={handleOnFilterAdded}
            onNavigateToSourcePvc={handleNavigateToSourcePvc}
            onOpenDetail={handleOpenDetail}
            onSort={handleOnSort}
            orderBy={query.order_by}
            report={report}
          />
          <SnapshotDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onNavigateToSourcePvc={handleNavigateToSourcePvc}
            snapshot={selectedSnapshot}
          />
          <div style={styles.paginationContainer}>{getPagination(isDisabled, true)}</div>
        </>
      )}
    </>
  );
};

export default OptimizationsSnapshotsTable;
