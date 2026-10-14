import type { VmRecommendationData } from 'api/ros/recommendations';
import { formatSavingsCellValue } from './savingsCellUtils';

export function getVmSavingsDisplay(item: VmRecommendationData): string | undefined {
  const savings = item.estimated_monthly_savings;
  return formatSavingsCellValue(savings?.value, savings?.units) ?? undefined;
}

export function getVmLastReported(item: VmRecommendationData): string | undefined {
  return item.last_recommended_at;
}
