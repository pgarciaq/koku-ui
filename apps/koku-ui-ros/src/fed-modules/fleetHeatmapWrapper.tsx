import React from 'react';
import { FleetHeatmap } from 'routes/optimizations/fleetHeatmap';

import { OptimizationsWrapper } from './optimizationsWrapper';

interface FleetHeatmapWrapperProps {
  breadcrumbLabel?: string;
  linkPath?: string;
}

const FleetHeatmapWrapper: React.FC<FleetHeatmapWrapperProps> = ({ breadcrumbLabel, linkPath }) => {
  return (
    <OptimizationsWrapper>
      <FleetHeatmap breadcrumbLabel={breadcrumbLabel} linkPath={linkPath} />
    </OptimizationsWrapper>
  );
};

export default FleetHeatmapWrapper;
