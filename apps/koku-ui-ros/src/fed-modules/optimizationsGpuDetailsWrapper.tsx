import React from 'react';
import { OptimizationsGpuDetails } from 'routes/optimizations/optimizationsTable';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsGpuDetailsOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

const OptimizationsGpuDetailsWrapper: React.FC<OptimizationsGpuDetailsOwnProps> = props => {
  return (
    <OptimizationsWrapper>
      <OptimizationsGpuDetails {...props} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsGpuDetailsWrapper;
