import 'routes/components/dataTable/dataTable.scss';

import { Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import type { RecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { styles } from 'routes/components/dataTable/dataTable.styles';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { getOptimizationsBreakdownPath } from 'routes/utils/paths';
import { getTimeFromNow } from 'utils/dates';
import { hasNotificationsWarning } from 'utils/notifications';

import { getRequestProps } from '../utils';
import { OptimizationStateCell } from '../optimizationStateCell';
import { RecommendationTagsLink } from '../recommendationTagsLink';

interface OptimizationsNamespacesDataTableOwnProps {
  breadcrumbLabel?: string;
  engine?: string;
  filterBy?: any;
  isClusterHidden?: boolean;
  isLoading?: boolean;
  linkPath?: string;
  linkState?: any;
  onFilterAdded?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: RecommendationReport;
  reportQueryString: string;
  term?: string;
}

type OptimizationsNamespacesDataTableProps = OptimizationsNamespacesDataTableOwnProps;

const OptimizationsNamespacesDataTable: React.FC<OptimizationsNamespacesDataTableProps> = ({
  breadcrumbLabel,
  engine,
  filterBy,
  isClusterHidden,
  isLoading,
  linkPath,
  linkState,
  onFilterAdded,
  onSort,
  orderBy,
  report,
  term,
}) => {
  const intl = useIntl();

  const [columns, setColumns] = useState([]);
  const [nestedColumns, setNestedColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const initDatum = () => {
    if (!report) {
      return;
    }
    const hasData = report?.data && report.data.length > 0;

    const newNestedColumns = [
      {
        colSpan: 2 + (isClusterHidden ? 0 : 1),
        hasRightBorder: true,
      },
      {
        colSpan: 2,
        hasRightBorder: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'memory' }),
      },
      {
        colSpan: 2,
        hasRightBorder: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cpu' }),
      },
      {
        isSubheader: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'state' }),
        rowSpan: 2,
      },
      {
        isSubheader: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'potential_savings' }),
        orderBy: 'estimated_monthly_savings',
        rowSpan: 2,
        ...(hasData && { isSortable: true }),
      },
      {
        isSubheader: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'last_reported' }),
        orderBy: 'last_reported',
        rowSpan: 2,
        style: styles.lastItemColumn,
        ...(hasData && { isSortable: true }),
      },
    ];

    const newRows = [];
    const newColumns = [
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'namespace' }),
        orderBy: 'project',
        ...(hasData && { isSortable: true }),
      },
      {
        isSubheader: true,
        hasRightBorder: true,
        hidden: isClusterHidden,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
        orderBy: 'cluster',
        ...(hasData && { isSortable: true }),
      },
      {
        isSubheader: true,
        hasRightBorder: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'tags' }),
      },
      {
        isSubheader: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'current' }),
        orderBy: 'memory_current_request',
        ...(hasData && { isSortable: true }),
      },
      {
        isSubheader: true,
        hasRightBorder: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'change' }),
        orderBy: 'memory_variation',
        ...(hasData && { isSortable: true }),
      },
      {
        isSubheader: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'current' }),
        orderBy: 'cpu_current_request',
        ...(hasData && { isSortable: true }),
      },
      {
        isSubheader: true,
        hasRightBorder: true,
        name: intl.formatMessage(messages.optimizationsNames, { value: 'change' }),
        orderBy: 'cpu_variation',
        ...(hasData && { isSortable: true }),
      },
    ];

    report?.data?.map(item => {
      const cluster = item.cluster_alias ?? item.cluster_uuid ?? '';
      const namespace = item.project ?? '';
      const lastReported = getTimeFromNow(item.last_reported);
      const showWarningIcon = hasNotificationsWarning(item?.recommendations, true);

      const optimizationsBreakdownPath = getOptimizationsBreakdownPath({
        basePath: linkPath,
        breadcrumbLabel,
        id: item.id,
        title: namespace,
      });

      const requestProps = getRequestProps(item, term, engine);
      const savings = item.recommendations?.estimated_monthly_savings;
      const waste = item.estimated_monthly_waste;
      const category = (item as any).category;
      const idleDays = item.idle_duration_days;

      const isIdleOrZombie = category === 'idle' || category === 'zombie';
      const potentialSavingsSource = isIdleOrZombie ? waste : savings;
      const potentialSavingsCell = (() => {
        if (potentialSavingsSource?.value != null) {
          return `$${Number(potentialSavingsSource.value).toFixed(2)} ${potentialSavingsSource.units ?? 'USD'}`;
        }
        return (
          <Tooltip content={intl.formatMessage(messages.savingsNoDataTooltip)}>
            <span>—</span>
          </Tooltip>
        );
      })();

      const analyticsIncomplete = item.analytics_incomplete;
      const ingestHooksFailed = item.ingest_hooks_failed;

      newRows.push({
        cells: [
          {
            value: (
              <Link to={optimizationsBreakdownPath} state={linkState}>
                {namespace}
              </Link>
            ),
          },
          {
            value: (
              <>
                {onFilterAdded ? (
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      onFilterAdded({ key: 'cluster', value: cluster });
                    }}
                  >
                    {cluster}
                  </a>
                ) : (
                  cluster
                )}
                {showWarningIcon && (
                  <span style={styles.warningIcon}>
                    <Icon status="warning">
                      <ExclamationTriangleIcon />
                    </Icon>
                  </span>
                )}
              </>
            ),
            hidden: isClusterHidden,
          },
          {
            value: <RecommendationTagsLink tags={item.tags} />,
          },
          { value: requestProps?.memoryRequestCurrent },
          { value: requestProps?.memoryVariation },
          { value: requestProps?.cpuRequestCurrent },
          { value: requestProps?.cpuVariation },
          {
            value: (
              <OptimizationStateCell
                analyticsIncomplete={analyticsIncomplete}
                category={category}
                idleDays={idleDays}
                ingestHooksFailed={ingestHooksFailed}
              />
            ),
          },
          {
            value: potentialSavingsCell,
          },
          { value: lastReported, style: styles.lastItem },
        ],
        optimization: {
          id: item.id,
          project: namespace,
        },
      });
    });

    const filteredColumns = (newColumns as any[]).filter(column => !column.hidden);
    const filteredNestedColumns = (newNestedColumns as any[]).filter(column => !column.hidden);
    const filteredRows = newRows.map(({ ...row }) => {
      row.cells = row.cells.filter(cell => !cell.hidden);
      return row;
    });

    setColumns(filteredColumns);
    setNestedColumns(filteredNestedColumns);
    setRows(filteredRows);
  };

  const handleOnSort = (value: string, isSortAscending: boolean) => {
    if (onSort) {
      onSort(value, isSortAscending);
    }
  };

  useEffect(() => {
    initDatum();
  }, [engine, linkState, report, term]);

  return (
    <DataTable
      columns={columns}
      emptyState={<NoOptimizationsState />}
      filterBy={filterBy}
      isLoading={isLoading}
      nestedColumns={nestedColumns}
      onSort={handleOnSort}
      orderBy={orderBy}
      rows={rows}
    />
  );
};

export { OptimizationsNamespacesDataTable };
