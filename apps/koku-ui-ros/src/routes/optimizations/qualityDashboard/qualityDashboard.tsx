import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  PageSection,
  Spinner,
  Title,
  ToggleGroup,
  ToggleGroupItem,
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
import type { GPUMIGQualityRow, PVCQualityRow, QualityEntityType, QualityRow, SnapshotQualityRow, VMQualityRow } from 'api/ros/quality';
import { fetchGPUMIGQualityMetrics, fetchPVCQualityMetrics, fetchQualityMetrics, fetchSnapshotQualityMetrics, fetchVMQualityMetrics } from 'api/ros/quality';
import messages from 'locales/messages';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { QualityCharts } from './qualityCharts';
import { QualityKpis } from './qualityKpis';
import type { QualityFilters } from './qualityToolbar';
import { QualityToolbar } from './qualityToolbar';

const DEFAULT_LIMIT = 50;

type AnyQualityRow = QualityRow | PVCQualityRow | VMQualityRow | GPUMIGQualityRow | SnapshotQualityRow;

const containerSortColumns = [
  'measured_at', 'cluster', 'project', 'workload', 'container',
  'stability', 'adoption', 'oom_events', 'recommendation_age',
];

const pvcSortColumns = [
  'measured_at', 'cluster', 'project', 'pvc_name',
  'stability', 'adoption', 'days_above_threshold', 'recommendation_age',
];

const vmSortColumns = [
  'measured_at', 'cluster', 'project', 'vm_name',
  'stability', 'adoption', 'saturation_days', 'recommendation_age',
];

const gpuSortColumns = [
  'measured_at', 'cluster', 'project', 'workload', 'container_name',
  'stability', 'adoption', 'contention_days', 'recommendation_age',
];

const snapshotSortColumns = [
  'measured_at', 'cluster', 'snapshot_name',
  'adoption', 'recommendation_age',
];

