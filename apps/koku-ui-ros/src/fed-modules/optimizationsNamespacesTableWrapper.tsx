import React from 'react';
import { OptimizationsNamespacesTable } from 'routes/optimizations/optimizationsTable';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsNamespacesTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  cluster?: string | string[];
  isClusterHidden?: boolean;
  linkPath?: string;
  linkState?: any;
  queryStateName: string;
}

type OptimizationsNamespacesTableWrapperProps = OptimizationsNamespacesTableOwnProps;

const OptimizationsNamespacesTableWrapper: React.FC<OptimizationsNamespacesTableWrapperProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  cluster,
  isClusterHidden,
  linkPath,
  linkState,
  queryStateName,
}: OptimizationsNamespacesTableOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsNamespacesTable
        breadcrumbLabel={breadcrumbLabel}
        breadcrumbPath={breadcrumbPath}
        cluster={cluster}
        isClusterHidden={isClusterHidden}
        linkPath={linkPath}
        linkState={linkState}
        queryStateName={queryStateName}
      />
    </OptimizationsWrapper>
  );
};

export default OptimizationsNamespacesTableWrapper;
