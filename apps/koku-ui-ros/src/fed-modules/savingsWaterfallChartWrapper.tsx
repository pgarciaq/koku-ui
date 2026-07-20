import React from 'react';
import { SavingsWaterfallChart } from 'routes/optimizations/savingsWaterfallChart';

import { OptimizationsWrapper } from './optimizationsWrapper';

const SavingsWaterfallChartWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <SavingsWaterfallChart />
    </OptimizationsWrapper>
  );
};

export default SavingsWaterfallChartWrapper;
