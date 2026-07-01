import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Pagination,
  PaginationVariant,
  Switch,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { axiosInstance } from 'api';
import type { HistoryListResponse, RecommendationHistoryParams } from 'api/ros/recommendationHistory';
import { fetchRecommendationHistory } from 'api/ros/recommendationHistory';
import messages from 'locales/messages';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { LoadingState } from 'routes/components/state/loadingState';

import type { HistoryExplorerFilters } from './historyExplorerToolbar';
import { HistoryExplorerToolbar } from './historyExplorerToolbar';
import { HistoryExplorerTable } from './historyExplorerTable';
import { styles } from './historyExplorer.styles';

const DEFAULT_LIMIT = 20;

function getDefaultDateRange(): { start_date: string; end_date: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  };
}

const HistoryExplorer: React.FC = () => {
  const intl = useIntl();
  const defaultDates = getDefaultDateRange();

  const [filters, setFilters] = useState<HistoryExplorerFilters>({
    start_date: defaultDates.start_date,
    end_date: defaultDates.end_date,
  });
  const [orderBy, setOrderBy] = useState('recorded_at');
  const [orderHow, setOrderHow] = useState('DESC');
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);
  const [showAdvancedColumns, setShowAdvancedColumns] = useState(false);

  const [data, setData] = useState<HistoryListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: RecommendationHistoryParams = {
        limit,
        offset,
        order_by: orderBy,
        order_how: orderHow,
        start_date: filters.start_date,
        end_date: filters.end_date,
        cluster: filters.cluster?.join(','),
        project: filters.project?.join(','),
        workload: filters.workload?.join(','),
        container: filters.container?.join(','),
        term: filters.term,
        engine: filters.engine,
      };
      const response = await fetchRecommendationHistory(params);
      setData(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch history data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, orderBy, orderHow, limit, offset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFiltersChange = (newFilters: HistoryExplorerFilters) => {
    setFilters(newFilters);
    setOffset(0);
  };

  const handleSort = (field: string) => {
    if (orderBy === field) {
      setOrderHow(orderHow === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setOrderBy(field);
      setOrderHow('DESC');
    }
    setOffset(0);
  };

  const handlePerPageSelect = (_event: any, perPage: number) => {
    setLimit(perPage);
    setOffset(0);
  };

  const handleSetPage = (_event: any, pageNumber: number) => {
    setOffset((pageNumber - 1) * limit);
  };

  const handleExport = async () => {
    try {
      const params: Record<string, string> = { format: 'csv' };
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.cluster?.length) {
        params['filter[cluster]'] = filters.cluster.join(',');
      }
      if (filters.project?.length) {
        params['filter[project]'] = filters.project.join(',');
      }
      if (filters.workload?.length) {
        params['filter[workload]'] = filters.workload.join(',');
      }
      if (filters.container?.length) {
        params['filter[container]'] = filters.container.join(',');
      }
      if (filters.term) {
        params['filter[term]'] = filters.term;
      }
      if (filters.engine) {
        params['filter[engine]'] = filters.engine;
      }
      if (orderBy) {
        params.order_by = orderBy;
      }
      if (orderHow) {
        params.order_how = orderHow;
      }

      const response = await axiosInstance.get('/recommendations/openshift/history', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recommendation-history-${filters.start_date || 'all'}-${filters.end_date || 'all'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Export failed silently — could show notification
    }
  };

  const count = data?.meta?.count ?? 0;
  const page = Math.trunc(offset / limit + 1);

  const getPagination = (isBottom = false) => (
    <Pagination
      isCompact={!isBottom}
      isDisabled={count === 0}
      itemCount={count}
      onPerPageSelect={handlePerPageSelect}
      onSetPage={handleSetPage}
      page={page}
      perPage={limit}
      titles={{
        paginationAriaLabel: intl.formatMessage(messages.historyPaginationAriaLabel, {
          placement: isBottom ? 'bottom' : 'top',
        }),
      }}
      variant={isBottom ? PaginationVariant.bottom : PaginationVariant.top}
    />
  );

  const renderEmptyState = () => (
    <Bullseye>
      <EmptyState
        headingLevel="h2"
        icon={SearchIcon}
        titleText={intl.formatMessage(messages.historyNoDataTitle)}
        variant={EmptyStateVariant.lg}
      >
        <EmptyStateBody>{intl.formatMessage(messages.historyNoDataBody)}</EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );

  return (
    <>
      <HistoryExplorerToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        pagination={getPagination()}
        isDisabled={count === 0}
      />

      <div style={{ padding: '0 var(--pf-v5-global--spacer--md)' }}>
        <Switch
          id="history-advanced-columns"
          label={intl.formatMessage(messages.historyShowAdvancedColumns)}
          isChecked={showAdvancedColumns}
          onChange={(_event, checked) => setShowAdvancedColumns(checked)}
        />
      </div>

      {isLoading ? (
        <LoadingState
          body={intl.formatMessage(messages.historyLoadingBody)}
          heading={intl.formatMessage(messages.historyLoadingTitle)}
        />
      ) : error ? (
        <Bullseye>
          <EmptyState headingLevel="h2" titleText={intl.formatMessage(messages.historyErrorTitle)} variant={EmptyStateVariant.lg}>
            <EmptyStateBody>{error}</EmptyStateBody>
          </EmptyState>
        </Bullseye>
      ) : count === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <HistoryExplorerTable
            data={data?.data || []}
            isLoading={isLoading}
            orderBy={orderBy}
            orderHow={orderHow}
            onSort={handleSort}
            showAdvancedColumns={showAdvancedColumns}
          />
          <div style={styles.paginationContainer}>{getPagination(true)}</div>
        </>
      )}
    </>
  );
};

export default HistoryExplorer;
