import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('./optimizationsWrapper', () => ({
  OptimizationsWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="wrapper">{children}</div>,
}));

jest.mock('routes/optimizations/optimizationsTable/optimizationsContainersTable/optimizationsContainersTable', () => {
  const Mock = (props: any) => <div data-testid="containers-table">Containers: {props.queryStateName}</div>;
  Mock.displayName = 'MockContainersTable';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsTable/optimizationsNamespacesTable/optimizationsNamespacesTable', () => {
  const Mock = (props: any) => <div data-testid="namespaces-table">Namespaces: {props.queryStateName}</div>;
  Mock.displayName = 'MockNamespacesTable';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsTable/optimizationsNodesTable/optimizationsNodesTable', () => {
  const Mock = (props: any) => <div data-testid="nodes-table">Nodes: {props.queryStateName}</div>;
  Mock.displayName = 'MockNodesTable';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsTable/optimizationsProjectsTable/optimizationsProjectsTable', () => {
  const Mock = (props: any) => <div data-testid="projects-table">Projects: {props.queryStateName}</div>;
  Mock.displayName = 'MockProjectsTable';
  return { __esModule: true, default: Mock };
});

jest.mock('routes/optimizations/optimizationsTable/optimizationsVmsTable/optimizationsVmsTable', () => {
  const Mock = (props: any) => <div data-testid="vms-table">Vms: {props.queryStateName}</div>;
  Mock.displayName = 'MockVmsTable';
  return { __esModule: true, default: Mock };
});

import OptimizationsTableWrapper from './optimizationsTableWrapper';

describe('OptimizationsTableWrapper', () => {
  test('defaults to containers table when no type is provided', async () => {
    render(<OptimizationsTableWrapper queryStateName="test" />);
    expect(await screen.findByTestId('containers-table')).toBeInTheDocument();
    expect(screen.getByText('Containers: test')).toBeInTheDocument();
  });

  test('renders containers table when type="containers"', async () => {
    render(<OptimizationsTableWrapper type="containers" queryStateName="ctr" />);
    expect(await screen.findByTestId('containers-table')).toBeInTheDocument();
    expect(screen.getByText('Containers: ctr')).toBeInTheDocument();
  });

  test('renders namespaces table when type="namespaces"', async () => {
    render(<OptimizationsTableWrapper type="namespaces" queryStateName="ns" />);
    expect(await screen.findByTestId('namespaces-table')).toBeInTheDocument();
    expect(screen.getByText('Namespaces: ns')).toBeInTheDocument();
  });

  test('renders nodes table when type="nodes"', async () => {
    render(<OptimizationsTableWrapper type="nodes" queryStateName="nd" />);
    expect(await screen.findByTestId('nodes-table')).toBeInTheDocument();
    expect(screen.getByText('Nodes: nd')).toBeInTheDocument();
  });

  test('renders projects table when type="projects"', async () => {
    render(<OptimizationsTableWrapper type="projects" queryStateName="proj" />);
    expect(await screen.findByTestId('projects-table')).toBeInTheDocument();
    expect(screen.getByText('Projects: proj')).toBeInTheDocument();
  });

  test('renders vms table when type="vms"', async () => {
    render(<OptimizationsTableWrapper type="vms" queryStateName="vm" />);
    expect(await screen.findByTestId('vms-table')).toBeInTheDocument();
    expect(screen.getByText('Vms: vm')).toBeInTheDocument();
  });

  test('renders null for unknown type', () => {
    const { container } = render(<OptimizationsTableWrapper type="unknown" queryStateName="x" />);
    expect(container.innerHTML).toBe('');
  });

  test('wraps content in OptimizationsWrapper', async () => {
    render(<OptimizationsTableWrapper type="containers" queryStateName="w" />);
    expect(await screen.findByTestId('wrapper')).toBeInTheDocument();
  });
});
