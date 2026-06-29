import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { OomTimeline } from './oomTimeline';

jest.mock('api/ros/recommendations', () => ({
  fetchOomTimeline: jest.fn(),
}));

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const { fetchOomTimeline } = require('api/ros/recommendations');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('OomTimeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    fetchOomTimeline.mockReturnValue(new Promise(() => {}));
    render(<OomTimeline recommendationId="test-id" />, { wrapper });
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('renders empty state when no OOM data', async () => {
    fetchOomTimeline.mockResolvedValue({ data: { data: [], meta: { count: 0 } } });
    render(<OomTimeline recommendationId="test-id" />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('No OOM events detected in this period')).toBeTruthy();
    });
  });

  it('renders empty state when all counts are zero', async () => {
    fetchOomTimeline.mockResolvedValue({
      data: {
        data: [
          { date: '2026-01-01', oom_kill_count: 0 },
          { date: '2026-01-02', oom_kill_count: 0 },
        ],
        meta: { count: 2 },
      },
    });
    render(<OomTimeline recommendationId="test-id" />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('No OOM events detected in this period')).toBeTruthy();
    });
  });

  it('renders chart when OOM data is present', async () => {
    fetchOomTimeline.mockResolvedValue({
      data: {
        data: [
          { date: '2026-01-01', oom_kill_count: 3 },
          { date: '2026-01-02', oom_kill_count: 1 },
        ],
        meta: { count: 2, container_id: 'ctr-1', start_date: '2026-01-01', end_date: '2026-01-02' },
      },
    });
    const { container } = render(<OomTimeline recommendationId="test-id" />, { wrapper });
    await waitFor(() => {
      expect(container.querySelector('[role="img"]') || container.querySelector('svg')).toBeTruthy();
    });
  });

  it('renders error state on fetch failure', async () => {
    fetchOomTimeline.mockRejectedValue(new Error('Network error'));
    render(<OomTimeline recommendationId="test-id" />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('No OOM events detected in this period')).toBeTruthy();
    });
  });
});
