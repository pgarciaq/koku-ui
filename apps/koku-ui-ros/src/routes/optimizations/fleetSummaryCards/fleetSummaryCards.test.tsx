import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { FleetSummaryCards } from './fleetSummaryCards';

jest.mock('hooks/useFleetSummary');

const { useFleetSummary } = require('hooks/useFleetSummary');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('FleetSummaryCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders skeleton cards during loading', () => {
    useFleetSummary.mockReturnValue({
      data: undefined,
      fetchStatus: 1, // FetchStatus.inProgress
    });

    const { container } = render(<FleetSummaryCards />, { wrapper });
    const skeletons = container.querySelectorAll('.pf-v6-c-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders nothing when fetch fails', () => {
    useFleetSummary.mockReturnValue({
      data: undefined,
      fetchStatus: 0, // FetchStatus.none
    });

    const { container } = render(<FleetSummaryCards />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when total_containers is zero', () => {
    useFleetSummary.mockReturnValue({
      data: {
        total_containers: 0,
        active_containers: 0,
        idle_containers: 0,
        abandoned_containers: 0,
        total_monthly_savings: { value: '0', units: 'USD' },
        cluster_count: 0,
      },
      fetchStatus: 2, // FetchStatus.complete
    });

    const { container } = render(<FleetSummaryCards />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders all stat cards with correct values', () => {
    useFleetSummary.mockReturnValue({
      data: {
        total_containers: 250,
        active_containers: 200,
        idle_containers: 30,
        abandoned_containers: 20,
        total_monthly_savings: { value: '1234.56', units: 'USD' },
        cluster_count: 5,
        currency: 'USD',
      },
      fetchStatus: 2, // FetchStatus.complete
    });

    render(<FleetSummaryCards />, { wrapper });

    expect(screen.getByText('Total containers')).toBeTruthy();
    expect(screen.getByText('250')).toBeTruthy();

    expect(screen.getByText('Idle containers')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();

    expect(screen.getByText('Abandoned containers')).toBeTruthy();
    expect(screen.getByText('20')).toBeTruthy();

    expect(screen.getByText('Potential monthly savings')).toBeTruthy();
    expect(screen.getByText('$1,234.56 USD')).toBeTruthy();

    expect(screen.getByText('Clusters')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('calculates percentages correctly', () => {
    useFleetSummary.mockReturnValue({
      data: {
        total_containers: 100,
        active_containers: 70,
        idle_containers: 20,
        abandoned_containers: 10,
        total_monthly_savings: { value: '500.00', units: 'USD' },
        cluster_count: 3,
      },
      fetchStatus: 2,
    });

    const { container } = render(<FleetSummaryCards />, { wrapper });

    const subtitles = container.querySelectorAll('span[style*="subtle"]');
    const texts = Array.from(subtitles).map(el => el.textContent);
    expect(texts.some(t => t?.includes('20.0'))).toBe(true);
    expect(texts.some(t => t?.includes('10.0'))).toBe(true);
  });

  it('handles missing savings gracefully', () => {
    useFleetSummary.mockReturnValue({
      data: {
        total_containers: 50,
        active_containers: 40,
        idle_containers: 5,
        abandoned_containers: 5,
        total_monthly_savings: undefined,
        cluster_count: 2,
      },
      fetchStatus: 2,
    });

    render(<FleetSummaryCards />, { wrapper });

    expect(screen.getByText('Potential monthly savings')).toBeTruthy();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('formats large numbers with locale separators', () => {
    useFleetSummary.mockReturnValue({
      data: {
        total_containers: 12500,
        active_containers: 10000,
        idle_containers: 1500,
        abandoned_containers: 1000,
        total_monthly_savings: { value: '99999.99', units: 'USD' },
        cluster_count: 42,
      },
      fetchStatus: 2,
    });

    render(<FleetSummaryCards />, { wrapper });

    expect(screen.getByText('12,500')).toBeTruthy();
    expect(screen.getByText('1,500')).toBeTruthy();
    expect(screen.getByText('1,000')).toBeTruthy();
    expect(screen.getByText('$99,999.99 USD')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });
});
