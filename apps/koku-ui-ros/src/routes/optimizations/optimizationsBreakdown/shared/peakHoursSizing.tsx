import { Alert, Card, CardBody, CardTitle, Title, TitleSizes, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

interface PeakHoursSizingCardProps {
  children: React.ReactNode;
  warning?: string;
}

const cellStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid var(--pf-t--global--border--color--default)',
};

const headerStyle: React.CSSProperties = {
  ...cellStyle,
  borderBottom: '2px solid var(--pf-t--global--border--color--default)',
};

/**
 * Peak hours sizing for node / timeslicing / VM detail.
 * Do not reuse container YAML request/limit Peak hours (`getConfiguration`) here.
 */
const PeakHoursSizingCard: React.FC<PeakHoursSizingCardProps> = ({ children, warning }) => {
  const intl = useIntl();

  return (
    <Card isCompact data-testid="peak-hours-sizing-card">
      <CardTitle>
        <Title headingLevel="h2" size={TitleSizes.lg}>
          {intl.formatMessage(messages.peakHoursSizing)}{' '}
          <Tooltip content={intl.formatMessage(messages.peakHoursSizingTooltip)}>
            <OutlinedQuestionCircleIcon />
          </Tooltip>
        </Title>
      </CardTitle>
      <CardBody>
        {warning ? (
          <Alert isInline variant="warning" title={warning} style={{ marginBottom: 12 }} />
        ) : null}
        {children}
      </CardBody>
    </Card>
  );
};

interface PeakHoursMetricRow {
  metric: string;
  value: string;
}

const PeakHoursMetricTable: React.FC<{ rows: PeakHoursMetricRow[] }> = ({ rows }) => {
  const intl = useIntl();

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...headerStyle, textAlign: 'left' }}>{intl.formatMessage(messages.metric)}</th>
          <th style={{ ...headerStyle, textAlign: 'right' }}>{intl.formatMessage(messages.recommended)}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.metric}>
            <td style={cellStyle}>{row.metric}</td>
            <td style={{ ...cellStyle, textAlign: 'right' }}>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export { PeakHoursMetricTable, PeakHoursSizingCard };
