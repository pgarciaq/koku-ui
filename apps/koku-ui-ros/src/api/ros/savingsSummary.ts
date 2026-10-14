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
  by_plugin_breakdown?: FleetSavingsBreakdownByPlugin;
  currency?: string;
  estimated_monthly_savings?: MoneyAmount;
  gpu_savings_note?: string;
}

export interface PluginSavingsBreakdown {
  additional_cost?: MoneyAmount;
  additional_cost_count?: number;
  savings?: MoneyAmount;
  savings_count?: number;
}

export interface FleetSavingsBreakdownByPlugin {
  container?: PluginSavingsBreakdown;
  gpu?: PluginSavingsBreakdown;
  node?: PluginSavingsBreakdown;
  pvc?: PluginSavingsBreakdown;
  snapshot?: PluginSavingsBreakdown;
  vm?: PluginSavingsBreakdown;
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

export type TabSummaryPlugin =
  'container' | 'namespace' | 'node' | 'pvc' | 'snapshot' | 'quota' | 'cluster-quota' | 'vm' | 'gpu-mig' | 'gpu-ts';

export function getPluginSavingsBreakdown(
  breakdown: FleetSavingsBreakdownByPlugin | undefined,
  plugin: TabSummaryPlugin
): PluginSavingsBreakdown | undefined {
  if (!breakdown) {
    return undefined;
  }
  switch (plugin) {
    case 'container':
      return breakdown.container;
    case 'node':
      return breakdown.node;
    case 'pvc':
      return breakdown.pvc;
    case 'snapshot':
      return breakdown.snapshot;
    case 'vm':
      return breakdown.vm;
    case 'gpu-ts':
      return breakdown.gpu;
    default:
      return undefined;
  }
}

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
    case 'vm':
      return byPlugin.vm;
    case 'gpu-ts':
      return byPlugin.gpu;
    default:
      return undefined;
  }
}
