import React from 'react';
import { FleetHeatmap } from 'routes/optimizations/fleetHeatmap';

import { OptimizationsWrapper } from './optimizationsWrapper';

const FleetHeatmapWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <FleetHeatmap />
    </OptimizationsWrapper>
  );
};

export default FleetHeatmapWrapper;
