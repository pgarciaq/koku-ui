import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('./optimizationsWrapper', () => ({
  OptimizationsWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="wrapper">{children}</div>,
}));

jest.mock('routes/optimizations/optimizationsBreakdown/optimizationsBreakdown', () => {
  const MockContainer = (props: any) => <div data-testid="container-breakdown">Container: {props.queryStateName}</div>;
  MockContainer.displayName = 'MockContainerBreakdown';
  return { __esModule: true, default: MockContainer };
});

jest.mock('routes/optimizations/optimizationsBreakdown/gpuMigBreakdown/gpuMigBreakdown', () => {
  const MockGpuMig = (props: any) => <div data-testid="gpu-mig-breakdown">GpuMig: {props.queryStateName}</div>;
  MockGpuMig.displayName = 'MockGpuMigBreakdown';
  return { __esModule: true, default: MockGpuMig };
});

jest.mock('routes/optimizations/optimizationsBreakdown/gpuTimeslicingBreakdown/gpuTimeslicingBreakdown', () => {
  const MockGpuTs = (props: any) => (
    <div data-testid="gpu-timeslicing-breakdown">GpuTimeslicing: {props.queryStateName}</div>
  );
  MockGpuTs.displayName = 'MockGpuTimeslicingBreakdown';
  return { __esModule: true, default: MockGpuTs };
});

jest.mock('routes/optimizations/optimizationsBreakdown/namespaceBreakdown/namespaceBreakdown', () => {
  const Mock = () => <div data-testid="namespace-breakdown">Namespace</div>;
  Mock.displayName = 'MockNamespaceBreakdown';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsBreakdown/nodeBreakdown/nodeBreakdown', () => {
  const Mock = () => <div data-testid="node-breakdown">Node</div>;
  Mock.displayName = 'MockNodeBreakdown';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsOcpBreakdown/optimizationsOcpBreakdown', () => {
  const Mock = () => <div data-testid="ocp-breakdown">OCP</div>;
  Mock.displayName = 'MockOcpBreakdown';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsBreakdown/pvcBreakdown/pvcBreakdown', () => {
  const Mock = () => <div data-testid="pvc-breakdown">PVC</div>;
  Mock.displayName = 'MockPvcBreakdown';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsBreakdown/quotaBreakdown/quotaBreakdown', () => {
  const Mock = () => <div data-testid="quota-breakdown">Quota</div>;
  Mock.displayName = 'MockQuotaBreakdown';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsBreakdown/clusterQuotaBreakdown/clusterQuotaBreakdown', () => {
  const Mock = () => <div data-testid="cluster-quota-breakdown">ClusterQuota</div>;
  Mock.displayName = 'MockClusterQuotaBreakdown';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsBreakdown/vmBreakdown/vmBreakdown', () => {
  const Mock = () => <div data-testid="vm-breakdown">VM</div>;
  Mock.displayName = 'MockVmBreakdown';
  return { __esModule: true, default: Mock };
});

import OptimizationsBreakdownWrapper from './optimizationsBreakdownWrapper';

describe('OptimizationsBreakdownWrapper', () => {
  test('defaults to container breakdown when no type is provided', async () => {
    render(<OptimizationsBreakdownWrapper queryStateName="test" />);
    expect(await screen.findByTestId('container-breakdown')).toBeInTheDocument();
    expect(screen.getByText('Container: test')).toBeInTheDocument();
  });

  test('renders gpu-mig breakdown when type="gpu-mig"', async () => {
    render(<OptimizationsBreakdownWrapper type="gpu-mig" queryStateName="migState" />);
    expect(await screen.findByTestId('gpu-mig-breakdown')).toBeInTheDocument();
    expect(screen.getByText('GpuMig: migState')).toBeInTheDocument();
  });

  test('renders gpu-timeslicing breakdown when type="gpu-timeslicing"', async () => {
    render(<OptimizationsBreakdownWrapper type="gpu-timeslicing" queryStateName="tsState" />);
    expect(await screen.findByTestId('gpu-timeslicing-breakdown')).toBeInTheDocument();
    expect(screen.getByText('GpuTimeslicing: tsState')).toBeInTheDocument();
  });

  test('renders namespace breakdown when type="namespace"', async () => {
    render(<OptimizationsBreakdownWrapper type="namespace" queryStateName="ns" />);
    expect(await screen.findByTestId('namespace-breakdown')).toBeInTheDocument();
  });

  test('renders node breakdown when type="node"', async () => {
    render(<OptimizationsBreakdownWrapper type="node" queryStateName="nd" />);
    expect(await screen.findByTestId('node-breakdown')).toBeInTheDocument();
  });

  test('renders pvc breakdown when type="pvc"', async () => {
    render(<OptimizationsBreakdownWrapper type="pvc" queryStateName="pvc" />);
    expect(await screen.findByTestId('pvc-breakdown')).toBeInTheDocument();
  });

  test('renders quota breakdown when type="quota"', async () => {
    render(<OptimizationsBreakdownWrapper type="quota" queryStateName="q" />);
    expect(await screen.findByTestId('quota-breakdown')).toBeInTheDocument();
  });

  test('renders cluster-quota breakdown when type="cluster-quota"', async () => {
    render(<OptimizationsBreakdownWrapper type="cluster-quota" queryStateName="cq" />);
    expect(await screen.findByTestId('cluster-quota-breakdown')).toBeInTheDocument();
  });

  test('renders vm breakdown when type="vm"', async () => {
    render(<OptimizationsBreakdownWrapper type="vm" queryStateName="vm" />);
    expect(await screen.findByTestId('vm-breakdown')).toBeInTheDocument();
  });

  test('renders ocp breakdown when type="ocp"', async () => {
    render(<OptimizationsBreakdownWrapper type="ocp" queryStateName="ocp" />);
    expect(await screen.findByTestId('ocp-breakdown')).toBeInTheDocument();
  });

  test('renders null for unknown type', () => {
    const { container } = render(<OptimizationsBreakdownWrapper type="unknown" queryStateName="x" />);
    expect(container.innerHTML).toBe('');
  });

  test('wraps content in OptimizationsWrapper', async () => {
    render(<OptimizationsBreakdownWrapper type="container" queryStateName="w" />);
    expect(await screen.findByTestId('wrapper')).toBeInTheDocument();
  });
});
