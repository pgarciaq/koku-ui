import { render, screen } from '@testing-library/react';
import type { NodeDailyDigestItem } from 'api/ros/recommendations';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { NodePeakHoursUsageChart } from './nodePeakHoursUsageChart';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

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

describe('NodePeakHoursUsageChart', () => {
  it('renders CPU chart with data-testid', () => {
    render(
      <Wrapper>
        <NodePeakHoursUsageChart dailyDigests={mockDigests} metricKey="cpu" recommendedValue={4} />
      </Wrapper>
    );
    expect(screen.getByTestId('node-peak-hours-usage-cpu')).toBeInTheDocument();
  });

  it('renders memory chart with data-testid', () => {
    render(
      <Wrapper>
        <NodePeakHoursUsageChart dailyDigests={mockDigests} metricKey="memory" recommendedValue={16} />
      </Wrapper>
    );
    expect(screen.getByTestId('node-peak-hours-usage-memory')).toBeInTheDocument();
  });

  it('renders nothing when dailyDigests is empty', () => {
    const { container } = render(
      <Wrapper>
        <NodePeakHoursUsageChart dailyDigests={[]} metricKey="cpu" recommendedValue={4} />
      </Wrapper>
    );
    expect(container.firstChild).toBeNull();
  });

  it('includes a recommended column when recommendedValue is set', () => {
    render(
      <Wrapper>
        <NodePeakHoursUsageChart dailyDigests={mockDigests} metricKey="cpu" recommendedValue={4} />
      </Wrapper>
    );
    const table = screen.getByRole('table');
    const headerCells = table.querySelectorAll('th');
    expect(headerCells).toHaveLength(4);
    const rows = table.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
  });

  it('omits the recommended column when recommendedValue is null', () => {
    render(
      <Wrapper>
        <NodePeakHoursUsageChart dailyDigests={mockDigests} metricKey="cpu" recommendedValue={null} />
      </Wrapper>
    );
    const table = screen.getByRole('table');
    const headerCells = table.querySelectorAll('th');
    expect(headerCells).toHaveLength(3);
  });
});