const QualityDashboard: React.FC = () => {
  const intl = useIntl();
  const [entityType, setEntityType] = useState<QualityEntityType>('container');
  const [data, setData] = useState<AnyQualityRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [filters, setFilters] = useState<QualityFilters>({});
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<{ index: number; direction: SortByDirection }>({
    index: 0,
    direction: SortByDirection.desc,
  });

  const sortColumns = entityType === 'pvc' ? pvcSortColumns : entityType === 'vm' ? vmSortColumns : entityType === 'gpu' ? gpuSortColumns : entityType === 'snapshot' ? snapshotSortColumns : containerSortColumns;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const params: Record<string, string> = {
        limit: String(DEFAULT_LIMIT),
        offset: String(offset),
        order_by: sortColumns[sortBy.index] || 'measured_at',
        order_how: sortBy.direction,
      };
      for (const [key, val] of Object.entries(filters)) {
        if (val) {
          params[key] = val;
        }
      }
      let responseData: AnyQualityRow[] = [];
      let count = 0;
      if (entityType === 'pvc') {
        const response = await fetchPVCQualityMetrics(params);
        responseData = response.data?.data ?? [];
        count = response.data?.meta?.count ?? 0;
      } else if (entityType === 'vm') {
        const response = await fetchVMQualityMetrics(params);
        responseData = response.data?.data ?? [];
        count = response.data?.meta?.count ?? 0;
      } else if (entityType === 'gpu') {
        const response = await fetchGPUMIGQualityMetrics(params);
        responseData = response.data?.data ?? [];
        count = response.data?.meta?.count ?? 0;
      } else if (entityType === 'snapshot') {
        const response = await fetchSnapshotQualityMetrics(params);
        responseData = response.data?.data ?? [];
        count = response.data?.meta?.count ?? 0;
      } else {
        const response = await fetchQualityMetrics(params);
        responseData = response.data?.data ?? [];
        count = response.data?.meta?.count ?? 0;
      }
      setData(responseData);
      setTotalCount(count);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, filters, offset, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEntityTypeChange = (type: QualityEntityType) => {
    setEntityType(type);
    setData([]);
    setOffset(0);
    setSortBy({ index: 0, direction: SortByDirection.desc });
  };

  const handleFiltersChange = (newFilters: QualityFilters) => {
    setFilters(newFilters);
    setOffset(0);
  };

  const handleSort = (_event: any, index: number, direction: SortByDirection) => {
    setSortBy({ index, direction });
    setOffset(0);
  };

  const columnHeaders = useMemo(() => {
    const common = [
      intl.formatMessage(messages.qualityColumnDate),
      intl.formatMessage(messages.qualityColumnCluster),
      intl.formatMessage(messages.qualityColumnProject),
    ];
    if (entityType === 'pvc') {
      return [
        ...common,
        intl.formatMessage(messages.qualityColumnPvcName),
        intl.formatMessage(messages.qualityColumnStability),
        intl.formatMessage(messages.qualityColumnAdoption),
        intl.formatMessage(messages.qualityColumnDaysAboveThreshold),
        intl.formatMessage(messages.qualityColumnAge),
      ];
    }
    if (entityType === 'vm') {
      return [
        ...common,
        intl.formatMessage(messages.qualityColumnVmName),
        intl.formatMessage(messages.qualityColumnStability),
        intl.formatMessage(messages.qualityColumnAdoption),
        intl.formatMessage(messages.qualityColumnSaturationDays),
        intl.formatMessage(messages.qualityColumnAge),
      ];
    }
    if (entityType === 'gpu') {
      return [
        ...common,
        intl.formatMessage(messages.qualityColumnWorkload),
        intl.formatMessage(messages.qualityColumnContainerName),
        intl.formatMessage(messages.qualityColumnStability),
        intl.formatMessage(messages.qualityColumnAdoption),
        intl.formatMessage(messages.qualityColumnContentionDays),
        intl.formatMessage(messages.qualityColumnAge),
      ];
    }
    if (entityType === 'snapshot') {
      return [
        intl.formatMessage(messages.qualityColumnDate),
        intl.formatMessage(messages.qualityColumnCluster),
        intl.formatMessage(messages.qualityColumnSnapshotName),
        intl.formatMessage(messages.qualityColumnAdoption),
        intl.formatMessage(messages.qualityColumnAge),
      ];
    }
    return [
      ...common,
      intl.formatMessage(messages.qualityColumnWorkload),
      intl.formatMessage(messages.qualityColumnContainer),
      intl.formatMessage(messages.qualityColumnStability),
      intl.formatMessage(messages.qualityColumnAdoption),
      intl.formatMessage(messages.qualityColumnOom),
      intl.formatMessage(messages.qualityColumnAge),
    ];
  }, [entityType, intl]);

  const renderRow = (row: AnyQualityRow, rowIdx: number) => {
    const commonCells = (
      <>
        <Td>{new Date(row.measured_at).toLocaleDateString()}</Td>
        <Td>{row.cluster_alias || row.cluster_uuid}</Td>
        <Td>{'namespace' in row ? row.namespace : ''}</Td>
      </>
    );

    if (entityType === 'pvc') {
      const pvcRow = row as PVCQualityRow;
      return (
        <Tr key={rowIdx}>
          {commonCells}
          <Td>{pvcRow.pvc_name}</Td>
          <Td>{pvcRow.stability_pct != null ? `${(pvcRow.stability_pct * 100).toFixed(1)}%` : '—'}</Td>
          <Td>{pvcRow.adoption_detected ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}</Td>
          <Td>{pvcRow.days_above_threshold ?? '—'}</Td>
          <Td>{pvcRow.recommendation_age_hours != null ? `${pvcRow.recommendation_age_hours}h` : '—'}</Td>
        </Tr>
      );
    }

    if (entityType === 'vm') {
      const vmRow = row as VMQualityRow;
      return (
        <Tr key={rowIdx}>
          {commonCells}
          <Td>{vmRow.vm_name}</Td>
          <Td>{vmRow.stability_pct != null ? `${(vmRow.stability_pct * 100).toFixed(1)}%` : '—'}</Td>
          <Td>{vmRow.adoption_detected ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}</Td>
          <Td>{vmRow.saturation_days ?? '—'}</Td>
          <Td>{vmRow.recommendation_age_hours != null ? `${vmRow.recommendation_age_hours}h` : '—'}</Td>
        </Tr>
      );
    }

    if (entityType === 'gpu') {
      const gpuRow = row as GPUMIGQualityRow;
      return (
        <Tr key={rowIdx}>
          {commonCells}
          <Td>{gpuRow.workload}</Td>
          <Td>{gpuRow.container_name}</Td>
          <Td>{gpuRow.stability_pct != null ? `${(gpuRow.stability_pct * 100).toFixed(1)}%` : '—'}</Td>
          <Td>{gpuRow.adoption_detected ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}</Td>
          <Td>{gpuRow.contention_days ?? '—'}</Td>
          <Td>{gpuRow.recommendation_age_hours != null ? `${gpuRow.recommendation_age_hours}h` : '—'}</Td>
        </Tr>
      );
    }

    if (entityType === 'snapshot') {
      const snapRow = row as SnapshotQualityRow;
      return (
        <Tr key={rowIdx}>
          <Td>{new Date(snapRow.measured_at).toLocaleDateString()}</Td>
          <Td>{snapRow.cluster_alias || snapRow.cluster_uuid}</Td>
          <Td>{snapRow.snapshot_name}</Td>
          <Td>{snapRow.adoption_detected ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}</Td>
          <Td>{snapRow.recommendation_age_hours != null ? `${snapRow.recommendation_age_hours}h` : '—'}</Td>
        </Tr>
      );
    }

    const containerRow = row as QualityRow;
    return (
      <Tr key={rowIdx}>
        {commonCells}
        <Td>{containerRow.workload}</Td>
        <Td>{containerRow.container_name}</Td>
        <Td>{containerRow.stability_pct != null ? `${(containerRow.stability_pct * 100).toFixed(1)}%` : '—'}</Td>
        <Td>{containerRow.adoption_detected ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}</Td>
        <Td>{containerRow.oom_events_after_rec ?? '—'}</Td>
        <Td>{containerRow.recommendation_age_hours != null ? `${containerRow.recommendation_age_hours}h` : '—'}</Td>
      </Tr>
    );
  };

  const entityToggle = (
    <ToggleGroup aria-label="Entity type selector" style={{ marginBottom: 16 }}>
      <ToggleGroupItem
        text={intl.formatMessage(messages.qualityEntityContainer)}
        isSelected={entityType === 'container'}
        onChange={() => handleEntityTypeChange('container')}
      />
      <ToggleGroupItem
        text={intl.formatMessage(messages.qualityEntityPvc)}
        isSelected={entityType === 'pvc'}
        onChange={() => handleEntityTypeChange('pvc')}
      />
      <ToggleGroupItem
        text={intl.formatMessage(messages.qualityEntityVm)}
        isSelected={entityType === 'vm'}
        onChange={() => handleEntityTypeChange('vm')}
      />
      <ToggleGroupItem
        text={intl.formatMessage(messages.qualityEntityGpu)}
        isSelected={entityType === 'gpu'}
        onChange={() => handleEntityTypeChange('gpu')}
      />
      <ToggleGroupItem
        text={intl.formatMessage(messages.qualityEntitySnapshot)}
        isSelected={entityType === 'snapshot'}
        onChange={() => handleEntityTypeChange('snapshot')}
      />
    </ToggleGroup>
  );

  if (isLoading && !data.length) {
    return (
      <PageSection>
        {entityToggle}
        <Spinner size="xl" aria-label={intl.formatMessage(messages.qualityDashboardTitle)} />
      </PageSection>
    );
  }

  if (hasError) {
    return (
      <PageSection>
        {entityToggle}
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
        {entityToggle}
        <QualityToolbar entityType={entityType} filters={filters} onFiltersChange={handleFiltersChange} />
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
      {entityToggle}
      <QualityToolbar entityType={entityType} filters={filters} onFiltersChange={handleFiltersChange} />
      {entityType === 'container' && (
        <>
          <QualityKpis data={data as QualityRow[]} />
          <QualityCharts data={data as QualityRow[]} />
        </>
      )}
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
            {data.map((row, rowIdx) => renderRow(row, rowIdx))}
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
