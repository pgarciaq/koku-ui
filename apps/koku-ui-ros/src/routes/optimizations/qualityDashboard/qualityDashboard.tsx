import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';
import {
  InnerScrollContainer,
  SortByDirection,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import type { QualityRow } from 'api/ros/quality';
import { fetchQualityMetrics } from 'api/ros/quality';
import messages from 'locales/messages';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { QualityCharts } from './qualityCharts';
import { QualityKpis } from './qualityKpis';
import type { QualityFilters } from './qualityToolbar';
import { QualityToolbar } from './qualityToolbar';

const DEFAULT_LIMIT = 50;

const QualityDashboard: React.FC = () => {
  const intl = useIntl();
  const [data, setData] = useState<QualityRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [filters, setFilters] = useState<QualityFilters>({});
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<{ index: number; direction: SortByDirection }>({
    index: 0,
    direction: SortByDirection.desc,
  });

  const sortColumns = [
    'measured_at',
    'cluster',
    'project',
    'workload',
    'container',
    'stability',
    'adoption',
    'oom_events',
    'recommendation_age',
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const params: Record<string, string> = {
        limit: String(DEFAULT_LIMIT),
        offset: String(offset),
        order_by: sortColumns[sortBy.index],
        order_how: sortBy.direction,
      };
      for (const [key, val] of Object.entries(filters)) {
        if (val) {
          params[key] = val;
        }
      }
      const response = await fetchQualityMetrics(params);
      setData(response.data?.data ?? []);
      setTotalCount(response.data?.meta?.count ?? 0);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [filters, offset, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFiltersChange = (newFilters: QualityFilters) => {
    setFilters(newFilters);
    setOffset(0);
  };

  const handleSort = (_event: any, index: number, direction: SortByDirection) => {
    setSortBy({ index, direction });
    setOffset(0);
  };

  const columnHeaders = useMemo(
    () => [
      intl.formatMessage(messages.qualityColumnDate),
      intl.formatMessage(messages.qualityColumnCluster),
      intl.formatMessage(messages.qualityColumnProject),
      intl.formatMessage(messages.qualityColumnWorkload),
      intl.formatMessage(messages.qualityColumnContainer),
      intl.formatMessage(messages.qualityColumnStability),
      intl.formatMessage(messages.qualityColumnAdoption),
      intl.formatMessage(messages.qualityColumnOom),
      intl.formatMessage(messages.qualityColumnAge),
    ],
    [intl]
  );

  if (isLoading && !data.length) {
    return (
      <PageSection>
        <Spinner size="xl" aria-label={intl.formatMessage(messages.qualityDashboardTitle)} />
      </PageSection>
    );
  }

  if (hasError) {
    return (
      <PageSection>
        <EmptyState variant={EmptyStateVariant.lg}>
          <Title headingLevel="h2" size="lg">
            {intl.formatMessage(messages.qualityDashboardTitle)}
          </Title>
          <EmptyStateBody>{intl.formatMessage(messages.qualityDashboardError)}</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  if (!data.length && !isLoading) {
    return (
      <PageSection>
        <QualityToolbar filters={filters} onFiltersChange={handleFiltersChange} />
        <EmptyState variant={EmptyStateVariant.lg}>
          <Title headingLevel="h2" size="lg">
            {intl.formatMessage(messages.qualityDashboardTitle)}
          </Title>
          <EmptyStateBody>{intl.formatMessage(messages.qualityDashboardEmpty)}</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  const pageCount = Math.ceil(totalCount / DEFAULT_LIMIT);
  const currentPage = Math.floor(offset / DEFAULT_LIMIT) + 1;

  return (
    <>
      <QualityToolbar filters={filters} onFiltersChange={handleFiltersChange} />
      <QualityKpis data={data} />
      <QualityCharts data={data} />
      <InnerScrollContainer>
        <Table aria-label={intl.formatMessage(messages.qualityDashboardTitle)} variant="compact">
          <Thead>
            <Tr>
              {columnHeaders.map((header, idx) => (
                <Th
                  key={idx}
                  sort={{
                    sortBy: { index: sortBy.index, direction: sortBy.direction },
                    onSort: handleSort,
                    columnIndex: idx,
                  }}
                >
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, rowIdx) => (
              <Tr key={rowIdx}>
                <Td>{new Date(row.measured_at).toLocaleDateString()}</Td>
                <Td>{row.cluster_alias || row.cluster_uuid}</Td>
                <Td>{row.namespace}</Td>
                <Td>{row.workload}</Td>
                <Td>{row.container_name}</Td>
                <Td>{row.stability_pct != null ? `${(row.stability_pct * 100).toFixed(1)}%` : '—'}</Td>
                <Td>{row.adoption_detected ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}</Td>
                <Td>{row.oom_events_after_rec ?? '—'}</Td>
                <Td>{row.recommendation_age_hours != null ? `${row.recommendation_age_hours}h` : '—'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </InnerScrollContainer>
      {pageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16, gap: 8 }}>
          <button disabled={currentPage <= 1} onClick={() => setOffset(offset - DEFAULT_LIMIT)}>
            {intl.formatMessage(messages.qualityPaginationPrevious)}
          </button>
          <span>
            {currentPage} / {pageCount}
          </span>
          <button disabled={currentPage >= pageCount} onClick={() => setOffset(offset + DEFAULT_LIMIT)}>
            {intl.formatMessage(messages.qualityPaginationNext)}
          </button>
        </div>
      )}
    </>
  );
};

export { QualityDashboard };
