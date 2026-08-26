import { render, screen, within } from '@testing-library/react';
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

jest.mock('./nodeVisualInsightsSection', () => ({
  NodeVisualInsightsSection: () => null,
}));

jest.mock('../shared/breakdownDecayInfoCard', () => ({
  BreakdownDecayInfoCard: () => null,
}));

import { configureStore } from '@reduxjs/toolkit';

import NodeBreakdown from './nodeBreakdown';

function createTestStore() {
  return configureStore({
    reducer: { ros: (state = {}) => state },
    middleware: gDM => gDM({ serializableCheck: false, immutableCheck: false }),
  });
}

const nodeReport = (overrides: Record<string, unknown> = {}) => ({
  node: 'worker-1',
  cluster_uuid: 'cluster-1',
  classification: { category: 'underutilized' },
  notifications: { '11': { code: 11, message: 'Parent engine warning' } },
  recommendation_terms: {
    short_term: {
      recommendation_engines: {
        cost: {
          recommended_cpu_cores: 8,
          recommended_memory_gib: 32,
          estimated_monthly_savings: { value: '10.00', units: 'USD' },
          business_hours: {
            recommended_cpu_cores: 4,
            recommended_memory_gib: 16,
            notifications: {
              '79': {
                code: 79,
                message: 'Business-hours node sizing is not peak-safe — overnight spikes outside the cluster schedule are excluded',
              },
            },
          },
        },
      },
    },
  },
  ...overrides,
});

function renderNode(report: unknown, search = '?id=worker-1') {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/breakdown',
              search,
              state: {
                nodeDetailsState: {
                  term: 'short_term',
                  engine: 'cost',
                  breadcrumbPath: '/optimizations',
                },
              },
            },
          ]}
        >
          <NodeBreakdown queryStateName="nodeDetailsState" />
        </MemoryRouter>
      </IntlProvider>
    </Provider>
  );
}

describe('NodeBreakdown peak hours', () => {
  beforeEach(() => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRosError.mockReturnValue(undefined);
  });

  test('shows Peak hours cores/GiB and nest 79 on the card only', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRos.mockReturnValue(nodeReport());

    renderNode(nodeReport());

    const card = screen.getByTestId('peak-hours-sizing-card');
    expect(within(card).getByText('4.00 cores')).toBeInTheDocument();
    expect(within(card).getByText('16.00 GiB')).toBeInTheDocument();
    expect(
      within(card).getByText(
        'Business-hours node sizing is not peak-safe — overnight spikes outside the cluster schedule are excluded'
      )
    ).toBeInTheDocument();
    expect(within(card).queryByText('Parent engine warning')).not.toBeInTheDocument();
    expect(screen.getByText('Parent engine warning')).toBeInTheDocument();
  });

  test('hides Peak hours when nest is reason-only', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRos.mockReturnValue(
      nodeReport({
        recommendation_terms: {
          short_term: {
            recommendation_engines: {
              cost: {
                recommended_cpu_cores: 8,
                recommended_memory_gib: 32,
                business_hours: { reason: 'Insufficient business-hours data for this term' },
              },
            },
          },
        },
      })
    );

    renderNode({});

    expect(screen.queryByTestId('peak-hours-sizing-card')).not.toBeInTheDocument();
  });

  test('hides Peak hours when nest is absent', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRos.mockReturnValue(
      nodeReport({
        recommendation_terms: {
          short_term: {
            recommendation_engines: {
              cost: {
                recommended_cpu_cores: 8,
                recommended_memory_gib: 32,
              },
            },
          },
        },
      })
    );

    renderNode({});

    expect(screen.queryByTestId('peak-hours-sizing-card')).not.toBeInTheDocument();
  });
});
