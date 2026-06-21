import React from 'react';
import { OptimizationsNamespacesBadge } from 'routes/optimizations/optimizationsNamespacesBadge';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsNamespacesBadgeOwnProps {
  cluster?: string | string[]; // Cluster name to filter by
}

type OptimizationsNamespacesBadgeProps = OptimizationsNamespacesBadgeOwnProps;

const OptimizationsNamespacesBadgeWrapper: React.FC<OptimizationsNamespacesBadgeProps> = ({
  cluster,
}: OptimizationsNamespacesBadgeOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsNamespacesBadge cluster={cluster} count={0} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsNamespacesBadgeWrapper;
