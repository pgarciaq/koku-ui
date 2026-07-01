import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { ThProps } from '@patternfly/react-table';
import type { HistoryRow } from 'api/ros/recommendationHistory';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

interface HistoryExplorerTableProps {
  data: HistoryRow[];
  isLoading?: boolean;
  orderBy?: string;
  orderHow?: string;
  onSort: (field: string) => void;
  showAdvancedColumns?: boolean;
}

const HistoryExplorerTable: React.FC<HistoryExplorerTableProps> = ({
  data,
  isLoading = false,
  orderBy,
  orderHow,
  onSort,
  showAdvancedColumns = false,
}) => {
  const intl = useIntl();

  const getSortParams = (field: string): ThProps['sort'] => {
    const isActive = orderBy === field;
    return {
      sortBy: {
        index: isActive ? 0 : undefined,
        direction: isActive ? (orderHow?.toLowerCase() === 'asc' ? 'asc' : 'desc') : undefined,
      },
      onSort: () => onSort(field),
      columnIndex: 0,
    };
  };

  const formatMillicores = (value: number | null): string => {
    if (value == null) {
      return '—';
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} cores`;
    }
    return `${value}m`;
  };

  const formatKib = (value: number | null): string => {
    if (value == null) {
      return '—';
    }
    if (value >= 1048576) {
      return `${(value / 1048576).toFixed(2)} GiB`;
    }
    if (value >= 1024) {
      return `${(value / 1024).toFixed(1)} MiB`;
    }
    return `${value} KiB`;
  };

  const formatSavings = (savings: HistoryRow['estimated_monthly_savings']): string => {
    if (!savings || savings.value == null) {
      return '—';
    }
    const val = savings.value;
    return `$${val.toFixed(2)}`;
  };

  const formatConfidence = (value: number | null): string => {
    if (value == null) {
      return '—';
    }
    return `${(value * 100).toFixed(0)}%`;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTerm = (term: string): string => {
    switch (term) {
      case 'short_term':
        return intl.formatMessage(messages.historyTermShort);
      case 'medium_term':
        return intl.formatMessage(messages.historyTermMedium);
      case 'long_term':
        return intl.formatMessage(messages.historyTermLong);
      default:
        return term;
    }
  };

  const formatEngine = (engine: string): string => {
    switch (engine) {
      case 'cost':
        return intl.formatMessage(messages.historyEngineCost);
      case 'performance':
        return intl.formatMessage(messages.historyEnginePerformance);
      default:
        return engine;
    }
  };

  return (
    <Table aria-label={intl.formatMessage(messages.historyTableAriaLabel)} variant="compact">
      <Thead>
        <Tr>
          <Th sort={getSortParams('recorded_at')}>{intl.formatMessage(messages.historyColDate)}</Th>
          <Th sort={getSortParams('cluster')}>{intl.formatMessage(messages.historyColCluster)}</Th>
          <Th sort={getSortParams('project')}>{intl.formatMessage(messages.historyColProject)}</Th>
          <Th sort={getSortParams('workload')}>{intl.formatMessage(messages.historyColWorkload)}</Th>
          <Th sort={getSortParams('container')}>{intl.formatMessage(messages.historyColContainer)}</Th>
          <Th sort={getSortParams('term')}>{intl.formatMessage(messages.historyColTerm)}</Th>
          <Th sort={getSortParams('engine')}>{intl.formatMessage(messages.historyColEngine)}</Th>
          <Th>{intl.formatMessage(messages.historyColCpuRequest)}</Th>
          <Th>{intl.formatMessage(messages.historyColCpuLimit)}</Th>
          <Th>{intl.formatMessage(messages.historyColMemRequest)}</Th>
          <Th>{intl.formatMessage(messages.historyColMemLimit)}</Th>
          <Th>{intl.formatMessage(messages.historyColConfidence)}</Th>
          <Th>{intl.formatMessage(messages.historyColSavings)}</Th>
          {showAdvancedColumns && (
            <>
              <Th>{intl.formatMessage(messages.historyColDataDays)}</Th>
              <Th>{intl.formatMessage(messages.historyColDecayHalfLife)}</Th>
              <Th>{intl.formatMessage(messages.historyColCpuP95)}</Th>
              <Th>{intl.formatMessage(messages.historyColMemP95)}</Th>
              <Th>{intl.formatMessage(messages.historyColOomCount)}</Th>
              <Th>{intl.formatMessage(messages.historyColIsIdle)}</Th>
            </>
          )}
        </Tr>
      </Thead>
      <Tbody>
        {!isLoading && data.length === 0 && (
          <Tr>
            <Td colSpan={showAdvancedColumns ? 19 : 13}>
              {intl.formatMessage(messages.historyNoData)}
            </Td>
          </Tr>
        )}
        {data.map((row, idx) => (
          <Tr key={`${row.recorded_at}-${row.cluster_uuid}-${row.container_name}-${row.term}-${row.engine}-${idx}`}>
            <Td>{formatDate(row.recorded_at)}</Td>
            <Td>{row.cluster_alias || row.cluster_uuid}</Td>
            <Td>{row.namespace}</Td>
            <Td>{row.workload}</Td>
            <Td>{row.container_name}</Td>
            <Td>{formatTerm(row.term)}</Td>
            <Td>{formatEngine(row.engine)}</Td>
            <Td>{formatMillicores(row.rec_cpu_request_millicores)}</Td>
            <Td>{formatMillicores(row.rec_cpu_limit_millicores)}</Td>
            <Td>{formatKib(row.rec_memory_request_kib)}</Td>
            <Td>{formatKib(row.rec_memory_limit_kib)}</Td>
            <Td>{formatConfidence(row.confidence_level)}</Td>
            <Td>{formatSavings(row.estimated_monthly_savings)}</Td>
            {showAdvancedColumns && (
              <>
                <Td>{row.expl_data_days ?? '—'}</Td>
                <Td>{row.expl_decay_half_life_hours != null ? `${row.expl_decay_half_life_hours.toFixed(1)}h` : '—'}</Td>
                <Td>{formatMillicores(row.expl_cpu_usage_p95_mc ?? null)}</Td>
                <Td>{formatKib(row.expl_mem_usage_p95_kib ?? null)}</Td>
                <Td>{row.expl_oom_count_sum ?? '—'}</Td>
                <Td>{row.expl_is_idle != null ? (row.expl_is_idle ? 'Yes' : 'No') : '—'}</Td>
              </>
            )}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export { HistoryExplorerTable };
