import React from 'react';
import { FleetSummaryCards } from 'routes/optimizations/fleetSummaryCards';

import { OptimizationsWrapper } from './optimizationsWrapper';

const FleetSummaryCardsWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <FleetSummaryCards />
    </OptimizationsWrapper>
  );
};

export default FleetSummaryCardsWrapper;
