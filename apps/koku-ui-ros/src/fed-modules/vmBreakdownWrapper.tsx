import React from 'react';
import { VmBreakdown } from 'routes/optimizations/optimizationsBreakdown/vmBreakdown';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface VmBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

type VmBreakdownProps = VmBreakdownOwnProps;

const VmBreakdownWrapper: React.FC<VmBreakdownProps> = ({
  linkState,
  projectPath,
  queryStateName,
}: VmBreakdownOwnProps) => {
  return (
    <OptimizationsWrapper>
      <VmBreakdown linkState={linkState} projectPath={projectPath} queryStateName={queryStateName} />
    </OptimizationsWrapper>
  );
};

export default VmBreakdownWrapper;
