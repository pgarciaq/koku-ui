import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { SavingsWaterfallChart } from './savingsWaterfallChart';

jest.mock('api/ros/savingsSummary');
jest.mock('components/featureToggle');

const { fetchFleetSavingsSummary } = require('api/ros/savingsSummary');
const { useIsVisualInsightsToggleEnabled } = require('components/featureToggle');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('SavingsWaterfallChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIsVisualInsightsToggleEnabled.mockReturnValue(true);
  });

  it('renders nothing when feature toggle is disabled', () => {
    useIsVisualInsightsToggleEnabled.mockReturnValue(false);

    const { container } = render(<SavingsWaterfallChart />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders loading skeleton while fetching', () => {
    fetchFleetSavingsSummary.mockReturnValue(new Promise(() => {}));

    const { container } = render(<SavingsWaterfallChart />, { wrapper });
    const skeletons = container.querySelectorAll('.pf-v6-c-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state when API fails', async () => {
    fetchFleetSavingsSummary.mockRejectedValue(new Error('Network error'));

    render(<SavingsWaterfallChart />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Unable to load savings data')).toBeTruthy();
    });
  });

  it('renders empty state when no savings data', async () => {
    fetchFleetSavingsSummary.mockResolvedValue({
      data: {
        by_plugin: {
          container: { value: '0', units: 'USD' },
          gpu: { value: '0', units: 'USD' },
          node: { value: '0', units: 'USD' },
          pvc: { value: '0', units: 'USD' },
          snapshot: { value: '0', units: 'USD' },
          vm: { value: '0', units: 'USD' },
        },
        estimated_monthly_savings: { value: '0', units: 'USD' },
        currency: 'USD',
      },
    });

    render(<SavingsWaterfallChart />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText('No savings data available. Configure cost rates to see potential savings by category.')
      ).toBeTruthy();
    });
  });

  it('renders empty state when by_plugin is undefined', async () => {
    fetchFleetSavingsSummary.mockResolvedValue({
      data: {
        by_plugin: undefined,
        estimated_monthly_savings: { value: '0', units: 'USD' },
        currency: 'USD',
      },
    });

    render(<SavingsWaterfallChart />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText('No savings data available. Configure cost rates to see potential savings by category.')
      ).toBeTruthy();
    });
  });

  it('renders chart with savings data', async () => {
    fetchFleetSavingsSummary.mockResolvedValue({
      data: {
        by_plugin: {
          container: { value: '500.00', units: 'USD' },
          gpu: { value: '200.00', units: 'USD' },
          node: { value: '300.00', units: 'USD' },
          pvc: { value: '0', units: 'USD' },
          snapshot: { value: '-50.00', units: 'USD' },
          vm: { value: '100.00', units: 'USD' },
        },
        estimated_monthly_savings: { value: '1050.00', units: 'USD' },
        currency: 'USD',
      },
    });

    render(<SavingsWaterfallChart />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Potential Savings by Category')).toBeTruthy();
    });
  });

  it('renders chart title with total savings subtitle', async () => {
    fetchFleetSavingsSummary.mockResolvedValue({
      data: {
        by_plugin: {
          container: { value: '1234.56', units: 'USD' },
        },
        estimated_monthly_savings: { value: '1234.56', units: 'USD' },
        currency: 'USD',
      },
    });

    render(<SavingsWaterfallChart />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Potential Savings by Category')).toBeTruthy();
      expect(screen.getByText(/Total estimated.*\$1,234\.56.*USD\/month/)).toBeTruthy();
    });
  });

  it('filters out zero-value categories', async () => {
    fetchFleetSavingsSummary.mockResolvedValue({
      data: {
        by_plugin: {
          container: { value: '500.00', units: 'USD' },
          gpu: { value: '0', units: 'USD' },
          node: { value: '0', units: 'USD' },
          pvc: { value: '0', units: 'USD' },
          snapshot: { value: '0', units: 'USD' },
          vm: { value: '0', units: 'USD' },
        },
        estimated_monthly_savings: { value: '500.00', units: 'USD' },
        currency: 'USD',
      },
    });

    render(<SavingsWaterfallChart />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Potential Savings by Category')).toBeTruthy();
    });
  });
});
