import { OptimizationsWrapper } from 'fed-modules/optimizationsWrapper';
import { OptimizationsQuotaBadge } from 'routes/optimizations/optimizationsQuotaBadge';
import React from 'react';

const OptimizationsQuotaBadgeWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <OptimizationsQuotaBadge />
    </OptimizationsWrapper>
  );
};

export default OptimizationsQuotaBadgeWrapper;
