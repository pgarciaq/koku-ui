import React from 'react';
import { OptimizationsVmsBadge } from 'routes/optimizations/optimizationsVmsBadge';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsVmsBadgeOwnProps {
  cluster?: string | string[];
}

type OptimizationsVmsBadgeProps = OptimizationsVmsBadgeOwnProps;

const OptimizationsVmsBadgeWrapper: React.FC<OptimizationsVmsBadgeProps> = ({
  cluster,
}: OptimizationsVmsBadgeOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsVmsBadge cluster={cluster} count={0} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsVmsBadgeWrapper;
