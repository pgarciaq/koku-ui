import 'routes/components/dataTable/dataTable.scss';

import { Label } from '@patternfly/react-core';
import type { GPUMIGRecommendationData, GPUMIGRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';

interface OptimizationsGpuMigDataTableOwnProps {
  filterBy?: any;
  isLoading?: boolean;
  onFilterAdded?(filter: { key: string; value: string });
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

const OptimizationsGpuMigDataTable: React.FC<OptimizationsGpuMigDataTableProps> = ({
  filterBy,
  isLoading,
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
      { name: intl.formatMessage(messages.gpuMigColumnCurrentProfile) },
      { name: intl.formatMessage(messages.gpuMigColumnRecommendedProfile) },
      { name: intl.formatMessage(messages.gpuMigColumnClassification) },
      { name: intl.formatMessage(messages.gpuMigColumnConfidence) },
    ];

    const newRows = [];
    report?.data?.map(item => {
      const clusterLabel = item.cluster_uuid ?? '';

      newRows.push({
        cells: [
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
          { value: item.namespace ?? '—' },
          { value: item.workload ?? '—' },
          { value: item.container ?? '—' },
          { value: item.gpu_model ?? '—' },
          { value: item.current_gpu_profile ?? '—' },
          { value: item.recommended_gpu_profile ?? '—' },
          { value: getClassificationBadge(item.classification) },
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
