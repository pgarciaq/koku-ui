import 'routes/components/dataTable/dataTable.scss';

import type { ClusterQuotaRecommendationReport } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { DataTable } from 'routes/components/dataTable';
import { NoOptimizationsState } from 'routes/components/page/noOptimizations/noOptimizationsState';

import { QuotaRecommendationTypeBadge, QuotaRiskLevelBadge } from '../quotaBadges';
import { formatUtilizationPercent, type QuotaGroupBy } from '../quotaTableUtils';

interface OptimizationsClusterQuotasDataTableOwnProps {
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
  report: ClusterQuotaRecommendationReport;
}

const OptimizationsClusterQuotasDataTable: React.FC<OptimizationsClusterQuotasDataTableOwnProps> = ({
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
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!report) {
      return;
    }
    const hasData = report?.data && report.data.length > 0;
    const isGrouped = groupBy === 'cluster';

    if (isGrouped) {
      setColumns([
        { name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }) },
        { name: intl.formatMessage(messages.storageRecommendationCount) },
        { name: intl.formatMessage(messages.quotaMaxUtilization) },
      ]);

      const newRows = [];
      report?.data?.forEach(item => {
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
            { value: formatUtilizationPercent(item.utilization) },
          ],
        });
      });
      setRows(newRows);
      return;
    }

    setColumns([
      {
        name: intl.formatMessage(messages.clusterQuotaName),
        orderBy: 'cluster_quota_name',
        ...(hasData && { isSortable: true }),
      },
      {
        name: intl.formatMessage(messages.optimizationsNames, { value: 'cluster' }),
      },
      {
        name: intl.formatMessage(messages.quotaNamespaces),
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
    ]);

    const newRows = [];
    report?.data?.forEach(item => {
      const namespaceSummary =
        item.namespaces && item.namespaces.length > 0
          ? item.namespaces.length <= 3
            ? item.namespaces.join(', ')
            : intl.formatMessage(messages.quotaNamespaceCount, { count: item.namespaces.length })
          : '—';
      const crqName = item.cluster_quota_name ?? '';
      const breakdownParams = new URLSearchParams({
        id: crqName,
        cluster_uuid: item.cluster_uuid,
      });
      if (breadcrumbLabel) {
        breakdownParams.set('breadcrumb_label', breadcrumbLabel);
      }
      const breakdownPath =
        linkPath && item.cluster_uuid && crqName ? `${linkPath}?${breakdownParams.toString()}` : undefined;
      const stateKey = queryStateName ?? 'clusterQuotaDetailsState';

      newRows.push({
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
                    cluster_quota_name: crqName,
                    breadcrumbLabel,
                  },
                }}
              >
                {crqName}
              </Link>
            ) : (
              crqName
            ),
          },
          {
            value: onFilterAdded ? (
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  onFilterAdded({ key: 'cluster', value: item.cluster_uuid ?? '' });
                }}
              >
                {item.cluster_uuid ?? ''}
              </a>
            ) : (
              item.cluster_uuid ?? ''
            ),
          },
          { value: namespaceSummary },
          { value: formatUtilizationPercent(item.utilization) },
          { value: <QuotaRecommendationTypeBadge type={item.recommendation_type} /> },
          { value: <QuotaRiskLevelBadge level={item.risk_level} /> },
        ],
      });
    });
    setRows(newRows);
  }, [breadcrumbLabel, groupBy, intl, linkPath, linkState, onDrillDownFromGroup, onFilterAdded, queryStateName, report]);

  if (!isLoading && (!report?.data || report.data.length === 0)) {
    return <NoOptimizationsState />;
  }

  return (
    <DataTable columns={columns} isLoading={isLoading} onSort={onSort} orderBy={orderBy} rows={rows} />
  );
};

export { OptimizationsClusterQuotasDataTable };
