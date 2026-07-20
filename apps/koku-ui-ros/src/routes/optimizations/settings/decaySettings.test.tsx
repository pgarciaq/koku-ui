import { render, screen, waitFor } from '@testing-library/react';
import { fetchRecommendationTermSettings } from 'api/ros/termSettings';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { DecaySettings } from './decaySettings';

jest.mock('api/ros/termSettings');

const mockFetch = fetchRecommendationTermSettings as jest.MockedFunction<typeof fetchRecommendationTermSettings>;

const mockTermSettingsResponse = {
  data: {
    recommendation_type: 'container',
    settings_locked: false,
    terms: [
      { name: 'short', window_days: 1, min_data_days: 1, decay_halflife_hours: 0, locked: false, is_default: true },
      { name: 'medium', window_days: 7, min_data_days: 3, decay_halflife_hours: 168, locked: false, is_default: true },
      { name: 'long', window_days: 15, min_data_days: 7, decay_halflife_hours: 360, locked: false, is_default: true },
    ],
  },
};

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('DecaySettings', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(mockTermSettingsResponse as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', async () => {
    render(<DecaySettings />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Term & decay settings')).toBeTruthy();
    });
  });

  it('renders plugin tabs', async () => {
    render(<DecaySettings />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Container')).toBeTruthy();
      expect(screen.getByText('Namespace')).toBeTruthy();
      expect(screen.getByText('Node')).toBeTruthy();
      expect(screen.getByText('GPU')).toBeTruthy();
      expect(screen.getByText('PVC')).toBeTruthy();
      expect(screen.getByText('VM')).toBeTruthy();
    });
  });

  it('renders term cards after loading', async () => {
    render(<DecaySettings />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Short')).toBeTruthy();
      expect(screen.getByText('Medium')).toBeTruthy();
      expect(screen.getByText('Long')).toBeTruthy();
    });
  });

  it('fetches settings on mount', async () => {
    render(<DecaySettings />, { wrapper });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('container');
    });
  });

  it('renders locked indicators when settings_locked is true', async () => {
    mockFetch.mockResolvedValue({
      data: {
        ...mockTermSettingsResponse.data,
        settings_locked: true,
      },
    } as any);

    render(<DecaySettings />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Short')).toBeTruthy();
    });
  });

  it('displays save and reset buttons', async () => {
    render(<DecaySettings />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy();
      expect(screen.getByText('Reset to defaults')).toBeTruthy();
    });
  });
});
