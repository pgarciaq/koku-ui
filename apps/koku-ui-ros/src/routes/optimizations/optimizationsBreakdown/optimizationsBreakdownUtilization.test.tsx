import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Interval, OptimizationType } from 'utils/commonTypes';

import { OptimizationsBreakdownUtilization } from './optimizationsBreakdownUtilization';

jest.mock('./optimizationsBreakdownChart', () => ({
  OptimizationsBreakdownChart: ({ name, requestData, limitData }) => (
    <div
      data-testid={name}
      data-request-amount={String(requestData?.[1]?.y ?? '')}
      data-limit-amount={String(limitData?.[1]?.y ?? '')}
    />
  ),
}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const amount = (n: number, format = 'cores') => ({ amount: n, format });

const plotsBucket = {
  cpuUsage: { p50: 0.2, p95: 0.4, p99: 0.5, max: 0.6, format: 'cores' },
  memoryUsage: { p50: 1, p95: 2, p99: 2, max: 3, format: 'GiB' },
};

const recommendationsWithPeakHours = {
  monitoring_end_time: '2026-08-01T00:00:00Z',
  recommendation_terms: {
    short_term: {
      plots: { plots_data: { '2026-08-01T00:00:00Z': plotsBucket } },
      business_hours_plots: { plots_data: { '2026-08-01T09:00:00Z': plotsBucket } },
      recommendation_engines: {
        cost: {
          config: {
            requests: { cpu: amount(1), memory: amount(4, 'GiB') },
            limits: { cpu: amount(2), memory: amount(8, 'GiB') },
          },
          variation: {
            requests: { cpu: {}, memory: {} },
            limits: { cpu: {}, memory: {} },
          },
          business_hours: {
            requests: { cpu: amount(3), memory: amount(6, 'GiB') },
            limits: { cpu: amount(4), memory: amount(12, 'GiB') },
          },
        },
      },
    },
  },
};

const renderUtilization = (recommendations: Record<string, unknown> = recommendationsWithPeakHours) =>
  render(
    <OptimizationsBreakdownUtilization
      currentInterval={Interval.short_term}
      optimizationType={OptimizationType.cost}
      recommendations={recommendations as any}
    />,
    { wrapper }
  );

describe('OptimizationsBreakdownUtilization', () => {
  it('keeps 24×7 request/limit on the all-hours charts', () => {
    renderUtilization();
    const cpu = screen.getByTestId('utilization-cpuUsage');
    expect(cpu).toHaveAttribute('data-request-amount', '1');
    expect(cpu).toHaveAttribute('data-limit-amount', '2');
  });

  it('renders Peak hours charts with BH request/limit when sizing and plots are present', () => {
    renderUtilization();
    expect(screen.getByTestId('utilization-peak-hours')).toBeInTheDocument();
    expect(screen.getByTestId('peak-hours-chart-caption')).toHaveTextContent(
      'This series excludes hours outside the office window'
    );
    const cpu = screen.getByTestId('utilization-peak-hours-cpuUsage');
    expect(cpu).toHaveAttribute('data-request-amount', '3');
    expect(cpu).toHaveAttribute('data-limit-amount', '4');
    const memory = screen.getByTestId('utilization-peak-hours-memoryUsage');
    expect(memory).toHaveAttribute('data-request-amount', '6');
    expect(memory).toHaveAttribute('data-limit-amount', '12');
  });

  it('hides Peak hours charts when the nest is reason-only', () => {
    renderUtilization({
      ...recommendationsWithPeakHours,
      recommendation_terms: {
        short_term: {
          ...recommendationsWithPeakHours.recommendation_terms.short_term,
          recommendation_engines: {
            cost: {
              ...recommendationsWithPeakHours.recommendation_terms.short_term.recommendation_engines.cost,
              business_hours: { reason: 'Insufficient business-hours data for this term' },
            },
          },
        },
      },
    });
    expect(screen.queryByTestId('utilization-peak-hours')).not.toBeInTheDocument();
    expect(screen.getByTestId('utilization-cpuUsage')).toBeInTheDocument();
  });

  it('hides Peak hours charts when BH plots are empty', () => {
    renderUtilization({
      ...recommendationsWithPeakHours,
      recommendation_terms: {
        short_term: {
          ...recommendationsWithPeakHours.recommendation_terms.short_term,
          business_hours_plots: undefined,
        },
      },
    });
    expect(screen.queryByTestId('utilization-peak-hours')).not.toBeInTheDocument();
  });

  it('hides Peak hours charts when BH plots_data is an empty object', () => {
    renderUtilization({
      ...recommendationsWithPeakHours,
      recommendation_terms: {
        short_term: {
          ...recommendationsWithPeakHours.recommendation_terms.short_term,
          business_hours_plots: { plots_data: {} },
        },
      },
    });
    expect(screen.queryByTestId('utilization-peak-hours')).not.toBeInTheDocument();
  });
});
