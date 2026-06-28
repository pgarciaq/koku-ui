import 'routes/components/dataTable/dataTable.scss';

import { Label } from '@patternfly/react-core';
import type { GPUMIGRecommendationData, GPUMIGRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';

interface OptimizationsGpuMigDataTableOwnProps {
  breakdownPath?: string;
  filterBy?: any;
  isLoading?: boolean;
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
  isLoading,
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

      const containerCell = breakdownPath ? (
        <Link
          to={breakdownPath}
          state={{
            ...(location?.state || {}),
            gpuMigDetailsState: {
              cluster_uuid: item.cluster_uuid,
              namespace: item.namespace,
              workload: item.workload,
              container: item.container,
              gpu_model: item.gpu_model,
              breadcrumbPath: `${location.pathname}${location.search}`,
            },
          }}
        >
          {containerName}
        </Link>
      ) : (
        containerName
      );

      newRows.push({
        cells: [
          { value: item.cluster_uuid ?? '' },
          { value: item.namespace ?? '—' },
          { value: item.workload ?? '—' },
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
  }, [report]);

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
