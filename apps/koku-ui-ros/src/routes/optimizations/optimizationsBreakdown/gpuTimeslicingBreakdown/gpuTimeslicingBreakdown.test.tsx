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

import GpuTimeslicingBreakdown from './gpuTimeslicingBreakdown';

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

describe('GpuTimeslicingBreakdown', () => {
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

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'test-cluster',
        node_name: 'gpu-node-1',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('Looking for optimizations...')).toBeInTheDocument();
  });

  test('renders no-data alert when report has no items', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({ data: [] });

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'test-cluster',
        node_name: 'gpu-node-1',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('No recommendations available for this term.')).toBeInTheDocument();
  });

  test('renders header and candidate containers when data is available', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      data: [
        {
          node_name: 'gpu-node-1',
          cluster_uuid: 'abc-123',
          gpu_model: 'A100-SXM4-40GB',
          classification: 'oversized',
          confidence_level: 0.92,
          recommended_replicas: 4,
          estimated_monthly_savings: { value: 150.0, units: 'USD' },
          candidate_containers: [
            {
              namespace: 'ml-prod',
              workload: 'inference-server',
              container: 'model-runner',
              sm_active_avg: 0.35,
              classification: 'undersized',
            },
            {
              namespace: 'ml-prod',
              workload: 'data-pipeline',
              container: 'preprocessor',
              sm_active_avg: 0.12,
              classification: 'idle',
            },
          ],
        },
      ],
    });

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'abc-123',
        node_name: 'gpu-node-1',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('gpu-node-1')).toBeInTheDocument();
    expect(screen.getByText('abc-123')).toBeInTheDocument();
    expect(screen.getByText('A100-SXM4-40GB')).toBeInTheDocument();
    expect(screen.getByText('oversized')).toBeInTheDocument();
    expect(screen.getByText('$150.00 USD')).toBeInTheDocument();

    expect(screen.getByText('model-runner')).toBeInTheDocument();
    expect(screen.getByText('preprocessor')).toBeInTheDocument();
    expect(screen.getByText('35.0%')).toBeInTheDocument();
    expect(screen.getByText('12.0%')).toBeInTheDocument();
    expect(screen.getByText('undersized')).toBeInTheDocument();
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  test('renders no-candidates alert when candidate_containers is empty', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      data: [
        {
          node_name: 'gpu-node-2',
          cluster_uuid: 'def-456',
          gpu_model: 'V100',
          recommended_replicas: 2,
          estimated_monthly_savings: { value: 50.0, units: 'USD' },
          candidate_containers: [],
        },
      ],
    });

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'def-456',
        node_name: 'gpu-node-2',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('gpu-node-2')).toBeInTheDocument();
    expect(screen.getByText('No candidate containers found for this node')).toBeInTheDocument();
  });

  test('fetches timeslicing detail not the list', () => {
    const { rosActions, rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({ data: [] });

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'abc-123',
        node_name: 'gpu-node-1',
        gpu_model: 'A100-SXM4-40GB',
        term: 'short_term',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(rosActions.fetchRosReport).toHaveBeenCalledWith(
      'gpuTimeslicingRecommendation',
      'ros',
      expect.stringContaining('gpu-node-1')
    );
    expect(rosActions.fetchRosReport).toHaveBeenCalledWith(
      'gpuTimeslicingRecommendation',
      'ros',
      expect.stringContaining('filter')
    );
  });

  test('shows Peak hours replica count and nest 81 on the card', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      data: [
        {
          node_name: 'gpu-node-1',
          cluster_uuid: 'abc-123',
          gpu_model: 'A100-SXM4-40GB',
          term: 'short',
          classification: 'oversized',
          recommended_replicas: 4,
          estimated_monthly_savings: { value: 150.0, units: 'USD' },
          notification_codes: [36],
          business_hours: {
            recommended_replicas: 2,
            notifications: {
              '81': {
                code: 81,
                message:
                  'Business-hours GPU time-slicing uses the cluster office window — overnight training and off-hours bursts are excluded',
              },
            },
          },
          candidate_containers: [],
        },
      ],
    });

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'abc-123',
        node_name: 'gpu-node-1',
        gpu_model: 'A100-SXM4-40GB',
        term: 'short_term',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByTestId('peak-hours-sizing-card')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Business-hours GPU time-slicing uses the cluster office window — overnight training and off-hours bursts are excluded'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('$150.00 USD')).toBeInTheDocument();
  });

  test('hides Peak hours when nest is reason-only', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      data: [
        {
          node_name: 'gpu-node-1',
          cluster_uuid: 'abc-123',
          gpu_model: 'A100-SXM4-40GB',
          recommended_replicas: 4,
          business_hours: { reason: 'Insufficient business-hours data for this term' },
          candidate_containers: [],
        },
      ],
    });

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'abc-123',
        node_name: 'gpu-node-1',
        gpu_model: 'A100-SXM4-40GB',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.queryByTestId('peak-hours-sizing-card')).not.toBeInTheDocument();
  });

  test('picks the matching gpu_model row instead of data[0]', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      data: [
        {
          node_name: 'gpu-node-1',
          gpu_model: 'V100',
          term: 'short',
          recommended_replicas: 1,
          candidate_containers: [],
        },
        {
          node_name: 'gpu-node-1',
          gpu_model: 'A100-SXM4-40GB',
          term: 'short',
          recommended_replicas: 8,
          candidate_containers: [],
        },
      ],
    });

    renderWithProviders(<GpuTimeslicingBreakdown queryStateName="gpuTs" />, {
      gpuTs: {
        cluster_uuid: 'abc-123',
        node_name: 'gpu-node-1',
        gpu_model: 'A100-SXM4-40GB',
        term: 'short_term',
        breadcrumbPath: '/optimizations',
      },
    });

    expect(screen.getByText('A100-SXM4-40GB')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.queryByText('V100')).not.toBeInTheDocument();
  });
});
