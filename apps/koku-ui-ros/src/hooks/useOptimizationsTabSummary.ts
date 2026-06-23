import type { TabSummaryPlugin } from 'api/ros/savingsSummary';
import { fetchFleetSavingsSummary, getPluginSavingsAmount } from 'api/ros/savingsSummary';
import { RosPathsType, RosType } from 'api/ros/ros';
import { useRosCount } from 'hooks/useRosCount';
import { useEffect, useState } from 'react';
import { FetchStatus } from 'store/common';

export interface UseOptimizationsTabSummaryOptions {
  engine?: string;
  plugin: TabSummaryPlugin;
  term?: string;
}

export interface UseOptimizationsTabSummaryResult {
  count: number;
  countFetchStatus?: FetchStatus;
  savingsUnits?: string;
  savingsValue?: string;
  summaryFetchStatus: FetchStatus;
}

function getRosPathsType(plugin: TabSummaryPlugin): RosPathsType {
  switch (plugin) {
    case 'container':
      return RosPathsType.recommendations;
    case 'namespace':
      return RosPathsType.namespaceRecommendations;
    case 'node':
      return RosPathsType.nodeRecommendations;
    case 'pvc':
      return RosPathsType.pvcRecommendations;
    case 'snapshot':
      return RosPathsType.snapshotRecommendations;
    case 'quota':
      return RosPathsType.quotaRecommendations;
    case 'cluster-quota':
      return RosPathsType.clusterQuotaRecommendations;
  }
}

export function useOptimizationsTabSummary({
  engine,
  plugin,
  term,
}: UseOptimizationsTabSummaryOptions): UseOptimizationsTabSummaryResult {
  const rosPathsType = getRosPathsType(plugin);
  const { count, fetchStatus: countFetchStatus } = useRosCount({
    engine: plugin === 'pvc' || plugin === 'snapshot' ? undefined : engine,
    rosPathsType,
    rosType: RosType.ros,
    term,
  });

  const [summaryFetchStatus, setSummaryFetchStatus] = useState<FetchStatus>(FetchStatus.inProgress);
  const [savingsValue, setSavingsValue] = useState<string | undefined>();
  const [savingsUnits, setSavingsUnits] = useState<string | undefined>();

  useEffect(() => {
    if (plugin === 'namespace' || plugin === 'quota' || plugin === 'cluster-quota') {
      setSummaryFetchStatus(FetchStatus.complete);
      setSavingsValue(undefined);
      setSavingsUnits(undefined);
      return;
    }

    let cancelled = false;
    setSummaryFetchStatus(FetchStatus.inProgress);

    fetchFleetSavingsSummary(term, engine)
      .then(res => {
        if (cancelled) {
          return;
        }
        const amount = getPluginSavingsAmount(res.data?.by_plugin, plugin);
        setSavingsValue(amount?.value);
        setSavingsUnits(amount?.units ?? res.data?.currency ?? 'USD');
        setSummaryFetchStatus(FetchStatus.complete);
      })
      .catch(() => {
        if (!cancelled) {
          setSavingsValue(undefined);
          setSavingsUnits(undefined);
          setSummaryFetchStatus(FetchStatus.none);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [engine, plugin, term]);

  return {
    count,
    countFetchStatus,
    savingsUnits,
    savingsValue,
    summaryFetchStatus,
  };
}
