import { OptimizationsWrapper } from 'fed-modules/optimizationsWrapper';
import { OptimizationsQuotaDetails } from 'routes/optimizations/optimizationsQuotaDetails';
import React from 'react';

export interface OptimizationsQuotaDetailsOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  clusterLinkPath?: string;
  clusterQueryStateName?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

const OptimizationsQuotaDetailsWrapper: React.FC<OptimizationsQuotaDetailsOwnProps> = props => {
  return (
    <OptimizationsWrapper>
      <OptimizationsQuotaDetails {...props} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsQuotaDetailsWrapper;
