import { OptimizationsWrapper } from 'fed-modules/optimizationsWrapper';
import QuotaBreakdown from 'routes/optimizations/optimizationsBreakdown/quotaBreakdown/quotaBreakdown';
import React from 'react';

export interface QuotaBreakdownOwnProps {
  linkState?: any;
  queryStateName: string;
}

const QuotaBreakdownWrapper: React.FC<QuotaBreakdownOwnProps> = ({ linkState, queryStateName }) => {
  return (
    <OptimizationsWrapper>
      <QuotaBreakdown linkState={linkState} queryStateName={queryStateName} />
    </OptimizationsWrapper>
  );
};

export default QuotaBreakdownWrapper;
