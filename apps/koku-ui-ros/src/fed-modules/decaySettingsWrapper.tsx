import React from 'react';
import { DecaySettings } from 'routes/optimizations/settings';

import { OptimizationsWrapper } from './optimizationsWrapper';

const DecaySettingsWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <DecaySettings />
    </OptimizationsWrapper>
  );
};

export default DecaySettingsWrapper;
