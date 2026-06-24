import type { NodeEngineRecommendation, NodeMetrics, NodeRecommendationData } from 'api/ros/recommendations';

/** Format node CPU/memory utilization as "P50% / P95%". Values are 0–1 fractions from the API. */
export function formatUtilPercentRange(p50?: number, p95?: number): string {
  const formatOne = (value?: number): string => {
    if (value == null) {
      return '—';
    }
    return `${(value * 100).toFixed(1)}%`;
  };

  if (p50 == null && p95 == null) {
    return '—';
  }

  return `${formatOne(p50)} / ${formatOne(p95)}`;
}

export function getNodeEngineRec(
  item: NodeRecommendationData,
  term: string,
  engine: string
): NodeEngineRecommendation | undefined {
  return item.recommendation_terms?.[term]?.recommendation_engines?.[engine];
}

export function getNodeFleetReduction(
  item: NodeRecommendationData,
  term: string,
  engine: string
): number | undefined {
  const reduction = getNodeEngineRec(item, term, engine)?.node_count_reduction;
  return reduction != null && reduction >= 0 ? reduction : undefined;
}

export function getNodeLastReported(
  item: NodeRecommendationData,
  term: string,
  engine: string
): string | undefined {
  return getNodeEngineRec(item, term, engine)?.updated_at;
}

export function getNodeMetricsDisplay(metrics?: NodeMetrics): { cpu: string; memory: string } {
  return {
    cpu: formatUtilPercentRange(metrics?.cpu_util_p50, metrics?.cpu_util_p95),
    memory: formatUtilPercentRange(metrics?.mem_util_p50, metrics?.mem_util_p95),
  };
}
