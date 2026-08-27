import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

import { NodeVisualInsightsSection } from './nodeVisualInsightsSection';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('NodeVisualInsightsSection', () => {
  it('renders the Visual Insights card with valid data', () => {
    render(<NodeVisualInsightsSection podCapacity={110} podCount={88} lastReported="2026-06-15" />, { wrapper });
    expect(screen.getByText('Visual Insights')).toBeTruthy();
    expect(screen.getByRole('table', { name: /Pod Scheduling Headroom/i })).toBeTruthy();
  });

  it('does not render when podCapacity is 0', () => {
    const { container } = render(<NodeVisualInsightsSection podCapacity={0} podCount={5} />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('does not render when podCapacity is negative', () => {
    const { container } = render(<NodeVisualInsightsSection podCapacity={-1} podCount={5} />, { wrapper });
    expect(container.innerHTML).toBe('');
  });

  it('renders gauge when podCount is 0 (empty node)', () => {
    render(<NodeVisualInsightsSection podCapacity={110} podCount={0} />, { wrapper });
    expect(screen.getByText('Visual Insights')).toBeTruthy();
    const table = screen.getByRole('table', { name: /Pod Scheduling Headroom/i });
    expect(table.textContent).toContain('"percent":0');
  });

  it('renders Peak hours usage when sizing and BH digests are present', () => {
    render(
      <NodeVisualInsightsSection
        dailyDigestsBusinessHours={[
          {
            bucket_date: '2026-06-15',
            cpu_usage_p50_mc: 2000,
            cpu_usage_p95_mc: 4000,
            mem_usage_p50_kib: 1048576,
            mem_usage_p95_kib: 2097152,
            max_cpu_allocatable_mc: 8000,
            max_mem_allocatable_kib: 8388608,
            max_cpu_requests_mc: 0,
            max_mem_requests_kib: 0,
          },
        ]}
        peakHoursCpuCores={4}
        peakHoursMemoryGib={8}
        podCapacity={0}
        podCount={0}
        showPeakHoursCharts
      />,
      { wrapper }
    );
    expect(screen.getByTestId('node-peak-hours-usage')).toBeInTheDocument();
    expect(screen.getByTestId('peak-hours-chart-caption')).toBeInTheDocument();
  });

  it('hides Peak hours usage when nest is reason-only', () => {
    const { container } = render(
      <NodeVisualInsightsSection
        dailyDigestsBusinessHours={[
          {
            bucket_date: '2026-06-15',
            cpu_usage_p50_mc: 2000,
            cpu_usage_p95_mc: 4000,
            mem_usage_p50_kib: 1048576,
            mem_usage_p95_kib: 2097152,
            max_cpu_allocatable_mc: 8000,
            max_mem_allocatable_kib: 8388608,
            max_cpu_requests_mc: 0,
            max_mem_requests_kib: 0,
          },
        ]}
        podCapacity={0}
        podCount={0}
        showPeakHoursCharts={false}
      />,
      { wrapper }
    );
    expect(container.innerHTML).toBe('');
  });
});
