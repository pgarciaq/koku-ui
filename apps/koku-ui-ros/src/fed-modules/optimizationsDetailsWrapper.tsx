import React from 'react';
import { OptimizationsDetailsTitle } from 'routes/optimizations/optimizationsDetails';

import { OptimizationsWrapper } from './optimizationsWrapper';

const OptimizationsDetailsWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <OptimizationsDetailsTitle />
    </OptimizationsWrapper>
  );
};

export default OptimizationsDetailsWrapper;
