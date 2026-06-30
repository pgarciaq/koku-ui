import { render, screen } from '@testing-library/react';
import type { VmDailyDigestItem } from 'api/ros/recommendations';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { VmUtilizationTrendChart } from './vmUtilizationTrendChart';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const makeDailyDigests = (count: number): VmDailyDigestItem[] =>
  Array.from({ length: count }, (_, i) => ({
    bucket_date: `2026-06-${String(i + 1).padStart(2, '0')}`,
    cpu_usage_p95_mc: 2000 + i * 100,
    mem_usage_p95_kib: 4194304 + i * 1024,
    sample_count: 24,
  }));

describe('VmUtilizationTrendChart', () => {
  it('renders nothing when dailyDigests is empty', () => {
    const { container } = render(
      <VmUtilizationTrendChart dailyDigests={[]} metricKey="cpu" recommendedValue={4000} />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-utilization-trend-cpu"]')).toBeNull();
  });

  it('renders CPU chart with multiple data points', () => {
    const digests = makeDailyDigests(5);
    const { container } = render(
      <VmUtilizationTrendChart dailyDigests={digests} metricKey="cpu" recommendedValue={4000} />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-utilization-trend-cpu"]')).toBeTruthy();
  });

  it('renders memory chart with multiple data points', () => {
    const digests = makeDailyDigests(5);
    const { container } = render(
      <VmUtilizationTrendChart dailyDigests={digests} metricKey="memory" recommendedValue={4294967296} />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-utilization-trend-memory"]')).toBeTruthy();
  });

  it('renders chart without reference line when recommendedValue is null', () => {
    const digests = makeDailyDigests(3);
    const { container } = render(
      <VmUtilizationTrendChart dailyDigests={digests} metricKey="cpu" recommendedValue={null} />,
      { wrapper }
    );
    const chart = container.querySelector('[data-testid="vm-utilization-trend-cpu"]');
    expect(chart).toBeTruthy();
    const accessibleTable = chart.querySelector('table');
    const headerCells = accessibleTable.querySelectorAll('th');
    expect(headerCells).toHaveLength(2);
  });

  it('includes reference line column in accessible table when recommendedValue is set', () => {
    const digests = makeDailyDigests(3);
    const { container } = render(
      <VmUtilizationTrendChart dailyDigests={digests} metricKey="cpu" recommendedValue={4000} />,
      { wrapper }
    );
    const chart = container.querySelector('[data-testid="vm-utilization-trend-cpu"]');
    const accessibleTable = chart.querySelector('table');
    const headerCells = accessibleTable.querySelectorAll('th');
    expect(headerCells).toHaveLength(3);
  });

  it('renders chart with a single data point', () => {
    const digests = makeDailyDigests(1);
    const { container } = render(
      <VmUtilizationTrendChart dailyDigests={digests} metricKey="cpu" recommendedValue={4000} />,
      { wrapper }
    );
    expect(container.querySelector('[data-testid="vm-utilization-trend-cpu"]')).toBeTruthy();
  });

  it('displays correct number of rows in accessible table', () => {
    const digests = makeDailyDigests(7);
    const { container } = render(
      <VmUtilizationTrendChart dailyDigests={digests} metricKey="memory" recommendedValue={null} />,
      { wrapper }
    );
    const rows = container.querySelectorAll('[data-testid="vm-utilization-trend-memory"] table tbody tr');
    expect(rows).toHaveLength(7);
  });
});
