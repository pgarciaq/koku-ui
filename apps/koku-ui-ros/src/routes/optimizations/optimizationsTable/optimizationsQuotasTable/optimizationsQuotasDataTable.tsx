import 'routes/components/dataTable/dataTable.scss';

import type { QuotaRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';
import { getTimeFromNow } from 'utils/dates';

import { QuotaRecommendationTypeBadge, QuotaRiskLevelBadge } from '../quotaBadges';
import { formatUtilizationPercent, type QuotaGroupBy } from '../quotaTableUtils';

interface OptimizationsQuotasDataTableOwnProps {
  breadcrumbLabel?: string;
  filterBy?: any;
  groupBy?: QuotaGroupBy;
  isLoading?: boolean;
  linkPath?: string;
  linkState?: any;
  onDrillDownFromGroup?(filter: { key: string; value: string });
  onFilterAdded?(filter: { key: string; value: string });
  onSort(value: string, isSortAscending: boolean);
  orderBy?: any;
  queryStateName?: string;
  report: QuotaRecommendationReport;
}

const OptimizationsQuotasDataTable: React.FC<OptimizationsQuotasDataTableOwnProps> = ({
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
  queryStateName,
  report,
}) => {
  const intl = useIntl();

  const { columns, rows } = useMemo(() => {
    if (!report) {
      return { columns: [], rows: [] };
    }
    const hasData = report?.data && report.data.length > 0;
    const isGrouped = groupBy !== '';

    if (isGrouped) {
      const groupLabel =
        groupBy === 'cluster'
          ? intl.formatMessage(messages.optimizationsNames, { value: 'cluster' })
          : intl.formatMessage(messages.optimizationsNames, { value: 'project' });

      const groupColumns = [
        { name: groupLabel },
        { name: intl.formatMessage(messages.storageRecommendationCount) },
        { name: intl.formatMessage(messages.quotaMaxUtilization) },
      ];

      const groupRows = [];
      report?.data?.forEach(item => {
        const groupValue = groupBy === 'cluster' ? item.cluster_uuid ?? '' : item.namespace ?? '';
        const filterKey = groupBy === 'cluster' ? 'cluster' : 'project';
        const drillDown = onDrillDownFromGroup && groupValue;

        groupRows.push({
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
            { value: formatUtilizationPercent(item.utilization) },
          ],
        });
      });
      return { columns: groupColumns, rows: groupRows };
    }

    const flatColumns = [
      {
        name: intl.formatMessage(messages.quotaName),
        orderBy: 'quota_name',
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
        name: intl.formatMessage(messages.quotaMaxUtilization),
        orderBy: 'utilization',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.filterByValues, { value: 'classification' }),
      },
      {
        name: intl.formatMessage(messages.quotaRiskLevel),
        orderBy: 'risk_level',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'last_reported' }),
      },
    ];

    const flatRows = [];
    report?.data?.forEach(item => {
      const quotaName = item.quota_name?.trim() || undefined;
      const rowLabel = quotaName || item.namespace || '';
      const breakdownParams = new URLSearchParams({
        cluster_uuid: item.cluster_uuid,
        namespace: item.namespace,
      });
      if (quotaName) {
        breakdownParams.set('id', quotaName);
      }
      if (breadcrumbLabel) {
        breakdownParams.set('breadcrumb_label', breadcrumbLabel);
      }
      const breakdownPath =
        linkPath && item.cluster_uuid && item.namespace
          ? `${linkPath}?${breakdownParams.toString()}`
          : undefined;
      const stateKey = queryStateName ?? 'quotaDetailsState';

      flatRows.push({
        cells: [
          {
            value: breakdownPath ? (
              <Link
                to={breakdownPath}
                state={{
                  ...linkState,
                  [stateKey]: {
                    ...(linkState?.[stateKey] || {}),
                    cluster_uuid: item.cluster_uuid,
                    namespace: item.namespace,
                    ...(quotaName && { quota_name: quotaName }),
                    breadcrumbLabel,
                  },
                }}
              >
                {rowLabel}
              </Link>
            ) : (
              rowLabel
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
          { value: item.cluster_uuid ?? '' },
          { value: formatUtilizationPercent(item.utilization) },
          { value: <QuotaRecommendationTypeBadge type={item.recommendation_type} /> },
          { value: <QuotaRiskLevelBadge level={item.risk_level} /> },
          {
            value: item.last_observed_at ? getTimeFromNow(item.last_observed_at) : '—',
          },
        ],
      });
    });
    return { columns: flatColumns, rows: flatRows };
  }, [breadcrumbLabel, groupBy, intl, linkPath, linkState, onDrillDownFromGroup, onFilterAdded, queryStateName, report]);

  if (!isLoading && (!report?.data || report.data.length === 0)) {
    return <NoOptimizationsState />;
  }

  return (
    <DataTable columns={columns} isLoading={isLoading} onSort={onSort} orderBy={orderBy} rows={rows} />
  );
};

export { OptimizationsQuotasDataTable };
