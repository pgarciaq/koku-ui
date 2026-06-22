import React from 'react';
import { OptimizationsNodesTable } from 'routes/optimizations/optimizationsTable';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsNodesTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

type OptimizationsNodesTableWrapperProps = OptimizationsNodesTableOwnProps;

const OptimizationsNodesTableWrapper: React.FC<OptimizationsNodesTableWrapperProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkPath,
  linkState,
  queryStateName,
}: OptimizationsNodesTableOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsNodesTable
        breadcrumbLabel={breadcrumbLabel}
        breadcrumbPath={breadcrumbPath}
        linkPath={linkPath}
        linkState={linkState}
        queryStateName={queryStateName}
      />
    </OptimizationsWrapper>
  );
};

export default OptimizationsNodesTableWrapper;
