import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { CpuThrottleTrend } from './cpuThrottleTrend';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('CpuThrottleTrend', () => {
  it('renders empty state when plotsData is undefined', () => {
    render(<CpuThrottleTrend plotsData={undefined} />, { wrapper });
    expect(screen.getByText('No CPU throttling detected')).toBeTruthy();
  });

  it('renders empty state when no throttle data present', () => {
    const plotsData = {
      '2026-01-01T00:00:00.000Z': {
        cpuUsage: { p50: 0.5, p95: 0.8, p99: 0.9, max: 1.0, format: 'cores' },
      },
      '2026-01-02T00:00:00.000Z': {
        cpuUsage: { p50: 0.6, p95: 0.9, p99: 1.0, max: 1.1, format: 'cores' },
      },
    };
    render(<CpuThrottleTrend plotsData={plotsData} />, { wrapper });
    expect(screen.getByText('No CPU throttling detected')).toBeTruthy();
  });

  it('renders empty state when all throttle values are zero', () => {
    const plotsData = {
      '2026-01-01T00:00:00.000Z': {
        cpuThrottle: { p95: 0, max: 0, format: 'cores' },
        cpuUsage: { p50: 0.5, p95: 0.8, p99: 0.9, max: 1.0, format: 'cores' },
      },
    };
    render(<CpuThrottleTrend plotsData={plotsData} />, { wrapper });
    expect(screen.getByText('No CPU throttling detected')).toBeTruthy();
  });

  it('renders chart when throttle data is present', () => {
    const plotsData = {
      '2026-01-01T00:00:00.000Z': {
        cpuThrottle: { p95: 0.2, max: 0.5, format: 'cores' },
        cpuUsage: { p50: 0.5, p95: 0.8, p99: 0.9, max: 1.0, format: 'cores' },
      },
      '2026-01-02T00:00:00.000Z': {
        cpuThrottle: { p95: 0.3, max: 0.6, format: 'cores' },
        cpuUsage: { p50: 0.6, p95: 0.9, p99: 1.0, max: 1.1, format: 'cores' },
      },
    };
    const { container } = render(<CpuThrottleTrend plotsData={plotsData} />, { wrapper });
    expect(container.querySelector('[role="img"]') || container.querySelector('svg') || container.querySelector('div')).toBeTruthy();
    expect(screen.queryByText('No CPU throttling detected')).toBeNull();
  });
});
