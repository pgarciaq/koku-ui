import React from 'react';
import { OptimizationsHcpBadge } from 'routes/optimizations/optimizationsHcpBadge';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsHcpBadgeOwnProps {
  cluster?: string | string[]; // Cluster name to filter by
}

type OptimizationsHcpBadgeProps = OptimizationsHcpBadgeOwnProps;

const OptimizationsHcpBadgeWrapper: React.FC<OptimizationsHcpBadgeProps> = ({
  cluster,
}: OptimizationsHcpBadgeOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsHcpBadge cluster={cluster} count={0} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsHcpBadgeWrapper;
