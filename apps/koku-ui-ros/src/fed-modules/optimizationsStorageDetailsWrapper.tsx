import React from 'react';
import { OptimizationsStorageDetails } from 'routes/optimizations/optimizationsStorageDetails';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsStorageDetailsOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

const OptimizationsStorageDetailsWrapper: React.FC<OptimizationsStorageDetailsOwnProps> = props => {
  return (
    <OptimizationsWrapper>
      <OptimizationsStorageDetails {...props} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsStorageDetailsWrapper;
