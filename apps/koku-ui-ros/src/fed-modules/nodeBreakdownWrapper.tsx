import React from 'react';
import { NodeBreakdown } from 'routes/optimizations/optimizationsBreakdown/nodeBreakdown';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface NodeBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

type NodeBreakdownProps = NodeBreakdownOwnProps;

const NodeBreakdownWrapper: React.FC<NodeBreakdownProps> = ({
  linkState,
  projectPath,
  queryStateName,
}: NodeBreakdownOwnProps) => {
  return (
    <OptimizationsWrapper>
      <NodeBreakdown linkState={linkState} projectPath={projectPath} queryStateName={queryStateName} />
    </OptimizationsWrapper>
  );
};

export default NodeBreakdownWrapper;
