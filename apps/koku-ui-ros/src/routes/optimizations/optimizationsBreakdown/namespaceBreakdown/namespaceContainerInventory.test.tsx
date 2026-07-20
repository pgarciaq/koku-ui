import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

jest.mock('store/ros', () => ({
  rosActions: { fetchRosReport: jest.fn(() => ({ type: 'MOCK_FETCH' })) },
  rosSelectors: {
    selectRos: jest.fn(() => undefined),
    selectRosFetchStatus: jest.fn(() => 2),
    selectRosError: jest.fn(() => undefined),
  },
}));

jest.mock('utils/dates', () => ({
  getTimeFromNow: jest.fn(() => '1 day ago'),
}));

jest.mock('routes/components/page/noOptimizations/noOptimizationsState', () => ({
  NoOptimizationsState: () => <div data-testid="no-optimizations">No optimizations available</div>,
}));

jest.mock('routes/components/state/loadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

jest.mock('routes/components/dataTable', () => ({
  DataTable: ({ columns, rows }: any) => (
    <table data-testid="data-table">
      <thead>
        <tr>
          {columns?.map((col: any, i: number) => (
            <th key={i}>{col.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows?.map((row: any, i: number) => (
          <tr key={i}>
            {row.cells?.map((cell: any, j: number) => (
              <td key={j}>{cell.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

jest.mock('../../optimizationsTable/utils', () => ({
  getRequestProps: jest.fn(() => ({
    cpuRequestCurrent: '100m',
    cpuVariation: '+50m',
    memoryRequestCurrent: '256Mi',
    memoryVariation: '-64Mi',
  })),
}));

import { configureStore } from '@reduxjs/toolkit';

import { NamespaceContainerInventory } from './namespaceContainerInventory';

function createTestStore() {
  return configureStore({
    reducer: { ros: (state = {}) => state },
    middleware: gDM => gDM({ serializableCheck: false, immutableCheck: false }),
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <IntlProvider locale="en">
        <MemoryRouter>{ui}</MemoryRouter>
      </IntlProvider>
    </Provider>
  );
}

describe('NamespaceContainerInventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders section title with helper popover icon', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({ meta: { count: 0 }, data: [] });

    renderWithProviders(<NamespaceContainerInventory namespace="my-project" />);

    expect(screen.getByText('Container recommendations in this namespace')).toBeInTheDocument();
  });

  test('renders loading state when fetch is in progress', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(1);
    rosSelectors.selectRos.mockReturnValue(undefined);

    renderWithProviders(<NamespaceContainerInventory namespace="my-project" />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  test('renders empty state when no containers have recommendations', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({ meta: { count: 0 }, data: [] });

    renderWithProviders(<NamespaceContainerInventory namespace="my-project" />);

    expect(screen.getByTestId('no-optimizations')).toBeInTheDocument();
  });

  test('renders container data when recommendations exist', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      meta: { count: 2, limit: 10, offset: 0 },
      data: [
        {
          id: 'rec-1',
          container: 'web-server',
          project: 'my-project',
          workload: 'deployment-web',
          workload_type: 'Deployment',
          last_reported: '2026-06-29T12:00:00Z',
          recommendations: {
            estimated_monthly_savings: { value: '15.50', units: 'USD' },
          },
        },
        {
          id: 'rec-2',
          container: 'sidecar',
          project: 'my-project',
          workload: 'deployment-web',
          workload_type: 'Deployment',
          last_reported: '2026-06-29T12:00:00Z',
          recommendations: {
            estimated_monthly_savings: { value: '3.20', units: 'USD' },
          },
        },
      ],
    });

    renderWithProviders(<NamespaceContainerInventory namespace="my-project" />);

    expect(screen.getByText('web-server')).toBeInTheDocument();
    expect(screen.getByText('sidecar')).toBeInTheDocument();
    expect(screen.getByText('$15.50 USD')).toBeInTheDocument();
    expect(screen.getByText('$3.20 USD')).toBeInTheDocument();
  });

  test('renders container name as link when breakdownPath is provided', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      meta: { count: 1, limit: 10, offset: 0 },
      data: [
        {
          id: 'rec-1',
          container: 'web-server',
          project: 'my-project',
          workload: 'deployment-web',
          workload_type: 'Deployment',
          last_reported: '2026-06-29T12:00:00Z',
          recommendations: {
            estimated_monthly_savings: { value: '5.00', units: 'USD' },
          },
        },
      ],
    });

    renderWithProviders(
      <NamespaceContainerInventory
        breakdownPath="/optimizations/breakdown"
        namespace="my-project"
      />
    );

    const link = screen.getByRole('link', { name: 'web-server' });
    expect(link).toBeInTheDocument();
  });

  test('renders dash when savings data is not available', () => {
    const { rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue({
      meta: { count: 1, limit: 10, offset: 0 },
      data: [
        {
          id: 'rec-1',
          container: 'no-savings-ctr',
          project: 'my-project',
          workload: 'deployment-x',
          workload_type: 'Deployment',
          last_reported: '2026-06-29T12:00:00Z',
          recommendations: {},
        },
      ],
    });

    renderWithProviders(<NamespaceContainerInventory namespace="my-project" />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('dispatches fetch with project filter', () => {
    const { rosActions, rosSelectors } = require('store/ros');
    rosSelectors.selectRosFetchStatus.mockReturnValue(2);
    rosSelectors.selectRos.mockReturnValue(undefined);
    rosSelectors.selectRosError.mockReturnValue(undefined);

    renderWithProviders(
      <NamespaceContainerInventory namespace="my-project" clusterUuid="cluster-123" />
    );

    expect(rosActions.fetchRosReport).toHaveBeenCalled();
    const queryString = rosActions.fetchRosReport.mock.calls[0][2];
    expect(queryString).toContain('project=my-project');
    expect(queryString).toContain('cluster=cluster-123');
  });
});
