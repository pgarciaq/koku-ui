import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { SnapshotAgeDistributionChart } from './snapshotAgeDistributionChart';

jest.mock('api/ros/recommendations', () => ({
  fetchSnapshotAgeDistribution: jest.fn(),
}));

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const { fetchSnapshotAgeDistribution } = require('api/ros/recommendations');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('SnapshotAgeDistributionChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    fetchSnapshotAgeDistribution.mockReturnValue(new Promise(() => {}));
    render(<SnapshotAgeDistributionChart />, { wrapper });
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('renders chart when all buckets have data', async () => {
    fetchSnapshotAgeDistribution.mockResolvedValue({
      data: {
        buckets: [
          { label: '<7 days', min_days: 0, max_days: 6, count: 45 },
          { label: '7-30 days', min_days: 7, max_days: 29, count: 120 },
          { label: '30-90 days', min_days: 30, max_days: 89, count: 30 },
          { label: '90+ days', min_days: 90, max_days: null, count: 8 },
        ],
        total: 203,
      },
    });
    const { container } = render(<SnapshotAgeDistributionChart />, { wrapper });
    await waitFor(() => {
      expect(container.querySelector('[role="img"]') || container.querySelector('svg')).toBeTruthy();
    });
    await waitFor(() => {
      const accessibleTable = container.querySelector('table');
      expect(accessibleTable).toBeTruthy();
      const rows = accessibleTable?.querySelectorAll('tbody tr');
      expect(rows?.length).toBe(4);
    });
  });

  it('renders empty state when total is 0', async () => {
    fetchSnapshotAgeDistribution.mockResolvedValue({
      data: {
        buckets: [
          { label: '<7 days', min_days: 0, max_days: 6, count: 0 },
          { label: '7-30 days', min_days: 7, max_days: 29, count: 0 },
          { label: '30-90 days', min_days: 30, max_days: 89, count: 0 },
          { label: '90+ days', min_days: 90, max_days: null, count: 0 },
        ],
        total: 0,
      },
    });
    render(<SnapshotAgeDistributionChart />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('No snapshot data available')).toBeTruthy();
    });
  });

  it('renders chart with partial data (some buckets zero)', async () => {
    fetchSnapshotAgeDistribution.mockResolvedValue({
      data: {
        buckets: [
          { label: '<7 days', min_days: 0, max_days: 6, count: 10 },
          { label: '7-30 days', min_days: 7, max_days: 29, count: 0 },
          { label: '30-90 days', min_days: 30, max_days: 89, count: 5 },
          { label: '90+ days', min_days: 90, max_days: null, count: 0 },
        ],
        total: 15,
      },
    });
    const { container } = render(<SnapshotAgeDistributionChart />, { wrapper });
    await waitFor(() => {
      expect(container.querySelector('[role="img"]') || container.querySelector('svg')).toBeTruthy();
    });
  });

  it('renders error state on fetch failure', async () => {
    fetchSnapshotAgeDistribution.mockRejectedValue(new Error('Network error'));
    render(<SnapshotAgeDistributionChart />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Unable to load snapshot age distribution')).toBeTruthy();
    });
  });
});
