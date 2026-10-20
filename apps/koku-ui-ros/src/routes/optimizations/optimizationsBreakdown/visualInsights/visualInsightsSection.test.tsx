import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { FetchStatus } from 'store/common';

import { VisualInsightsSection } from './visualInsightsSection';

jest.mock('api/ros/recommendations', () => ({
  fetchOomTimeline: jest.fn(),
}));

// All three tiles are stubbed: the section suite pins visibility semantics
// only. The tiles' own suites cover their rendering (chart internals crash
// in jsdom across this suite family regardless).
jest.mock('./containerHistoryChart', () => ({
  ContainerHistoryChart: () => <div data-testid="history-chart" />,
}));

jest.mock('./cpuThrottleTrend', () => ({
  CpuThrottleTrend: () => <div data-testid="throttle-trend" />,
}));

jest.mock('./oomTimeline', () => ({
  OomTimeline: (props: any) =>
    props.hasError ? (
      <div data-testid="oom-error-tile" />
    ) : props.entries?.some((d: any) => d.oom_kill_count > 0) ? (
      <div data-testid="oom-chart" />
    ) : (
      <div>No OOM events detected in this period</div>
    ),
}));

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));

jest.mock('routes/components/charts/theme', () => ({}));

const { fetchOomTimeline } = require('api/ros/recommendations');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

// #696 redesign contract: the card must never flash-then-hide. It stays
// unmounted while the async OOM input resolves, appears only when at least
// one child has data (or the OOM fetch errored — an error is not an empty
// state), and keeps the lab-expected empty-state tiles while it is shown.
describe('VisualInsightsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not mount the card before every async input is resolved', () => {
    fetchOomTimeline.mockReturnValue(new Promise(() => {}));
    const { container } = render(
      <VisualInsightsSection recommendationId="test-id" historyFetchStatus={FetchStatus.complete} />,
      { wrapper }
    );
    expect(container.firstChild).toBeNull();
    expect(fetchOomTimeline).toHaveBeenCalled();
  });

  it('renders the card when the OOM timeline has events', async () => {
    fetchOomTimeline.mockResolvedValue({
      data: {
        data: [
          { date: '2026-01-01', oom_kill_count: 3 },
          { date: '2026-01-02', oom_kill_count: 1 },
        ],
        meta: { count: 2 },
      },
    });
    render(<VisualInsightsSection recommendationId="test-id" historyFetchStatus={FetchStatus.complete} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByTestId('oom-chart')).toBeTruthy();
    });
    expect(screen.getByText('Visual Insights')).toBeTruthy();
  });

  it('keeps empty-state tiles visible when another child has data', async () => {
    fetchOomTimeline.mockResolvedValue({ data: { data: [], meta: { count: 0 } } });
    render(
      <VisualInsightsSection
        recommendationId="test-id"
        historyData={[{ cluster_alias: 'c1' } as any]}
        historyFetchStatus={FetchStatus.complete}
      />,
      { wrapper }
    );
    await waitFor(() => {
      expect(screen.getByText('Visual Insights')).toBeTruthy();
    });
    // Lab expectation: with zero OOM kills the OOM panel shows its empty
    // state instead of the section flashing away.
    expect(screen.getByText('No OOM events detected in this period')).toBeTruthy();
  });

  it('does not collapse when the OOM fetch errors (error is not empty)', async () => {
    fetchOomTimeline.mockRejectedValue(new Error('network down'));
    render(<VisualInsightsSection recommendationId="test-id" historyFetchStatus={FetchStatus.complete} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByTestId('oom-error-tile')).toBeTruthy();
    });
    expect(screen.getByText('Visual Insights')).toBeTruthy();
    expect(screen.queryByText('No OOM events detected in this period')).toBeNull();
  });

  it('renders nothing once every child is known-empty and nothing errored', async () => {
    fetchOomTimeline.mockResolvedValue({ data: { data: [], meta: { count: 0 } } });
    const { container } = render(
      <VisualInsightsSection recommendationId="test-id" historyData={[]} historyFetchStatus={FetchStatus.complete} />,
      { wrapper }
    );
    await waitFor(() => {
      expect(fetchOomTimeline).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
