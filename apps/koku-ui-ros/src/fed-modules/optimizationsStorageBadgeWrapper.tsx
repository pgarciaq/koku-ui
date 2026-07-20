import React from 'react';
import { OptimizationsStorageBadge } from 'routes/optimizations/optimizationsStorageBadge';

import { OptimizationsWrapper } from './optimizationsWrapper';

const OptimizationsStorageBadgeWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <OptimizationsStorageBadge />
    </OptimizationsWrapper>
  );
};

export default OptimizationsStorageBadgeWrapper;
