import { ChartDonutThreshold, ChartDonutUtilization } from '@patternfly/react-charts/victory';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

interface NodePodHeadroomGaugeOwnProps {
  lastReported?: string;
  podCapacity: number;
  podCount: number;
}

const NodePodHeadroomGauge: React.FC<NodePodHeadroomGaugeOwnProps> = ({ lastReported, podCapacity, podCount }) => {
  const intl = useIntl();

  const percent = useMemo(() => {
    if (!podCapacity || podCapacity <= 0) {
      return 0;
    }
    return Math.round((podCount / podCapacity) * 100);
  }, [podCount, podCapacity]);

  const thresholds = useMemo(
    () => [
      { value: 80, color: '#F0AB00' },
      { value: 90, color: '#C9190B' },
    ],
    []
  );

  const formattedDate = useMemo(() => {
    if (!lastReported) {
      return undefined;
    }
    return intl.formatDate(new Date(lastReported), { year: 'numeric', month: 'short', day: 'numeric' });
  }, [intl, lastReported]);

  return (
    <div>
      <div style={{ height: 230, width: 230 }}>
        <ChartDonutThreshold
          ariaDesc={intl.formatMessage(messages.visualInsightsNodePodHeadroomDesc)}
          ariaTitle={intl.formatMessage(messages.visualInsightsNodePodHeadroomTitle)}
          data={thresholds.map(t => ({ x: `${t.value}%`, y: t.value }))}
          height={230}
          width={230}
        >
          <ChartDonutUtilization
            data={{
              x: intl.formatMessage(messages.visualInsightsNodePodHeadroomScheduled, { percent }),
              y: Math.min(percent, 100),
            }}
            labels={({ datum }) => (datum.x ? `${datum.x}` : null)}
            subTitle={intl.formatMessage(messages.visualInsightsNodePodHeadroomScheduled, { percent })}
            title={`${percent}%`}
            thresholds={thresholds}
          />
        </ChartDonutThreshold>
      </div>
      {formattedDate && (
        <div style={{ fontSize: 'var(--pf-t--global--font--size--sm)', marginTop: 8, textAlign: 'center' }}>
          {intl.formatMessage(messages.visualInsightsNodePodHeadroomDataAsOf, { date: formattedDate })}
        </div>
      )}
      {/* Visually-hidden data table for screen readers */}
      <table
        aria-label={intl.formatMessage(messages.visualInsightsNodePodHeadroomTitle)}
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.visualInsightsNodePodHeadroomTitle)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{intl.formatMessage(messages.visualInsightsNodePodHeadroomScheduled, { percent })}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { NodePodHeadroomGauge };
