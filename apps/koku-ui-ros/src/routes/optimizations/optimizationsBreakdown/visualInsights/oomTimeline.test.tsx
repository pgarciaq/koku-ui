import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { OomTimeline } from './oomTimeline';

jest.mock('routes/components/charts/common/chartUtils', () => ({
  getResizeObserver: jest.fn(() => jest.fn()),
}));


const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

// #696: the tile is presentational — the owning section fetches the data so
// it can decide visibility without mounting/unmounting the chart. A failed
// fetch renders an error state; it must never read as "no OOM events".
describe('OomTimeline', () => {
  const baseProps = { isLoading: false, hasError: false };

  it('renders loading state while the section fetch is in flight', () => {
    render(<OomTimeline {...baseProps} isLoading />, { wrapper });
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('renders empty state when no OOM data', () => {
    render(<OomTimeline {...baseProps} entries={[]} />, { wrapper });
    expect(screen.getByText('No OOM events detected in this period')).toBeTruthy();
  });

  it('renders empty state when all counts are zero', () => {
    render(
      <OomTimeline
        {...baseProps}
        entries={[
          { date: '2026-01-01', oom_kill_count: 0 },
          { date: '2026-01-02', oom_kill_count: 0 },
        ]}
      />,
      { wrapper }
    );
    expect(screen.getByText('No OOM events detected in this period')).toBeTruthy();
  });

  it('renders an error state when the fetch failed — not the empty state', () => {
    render(<OomTimeline {...baseProps} entries={[]} hasError />, { wrapper });
    expect(screen.getByText('Could not load OOM event data')).toBeTruthy();
    expect(screen.queryByText('No OOM events detected in this period')).toBeNull();
  });

  // Chart render goes through waitFor like the pre-existing suites: a
  // synchronous first mount of the pf-charts components crashes in jsdom,
  // an act()-wrapped render does not.
  it('renders the chart when OOM events exist', async () => {
    const { container, rerender } = render(<OomTimeline {...baseProps} entries={[]} />, { wrapper });
    // pf-charts crash on a synchronous first mount in jsdom; every chart in
    // this family is rendered through a re-render, like the fetch-resolve
    // update the component performs in production.
    rerender(
      <OomTimeline
        {...baseProps}
        entries={[
          { date: '2026-01-01', oom_kill_count: 3 },
          { date: '2026-01-02', oom_kill_count: 0 },
        ]}
      />
    );
    await waitFor(() => {
      expect(container.querySelector('[role="img"]') || container.querySelector('svg')).toBeTruthy();
    });
    expect(screen.queryByText('No OOM events detected in this period')).toBeNull();
  });
});
