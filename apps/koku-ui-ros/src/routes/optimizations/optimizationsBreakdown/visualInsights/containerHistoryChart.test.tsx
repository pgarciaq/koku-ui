import { render, screen } from '@testing-library/react';
import type { HistoryRow } from 'api/ros/recommendationHistory';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { ContainerHistoryChart } from './containerHistoryChart';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const makeSampleRow = (overrides: Partial<HistoryRow> = {}): HistoryRow => ({
  recorded_at: '2026-06-15T12:00:00Z',
  cluster_uuid: 'cluster-1',
  cluster_alias: 'my-cluster',
  namespace: 'default',
  workload: 'my-app',
  container_name: 'app',
  term: 'short_term',
  engine: 'cost',
  rec_cpu_request_millicores: 250,
  rec_cpu_limit_millicores: 500,
  rec_memory_request_kib: 262144,
  rec_memory_limit_kib: 524288,
  notification_codes: null,
  confidence_level: 0.95,
  ...overrides,
});

describe('ContainerHistoryChart', () => {
  it('renders empty state when data is empty', () => {
    render(<ContainerHistoryChart data={[]} />, { wrapper });
    expect(screen.getByText('No recommendation history available for this container.')).toBeTruthy();
  });

  it('renders chart when data is provided', () => {
    const data = [
      makeSampleRow({ recorded_at: '2026-06-01T12:00:00Z', rec_cpu_request_millicores: 200 }),
      makeSampleRow({ recorded_at: '2026-06-08T12:00:00Z', rec_cpu_request_millicores: 250 }),
      makeSampleRow({ recorded_at: '2026-06-15T12:00:00Z', rec_cpu_request_millicores: 300 }),
    ];
    const { container } = render(<ContainerHistoryChart data={data} />, { wrapper });
    expect(screen.queryByText('No recommendation history available for this container.')).toBeNull();
    expect(screen.getByText('CPU Recommendation Trend')).toBeTruthy();
    expect(screen.getByText('Memory Recommendation Trend')).toBeTruthy();
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('handles null recommendation values gracefully', () => {
    const data = [
      makeSampleRow({
        recorded_at: '2026-06-01T12:00:00Z',
        rec_cpu_request_millicores: null,
        rec_cpu_limit_millicores: null,
        rec_memory_request_kib: null,
        rec_memory_limit_kib: null,
      }),
    ];
    const { container } = render(<ContainerHistoryChart data={data} />, { wrapper });
    expect(container.querySelector('div')).toBeTruthy();
  });
});
