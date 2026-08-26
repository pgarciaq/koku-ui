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
  beforeEach(() => {
    const { rosActions, rosSelectors } = require('store/ros');
    rosActions.fetchRosReport.mockClear();
    rosSelectors.selectRos.mockReset();
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRosError.mockReturnValue(undefined);
  });
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

  test('adds Peak hours profile columns and one 80 warning after unique container detail', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockImplementation((_state, pathsType) => {
      if (pathsType === 'gpuMigRecommendations') {
        return {
          data: [
            {
              cluster_uuid: 'abc-123',
              namespace: 'ml-training',
              workload: 'training-job',
              container: 'trainer',
              gpu_model: 'A100-SXM4-40GB',
              term: 'short_term',
              current_gpu_profile: '3g.20gb',
              recommended_gpu_profile: '2g.10gb',
              gpu_classification: 'oversized',
              confidence_level: 0.85,
            },
          ],
        };
      }
      if (pathsType === 'recommendations') {
        return { data: [{ id: 'ctr-1' }] };
      }
      if (pathsType === 'recommendation') {
        return {
          id: 'ctr-1',
          gpu: {
            short: {
              recommended_gpu_profile: '2g.10gb',
              business_hours: {
                recommended_gpu_profile: '1g.5gb',
                gpu_classification: 'oversized',
                notifications: {
                  '80': {
                    code: 80,
                    message:
                      'Business-hours GPU sizing uses the namespace office window — overnight training and off-hours bursts are excluded',
                  },
                },
              },
            },
          },
        };
      }
      return undefined;
    });

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'abc-123',
        namespace: 'ml-training',
        workload: 'training-job',
        container: 'trainer',
        gpu_model: 'A100-SXM4-40GB',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('Peak hours profile')).toBeInTheDocument();
    expect(screen.getByText('1g.5gb')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Business-hours GPU sizing uses the namespace office window — overnight training and off-hours bursts are excluded'
      )
    ).toBeInTheDocument();
  });

  test('omits Peak hours when container lookup returns 0 ids', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockImplementation((_state, pathsType) => {
      if (pathsType === 'gpuMigRecommendations') {
        return {
          data: [
            {
              cluster_uuid: 'abc-123',
              namespace: 'ml-training',
              container: 'trainer',
              term: 'short_term',
              recommended_gpu_profile: '2g.10gb',
            },
          ],
        };
      }
      if (pathsType === 'recommendations') {
        return { data: [] };
      }
      return { id: 'should-not-use', gpu: { short: { business_hours: { recommended_gpu_profile: '1g.5gb' } } } };
    });

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'abc-123',
        namespace: 'ml-training',
        container: 'trainer',
        gpu_model: 'A100',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.queryByText('Peak hours profile')).not.toBeInTheDocument();
    expect(screen.queryByText('1g.5gb')).not.toBeInTheDocument();
  });

  test('omits Peak hours when container lookup returns more than one id', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockImplementation((_state, pathsType) => {
      if (pathsType === 'gpuMigRecommendations') {
        return {
          data: [
            {
              cluster_uuid: 'abc-123',
              namespace: 'ml-training',
              container: 'trainer',
              term: 'short_term',
              recommended_gpu_profile: '2g.10gb',
            },
          ],
        };
      }
      if (pathsType === 'recommendations') {
        return { data: [{ id: 'a' }, { id: 'b' }] };
      }
      return { gpu: { short: { business_hours: { recommended_gpu_profile: '1g.5gb' } } } };
    });

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'abc-123',
        namespace: 'ml-training',
        container: 'trainer',
        gpu_model: 'A100',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.queryByText('Peak hours profile')).not.toBeInTheDocument();
  });

  test('uses MIG row id and skips guessing when #495 id is present', () => {
    const { rosActions, rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockImplementation((_state, pathsType) => {
      if (pathsType === 'gpuMigRecommendations') {
        return {
          data: [
            {
              id: 'native-ctr-1',
              cluster_uuid: 'abc-123',
              namespace: 'ml-training',
              container: 'trainer',
              term: 'medium_term',
              recommended_gpu_profile: '2g.10gb',
            },
          ],
        };
      }
      if (pathsType === 'recommendation') {
        return {
          id: 'native-ctr-1',
          gpu: {
            medium: {
              business_hours: {
                recommended_gpu_profile: '1g.5gb',
                gpu_classification: 'undersized',
              },
            },
          },
        };
      }
      return { data: [{ id: 'wrong' }] };
    });

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'abc-123',
        namespace: 'ml-training',
        container: 'trainer',
        gpu_model: 'A100',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('1g.5gb')).toBeInTheDocument();
    expect(rosActions.fetchRosReport).not.toHaveBeenCalledWith(
      'recommendations',
      'ros',
      expect.anything()
    );
  });

  test('hides Peak hours columns when GPU nest is reason-only', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockImplementation((_state, pathsType) => {
      if (pathsType === 'gpuMigRecommendations') {
        return {
          data: [
            {
              id: 'ctr-1',
              container: 'trainer',
              term: 'short_term',
              recommended_gpu_profile: '2g.10gb',
            },
          ],
        };
      }
      if (pathsType === 'recommendation') {
        return {
          gpu: {
            short: { business_hours: { reason: 'Insufficient business-hours data for this term' } },
          },
        };
      }
      return undefined;
    });

    renderWithProviders(<GpuMigBreakdown queryStateName="gpuMig" />, {
      gpuMig: {
        cluster_uuid: 'abc-123',
        namespace: 'ml-training',
        container: 'trainer',
        gpu_model: 'A100',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.queryByText('Peak hours profile')).not.toBeInTheDocument();
  });
});
