import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { VmVisualInsightsSection } from './vmVisualInsightsSection';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const bhDigest = {
  bucket_date: '2026-06-15',
  cpu_usage_p95_mc: 2500,
  mem_usage_p95_kib: 2097152,
  sample_count: 9,
};

describe('VmVisualInsightsSection', () => {
  it('renders Peak hours usage when sizing and BH digests are present', () => {
    render(
      <VmVisualInsightsSection
        dailyDigestsBusinessHours={[bhDigest]}
        peakHoursMemoryGib={8}
        peakHoursVcpu={4}
        showPeakHoursCharts
      />,
      { wrapper }
    );
    expect(screen.getByTestId('vm-peak-hours-usage')).toBeInTheDocument();
    expect(screen.getByTestId('peak-hours-chart-caption')).toBeInTheDocument();
  });

  it('hides Peak hours usage when nest is reason-only', () => {
    const { container } = render(
      <VmVisualInsightsSection
        dailyDigestsBusinessHours={[bhDigest]}
        showPeakHoursCharts={false}
      />,
      { wrapper }
    );
    expect(container.innerHTML).toBe('');
    expect(screen.queryByTestId('vm-peak-hours-usage')).not.toBeInTheDocument();
  });

  it('does not overlay Peak hours rec on all-hours utilization', () => {
    render(
      <VmVisualInsightsSection
        dailyDigests={[bhDigest]}
        dailyDigestsBusinessHours={[bhDigest]}
        peakHoursVcpu={4}
        recommended={{ vcpu: 2, memory_gib: 4 }}
        current={{ vcpu: 8, memory_gib: 16 }}
        showPeakHoursCharts
      />,
      { wrapper }
    );
    expect(screen.getByTestId('vm-peak-hours-usage')).toBeInTheDocument();
    expect(screen.getByTestId('vm-utilization-trend-cpu')).toBeInTheDocument();
    expect(screen.getByTestId('vm-peak-hours-trend-cpu')).toBeInTheDocument();
    const peakHoursSection = screen.getByTestId('vm-peak-hours-usage');
    expect(peakHoursSection.contains(screen.getByTestId('vm-utilization-trend-cpu'))).toBe(false);
    expect(peakHoursSection.contains(screen.getByTestId('vm-peak-hours-trend-cpu'))).toBe(true);
  });
});
