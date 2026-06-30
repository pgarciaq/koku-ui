import { render, screen } from '@testing-library/react';
import type { NodeDailyDigestItem } from 'api/ros/recommendations';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { NodeUtilizationTrend } from './nodeUtilizationTrend';

const mockDigests: NodeDailyDigestItem[] = [
  {
    bucket_date: '2026-06-15',
    cpu_usage_p50_mc: 3200,
    cpu_usage_p95_mc: 5600,
    mem_usage_p50_kib: 4194304,
    mem_usage_p95_kib: 6291456,
    max_cpu_allocatable_mc: 8000,
    max_mem_allocatable_kib: 16777216,
  },
  {
    bucket_date: '2026-06-16',
    cpu_usage_p50_mc: 2800,
    cpu_usage_p95_mc: 4900,
    mem_usage_p50_kib: 3932160,
    mem_usage_p95_kib: 5898240,
    max_cpu_allocatable_mc: 8000,
    max_mem_allocatable_kib: 16777216,
  },
];

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

describe('NodeUtilizationTrend', () => {
  it('renders CPU chart with data-testid', () => {
    render(
      <Wrapper>
        <NodeUtilizationTrend dailyDigests={mockDigests} metricKey="cpu" />
      </Wrapper>
    );
    expect(screen.getByTestId('node-utilization-trend-cpu')).toBeInTheDocument();
  });

  it('renders memory chart with data-testid', () => {
    render(
      <Wrapper>
        <NodeUtilizationTrend dailyDigests={mockDigests} metricKey="memory" />
      </Wrapper>
    );
    expect(screen.getByTestId('node-utilization-trend-memory')).toBeInTheDocument();
  });

  it('renders nothing when dailyDigests is empty', () => {
    const { container } = render(
      <Wrapper>
        <NodeUtilizationTrend dailyDigests={[]} metricKey="cpu" />
      </Wrapper>
    );
    expect(container.firstChild).toBeNull();
  });

  it('includes a screen-reader table with correct row count', () => {
    render(
      <Wrapper>
        <NodeUtilizationTrend dailyDigests={mockDigests} metricKey="cpu" targetUtilizationBP={7000} />
      </Wrapper>
    );
    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
  });
});
