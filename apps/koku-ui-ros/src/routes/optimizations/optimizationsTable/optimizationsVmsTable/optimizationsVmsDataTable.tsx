import 'routes/components/dataTable/dataTable.scss';

import { Label, Tooltip } from '@patternfly/react-core';
import type { VmRecommendationData, VmRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { getTimeFromNow } from 'utils/dates';

import { CrossTabLink } from '../crossTabLink';
import { formatMoneyCell, type StorageGroupBy } from '../storageTableUtils';

interface OptimizationsVmsDataTableOwnProps {
  breadcrumbLabel?: string;
  engine?: string;
  filterBy?: any;
  groupBy?: StorageGroupBy;
  isLoading?: boolean;
  linkPath?: string;
  linkState?: any;
  onDrillDownFromGroup?(filter: { key: string; value: string });
  onFilterAdded?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: VmRecommendationReport;
  reportQueryString: string;
  term?: string;
}

type OptimizationsVmsDataTableProps = OptimizationsVmsDataTableOwnProps;

const vmCategoryBadgeMap: Record<string, { messageKey: keyof typeof messages; color: string }> = {
  abandoned: { messageKey: 'vmStatusAbandoned', color: 'red' },
  power_off_candidate: { messageKey: 'vmStatusPowerOff', color: 'orange' },
  idle: { messageKey: 'vmStatusIdle', color: 'orange' },
  oversized: { messageKey: 'vmStatusOversized', color: 'blue' },
  undersized: { messageKey: 'vmStatusUndersized', color: 'purple' },
  optimized: { messageKey: 'vmStatusOptimized', color: 'green' },
};

const getStatusBadge = (item: VmRecommendationData, intl: any) => {
  const category = item.category;
  if (!category) {
    return (
      <Label color="green" isCompact>
        {intl.formatMessage(messages.vmStatusOptimized)}
      </Label>
    );
  }

  const badge = vmCategoryBadgeMap[category];
  if (!badge) {
    return (
      <Label color="green" isCompact>
        {intl.formatMessage(messages.vmStatusOptimized)}
      </Label>
    );
  }

  return (
    <Label color={badge.color as any} isCompact>
      {intl.formatMessage(messages[badge.messageKey])}
    </Label>
  );
};

const getSavingsCell = (item: VmRecommendationData, intl: any) => {
  const savings = item.estimated_monthly_savings;
  if (savings?.value != null) {
    return `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`;
  }
  return (
    <Tooltip content={intl.formatMessage(messages.savingsNoDataTooltip)}>
      <span>—</span>
    </Tooltip>
  );
};

const OptimizationsVmsDataTable: React.FC<OptimizationsVmsDataTableProps> = ({
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
}) => {
  const intl = useIntl();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const initDatum = () => {
    if (!report) {
      return;
    }
    const hasData = report?.data && report.data.length > 0;
    const isGrouped = groupBy !== '';

    if (isGrouped) {
      const groupLabel =
        groupBy === 'cluster'
          ? intl.formatMessage(messages.optimizationsNames, { value: 'cluster' })
          : intl.formatMessage(messages.optimizationsNames, { value: 'namespace' });

      setColumns([
        { name: groupLabel },
        { name: intl.formatMessage(messages.storageRecommendationCount) },
        {
          name: intl.formatMessage(messages.optimizationsNames, { value: 'potential_savings' }),
        },
      ]);

      const newRows = [];
      report?.data?.forEach(item => {
        const savings = formatMoneyCell(item.estimated_monthly_savings);
        const groupValue = groupBy === 'cluster' ? item.cluster_uuid ?? '' : item.namespace ?? '';
        const filterKey = groupBy === 'cluster' ? 'cluster' : 'namespace';
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
            { value: savings ?? '—' },
          ],
        });
      });
      setRows(newRows);
      return;
    }

    const newColumns = [
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_name' }),
        orderBy: 'vm_name',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'namespace' }),
        orderBy: 'namespace',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
        orderBy: 'cluster_uuid',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_current_vcpu' }),
        orderBy: 'current_vcpu',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_current_memory' }),
        orderBy: 'current_memory_gib',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_recommended_vcpu' }),
        orderBy: 'recommended_vcpu',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_recommended_memory' }),
        orderBy: 'recommended_memory_gib',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_status' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'potential_savings' }),
        orderBy: 'estimated_monthly_savings',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'last_reported' }),
        orderBy: 'last_recommended_at',
        ...(hasData && { isSortable: true }),
      },
    ];

    const newRows = [];
    report?.data?.map(item => {
      const clusterLabel = item.cluster_uuid ?? '';
      const lastReported = item.last_recommended_at ? getTimeFromNow(item.last_recommended_at) : '—';
      const breakdownPath =
        linkPath && item.cluster_uuid && item.namespace && item.vm_name
          ? `${linkPath}?id=${encodeURIComponent(item.vm_name)}&cluster_uuid=${encodeURIComponent(item.cluster_uuid)}&namespace=${encodeURIComponent(item.namespace)}${breadcrumbLabel ? `&breadcrumb_label=${encodeURIComponent(breadcrumbLabel)}` : ''}`
          : undefined;

      newRows.push({
        cells: [
          {
            value: breakdownPath ? (
              <Link
                to={breakdownPath}
                state={{
                  ...linkState,
                  vmDetailsState: {
                    ...(linkState?.vmDetailsState || {}),
                    cluster_uuid: item.cluster_uuid,
                    namespace: item.namespace,
                    vm_name: item.vm_name,
                    breadcrumbLabel,
                  },
                }}
              >
                {item.vm_name ?? ''}
              </Link>
            ) : (
              item.vm_name ?? ''
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
          { value: item.current?.vcpu ?? '—' },
          { value: item.current?.memory_gib != null ? `${item.current.memory_gib} GiB` : '—' },
          { value: item.recommended?.vcpu ?? '—' },
          { value: item.recommended?.memory_gib != null ? `${item.recommended.memory_gib} GiB` : '—' },
          { value: getStatusBadge(item, intl) },
          { value: getSavingsCell(item, intl) },
          { value: lastReported },
        ],
      });
    });

    setColumns(newColumns);
    setRows(newRows);
  };

  const handleOnSort = (value: string, isSortAscending: boolean) => {
    if (onSort) {
      onSort(value, isSortAscending);
    }
  };

  useEffect(() => {
    initDatum();
  }, [groupBy, linkState, onDrillDownFromGroup, report]);

  return (
    <DataTable
      columns={columns}
      emptyState={<NoOptimizationsState />}
      filterBy={filterBy}
      isLoading={isLoading}
      onSort={handleOnSort}
      orderBy={orderBy}
      rows={rows}
    />
  );
};

export { OptimizationsVmsDataTable };
