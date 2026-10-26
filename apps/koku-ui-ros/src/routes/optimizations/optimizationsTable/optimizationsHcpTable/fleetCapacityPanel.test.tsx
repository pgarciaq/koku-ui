import { render, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';

import type { HcpCapacityRow } from 'api/ros/hcpCapacity';
import { FleetCapacityPanel } from './fleetCapacityPanel';

jest.mock('hooks/useHcpCapacityLatest');

const { useHcpCapacityLatest } = require('hooks/useHcpCapacityLatest');

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

// Healthy Task 2 fixture: request/low/average 7 memory_request, medium 5
// cpu_usage, high 3 cpu_usage; headroom 3/3/3/1/-1 (signed over-capacity).
const healthyScenarios = [
  { name: 'request', max_hcs: 7, limiting_resource: 'memory_request', headroom: 3, status: 'ok' },
  { name: 'low_qps', max_hcs: 7, limiting_resource: 'memory_request', headroom: 3, status: 'ok' },
  { name: 'average_qps', max_hcs: 7, limiting_resource: 'memory_request', headroom: 3, status: 'ok' },
  { name: 'medium_qps', max_hcs: 5, limiting_resource: 'cpu_usage', headroom: 1, status: 'ok' },
  { name: 'high_qps', max_hcs: 3, limiting_resource: 'cpu_usage', headroom: -1, status: 'ok' },
];

const healthyRow: HcpCapacityRow = {
  cluster_uuid: '11111111-1111-1111-1111-111111111111',
  observed_at: '2026-10-25T14:59:59Z',
  mce_sampled_at: null,
  native_model_version: 'hcp-published-sizing-v1',
  source_versions: { operator: 'deadbeef', ocp: '4.22.17', mce: '' },
  collection_interval_minutes: 60,
  upload_cycle_minutes: 360,
  sample_age_seconds: 1800,
  inventory_complete: true,
  worker_placement_known: true,
  current_hc_count: 4,
  ready_hcp_count: 2,
  average_ready_hcp_qps: 300,
  ready_hcp_qps_known: true,
  hosted_availability_basis: 'highly_available',
  pressure_state: 'unknown',
  eligible_workers: { cpu_allocatable_millicores: 64000, memory_allocatable_bytes: 137438953472, max_pods: 1500 },
  scenarios: healthyScenarios,
  mce_references: { request: 8, low_qps: null, average_qps: 8, medium_qps: 4, high_qps: 2 },
  warnings: { stale: false, below_version_floor: false, pressured: false, pressure_unknown: true },
};

const pressuredRow: HcpCapacityRow = {
  ...healthyRow,
  cluster_uuid: '22222222-2222-2222-2222-222222222222',
  pressure_state: 'pressured',
  // API withholds exact headroom under affirmed pressure; maxima stay.
  scenarios: healthyScenarios.map(s => ({ ...s, headroom: null })),
  warnings: { stale: false, below_version_floor: false, pressured: true, pressure_unknown: false },
};

const degradedRow: HcpCapacityRow = {
  ...healthyRow,
  cluster_uuid: '33333333-3333-3333-3333-333333333333',
  // Unknown average QPS: the average scenario has no estimate (empty
  // limiting resource) — it must render unavailable, never 0.
  scenarios: healthyScenarios.map(s =>
    s.name === 'average_qps' ? { ...s, max_hcs: 0, limiting_resource: '', headroom: null } : s
  ),
  warnings: { stale: true, below_version_floor: true, pressured: false, pressure_unknown: false, mce_may_be_stale: true },
};

describe('FleetCapacityPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders one card per management cluster', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: [healthyRow, pressuredRow], fetchStatus: 2 });

    render(<FleetCapacityPanel />, { wrapper });

    expect(screen.getByText('11111111-1111-1111-1111-111111111111')).toBeInTheDocument();
    expect(screen.getByText('22222222-2222-2222-2222-222222222222')).toBeInTheDocument();
  });

  it('renders the five scenarios with values, headroom, and source labels', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: [healthyRow], fetchStatus: 2 });

    render(<FleetCapacityPanel />, { wrapper });

    expect(screen.getByText('Request-based')).toBeInTheDocument();
    expect(screen.getByText('Low API load')).toBeInTheDocument();
    expect(screen.getByText('Average API load')).toBeInTheDocument();
    expect(screen.getByText('Medium API load')).toBeInTheDocument();
    expect(screen.getByText('High API load')).toBeInTheDocument();
    // Values and signed headroom (over-capacity stays negative).
    expect(screen.getAllByText('7').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+3').length).toBeGreaterThan(0);
    expect(screen.getByText('-1')).toBeInTheDocument();
    // Source labels.
    expect(screen.getByText(/4\.22\.17/)).toBeInTheDocument();
    expect(screen.getByText(/deadbeef/)).toBeInTheDocument();
  });

  it('keeps unavailable scenarios unavailable, never zero-filled', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: [degradedRow], fetchStatus: 2 });

    const { container } = render(<FleetCapacityPanel />, { wrapper });

    // The average scenario renders the unavailable marker next to its
    // label, not a bogus 0 maximum.
    const averageLabel = screen.getByText('Average API load');
    expect(averageLabel).toBeInTheDocument();
    const scenarioLine = averageLabel.closest('div');
    expect(scenarioLine.textContent).toContain('—');
    expect(screen.queryByText('0 hosted clusters')).not.toBeInTheDocument();
  });

  it('hides exact headroom under affirmed pressure', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: [pressuredRow], fetchStatus: 2 });

    render(<FleetCapacityPanel />, { wrapper });

    // The pressured card never shows a +N figure...
    expect(screen.queryByText('+3')).not.toBeInTheDocument();
    // ...while its scenario maxima still render.
    expect(screen.getAllByText('7').length).toBeGreaterThan(0);
  });

  it('shows the pressure-unknown caution explicitly', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: [healthyRow], fetchStatus: 2 });

    render(<FleetCapacityPanel />, { wrapper });

    expect(screen.getByText(/Node pressure unknown/i)).toBeInTheDocument();
  });

  it('renders stale, below-floor, and MCE-may-be-stale cautions', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: [degradedRow], fetchStatus: 2 });

    render(<FleetCapacityPanel />, { wrapper });

    expect(screen.getByText(/Snapshot is stale/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.17 floor/i)).toBeInTheDocument();
    expect(screen.getByText(/MCE references may be stale/i)).toBeInTheDocument();
  });

  it('renders nothing without rows (fetch failed or no capacity data)', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: undefined, fetchStatus: 0 });

    const { container } = render(<FleetCapacityPanel />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing while loading', () => {
    useHcpCapacityLatest.mockReturnValue({ rows: undefined, fetchStatus: 1 });

    const { container } = render(<FleetCapacityPanel />, { wrapper });
    expect(container.firstChild).toBeNull();
  });
});
