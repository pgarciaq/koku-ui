import { ChartDonutThreshold, ChartDonutUtilization } from '@patternfly/react-charts/victory';
import type { QuotaResourceValues, QuotaUtilizationPercents } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

const DEFAULT_AMBER_PERCENT = 85;

interface ClusterQuotaUtilizationGaugesOwnProps {
  quotaHard?: QuotaResourceValues;
  quotaUsed?: QuotaResourceValues;
  utilization?: QuotaUtilizationPercents;
  headroomBasisPoints?: number;
}

interface GaugeData {
  key: string;
  percent: number;
  usedLabel: string;
  hardLabel: string;
}

const formatMillicores = (millicores: number): string => {
  if (millicores >= 1000) {
    const cores = millicores / 1000;
    const val = Number.isInteger(cores) ? `${cores}` : `${cores.toFixed(1)}`;
    return `${val} cores`;
  }
  return `${Math.round(millicores)}m`;
};

const formatBytes = (bytes: number): string => {
  const GiB = 1024 ** 3;
  const MiB = 1024 ** 2;
  if (bytes >= GiB) {
    const val = bytes / GiB;
    return `${val % 1 === 0 ? val : val.toFixed(1)} GiB`;
  }
  const val = bytes / MiB;
  return `${val % 1 === 0 ? val : val.toFixed(0)} MiB`;
};

const ClusterQuotaUtilizationGauges: React.FC<ClusterQuotaUtilizationGaugesOwnProps> = ({
  quotaHard,
  quotaUsed,
  utilization,
  headroomBasisPoints,
}) => {
  const intl = useIntl();

  const thresholds = useMemo(() => {
    const amberPercent = headroomBasisPoints != null ? headroomBasisPoints / 100 : DEFAULT_AMBER_PERCENT;
    const redPercent = Math.min(amberPercent + 10, 100);
    return [
      { value: amberPercent, color: '#F0AB00' },
      { value: redPercent, color: '#C9190B' },
    ];
  }, [headroomBasisPoints]);

  const gauges: GaugeData[] = useMemo(() => {
    const result: GaugeData[] = [];

    const cpuHard = quotaHard?.cpu_limit_millicores;
    const cpuUsed = quotaUsed?.cpu_limit_millicores;
    if (cpuHard != null && cpuHard > 0) {
      const percent =
        utilization?.cpu_limit_percent != null
          ? Math.round(utilization.cpu_limit_percent)
          : Math.round(((cpuUsed ?? 0) / cpuHard) * 100);
      result.push({
        key: 'cpu',
        percent,
        usedLabel: formatMillicores(cpuUsed ?? 0),
        hardLabel: formatMillicores(cpuHard),
      });
    }

    const memHard = quotaHard?.memory_limit_bytes;
    const memUsed = quotaUsed?.memory_limit_bytes;
    if (memHard != null && memHard > 0) {
      const percent =
        utilization?.memory_limit_percent != null
          ? Math.round(utilization.memory_limit_percent)
          : Math.round(((memUsed ?? 0) / memHard) * 100);
      result.push({
        key: 'memory',
        percent,
        usedLabel: formatBytes(memUsed ?? 0),
        hardLabel: formatBytes(memHard),
      });
    }

    const podsHard = quotaHard?.pods;
    const podsUsed = quotaUsed?.pods;
    if (podsHard != null && podsHard > 0) {
      const percent =
        utilization?.pods_percent != null
          ? Math.round(utilization.pods_percent)
          : Math.round(((podsUsed ?? 0) / podsHard) * 100);
      result.push({
        key: 'pods',
        percent,
        usedLabel: `${podsUsed ?? 0}`,
        hardLabel: `${podsHard}`,
      });
    }

    return result;
  }, [quotaHard, quotaUsed, utilization]);

  if (gauges.length === 0) {
    return null;
  }

  const getResourceTitle = (key: string) => {
    switch (key) {
      case 'cpu':
        return intl.formatMessage(messages.clusterQuotaGaugeCpuTitle);
      case 'memory':
        return intl.formatMessage(messages.clusterQuotaGaugeMemoryTitle);
      case 'pods':
        return intl.formatMessage(messages.clusterQuotaGaugePodsTitle);
      default:
        return key;
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: gauges.length === 1 ? 'center' : 'flex-start' }}>
      {gauges.map(gauge => {
        const displayPercent = gauge.percent;
        const chartPercent = Math.min(displayPercent, 100);
        const title = getResourceTitle(gauge.key);

        return (
          <div key={gauge.key} style={{ textAlign: 'center' }}>
            <div style={{ height: 230, width: 230 }}>
              <ChartDonutThreshold
                ariaDesc={intl.formatMessage(messages.clusterQuotaGaugeAriaDesc, { resource: title })}
                ariaTitle={intl.formatMessage(messages.clusterQuotaGaugeAriaTitle, { resource: title })}
                data={thresholds.map(t => ({ x: `${t.value}%`, y: t.value }))}
                height={230}
                width={230}
              >
                <ChartDonutUtilization
                  data={{ x: `${displayPercent}% ${title}`, y: chartPercent }}
                  labels={({ datum }) => (datum.x ? `${datum.x}` : null)}
                  subTitle={title}
                  title={`${displayPercent}%`}
                  thresholds={thresholds}
                />
              </ChartDonutThreshold>
            </div>
            <div style={{ fontSize: 'var(--pf-t--global--font--size--sm)', marginTop: 8 }}>
              {intl.formatMessage(messages.clusterQuotaGaugeSubtitle, {
                used: gauge.usedLabel,
                hard: gauge.hardLabel,
              })}
            </div>
            {/* Visually-hidden data table for screen readers */}
            <table
              aria-label={intl.formatMessage(messages.clusterQuotaGaugeAriaTitle, { resource: title })}
              style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
            >
              <thead>
                <tr>
                  <th>{title}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{`${displayPercent}%`}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export { ClusterQuotaUtilizationGauges };
