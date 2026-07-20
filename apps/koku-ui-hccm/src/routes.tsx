import { Bullseye, Spinner } from '@patternfly/react-core';
import { useIsPriceListToggleEnabled } from 'components/featureToggle';
import { userAccess } from 'components/userAccess';
import React, { lazy, Suspense } from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';
import { routePaths } from 'routePaths';

const NotFound = lazy(() => import(/* webpackChunkName: "NotFound" */ '@koku-ui/ui-lib/components/page/notFound'));
const AwsBreakdown = lazy(() => import(/* webpackChunkName: "awsBreakdown" */ 'routes/details/awsBreakdown'));
const AwsDetails = lazy(() => import(/* webpackChunkName: "awsDetails" */ 'routes/details/awsDetails'));
const AzureBreakdown = lazy(() => import(/* webpackChunkName: "azureBreakdown" */ 'routes/details/azureBreakdown'));
const AzureDetails = lazy(() => import(/* webpackChunkName: "azureDetails" */ 'routes/details/azureDetails'));
const CostModelBreakdown = lazy(
  () => import(/* webpackChunkName: "CostModelBreakdown" */ 'routes/settings/costModels/costModelBreakdown')
);
const CostModelBreakdownDeprecated = lazy(
  () =>
    import(
      /* webpackChunkName: "CostModelBreakdownDeprecated" */ 'routes/settings/costModelsDeprecated/costModelBreakdown'
    )
);
const CostModelCreate = lazy(
  () => import(/* webpackChunkName: "CostModelBreakdown" */ 'routes/settings/costModels/costModelCreate')
);
const Explorer = lazy(() => import(/* webpackChunkName: "explorer" */ 'routes/explorer'));
const GcpBreakdown = lazy(() => import(/* webpackChunkName: "gcpBreakdown" */ 'routes/details/gcpBreakdown'));
const GcpDetails = lazy(() => import(/* webpackChunkName: "gcpDetails" */ 'routes/details/gcpDetails'));
const OptimizationsDecaySettings = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/decaySettings')
);
const Optimizations = lazy(() => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations'));
const OcpBreakdown = lazy(() => import(/* webpackChunkName: "ocpBreakdown" */ 'routes/details/ocpBreakdown'));
const OcpDetails = lazy(() => import(/* webpackChunkName: "ocpDetails" */ 'routes/details/ocpDetails'));
const OcpOptimizationsBreakdown = lazy(
  () =>
    import(
      /* webpackChunkName: "recommendations" */ './routes/details/ocpBreakdown/optimizations/ocpOptimizationsBreakdown'
    )
);
const NamespaceBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/namespaceBreakdown')
);
const NodeBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/nodeBreakdown')
);
const PvcBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/pvcBreakdown')
);
const QuotaBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/quotaBreakdown')
);
const VmBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/vmBreakdown')
);
const ClusterQuotaBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/clusterQuotaBreakdown')
);
const GpuTimeslicingBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/gpuTimeslicingBreakdown')
);
const GpuMigBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/gpuMigBreakdown')
);
const OptimizationsBreakdown = lazy(
  () => import(/* webpackChunkName: "recommendations" */ 'routes/optimizations/optimizationsBreakdown')
);
const Overview = lazy(() => import(/* webpackChunkName: "overview" */ 'routes/overview'));
const PriceListBreakdown = lazy(
  () => import(/* webpackChunkName: "PriceListBreakdown" */ 'routes/settings/priceLists/priceListBreakdown')
);
const PriceListCreate = lazy(
  () => import(/* webpackChunkName: "PriceListCreate" */ 'routes/settings/priceLists/priceListCreate')
);
const Settings = lazy(() => import(/* webpackChunkName: "overview" */ 'routes/settings'));

const CostModelsBreakdownWrapper: React.FC = () => {
  const isPriceListToggleEnabled = useIsPriceListToggleEnabled();
  return isPriceListToggleEnabled ? <CostModelBreakdown /> : <CostModelBreakdownDeprecated />;
};

