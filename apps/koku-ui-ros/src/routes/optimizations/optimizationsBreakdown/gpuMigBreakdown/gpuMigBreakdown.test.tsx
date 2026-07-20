import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

// eslint-disable-next-line no-restricted-imports
import messages from '../../../../../locales/data.json';

jest.mock('store/ros', () => ({
  rosActions: { fetchRosReport: jest.fn(() => ({ type: 'MOCK_FETCH' })) },
  rosSelectors: {
    selectRos: jest.fn(() => undefined),
    selectRosFetchStatus: jest.fn(() => 2),
    selectRosError: jest.fn(() => undefined),
  },
}));

import { configureStore } from '@reduxjs/toolkit';

import GpuMigBreakdown from './gpuMigBreakdown';

function createTestStore() {
  return configureStore({
    reducer: { ros: (state = {}) => state },
    middleware: gDM => gDM({ serializableCheck: false, immutableCheck: false }),
  });
}

function renderWithProviders(ui: React.ReactElement, locationState: Record<string, any> = {}) {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter initialEntries={[{ pathname: '/breakdown', state: locationState }]}>
          {ui}
        </MemoryRouter>
      </IntlProvider>
    </Provider>
  );
}

describe('GpuMigBreakdown', () => {
  test('renders loading state when fetch is in progress', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(1);
    rosSelectors.selectRos.mockReturnValue(undefined);

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'test-cluster',
        namespace: 'test-ns',
        container: 'test-ctr',
        gpu_model: 'A100',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('Looking for optimizations...')).toBeInTheDocument();
  });

  test('renders no-data alert when report has no items', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({ data: [] });

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'test-cluster',
        namespace: 'test-ns',
        container: 'test-ctr',
        gpu_model: 'A100',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('No recommendations available for this term.')).toBeInTheDocument();
  });

  test('renders MIG profile table when data is available', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      data: [
        {
          cluster_uuid: 'abc-123',
          namespace: 'ml-training',
          workload: 'training-job',
          container: 'trainer',
          gpu_model: 'A100-SXM4-40GB',
          node_name: 'gpu-node-1',
          term: 'short_term',
          current_gpu_profile: '3g.20gb',
          recommended_gpu_profile: '2g.10gb',
          gpu_classification: 'oversized',
          confidence_level: 0.85,
        },
        {
          cluster_uuid: 'abc-123',
          namespace: 'ml-training',
          workload: 'training-job',
          container: 'trainer',
          gpu_model: 'A100-SXM4-40GB',
          node_name: 'gpu-node-1',
          term: 'medium_term',
          current_gpu_profile: '3g.20gb',
          recommended_gpu_profile: '1g.5gb',
          gpu_classification: 'oversized',
          confidence_level: 0.72,
        },
      ],
    });

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'abc-123',
        namespace: 'ml-training',
        container: 'trainer',
        gpu_model: 'A100-SXM4-40GB',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('trainer')).toBeInTheDocument();
    expect(screen.getByText('ml-training')).toBeInTheDocument();
    expect(screen.getByText('A100-SXM4-40GB')).toBeInTheDocument();
    expect(screen.getAllByText('3g.20gb').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2g.10gb')).toBeInTheDocument();
    expect(screen.getAllByText('oversized').length).toBeGreaterThanOrEqual(1);
  });
});
