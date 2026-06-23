import { OptimizationsWrapper } from 'fed-modules/optimizationsWrapper';
import ClusterQuotaBreakdown from 'routes/optimizations/optimizationsBreakdown/clusterQuotaBreakdown/clusterQuotaBreakdown';
import React from 'react';

export interface ClusterQuotaBreakdownOwnProps {
  linkState?: any;
  queryStateName: string;
}

const ClusterQuotaBreakdownWrapper: React.FC<ClusterQuotaBreakdownOwnProps> = ({ linkState, queryStateName }) => {
  return (
    <OptimizationsWrapper>
      <ClusterQuotaBreakdown linkState={linkState} queryStateName={queryStateName} />
    </OptimizationsWrapper>
  );
};

export default ClusterQuotaBreakdownWrapper;
