import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

const captionStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--pf-t--global--text--color--subtle)',
  marginBottom: 8,
};

const PeakHoursChartCaption: React.FC = () => {
  const intl = useIntl();
  return (
    <div data-testid="peak-hours-chart-caption" style={captionStyle}>
      {intl.formatMessage(messages.visualInsightsPeakHoursChartCaption)}
    </div>
  );
};

export { PeakHoursChartCaption };
