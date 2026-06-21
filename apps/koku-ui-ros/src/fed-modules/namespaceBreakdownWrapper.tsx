import React from 'react';
import { NamespaceBreakdown } from 'routes/optimizations/optimizationsBreakdown/namespaceBreakdown';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface NamespaceBreakdownOwnProps {
  linkState?: any;
  projectPath?: string;
  queryStateName: string;
}

type NamespaceBreakdownProps = NamespaceBreakdownOwnProps;

const NamespaceBreakdownWrapper: React.FC<NamespaceBreakdownProps> = ({
  linkState,
  projectPath,
  queryStateName,
}: NamespaceBreakdownOwnProps) => {
  return (
    <OptimizationsWrapper>
      <NamespaceBreakdown linkState={linkState} projectPath={projectPath} queryStateName={queryStateName} />
    </OptimizationsWrapper>
  );
};

export default NamespaceBreakdownWrapper;
