import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import { FleetHeatmap } from './fleetHeatmap';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('hooks/useFleetHeatmap');

const { useFleetHeatmap } = require('hooks/useFleetHeatmap');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

const makeNode = (overrides: Record<string, any> = {}) => ({
  node: 'node-1',
  cluster_uuid: 'c-uuid-1',
  cluster_alias: 'test-cluster',
  machineset_name: 'ms-workers',
  instance_type: 'm5.xlarge',
  cpu_util_p95: 0.72,
  mem_util_p95: 0.45,
  idle_state: 'active',
  utilization_band: 'healthy',
  node_count_reduction: 0,
  estimated_savings_cents: 0,
  ...overrides,
});

describe('FleetHeatmap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders skeleton during loading', () => {
    useFleetHeatmap.mockReturnValue({
      data: undefined,
      fetchStatus: 1, // FetchStatus.inProgress
    });

    const { container } = render(<FleetHeatmap />, { wrapper });
    const skeletons = container.querySelectorAll('.pf-v6-c-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders nothing on error', () => {
    useFleetHeatmap.mockReturnValue({
      data: undefined,
      fetchStatus: 0, // FetchStatus.none
      error: 'Network error',
    });

    const { container } = render(<FleetHeatmap />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders empty state when no nodes', () => {
    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 0, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: null, data_window: '7 days' }, data: [] },
      fetchStatus: 2, // FetchStatus.complete
    });

    render(<FleetHeatmap />, { wrapper });
    expect(screen.getByText('No node data available')).toBeTruthy();
  });

  it('renders cells grouped by MachineSet', () => {
    const nodes = [
      makeNode({ node: 'n-1', machineset_name: 'ms-infra' }),
      makeNode({ node: 'n-2', machineset_name: 'ms-infra' }),
      makeNode({ node: 'n-3', machineset_name: 'ms-workers' }),
    ];

    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 3, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: nodes },
      fetchStatus: 2,
    });

    const { container } = render(<FleetHeatmap />, { wrapper });
    const cells = container.querySelectorAll('[role="button"]');
    expect(cells.length).toBe(3);

    expect(screen.getAllByText('ms-infra').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ms-workers').length).toBeGreaterThan(0);
  });

  it('shows "Ungrouped" for nodes without MachineSet', () => {
    const nodes = [makeNode({ node: 'n-solo', machineset_name: '' })];

    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 1, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: nodes },
      fetchStatus: 2,
    });

    render(<FleetHeatmap />, { wrapper });
    expect(screen.getAllByText('Ungrouped').length).toBeGreaterThan(0);
  });

  it('navigates to node breakdown on cell click with linkPath', () => {
    const nodes = [makeNode({ node: 'my-node', cluster_uuid: 'my-cluster' })];

    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 1, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: nodes },
      fetchStatus: 2,
    });

    const linkPath = '/openshift/cost-management/optimizations/node-breakdown';
    const breadcrumbLabel = 'Back to optimizations';

    const { container } = render(
      <FleetHeatmap linkPath={linkPath} breadcrumbLabel={breadcrumbLabel} />,
      { wrapper }
    );
    const cell = container.querySelector('[role="button"]');
    fireEvent.click(cell!);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/openshift/cost-management/optimizations/node-breakdown?breadcrumb_label=Back%20to%20optimizations&breakdown_title=my-node&id=my-node'
    );
  });

  it('falls back to default path when linkPath is not provided', () => {
    const nodes = [makeNode({ node: 'my-node', cluster_uuid: 'my-cluster' })];

    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 1, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: nodes },
      fetchStatus: 2,
    });

    const { container } = render(<FleetHeatmap />, { wrapper });
    const cell = container.querySelector('[role="button"]');
    fireEvent.click(cell!);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/optimizations/node-breakdown?breakdown_title=my-node&id=my-node'
    );
  });

  it('renders the legend with all band labels', () => {
    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 1, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: [makeNode()] },
      fetchStatus: 2,
    });

    render(<FleetHeatmap />, { wrapper });
    expect(screen.getByText('Idle')).toBeTruthy();
    expect(screen.getByText('Low')).toBeTruthy();
    expect(screen.getByText('Moderate')).toBeTruthy();
    expect(screen.getByText('Healthy')).toBeTruthy();
    expect(screen.getByText('Hot')).toBeTruthy();
  });

  it('renders metric toggle', () => {
    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 1, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: [makeNode()] },
      fetchStatus: 2,
    });

    render(<FleetHeatmap />, { wrapper });
    expect(screen.getByText('CPU utilization')).toBeTruthy();
    expect(screen.getByText('Memory utilization')).toBeTruthy();
  });

  it('shows "Show all" toggle for large fleets', () => {
    const nodes = Array.from({ length: 150 }, (_, i) =>
      makeNode({ node: `node-${i}`, cpu_util_p95: i / 150 })
    );

    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 150, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: nodes },
      fetchStatus: 2,
    });

    const { container } = render(<FleetHeatmap />, { wrapper });

    const cells = container.querySelectorAll('[role="button"]');
    expect(cells.length).toBe(100);

    expect(screen.getByText(/Show all.*150/)).toBeTruthy();
  });

  it('renders accessible data table', () => {
    const nodes = [makeNode()];

    useFleetHeatmap.mockReturnValue({
      data: { meta: { count: 1, metric: 'cpu', term: 'medium', engine: 'cost', latest_update: '2026-07-01', data_window: '7 days' }, data: nodes },
      fetchStatus: 2,
    });

    const { container } = render(<FleetHeatmap />, { wrapper });
    const table = container.querySelector('table[role="table"]');
    expect(table).toBeTruthy();
    expect(table?.querySelector('caption')?.textContent).toBe('Node fleet utilization data');
  });
});
