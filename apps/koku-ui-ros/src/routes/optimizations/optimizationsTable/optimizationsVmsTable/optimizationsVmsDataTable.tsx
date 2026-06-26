import 'routes/components/dataTable/dataTable.scss';

import { Label, Tooltip } from '@patternfly/react-core';
import type { VmRecommendationData, VmRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { getOptimizationsBreakdownPath } from 'routes/utils/paths';
import { getTimeFromNow } from 'utils/dates';

interface OptimizationsVmsDataTableOwnProps {
  breadcrumbLabel?: string;
  engine?: string;
  filterBy?: any;
  isLoading?: boolean;
  linkPath?: string;
  linkState?: any;
  onFilterAdded?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  report: VmRecommendationReport;
  reportQueryString: string;
  term?: string;
}

type OptimizationsVmsDataTableProps = OptimizationsVmsDataTableOwnProps;

const getStatusBadges = (item: VmRecommendationData, intl: any) => {
  const badges: React.ReactNode[] = [];
  const meta = item.metadata;
  if (!meta) {
    return null;
  }

  if (meta.is_abandoned) {
    badges.push(
      <Label key="abandoned" color="red" isCompact>
        {intl.formatMessage(messages.vmStatusAbandoned)}
      </Label>
    );
  }

  if (meta.is_idle) {
    badges.push(
      <Label key="idle" color="orange" isCompact style={badges.length > 0 ? { marginLeft: 4 } : undefined}>
        {intl.formatMessage(messages.vmStatusIdle)}
      </Label>
    );
  }

  if (meta.is_power_off_candidate) {
    badges.push(
      <Label key="poweroff" color="orange" isCompact style={badges.length > 0 ? { marginLeft: 4 } : undefined}>
        {intl.formatMessage(messages.vmStatusPowerOff)}
      </Label>
    );
  }

  if (meta.is_oversized) {
    badges.push(
      <Label key="oversized" color="blue" isCompact style={badges.length > 0 ? { marginLeft: 4 } : undefined}>
        {intl.formatMessage(messages.vmStatusOversized)}
      </Label>
    );
  }

  if (badges.length === 0) {
    badges.push(
      <Label key="ok" color="green" isCompact>
        {intl.formatMessage(messages.vmStatusOk)}
      </Label>
    );
  }

  return <>{badges}</>;
};

const getSavingsCell = (item: VmRecommendationData, intl: any) => {
  const savings = item.savings;
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
  isLoading,
  linkPath,
  linkState,
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
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_name' }),
        orderBy: 'vm_name',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'namespace' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_current_vcpu' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_current_memory' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_recommended_vcpu' }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'vm_recommended_memory' }),
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
      },
    ];

    const newRows = [];
    report?.data?.map(item => {
      const clusterLabel = item.cluster_uuid ?? '';
      const lastReported = item.last_recommended_at ? getTimeFromNow(item.last_recommended_at) : '—';

      newRows.push({
        cells: [
          {
            value: linkPath ? (
              <Link
                to={getOptimizationsBreakdownPath({
                  basePath: linkPath,
                  breadcrumbLabel,
                  id: item.vm_name,
                  title: item.vm_name,
                })}
                state={linkState}
              >
                {item.vm_name ?? ''}
              </Link>
            ) : (
              item.vm_name ?? ''
            ),
          },
          {
            value: onFilterAdded ? (
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  onFilterAdded({ key: 'namespace', value: item.namespace ?? '' });
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
          { value: item.current?.vcpu ?? '—' },
          { value: item.current?.memory_gib != null ? `${item.current.memory_gib} GiB` : '—' },
          { value: item.recommended?.vcpu ?? '—' },
          { value: item.recommended?.memory_gib != null ? `${item.recommended.memory_gib} GiB` : '—' },
          { value: getStatusBadges(item, intl) },
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
  }, [linkState, report]);

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
