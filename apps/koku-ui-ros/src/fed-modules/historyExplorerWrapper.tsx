import React, { Suspense } from 'react';

import { OptimizationsWrapper } from './optimizationsWrapper';

const HistoryExplorer = React.lazy(() => import('routes/optimizations/historyExplorer/historyExplorer'));

const HistoryExplorerWrapper: React.FC = () => {
  return (
    <OptimizationsWrapper>
      <Suspense fallback={null}>
        <HistoryExplorer />
      </Suspense>
    </OptimizationsWrapper>
  );
};

export default HistoryExplorerWrapper;
