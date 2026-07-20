import React from 'react';
import { OptimizationsNodesBadge } from 'routes/optimizations/optimizationsNodesBadge';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsNodesBadgeOwnProps {
  cluster?: string | string[];
}

type OptimizationsNodesBadgeProps = OptimizationsNodesBadgeOwnProps;

const OptimizationsNodesBadgeWrapper: React.FC<OptimizationsNodesBadgeProps> = ({
  cluster,
}: OptimizationsNodesBadgeOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsNodesBadge cluster={cluster} count={0} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsNodesBadgeWrapper;
