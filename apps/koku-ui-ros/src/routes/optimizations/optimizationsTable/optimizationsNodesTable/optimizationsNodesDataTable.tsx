import 'routes/components/dataTable/dataTable.scss';

import { Label, Tooltip } from '@patternfly/react-core';
import type { NodeRecommendationData, NodeRecommendationReport } from 'api/ros/recommendations';
import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { getOptimizationsBreakdownPath } from 'routes/utils/paths';
import { getTimeFromNow } from 'utils/dates';

import {
  formatUtilPercentRange,
  getNodeEngineRec,
  getNodeFleetReduction,
  getNodeLastReported,
} from '../nodeTableUtils';
import { formatMoneyCell, type StorageGroupBy } from '../storageTableUtils';

interface OptimizationsNodesDataTableOwnProps {
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
  report: NodeRecommendationReport;
  reportQueryString: string;
  term?: string;
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
    const resource = c.stranded_resource.charAt(0).toUpperCase() + c.stranded_resource.slice(1);
    badges.push(
      <Label key="stranded" color="blue" isCompact style={badges.length > 0 ? { marginLeft: 4 } : undefined}>
        {intl.formatMessage(messages.nodeClassificationStrandedResource, { resource })}
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

const getSavingsCell = (item: NodeRecommendationData, intl: any, term: string, engine: string) => {
  const savings = getNodeEngineRec(item, term, engine)?.estimated_monthly_savings;

  if (savings?.value != null) {
    return `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`;
  }
  return (
    <Tooltip content={intl.formatMessage(messages.savingsNoDataTooltip)}>
      <span>—</span>
    </Tooltip>
  );
};

const getFleetReductionCell = (item: NodeRecommendationData, term: string, engine: string) => {
  const reduction = getNodeFleetReduction(item, term, engine);
  return reduction != null ? reduction : '—';
};

const OptimizationsNodesDataTable: React.FC<OptimizationsNodesDataTableProps> = ({
  breadcrumbLabel,
  engine = ROS_LIST_ENGINE,
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
  term = ROS_LIST_TERM,
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
      const groupLabel = intl.formatMessage(messages.optimizationsNames, { value: 'cluster' });

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
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node' }),
        orderBy: 'node',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
        orderBy: 'cluster_uuid',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_cpu_util' }),
        orderBy: 'cpu_util_p95',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_mem_util' }),
        orderBy: 'mem_util_p95',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_classification' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'node_fleet_reduction' }),
        orderBy: 'fleet_reduction',
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
    ];

    const newRows = [];
    report?.data?.map(item => {
      const clusterLabel = item.cluster_uuid ?? '';
      const lastReportedRaw = getNodeLastReported(item, term, engine);
      const lastReported = lastReportedRaw ? getTimeFromNow(lastReportedRaw) : '—';

      newRows.push({
        cells: [
          {
            value: linkPath ? (
              <Link
                to={getOptimizationsBreakdownPath({
                  basePath: linkPath,
                  breadcrumbLabel,
                  id: item.node,
                  title: item.node,
                })}
                state={linkState}
              >
                {item.node ?? ''}
              </Link>
            ) : (
              item.node ?? ''
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
          {
            value: formatUtilPercentRange(item.metrics?.cpu_util_p50, item.metrics?.cpu_util_p95),
          },
          {
            value: formatUtilPercentRange(item.metrics?.mem_util_p50, item.metrics?.mem_util_p95),
          },
          { value: getClassificationBadges(item, intl) },
          { value: getFleetReductionCell(item, term, engine) },
          { value: getSavingsCell(item, intl, term, engine) },
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
  }, [engine, groupBy, linkState, onDrillDownFromGroup, report, term]);

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
