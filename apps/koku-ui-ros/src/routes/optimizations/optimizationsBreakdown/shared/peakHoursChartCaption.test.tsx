import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { PeakHoursChartCaption } from './peakHoursChartCaption';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('PeakHoursChartCaption', () => {
  test('renders the Visual Insights Peak hours caption by default', () => {
    render(<PeakHoursChartCaption />, { wrapper });
    expect(screen.getByTestId('peak-hours-chart-caption')).toHaveTextContent(
      'This series excludes hours outside the office window, including overnight windows.'
    );
  });

  test('renders the container utilization caption', () => {
    render(<PeakHoursChartCaption variant="container" />, { wrapper });
    expect(screen.getByTestId('peak-hours-chart-caption')).toHaveTextContent(
      'Solid request and limit lines are the 24×7 recommendation'
    );
    expect(screen.getByTestId('peak-hours-chart-caption')).toHaveTextContent(
      'The dashed series is peak-hours usage'
    );
  });
});
