import React, { Suspense } from 'react';

import { OptimizationsWrapper } from './optimizationsWrapper';

const ContainersTable = React.lazy(
  () => import('routes/optimizations/optimizationsTable/optimizationsContainersTable/optimizationsContainersTable')
);
const NamespacesTable = React.lazy(
  () => import('routes/optimizations/optimizationsTable/optimizationsNamespacesTable/optimizationsNamespacesTable')
);
const NodesTable = React.lazy(
  () => import('routes/optimizations/optimizationsTable/optimizationsNodesTable/optimizationsNodesTable')
);
const ProjectsTable = React.lazy(
  () => import('routes/optimizations/optimizationsTable/optimizationsProjectsTable/optimizationsProjectsTable')
);
const VmsTable = React.lazy(
  () => import('routes/optimizations/optimizationsTable/optimizationsVmsTable/optimizationsVmsTable')
);

const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  containers: ContainersTable,
  namespaces: NamespacesTable,
  nodes: NodesTable,
  projects: ProjectsTable,
  vms: VmsTable,
};

export interface OptimizationsTableWrapperProps {
  type?: string;
  [key: string]: any;
}

const OptimizationsTableWrapper: React.FC<OptimizationsTableWrapperProps> = ({ type = 'containers', ...rest }) => {
  const Component = componentMap[type];

  if (!Component) {
    return null;
  }

  return (
    <OptimizationsWrapper>
      <Suspense fallback={null}>
        <Component {...rest} />
      </Suspense>
    </OptimizationsWrapper>
  );
};

export default OptimizationsTableWrapper;
