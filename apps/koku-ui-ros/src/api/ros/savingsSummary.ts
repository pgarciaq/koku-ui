import { axiosInstance } from 'api';

import type { MoneyAmount } from './recommendations';

export interface FleetSavingsByPlugin {
  container?: MoneyAmount;
  gpu?: MoneyAmount;
  node?: MoneyAmount;
  pvc?: MoneyAmount;
  snapshot?: MoneyAmount;
  vm?: MoneyAmount;
}

export interface FleetSavingsSummaryResponse {
  by_plugin?: FleetSavingsByPlugin;
  currency?: string;
  estimated_monthly_savings?: MoneyAmount;
  gpu_savings_note?: string;
}

function toApiTerm(term?: string): string | undefined {
  if (!term) {
    return undefined;
  }
  return term.replace(/_term$/, '');
}

export function fetchFleetSavingsSummary(term?: string, engine?: string) {
  const params = new URLSearchParams();
  const apiTerm = toApiTerm(term);
  if (apiTerm) {
    params.set('term', apiTerm);
  }
  if (engine) {
    params.set('engine', engine);
  }
  const query = params.toString();
  return axiosInstance.get<FleetSavingsSummaryResponse>(
    `/recommendations/openshift/savings-summary${query ? `?${query}` : ''}`
  );
}

export type TabSummaryPlugin = 'container' | 'namespace' | 'node' | 'pvc' | 'snapshot' | 'quota' | 'cluster-quota';

export function getPluginSavingsAmount(
  byPlugin: FleetSavingsByPlugin | undefined,
  plugin: TabSummaryPlugin
): MoneyAmount | undefined {
  if (!byPlugin) {
    return undefined;
  }
  switch (plugin) {
    case 'container':
      return byPlugin.container;
    case 'node':
      return byPlugin.node;
    case 'pvc':
      return byPlugin.pvc;
    case 'snapshot':
      return byPlugin.snapshot;
    default:
      return undefined;
  }
}
