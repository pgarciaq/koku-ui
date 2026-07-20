import React from 'react';
import { QualityDashboard } from 'routes/optimizations/qualityDashboard';

import { OptimizationsWrapper } from './optimizationsWrapper';

const QualityDashboardWrapper: React.FC = () => (
  <OptimizationsWrapper>
    <QualityDashboard />
  </OptimizationsWrapper>
);

export default QualityDashboardWrapper;
