import React from 'react';
import PvcBreakdown from 'routes/optimizations/optimizationsBreakdown/pvcBreakdown/pvcBreakdown';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface PvcBreakdownOwnProps {
  linkState?: any;
  queryStateName: string;
}

const PvcBreakdownWrapper: React.FC<PvcBreakdownOwnProps> = ({ linkState, queryStateName }) => {
  return (
    <OptimizationsWrapper>
      <PvcBreakdown linkState={linkState} queryStateName={queryStateName} />
    </OptimizationsWrapper>
  );
};

export default PvcBreakdownWrapper;
