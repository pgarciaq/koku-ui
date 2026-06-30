import { ChartDonutThreshold, ChartDonutUtilization } from '@patternfly/react-charts/victory';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

interface GpuVramUtilizationGaugeOwnProps {
  fbUsageMaxMib: number;
  totalFbMib: number | undefined | null;
}

const GpuVramUtilizationGauge: React.FC<GpuVramUtilizationGaugeOwnProps> = ({ fbUsageMaxMib, totalFbMib }) => {
  const intl = useIntl();

  if (!totalFbMib || totalFbMib <= 0) {
    return null;
  }

  const percent = useMemo(() => {
    return Math.round((fbUsageMaxMib / totalFbMib) * 100);
  }, [fbUsageMaxMib, totalFbMib]);

  const thresholds = useMemo(
    () => [
      { value: 85, color: '#F0AB00' },
      { value: 95, color: '#C9190B' },
    ],
    []
  );

  const formatMib = (mib: number) => intl.formatNumber(mib, { maximumFractionDigits: 0 });

  return (
    <div>
      <div style={{ height: 230, width: 230 }}>
        <ChartDonutThreshold
          ariaDesc={intl.formatMessage(messages.visualInsightsVramUtilizationDesc)}
          ariaTitle={intl.formatMessage(messages.visualInsightsVramUtilizationTitle)}
          data={thresholds.map(t => ({ x: `${t.value}%`, y: t.value }))}
          height={230}
          width={230}
        >
          <ChartDonutUtilization
            data={{
              x: intl.formatMessage(messages.visualInsightsVramUtilizationUsed, { percent }),
              y: Math.min(percent, 100),
            }}
            labels={({ datum }) => (datum.x ? `${datum.x}` : null)}
            subTitle={intl.formatMessage(messages.visualInsightsVramUtilizationSubtitle, {
              usage: formatMib(fbUsageMaxMib),
              capacity: formatMib(totalFbMib),
            })}
            title={`${percent}%`}
            thresholds={thresholds}
          />
        </ChartDonutThreshold>
      </div>
      {/* Visually-hidden data table for screen readers */}
      <table
        aria-label={intl.formatMessage(messages.visualInsightsVramUtilizationTitle)}
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.visualInsightsVramUtilizationTitle)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{intl.formatMessage(messages.visualInsightsVramUtilizationUsed, { percent })}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { GpuVramUtilizationGauge };
