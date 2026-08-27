import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { GpuVisualInsightsSection } from './gpuVisualInsightsSection';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const allHours = {
  dramActiveAvg: 0.31,
  fbUsageMaxMib: 61440,
  smActiveAvg: 0.72,
  tensorPipeActiveAvg: 0.45,
  totalFbMib: 81920,
};

describe('GpuVisualInsightsSection', () => {
  it('renders all-hours Visual Insights when metrics are present', () => {
    render(<GpuVisualInsightsSection {...allHours} />, { wrapper });
    expect(screen.getByText('Visual Insights')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /GPU Subsystem Utilization/i })).toBeInTheDocument();
    expect(screen.queryByTestId('gpu-peak-hours-visual-insights')).not.toBeInTheDocument();
  });

  it('renders Peak hours radar when showPeakHoursCharts and nest metrics are set', () => {
    render(
      <GpuVisualInsightsSection
        {...allHours}
        peakHours={{
          dramActiveAvg: 0.4,
          fbUsageMaxMib: 20480,
          smActiveAvg: 0.9,
          tensorPipeActiveAvg: 0.2,
          totalFbMib: 81920,
        }}
        showPeakHoursCharts
      />,
      { wrapper }
    );
    expect(screen.getByTestId('gpu-peak-hours-visual-insights')).toBeInTheDocument();
    expect(screen.getByText('Peak hours GPU utilization')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /Peak hours GPU subsystem utilization/i })).toBeInTheDocument();
    expect(screen.getByTestId('peak-hours-chart-caption')).toBeInTheDocument();
  });

  it('hides Peak hours charts when showPeakHoursCharts is false', () => {
    render(
      <GpuVisualInsightsSection
        {...allHours}
        peakHours={{ smActiveAvg: 0.9, totalFbMib: 81920, fbUsageMaxMib: 1000 }}
        showPeakHoursCharts={false}
      />,
      { wrapper }
    );
    expect(screen.queryByTestId('gpu-peak-hours-visual-insights')).not.toBeInTheDocument();
  });

  it('hides Peak hours charts when nest metrics are empty (reason-only)', () => {
    render(
      <GpuVisualInsightsSection {...allHours} peakHours={{}} showPeakHoursCharts />,
      { wrapper }
    );
    expect(screen.queryByTestId('gpu-peak-hours-visual-insights')).not.toBeInTheDocument();
  });

  it('renders Peak hours only when all-hours metrics are absent', () => {
    render(
      <GpuVisualInsightsSection
        peakHours={{
          smActiveAvg: 0.5,
          fbUsageMaxMib: 4096,
          totalFbMib: 16384,
        }}
        showPeakHoursCharts
      />,
      { wrapper }
    );
    expect(screen.queryByText('Visual Insights')).not.toBeInTheDocument();
    expect(screen.getByTestId('gpu-peak-hours-visual-insights')).toBeInTheDocument();
  });

  it('renders nothing when both perspectives are empty', () => {
    const { container } = render(<GpuVisualInsightsSection />, { wrapper });
    expect(container.innerHTML).toBe('');
  });
});
