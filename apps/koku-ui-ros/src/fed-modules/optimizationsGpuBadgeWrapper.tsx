import React from 'react';
import { OptimizationsGpuBadge } from 'routes/optimizations/optimizationsGpuBadge';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsGpuBadgeOwnProps {
  cluster?: string | string[];
}

type OptimizationsGpuBadgeProps = OptimizationsGpuBadgeOwnProps;

const OptimizationsGpuBadgeWrapper: React.FC<OptimizationsGpuBadgeProps> = ({
  cluster,
}: OptimizationsGpuBadgeOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsGpuBadge cluster={cluster} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsGpuBadgeWrapper;
