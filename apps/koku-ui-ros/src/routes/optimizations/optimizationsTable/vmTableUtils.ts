import type { VmRecommendationData } from 'api/ros/recommendations';

export function getVmSavingsDisplay(item: VmRecommendationData): string | undefined {
  const savings = item.savings;
  if (savings?.value != null) {
    return `$${Number(savings.value).toFixed(2)} ${savings.units ?? 'USD'}`;
  }
  return undefined;
}

export function getVmLastReported(item: VmRecommendationData): string | undefined {
  return item.last_recommended_at;
}
