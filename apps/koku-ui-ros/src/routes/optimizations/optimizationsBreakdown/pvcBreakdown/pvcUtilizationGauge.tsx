import { ChartDonutThreshold, ChartDonutUtilization } from '@patternfly/react-charts/victory';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

const DEFAULT_NEAR_FULL_BP = 8500;

interface PvcUtilizationGaugeOwnProps {
  capacityBytes: number;
  lastDate: string;
  nearFullThresholdBp?: number;
  usageBytesMax: number;
}

const PvcUtilizationGauge: React.FC<PvcUtilizationGaugeOwnProps> = ({
  capacityBytes,
  lastDate,
  nearFullThresholdBp,
  usageBytesMax,
}) => {
  const intl = useIntl();

  const percent = useMemo(() => {
    if (!capacityBytes || capacityBytes <= 0) {
      return 0;
    }
    return Math.round((usageBytesMax / capacityBytes) * 100);
  }, [usageBytesMax, capacityBytes]);

  const thresholds = useMemo(() => {
    const amberPercent = (nearFullThresholdBp ?? DEFAULT_NEAR_FULL_BP) / 100;
    const redPercent = Math.min(amberPercent + 10, 100);
    return [
      { value: amberPercent, color: '#F0AB00' },
      { value: redPercent, color: '#C9190B' },
    ];
  }, [nearFullThresholdBp]);

  const formattedDate = useMemo(() => {
    return intl.formatDate(new Date(lastDate), { year: 'numeric', month: 'short', day: 'numeric' });
  }, [intl, lastDate]);

  return (
    <div>
      <div style={{ height: 230, width: 230 }}>
        <ChartDonutThreshold
          ariaDesc={intl.formatMessage(messages.visualInsightsPvcUtilizationDesc)}
          ariaTitle={intl.formatMessage(messages.visualInsightsPvcUtilizationTitle)}
          data={thresholds.map(t => ({ x: `${t.value}%`, y: t.value }))}
          height={230}
          width={230}
        >
          <ChartDonutUtilization
            data={{ x: intl.formatMessage(messages.visualInsightsPvcUtilizationUsed, { percent }), y: percent }}
            labels={({ datum }) => (datum.x ? `${datum.x}` : null)}
            subTitle={intl.formatMessage(messages.visualInsightsPvcUtilizationUsed, { percent })}
            title={`${percent}%`}
            thresholds={thresholds}
          />
        </ChartDonutThreshold>
      </div>
      <div style={{ fontSize: 'var(--pf-t--global--font--size--sm)', marginTop: 8, textAlign: 'center' }}>
        {intl.formatMessage(messages.visualInsightsPvcUtilizationDataAsOf, { date: formattedDate })}
      </div>
      {/* Visually-hidden data table for screen readers */}
      <table
        aria-label={intl.formatMessage(messages.visualInsightsPvcUtilizationTitle)}
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.visualInsightsPvcUtilizationTitle)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{intl.formatMessage(messages.visualInsightsPvcUtilizationUsed, { percent })}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { PvcUtilizationGauge };
