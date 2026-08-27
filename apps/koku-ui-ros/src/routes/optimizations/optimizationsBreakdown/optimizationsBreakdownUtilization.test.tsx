import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Interval, OptimizationType } from 'utils/commonTypes';

import { OptimizationsBreakdownUtilization } from './optimizationsBreakdownUtilization';

jest.mock('./optimizationsBreakdownChart', () => ({
  OptimizationsBreakdownChart: () => <div data-testid="utilization-chart" />,
}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('OptimizationsBreakdownUtilization', () => {
  it('renders the Peak hours caption explaining 24×7 thresholds vs dashed usage', () => {
    render(
      <OptimizationsBreakdownUtilization
        currentInterval={Interval.short_term}
        optimizationType={OptimizationType.cost}
        recommendations={{}}
      />,
      { wrapper }
    );
    expect(screen.getByTestId('peak-hours-chart-caption')).toHaveTextContent(
      'Solid request and limit lines are the 24×7 recommendation'
    );
  });
});