export const routes = {
  awsBreakdown: {
    element: userAccess(AwsBreakdown),
    ...routePaths.awsBreakdown,
  },
  awsDetails: {
    element: userAccess(AwsDetails),
    ...routePaths.awsDetails,
  },
  azureBreakdown: {
    element: userAccess(AzureBreakdown),
    ...routePaths.azureBreakdown,
  },
  azureDetails: {
    element: userAccess(AzureDetails),
    ...routePaths.azureDetails,
  },
  costModelBreakdown: {
    element: userAccess(CostModelsBreakdownWrapper),
    ...routePaths.costModelBreakdown, // Note: Order matters (i.e., dynamic segment must be defined after costModelsDetails)
  },
  costModelCreate: {
    element: userAccess(CostModelCreate),
    ...routePaths.costModelCreate,
  },
  explorer: {
    element: userAccess(Explorer),
    ...routePaths.explorer,
  },
  gcpBreakdown: {
    element: userAccess(GcpBreakdown),
    ...routePaths.gcpBreakdown,
  },
  gcpDetails: {
    element: userAccess(GcpDetails),
    ...routePaths.gcpDetails,
  },
  ocpBreakdown: {
    element: userAccess(OcpBreakdown),
    ...routePaths.ocpBreakdown,
  },
  ocpDetails: {
    element: userAccess(OcpDetails),
    ...routePaths.ocpDetails,
  },
  ocpOptimizationsBreakdown: {
    element: userAccess(OcpOptimizationsBreakdown),
    ...routePaths.ocpOptimizationsBreakdown,
  },
  optimizationsBreakdown: {
    element: userAccess(OptimizationsBreakdown),
    ...routePaths.optimizationsBreakdown,
  },
  optimizationsNamespaceBreakdown: {
    element: userAccess(NamespaceBreakdown),
    ...routePaths.optimizationsNamespaceBreakdown,
  },
  optimizationsNodeBreakdown: {
    element: userAccess(NodeBreakdown),
    ...routePaths.optimizationsNodeBreakdown,
  },
  optimizationsPvcBreakdown: {
    element: userAccess(PvcBreakdown),
    ...routePaths.optimizationsPvcBreakdown,
  },
  optimizationsQuotaBreakdown: {
    element: userAccess(QuotaBreakdown),
    ...routePaths.optimizationsQuotaBreakdown,
  },
  optimizationsVmBreakdown: {
    element: userAccess(VmBreakdown),
    ...routePaths.optimizationsVmBreakdown,
  },
  optimizationsClusterQuotaBreakdown: {
    element: userAccess(ClusterQuotaBreakdown),
    ...routePaths.optimizationsClusterQuotaBreakdown,
  },
  optimizationsGpuTimeslicingBreakdown: {
    element: userAccess(GpuTimeslicingBreakdown),
    ...routePaths.optimizationsGpuTimeslicingBreakdown,
  },
  optimizationsGpuMigBreakdown: {
    element: userAccess(GpuMigBreakdown),
    ...routePaths.optimizationsGpuMigBreakdown,
  },
  optimizationsDecaySettings: {
    element: userAccess(OptimizationsDecaySettings),
    ...routePaths.optimizationsDecaySettings,
  },
  optimizations: {
    element: userAccess(Optimizations),
    ...routePaths.optimizations,
  },
  overview: {
    element: userAccess(Overview),
    ...routePaths.overview,
  },
  priceListBreakdown: {
    element: userAccess(PriceListBreakdown),
    ...routePaths.priceListBreakdown,
  },
  priceListCreate: {
    element: userAccess(PriceListCreate),
    ...routePaths.priceListCreate,
  },
  settings: {
    element: userAccess(Settings),
    ...routePaths.settings,
  },
};

export const Routes = () => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner size="lg" />
      </Bullseye>
    }
  >
    <RouterRoutes>
      {Object.keys(routes).map(key => {
        const route = routes[key];
        return <Route key={route.path} path={route.path} element={<route.element />} />;
      })}
      {/* Finally, catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  </Suspense>
);
