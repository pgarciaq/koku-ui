import React from 'react';
import { OptimizationsVmsTable } from 'routes/optimizations/optimizationsTable';

import { OptimizationsWrapper } from './optimizationsWrapper';

export interface OptimizationsVmsTableOwnProps {
  breadcrumbLabel?: string;
  breadcrumbPath?: string;
  linkPath?: string;
  linkState?: any;
  queryStateName?: string;
}

type OptimizationsVmsTableWrapperProps = OptimizationsVmsTableOwnProps;

const OptimizationsVmsTableWrapper: React.FC<OptimizationsVmsTableWrapperProps> = ({
  breadcrumbLabel,
  breadcrumbPath,
  linkPath,
  linkState,
  queryStateName,
}: OptimizationsVmsTableOwnProps) => {
  return (
    <OptimizationsWrapper>
      <OptimizationsVmsTable
        breadcrumbLabel={breadcrumbLabel}
        breadcrumbPath={breadcrumbPath}
        linkPath={linkPath}
        linkState={linkState}
        queryStateName={queryStateName}
      />
    </OptimizationsWrapper>
  );
};

export default OptimizationsVmsTableWrapper;
