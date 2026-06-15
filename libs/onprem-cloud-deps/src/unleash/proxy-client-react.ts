const ONPREM_ENABLED_FLAGS = new Set([
  'cost-management.koku-ui-hccm.efficiency',
  'cost-management.koku-ui-hccm.exact-filter',
  'cost-management.koku-ui-hccm.gpu',
  'cost-management.koku-ui-hccm.mig',
  'cost-management.koku-ui-hccm.wasted-cost',
  'cost-management.koku-ui-ros.box-plot',
]);

export const useUnleashClient = () => ({
  isEnabled: (feature: string) => ONPREM_ENABLED_FLAGS.has(feature),
});
