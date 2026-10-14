import { render, screen } from '@testing-library/react';
import { FetchStatus } from 'store/common';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { OptimizationsTabSummaryBanner } from './optimizationsTabSummaryBanner';

const mockUseSummary = jest.fn();

jest.mock('hooks/useOptimizationsTabSummary', () => ({
  useOptimizationsTabSummary: (...args: any[]) => mockUseSummary(...args),
}));

const renderBanner = (props: any) =>
  render(
    <IntlProvider locale="en">
      <OptimizationsTabSummaryBanner plugin="container" {...props} />
    </IntlProvider>
  );

// NOTE: jest mocks react-intl (src/__mocks__/react-intl.ts), so ICU messages
// render as raw defaultMessage + JSON params. Assertions below match on the
// distinctive static fragments that identify WHICH message was selected.

describe('OptimizationsTabSummaryBanner', () => {
  beforeEach(() => {
    mockUseSummary.mockReset();
  });

  test('renders skeleton while loading', () => {
    mockUseSummary.mockReturnValue({
      count: 0,
      countFetchStatus: FetchStatus.inProgress,
      summaryFetchStatus: FetchStatus.inProgress,
    });
    const { container } = renderBanner({});
    expect(container.querySelector('.pf-v6-c-skeleton, .pf-c-skeleton')).not.toBeNull();
  });

  test('renders savings and additional cost when both are present', () => {
    mockUseSummary.mockReturnValue({
      breakdown: {
        savings: { value: '800.00', units: 'USD' },
        additional_cost: { value: '182.29', units: 'USD' },
        savings_count: 3,
        additional_cost_count: 2,
      },
      count: 5,
      countFetchStatus: FetchStatus.complete,
      savingsUnits: 'USD',
      savingsValue: '617.71',
      summaryFetchStatus: FetchStatus.complete,
    });
    renderBanner({});
    expect(screen.getByText(/Potential savings:/)).toBeInTheDocument();
    expect(screen.getByText(/Additional cost:/)).toBeInTheDocument();
    expect(screen.queryByText(/Total potential savings:/)).not.toBeInTheDocument();
  });

  test('renders legacy savings message when only savings exist', () => {
    mockUseSummary.mockReturnValue({
      breakdown: {
        savings: { value: '800.00', units: 'USD' },
        additional_cost: { value: '0.00', units: 'USD' },
        savings_count: 3,
        additional_cost_count: 0,
      },
      count: 3,
      countFetchStatus: FetchStatus.complete,
      savingsUnits: 'USD',
      savingsValue: '800.00',
      summaryFetchStatus: FetchStatus.complete,
    });
    renderBanner({});
    expect(screen.getByText(/Total potential savings:/)).toBeInTheDocument();
    expect(screen.queryByText(/Additional cost:/)).not.toBeInTheDocument();
  });

  test('renders additional cost message when only cost exists', () => {
    mockUseSummary.mockReturnValue({
      breakdown: {
        savings: { value: '0.00', units: 'USD' },
        additional_cost: { value: '182.29', units: 'USD' },
        savings_count: 0,
        additional_cost_count: 2,
      },
      count: 2,
      countFetchStatus: FetchStatus.complete,
      savingsUnits: 'USD',
      savingsValue: '-182.29',
      summaryFetchStatus: FetchStatus.complete,
    });
    renderBanner({});
    expect(screen.getByText(/Additional cost:/)).toBeInTheDocument();
    expect(screen.queryByText(/Total potential savings:/)).not.toBeInTheDocument();
  });

  test('renders count only when no amounts exist', () => {
    mockUseSummary.mockReturnValue({
      count: 4,
      countFetchStatus: FetchStatus.complete,
      summaryFetchStatus: FetchStatus.complete,
    });
    renderBanner({});
    // The count message is the only one containing the 'No recommendations' branch literal.
    expect(screen.getByText(/No recommendations/)).toBeInTheDocument();
    expect(screen.queryByText(/Potential savings:/)).not.toBeInTheDocument();
  });

  test('renders legacy message when breakdown is absent (older backend)', () => {
    mockUseSummary.mockReturnValue({
      breakdown: undefined,
      count: 2,
      countFetchStatus: FetchStatus.complete,
      savingsUnits: 'USD',
      savingsValue: '617.71',
      summaryFetchStatus: FetchStatus.complete,
    });
    renderBanner({});
    expect(screen.getByText(/Total potential savings:/)).toBeInTheDocument();
  });

  test('waste variant falls back to count when value is negative', () => {
    mockUseSummary.mockReturnValue({
      breakdown: undefined,
      count: 1,
      countFetchStatus: FetchStatus.complete,
      savingsUnits: 'USD',
      savingsValue: '-5.00',
      summaryFetchStatus: FetchStatus.complete,
    });
    renderBanner({ variant: 'waste' });
    expect(screen.getByText(/1 recommendation/)).toBeInTheDocument();
    expect(screen.queryByText(/waste/)).not.toBeInTheDocument();
  });
});
