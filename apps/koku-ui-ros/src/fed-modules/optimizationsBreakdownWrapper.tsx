import React, { Suspense } from 'react';

import { OptimizationsWrapper } from './optimizationsWrapper';

const ContainerBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/optimizationsBreakdown')
);
const ClusterQuotaBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/clusterQuotaBreakdown/clusterQuotaBreakdown')
);
const GpuMigBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/gpuMigBreakdown/gpuMigBreakdown')
);
const GpuTimeslicingBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/gpuTimeslicingBreakdown/gpuTimeslicingBreakdown')
);
const NamespaceBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/namespaceBreakdown/namespaceBreakdown')
);
const NodeBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/nodeBreakdown/nodeBreakdown')
);
const OcpBreakdown = React.lazy(() => import('routes/optimizations/optimizationsOcpBreakdown/optimizationsOcpBreakdown'));
const PvcBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/pvcBreakdown/pvcBreakdown')
);
const QuotaBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/quotaBreakdown/quotaBreakdown')
);
const VmBreakdown = React.lazy(
  () => import('routes/optimizations/optimizationsBreakdown/vmBreakdown/vmBreakdown')
);

const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  container: ContainerBreakdown,
  'cluster-quota': ClusterQuotaBreakdown,
  'gpu-mig': GpuMigBreakdown,
  'gpu-timeslicing': GpuTimeslicingBreakdown,
  namespace: NamespaceBreakdown,
  node: NodeBreakdown,
  ocp: OcpBreakdown,
  pvc: PvcBreakdown,
  quota: QuotaBreakdown,
  vm: VmBreakdown,
};

export interface OptimizationsBreakdownWrapperProps {
  type?: string;
  [key: string]: any;
}

const OptimizationsBreakdownWrapper: React.FC<OptimizationsBreakdownWrapperProps> = ({ type = 'container', ...rest }) => {
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

export default OptimizationsBreakdownWrapper;
