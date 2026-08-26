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

jest.mock('./visualInsights', () => ({
  VmVisualInsightsSection: () => null,
}));

jest.mock('../shared/breakdownDecayInfoCard', () => ({
  BreakdownDecayInfoCard: () => null,
}));

import { configureStore } from '@reduxjs/toolkit';

import VmBreakdown from './vmBreakdown';

function createTestStore() {
  return configureStore({
    reducer: { ros: (state = {}) => state },
    middleware: gDM => gDM({ serializableCheck: false, immutableCheck: false }),
  });
}

const vmReport = (overrides: Record<string, unknown> = {}) => ({
  vm_name: 'web-vm',
  namespace: 'prod',
  cluster_uuid: 'cluster-1',
  current: { vcpu: 4, memory_gib: 8, disk_gib: 50, instance_type: 'cx1.xlarge' },
  recommended: { vcpu: 2, memory_gib: 4, disk_gib: 50, instance_type: 'cx1.large' },
  notifications: [{ code: 64, message: 'Parent idle warning' }],
  business_hours: {
    recommended_vcpu: 3,
    recommended_memory_gib: 6,
    notifications: {
      '82': {
        code: 82,
        message:
          'Business-hours VM sizing uses the namespace office window — overnight batch and off-hours bursts are excluded',
      },
    },
  },
  ...overrides,
});

function renderVm(report: unknown) {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/breakdown',
              search: '?id=web-vm&cluster_uuid=cluster-1&namespace=prod',
              state: {
                vmDetailsState: {
                  cluster_uuid: 'cluster-1',
                  namespace: 'prod',
                  vm_name: 'web-vm',
                  term: 'short_term',
                  engine: 'cost',
                  breadcrumbPath: '/optimizations',
                },
              },
            },
          ]}
        >
          <VmBreakdown queryStateName="vmDetailsState" />
        </MemoryRouter>
      </IntlProvider>
    </Provider>
  );
}

describe('VmBreakdown peak hours', () => {
  beforeEach(() => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRosError.mockReturnValue(undefined);
  });

  test('shows thin Peak hours vCPU/GiB and nest 82 on the card only', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRos.mockReturnValue(vmReport());

    renderVm(vmReport());

    expect(screen.getByTestId('peak-hours-sizing-card')).toBeInTheDocument();
    expect(screen.getByText('3.00')).toBeInTheDocument();
    expect(screen.getByText('6.00 GiB')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Business-hours VM sizing uses the namespace office window — overnight batch and off-hours bursts are excluded'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Parent idle warning')).toBeInTheDocument();
    expect(screen.getByText('cx1.large')).toBeInTheDocument();
  });

  test('does not render nested disk or instance type inside Peak hours', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRos.mockReturnValue(vmReport());

    renderVm(vmReport());

    const card = screen.getByTestId('peak-hours-sizing-card');
    expect(card).not.toHaveTextContent('Disk');
    expect(card).not.toHaveTextContent('Instance type');
    expect(card).not.toHaveTextContent('cx1.large');
  });

  test('hides Peak hours when nest is reason-only', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRos.mockReturnValue(
      vmReport({
        business_hours: { reason: 'Insufficient business-hours data for this term' },
      })
    );

    renderVm({});

    expect(screen.queryByTestId('peak-hours-sizing-card')).not.toBeInTheDocument();
  });

  test('hides Peak hours when nest is absent', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRos.mockReturnValue(vmReport({ business_hours: undefined }));

    renderVm({});

    expect(screen.queryByTestId('peak-hours-sizing-card')).not.toBeInTheDocument();
  });
});
