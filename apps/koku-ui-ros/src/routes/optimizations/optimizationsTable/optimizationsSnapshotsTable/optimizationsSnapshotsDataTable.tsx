import 'routes/components/dataTable/dataTable.scss';

import { Label } from '@patternfly/react-core';
import type { SnapshotRecommendationData, SnapshotRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { getTimeFromNow } from 'utils/dates';

import { CrossTabLink, SameTabFilterLink } from '../crossTabLink';
import { formatMoneyCell, formatStorageBytes, type StorageGroupBy } from '../storageTableUtils';

interface OptimizationsSnapshotsDataTableOwnProps {
  filterBy?: any;
  groupBy?: StorageGroupBy;
  isLoading?: boolean;
  onDrillDownFromGroup?(filter: { key: string; value: string });
  onFilterAdded?(filter: { key: string; value: string });
  onNavigateToSourcePvc?(item: SnapshotRecommendationData);
  onOpenDetail?(item: SnapshotRecommendationData);
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: SnapshotRecommendationReport;
}

const getClassificationBadge = (type: string | undefined, intl: ReturnType<typeof useIntl>) => {
  const map: Record<string, { id: keyof typeof messages; color: 'red' | 'orange' | 'blue' | 'green' | 'grey' }> = {
    orphaned: { id: 'snapshotClassificationOrphaned', color: 'grey' },
    stale: { id: 'snapshotClassificationStale', color: 'orange' },
    never_restored: { id: 'snapshotClassificationNeverRestored', color: 'orange' },
    redundant: { id: 'snapshotClassificationRedundant', color: 'blue' },
    managed: { id: 'snapshotClassificationManaged', color: 'green' },
    active: { id: 'snapshotClassificationActive', color: 'green' },
  };
  const entry = type ? map[type] : undefined;
  if (!entry) {
    return type ?? '—';
  }
  return (
    <Label color={entry.color} isCompact>
      {intl.formatMessage(messages[entry.id])}
    </Label>
  );
};

const OptimizationsSnapshotsDataTable: React.FC<OptimizationsSnapshotsDataTableOwnProps> = ({
  filterBy,
  groupBy = '',
  isLoading,
  onDrillDownFromGroup,
  onFilterAdded,
  onNavigateToSourcePvc,
  onOpenDetail,
  onSort,
  orderBy,
  report,
}) => {
  const intl = useIntl();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!report) {
      return;
    }
    const hasData = report?.data && report.data.length > 0;
    const isGrouped = groupBy !== '';

    if (isGrouped) {
      const groupLabel =
        groupBy === 'cluster'
          ? intl.formatMessage(messages.optimizationsNames, { value: 'cluster' })
          : intl.formatMessage(messages.optimizationsNames, { value: 'project' });

      setColumns([
        { name: groupLabel },
        { name: intl.formatMessage(messages.storageRecommendationCount) },
        { name: intl.formatMessage(messages.storageTotalRestoreSize) },
        { name: intl.formatMessage(messages.monthlyHoldingCost) },
      ]);

      const newRows = [];
      report?.data?.forEach(item => {
        const waste = formatMoneyCell(item.estimated_monthly_cost);
        const groupValue = groupBy === 'cluster' ? item.cluster_uuid ?? '' : item.namespace ?? '';
        const filterKey = groupBy === 'cluster' ? 'cluster' : 'project';
        const drillDown = onDrillDownFromGroup && groupValue;

        newRows.push({
          cells: [
            {
              value: drillDown ? (
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onDrillDownFromGroup({ key: filterKey, value: groupValue });
                  }}
                >
                  {groupValue}
                </a>
              ) : (
                groupValue
              ),
            },
            { value: item.count != null ? String(item.count) : '—' },
            { value: formatStorageBytes(item.restore_size_bytes) },
            {
              value: waste ? (
                <span style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }}>{waste}</span>
              ) : (
                '—'
              ),
            },
          ],
        });
      });
      setRows(newRows);
      return;
    }

    setColumns([
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'snapshot_name' }),
        orderBy: 'snapshot_name',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'project' }),
        orderBy: 'namespace',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.sourcePvc),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
      },
      {
        name: intl.formatMessage(messages.snapshotAgeDays),
        orderBy: 'age_days',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'classification' }),
      },
      {
        name: intl.formatMessage(messages.monthlyHoldingCost),
        orderBy: 'estimated_monthly_cost',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'last_reported' }),
      },
    ]);

    const newRows = [];
    report?.data?.forEach(item => {
      const waste = formatMoneyCell(item.estimated_monthly_cost);
      const clusterLabel = item.cluster_uuid ?? '';

      newRows.push({
        cells: [
          {
            value: onOpenDetail ? (
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  onOpenDetail(item);
                }}
              >
                {item.snapshot_name ?? ''}
              </a>
            ) : (
              item.snapshot_name ?? ''
            ),
          },
          {
            value: item.namespace ? (
              <CrossTabLink target={{ tab: 'namespace', filterKey: 'project', filterValue: item.namespace }}>
                {item.namespace}
              </CrossTabLink>
            ) : (
              ''
            ),
          },
          {
            value: item.source_pvc_name ? (
              <CrossTabLink target={{ tab: 'storage', sub: 'pvc', filterKey: 'pvc_name', filterValue: item.source_pvc_name }}>
                {item.source_pvc_name}
              </CrossTabLink>
            ) : (
              ''
            ),
          },
          {
            value: clusterLabel ? (
              <SameTabFilterLink filterKey="cluster" filterValue={clusterLabel} prefix="snap_">
                {clusterLabel}
              </SameTabFilterLink>
            ) : (
              ''
            ),
          },
          { value: item.age_days != null ? String(item.age_days) : '—' },
          { value: getClassificationBadge(item.recommendation_type, intl) },
          { value: waste ? <span style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }}>{waste}</span> : '—' },
          { value: item.last_reported ? getTimeFromNow(item.last_reported) : '—' },
        ],
      });
    });
    setRows(newRows);
  }, [groupBy, intl, onDrillDownFromGroup, onFilterAdded, onNavigateToSourcePvc, onOpenDetail, report]);

  return (
    <DataTable
      columns={columns}
      emptyState={<NoOptimizationsState />}
      filterBy={filterBy}
      isLoading={isLoading}
      onSort={onSort}
      orderBy={orderBy}
      rows={rows}
    />
  );
};

export { OptimizationsSnapshotsDataTable };
