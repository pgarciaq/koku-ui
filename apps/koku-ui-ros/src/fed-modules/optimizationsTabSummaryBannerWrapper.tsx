import React from 'react';
import type { OptimizationsTabSummaryBannerProps } from 'routes/optimizations/optimizationsTabSummary';
import { OptimizationsTabSummaryBanner } from 'routes/optimizations/optimizationsTabSummary';

import { OptimizationsWrapper } from './optimizationsWrapper';

const OptimizationsTabSummaryBannerWrapper: React.FC<OptimizationsTabSummaryBannerProps> = props => {
  return (
    <OptimizationsWrapper>
      <OptimizationsTabSummaryBanner {...props} />
    </OptimizationsWrapper>
  );
};

export default OptimizationsTabSummaryBannerWrapper;
