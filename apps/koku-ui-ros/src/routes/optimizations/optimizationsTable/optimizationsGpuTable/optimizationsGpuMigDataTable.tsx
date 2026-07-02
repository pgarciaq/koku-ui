import 'routes/components/dataTable/dataTable.scss';

import { Label } from '@patternfly/react-core';
import type { GPUMIGRecommendationData, GPUMIGRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';

import { CrossTabLink, SameTabFilterLink } from '../crossTabLink';
import { type StorageGroupBy } from '../storageTableUtils';

interface OptimizationsGpuMigDataTableOwnProps {
  breakdownPath?: string;
  filterBy?: any;
  groupBy?: StorageGroupBy;
  isLoading?: boolean;
  onDrillDownFromGroup?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: GPUMIGRecommendationReport;
  reportQueryString: string;
}

type OptimizationsGpuMigDataTableProps = OptimizationsGpuMigDataTableOwnProps;

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

const confidenceColorMap: Record<string, 'green' | 'yellow' | 'orange'> = {
  high: 'green',
  medium: 'yellow',
  low: 'orange',
};

const getConfidenceLabel = (item: GPUMIGRecommendationData) => {
  const level = item.confidence_level;
  if (level == null) {
    return '—';
  }
  const label = String(level);
  return (
    <Label color={confidenceColorMap[label] ?? 'grey'} isCompact>
      {label}
    </Label>
  );
};

const formatTerm = (term: string) => {
  if (!term) {
    return '—';
  }
  return term.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const OptimizationsGpuMigDataTable: React.FC<OptimizationsGpuMigDataTableProps> = ({
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
      const groupLabel =
        groupBy === 'cluster'
          ? intl.formatMessage(messages.gpuMigColumnCluster)
          : intl.formatMessage(messages.gpuMigColumnNamespace);

      setColumns([
        { name: groupLabel },
        { name: intl.formatMessage(messages.storageRecommendationCount) },
      ]);

      const newRows = [];
      report?.data?.forEach(item => {
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
          ],
        });
      });
      setRows(newRows);
      return;
    }

    const newColumns = [
      {
        name: intl.formatMessage(messages.gpuMigColumnCluster),
        orderBy: 'cluster_uuid',
        ...(hasData && { isSortable: true }),
      },
      { name: intl.formatMessage(messages.gpuMigColumnNamespace) },
      { name: intl.formatMessage(messages.gpuMigColumnWorkload) },
      { name: intl.formatMessage(messages.gpuMigColumnContainer) },
      { name: intl.formatMessage(messages.gpuMigColumnGpuModel) },
      { name: intl.formatMessage(messages.gpuMigColumnTerm) },
      { name: intl.formatMessage(messages.gpuMigColumnCurrentProfile) },
      { name: intl.formatMessage(messages.gpuMigColumnRecommendedProfile) },
      { name: intl.formatMessage(messages.gpuMigColumnClassification) },
      { name: intl.formatMessage(messages.gpuMigColumnConfidence) },
    ];

    const newRows = [];
    report?.data?.map(item => {
      const containerName = item.container ?? '—';
      const detailState = {
        ...(location?.state || {}),
        gpuMigDetailsState: {
          cluster_uuid: item.cluster_uuid,
          namespace: item.namespace,
          workload: item.workload,
          container: item.container,
          gpu_model: item.gpu_model,
          breadcrumbPath: `${location.pathname}${location.search}`,
        },
      };

      const containerCell = item.container ? (
        <CrossTabLink target={{ tab: 'container', filterKey: 'container', filterValue: item.container }}>
          {containerName}
        </CrossTabLink>
      ) : (
        containerName
      );

      const clusterCell = item.cluster_uuid ? (
        <SameTabFilterLink filterKey="cluster" filterValue={item.cluster_uuid} prefix="gpu_mig_">
          {item.cluster_uuid}
        </SameTabFilterLink>
      ) : (
        ''
      );

      const namespaceCell = item.namespace ? (
        <CrossTabLink target={{ tab: 'namespace', filterKey: 'project', filterValue: item.namespace }}>
          {item.namespace}
        </CrossTabLink>
      ) : (
        '—'
      );

      const workloadCell =
        breakdownPath && item.workload ? (
          <Link to={breakdownPath} state={detailState}>
            {item.workload}
          </Link>
        ) : (
          item.workload ?? '—'
        );

      newRows.push({
        cells: [
          { value: clusterCell },
          { value: namespaceCell },
          { value: workloadCell },
          { value: containerCell },
          { value: item.gpu_model ?? '—' },
          { value: formatTerm(item.term) },
          { value: item.current_gpu_profile ?? '—' },
          { value: item.recommended_gpu_profile ?? '—' },
          { value: getClassificationBadge(item.gpu_classification) },
          { value: getConfidenceLabel(item) },
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

export { OptimizationsGpuMigDataTable };
