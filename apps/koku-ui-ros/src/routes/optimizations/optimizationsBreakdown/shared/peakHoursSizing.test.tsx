import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { PeakHoursMetricTable, PeakHoursSizingCard } from './peakHoursSizing';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('PeakHoursSizingCard', () => {
  test('renders title, children, and nest warning text', () => {
    render(
      <PeakHoursSizingCard warning="Business-hours node sizing is not peak-safe">
        <span>4.00 cores</span>
      </PeakHoursSizingCard>,
      { wrapper }
    );

    expect(screen.getByTestId('peak-hours-sizing-card')).toBeInTheDocument();
    expect(screen.getByText('Peak hours sizing')).toBeInTheDocument();
    expect(screen.getByText('4.00 cores')).toBeInTheDocument();
    expect(screen.getByText('Business-hours node sizing is not peak-safe')).toBeInTheDocument();
  });

  test('omits warning alert when message is absent', () => {
    render(
      <PeakHoursSizingCard>
        <span>body</span>
      </PeakHoursSizingCard>,
      { wrapper }
    );

    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('PeakHoursMetricTable', () => {
  test('renders metric rows', () => {
    render(<PeakHoursMetricTable rows={[{ metric: 'CPU Cores', value: '4.00 cores' }]} />, { wrapper });
    expect(screen.getByText('CPU Cores')).toBeInTheDocument();
    expect(screen.getByText('4.00 cores')).toBeInTheDocument();
  });
});
