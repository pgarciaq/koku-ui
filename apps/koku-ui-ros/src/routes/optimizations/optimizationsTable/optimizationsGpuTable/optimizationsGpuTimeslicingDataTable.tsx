import 'routes/components/dataTable/dataTable.scss';

import { Label, Tooltip } from '@patternfly/react-core';
import type { GPUTimeslicingRecommendationData, GPUTimeslicingRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';

import { CrossTabLink, SameTabFilterLink } from '../crossTabLink';
import { formatMoneyCell, type StorageGroupBy } from '../storageTableUtils';

interface OptimizationsGpuTimeslicingDataTableOwnProps {
  breakdownPath?: string;
  filterBy?: any;
  groupBy?: StorageGroupBy;
  isLoading?: boolean;
  onDrillDownFromGroup?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: GPUTimeslicingRecommendationReport;
  reportQueryString: string;
}

type OptimizationsGpuTimeslicingDataTableProps = OptimizationsGpuTimeslicingDataTableOwnProps;

const classificationColorMap: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'grey'> = {
  rightsized: 'green',
  oversized: 'orange',
  undersized: 'blue',
  idle: 'red',
};

const getClassificationBadge = (classification: string) => {
  if (!classification) {
    return '—';
  }
  return (
    <Label color={classificationColorMap[classification] ?? 'grey'} isCompact>
      {classification}
    </Label>
  );
};

const getSavingsCell = (item: GPUTimeslicingRecommendationData, intl: ReturnType<typeof useIntl>) => {
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

const OptimizationsGpuTimeslicingDataTable: React.FC<OptimizationsGpuTimeslicingDataTableProps> = ({
  breakdownPath,
  filterBy,
  groupBy = '',
  isLoading,
  onDrillDownFromGroup,
  onSort,
  orderBy,
  report,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const initDatum = () => {
    if (!report) {
      return;
    }
    const hasData = report?.data && report.data.length > 0;
    const isGrouped = groupBy !== '';

    if (isGrouped) {
      const groupLabel = intl.formatMessage(messages.gpuTimeslicingColumnCluster);

      setColumns([
        { name: groupLabel },
        { name: intl.formatMessage(messages.storageRecommendationCount) },
        { name: intl.formatMessage(messages.gpuTimeslicingColumnSavings) },
      ]);

      const newRows = [];
      report?.data?.forEach(item => {
        const savings = formatMoneyCell(item.estimated_monthly_savings);
        const groupValue = item.cluster_uuid ?? '';
        const drillDown = onDrillDownFromGroup && groupValue;

        newRows.push({
          cells: [
            {
              value: drillDown ? (
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onDrillDownFromGroup({ key: 'cluster', value: groupValue });
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
        name: intl.formatMessage(messages.gpuTimeslicingColumnCluster),
        orderBy: 'cluster_uuid',
        ...(hasData && { isSortable: true }),
      },
      { name: intl.formatMessage(messages.gpuTimeslicingColumnNode) },
      { name: intl.formatMessage(messages.gpuTimeslicingColumnGpuModel) },
      { name: intl.formatMessage(messages.gpuTimeslicingColumnRecommendedReplicas) },
      {
        name: intl.formatMessage(messages.gpuTimeslicingColumnSavings),
        orderBy: 'estimated_monthly_savings',
        ...(hasData && { isSortable: true }),
      },
      { name: intl.formatMessage(messages.gpuTimeslicingColumnClassification) },
    ];

    const newRows = [];
    report?.data?.map(item => {
      const nodeName = item.node_name ?? '—';
      const detailState = {
        ...(location?.state || {}),
        gpuTimeslicingDetailsState: {
          cluster_uuid: item.cluster_uuid,
          node_name: item.node_name,
          breadcrumbPath: `${location.pathname}${location.search}`,
        },
      };

      const nodeCell = item.node_name ? (
        <CrossTabLink target={{ tab: 'node', filterKey: 'node', filterValue: item.node_name }}>
          {nodeName}
        </CrossTabLink>
      ) : (
        nodeName
      );

      const clusterCell = item.cluster_uuid ? (
        <SameTabFilterLink filterKey="cluster" filterValue={item.cluster_uuid} prefix="gpu_ts_">
          {item.cluster_uuid}
        </SameTabFilterLink>
      ) : (
        ''
      );

      newRows.push({
        cells: [
          { value: clusterCell },
          { value: nodeCell },
          { value: item.gpu_model ?? '—' },
          { value: item.recommended_replicas != null ? item.recommended_replicas : '—' },
          { value: getSavingsCell(item, intl) },
          { value: getClassificationBadge(item.classification) },
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
  }, [groupBy, onDrillDownFromGroup, report]);

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

export { OptimizationsGpuTimeslicingDataTable };
