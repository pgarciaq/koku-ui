import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { SnapshotCostByTypeChart } from './snapshotCostByTypeChart';

jest.mock('api/ros/recommendations', () => ({
  fetchSnapshotCostByType: jest.fn(),
}));

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const { fetchSnapshotCostByType } = require('api/ros/recommendations');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('SnapshotCostByTypeChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    fetchSnapshotCostByType.mockReturnValue(new Promise(() => {}));
    render(<SnapshotCostByTypeChart />, { wrapper });
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('renders donut chart with multiple types', async () => {
    fetchSnapshotCostByType.mockResolvedValue({
      data: {
        data: [
          { recommendation_type: 'orphaned', total_cost_cents: 1250, count: 15 },
          { recommendation_type: 'stale', total_cost_cents: 800, count: 10 },
          { recommendation_type: 'active', total_cost_cents: 200, count: 50 },
        ],
      },
    });
    const { container } = render(<SnapshotCostByTypeChart />, { wrapper });
    await waitFor(() => {
      expect(container.querySelector('[role="img"]') || container.querySelector('svg')).toBeTruthy();
    });
  });

  it('renders empty state when no data returned', async () => {
    fetchSnapshotCostByType.mockResolvedValue({
      data: {
        data: [],
      },
    });
    render(<SnapshotCostByTypeChart />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('No snapshot cost data available')).toBeTruthy();
    });
  });

  it('renders empty state when all costs are zero', async () => {
    fetchSnapshotCostByType.mockResolvedValue({
      data: {
        data: [
          { recommendation_type: 'active', total_cost_cents: 0, count: 5 },
        ],
      },
    });
    render(<SnapshotCostByTypeChart />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('No snapshot cost data available')).toBeTruthy();
    });
  });

  it('renders chart with a single type (full donut)', async () => {
    fetchSnapshotCostByType.mockResolvedValue({
      data: {
        data: [
          { recommendation_type: 'orphaned', total_cost_cents: 5000, count: 25 },
        ],
      },
    });
    const { container } = render(<SnapshotCostByTypeChart />, { wrapper });
    await waitFor(() => {
      expect(container.querySelector('[role="img"]') || container.querySelector('svg')).toBeTruthy();
    });
  });

  it('renders error state on fetch failure', async () => {
    fetchSnapshotCostByType.mockRejectedValue(new Error('Network error'));
    render(<SnapshotCostByTypeChart />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Unable to load snapshot cost data')).toBeTruthy();
    });
  });
});
