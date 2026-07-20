import 'routes/components/dataTable/dataTable.scss';

import { Label } from '@patternfly/react-core';
import type { PvcRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { getTimeFromNow } from 'utils/dates';

import { formatMoneyCell, formatStorageBytes, formatUsageRatio, type StorageGroupBy } from '../storageTableUtils';

interface OptimizationsPvcsDataTableOwnProps {
  breadcrumbLabel?: string;
  filterBy?: any;
  groupBy?: StorageGroupBy;
  isLoading?: boolean;
  linkPath?: string;
  linkState?: any;
  onDrillDownFromGroup?(filter: { key: string; value: string });
  onFilterAdded?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: PvcRecommendationReport;
  term?: string;
}

const getClassificationBadge = (type: string | undefined, intl: ReturnType<typeof useIntl>) => {
  switch (type) {
    case 'oversized':
      return (
        <Label color="orange" isCompact>
          {intl.formatMessage(messages.pvcClassificationOversized)}
        </Label>
      );
    case 'near_full':
      return (
        <Label color="red" isCompact>
          {intl.formatMessage(messages.pvcClassificationNearFull)}
        </Label>
      );
    case 'orphaned':
      return (
        <Label color="grey" isCompact>
          {intl.formatMessage(messages.pvcClassificationOrphaned)}
        </Label>
      );
    case 'healthy':
      return (
        <Label color="green" isCompact>
          {intl.formatMessage(messages.pvcClassificationHealthy)}
        </Label>
      );
    default:
      return type ?? '—';
  }
};

const OptimizationsPvcsDataTable: React.FC<OptimizationsPvcsDataTableOwnProps> = ({
  breadcrumbLabel,
  filterBy,
  groupBy = '',
  isLoading,
  linkPath,
  linkState,
  onDrillDownFromGroup,
  onFilterAdded,
  onSort,
  orderBy,
  report,
  term,
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
        { name: intl.formatMessage(messages.storageTotalCapacity) },
        {
          name: intl.formatMessage(messages.optimizationsNames, { value: 'potential_savings' }),
        },
      ]);

      const newRows = [];
      report?.data?.forEach(item => {
        const savings = formatMoneyCell(item.estimated_monthly_savings);
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
            { value: formatStorageBytes(item.capacity_bytes) },
            { value: savings ?? '—' },
          ],
        });
      });
      setRows(newRows);
      return;
    }

    setColumns([
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'pvc_name' }),
        orderBy: 'pvc_name',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'project' }),
        orderBy: 'namespace',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
      },
      {
        name: intl.formatMessage(messages.pvcCapacity),
        orderBy: 'capacity_bytes',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.pvcUsagePercent),
        orderBy: 'usage_ratio',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'classification' }),
        orderBy: 'recommendation_type',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'potential_savings' }),
        orderBy: 'estimated_monthly_savings',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'last_reported' }),
      },
    ]);

    const newRows = [];
    report?.data?.forEach(item => {
      const savings = formatMoneyCell(item.estimated_monthly_savings);
      const clusterLabel = item.cluster_uuid ?? '';
      const breakdownPath =
        linkPath && item.cluster_uuid && item.namespace && item.persistentvolumeclaim
          ? `${linkPath}?id=${encodeURIComponent(item.persistentvolumeclaim)}&cluster_uuid=${encodeURIComponent(item.cluster_uuid)}&namespace=${encodeURIComponent(item.namespace)}`
          : undefined;

      newRows.push({
        cells: [
          {
            value: breakdownPath ? (
              <Link
                to={breakdownPath}
                state={{
                  ...linkState,
                  pvcDetailsState: {
                    ...(linkState?.pvcDetailsState || {}),
                    term,
                    cluster_uuid: item.cluster_uuid,
                    namespace: item.namespace,
                    persistentvolumeclaim: item.persistentvolumeclaim,
                    breadcrumbLabel,
                  },
                }}
              >
                {item.persistentvolumeclaim ?? ''}
              </Link>
            ) : (
              item.persistentvolumeclaim ?? ''
            ),
          },
          {
            value: onFilterAdded ? (
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  onFilterAdded({ key: 'project', value: item.namespace ?? '' });
                }}
              >
                {item.namespace ?? ''}
              </a>
            ) : (
              item.namespace ?? ''
            ),
          },
          {
            value: onFilterAdded ? (
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  onFilterAdded({ key: 'cluster', value: clusterLabel });
                }}
              >
                {clusterLabel}
              </a>
            ) : (
              clusterLabel
            ),
          },
          { value: formatStorageBytes(item.capacity_bytes) },
          { value: formatUsageRatio(item.usage_ratio) },
          { value: getClassificationBadge(item.recommendation_type, intl) },
          { value: savings ?? '—' },
          { value: item.last_reported ? getTimeFromNow(item.last_reported) : '—' },
        ],
      });
    });
    setRows(newRows);
  }, [breadcrumbLabel, groupBy, intl, linkPath, linkState, onDrillDownFromGroup, onFilterAdded, report, term]);

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

export { OptimizationsPvcsDataTable };
