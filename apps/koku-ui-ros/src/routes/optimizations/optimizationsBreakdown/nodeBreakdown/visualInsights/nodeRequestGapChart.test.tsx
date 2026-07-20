import { render, screen } from '@testing-library/react';
import type { NodeDailyDigestItem } from 'api/ros/recommendations';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { NodeRequestGapChart } from './nodeRequestGapChart';

const mockDigests: NodeDailyDigestItem[] = [
  {
    bucket_date: '2026-06-15',
    cpu_usage_p50_mc: 3200,
    cpu_usage_p95_mc: 5600,
    mem_usage_p50_kib: 4194304,
    mem_usage_p95_kib: 6291456,
    max_cpu_allocatable_mc: 8000,
    max_mem_allocatable_kib: 16777216,
    max_cpu_requests_mc: 7200,
    max_mem_requests_kib: 12582912,
  },
  {
    bucket_date: '2026-06-16',
    cpu_usage_p50_mc: 2800,
    cpu_usage_p95_mc: 4900,
    mem_usage_p50_kib: 3932160,
    mem_usage_p95_kib: 5898240,
    max_cpu_allocatable_mc: 8000,
    max_mem_allocatable_kib: 16777216,
    max_cpu_requests_mc: 6800,
    max_mem_requests_kib: 11534336,
  },
];

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

describe('NodeRequestGapChart', () => {
  it('renders CPU chart with data-testid', () => {
    render(
      <Wrapper>
        <NodeRequestGapChart dailyDigests={mockDigests} metricKey="cpu" />
      </Wrapper>
    );
    expect(screen.getByTestId('node-request-gap-chart-cpu')).toBeInTheDocument();
  });

  it('renders memory chart with data-testid', () => {
    render(
      <Wrapper>
        <NodeRequestGapChart dailyDigests={mockDigests} metricKey="memory" />
      </Wrapper>
    );
    expect(screen.getByTestId('node-request-gap-chart-memory')).toBeInTheDocument();
  });

  it('renders nothing when dailyDigests is empty', () => {
    const { container } = render(
      <Wrapper>
        <NodeRequestGapChart dailyDigests={[]} metricKey="cpu" />
      </Wrapper>
    );
    expect(container.firstChild).toBeNull();
  });

  it('includes a screen-reader table with correct row count', () => {
    render(
      <Wrapper>
        <NodeRequestGapChart dailyDigests={mockDigests} metricKey="cpu" />
      </Wrapper>
    );
    const table = screen.getByRole('table');
    const rows = table.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
  });

  it('renders nothing when allocatable is zero', () => {
    const zeroAllocatable: NodeDailyDigestItem[] = [
      {
        bucket_date: '2026-06-15',
        cpu_usage_p50_mc: 3200,
        cpu_usage_p95_mc: 5600,
        mem_usage_p50_kib: 4194304,
        mem_usage_p95_kib: 6291456,
        max_cpu_allocatable_mc: 0,
        max_mem_allocatable_kib: 0,
        max_cpu_requests_mc: 7200,
        max_mem_requests_kib: 12582912,
      },
    ];
    const { container } = render(
      <Wrapper>
        <NodeRequestGapChart dailyDigests={zeroAllocatable} metricKey="cpu" />
      </Wrapper>
    );
    expect(container.firstChild).toBeNull();
  });
});
