import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { PeakHoursChartCaption } from './peakHoursChartCaption';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('PeakHoursChartCaption', () => {
  test('renders the Peak hours office-window caption', () => {
    render(<PeakHoursChartCaption />, { wrapper });
    expect(screen.getByTestId('peak-hours-chart-caption')).toHaveTextContent(
      'This series excludes hours outside the office window, including overnight windows.'
    );
  });
});
