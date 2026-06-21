import 'routes/components/dataTable/dataTable.scss';

import { Label, Tooltip } from '@patternfly/react-core';
import type { NodeRecommendationData, NodeRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { formatPercentage } from 'utils/format';

interface OptimizationsNodesDataTableOwnProps {
  filterBy?: any;
  isLoading?: boolean;
  onFilterAdded?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: NodeRecommendationReport;
  reportQueryString: string;
}

type OptimizationsNodesDataTableProps = OptimizationsNodesDataTableOwnProps;

const getClassificationBadges = (item: NodeRecommendationData, intl: any) => {
  const badges: React.ReactNode[] = [];
  const c = item.classification;
  if (!c) {
    return null;
  }

  if (c.idle_state === 'idle' || c.idle_state === 'zombie') {
    badges.push(
      <Label key="idle" color={c.idle_state === 'zombie' ? 'red' : 'orange'} isCompact>
        {intl.formatMessage(messages.idleStateBadge, {
          state: c.idle_state === 'zombie' ? 'Zombie' : 'Idle',
          days: 0,
        })}
      </Label>
    );
  }

  if (c.is_underutilized) {
    badges.push(
      <Label key="underutil" color="blue" isCompact style={badges.length > 0 ? { marginLeft: 4 } : undefined}>
        {intl.formatMessage(messages.nodeClassificationUnderutilized)}
      </Label>
    );
  }

  if (c.is_overcommitted) {
    badges.push(
      <Label key="overcommit" color="orange" isCompact style={badges.length > 0 ? { marginLeft: 4 } : undefined}>
        {intl.formatMessage(messages.nodeClassificationOvercommitted)}
      </Label>
    );
  }

  if (c.stranded_resource) {
    badges.push(
      <Label key="stranded" color="blue" isCompact style={badges.length > 0 ? { marginLeft: 4 } : undefined}>
        {intl.formatMessage(messages.nodeClassificationStrandedResource, {
          resource: c.stranded_resource.toUpperCase(),
        })}
      </Label>
    );
  }

  if (badges.length === 0) {
    badges.push(
      <Label key="well" color="green" isCompact>
        {intl.formatMessage(messages.nodeClassificationWellUtilized)}
      </Label>
    );
  }

  return <>{badges}</>;
};

const getSavingsCell = (item: NodeRecommendationData, intl: any) => {
  const terms = item.recommendation_terms;
  const costEngine = terms?.medium_term?.recommendation_engines?.cost ?? terms?.short_term?.recommendation_engines?.cost;
  const savings = costEngine?.estimated_monthly_savings;

  if (savings?.value != null) {
    return `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`;
  }
  return (
    <Tooltip content={intl.formatMessage(messages.savingsNoDataTooltip)}>
      <span>—</span>
    </Tooltip>
  );
};

const OptimizationsNodesDataTable: React.FC<OptimizationsNodesDataTableProps> = ({
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
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node' }),
        orderBy: 'node',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
        orderBy: 'cluster',
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'instance_type' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_classification' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_cpu_util' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_mem_util' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_pod_count' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'potential_savings' }),
        orderBy: 'estimated_monthly_savings',
        ...(hasData && { isSortable: true }),
      },
    ];

    const newRows = [];
    report?.data?.map(item => {
      const clusterLabel = item.cluster_uuid ?? '';

      newRows.push({
        cells: [
          { value: item.node ?? '' },
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
          { value: item.instance_type ?? '—' },
          { value: getClassificationBadges(item, intl) },
          {
            value:
              item.metrics?.cpu_util_p95 != null ? formatPercentage(item.metrics.cpu_util_p95 * 100) + '%' : '—',
          },
          {
            value:
              item.metrics?.mem_util_p95 != null ? formatPercentage(item.metrics.mem_util_p95 * 100) + '%' : '—',
          },
          { value: item.pod_count ?? '—' },
          { value: getSavingsCell(item, intl) },
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

export { OptimizationsNodesDataTable };
