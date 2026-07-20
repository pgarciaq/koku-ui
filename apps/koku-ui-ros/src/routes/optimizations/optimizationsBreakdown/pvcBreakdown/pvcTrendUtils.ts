import type { PvcRecommendationData } from 'api/ros/recommendations';
import type { RecommendationTermSetting } from 'api/ros/termSettings';
import {
  defaultPvcTermSettings,
  PVC_DEFAULT_TERM_MIN_DATA,
  type RecommendationTermName,
} from 'routes/optimizations/optimizationsTable/recommendationTermLabels';

/** Floor from ROS_PVC_MIN_TREND_DAYS (default 2). */
export const PVC_DEFAULT_MIN_TREND_DAYS = 2;

export type PvcTrendDisplayState = 'projected' | 'flat' | 'unavailable' | 'not_applicable';

export function resolvePvcTermSettings(
  termSettings?: RecommendationTermSetting[] | null
): RecommendationTermSetting[] {
  return termSettings?.length ? termSettings : defaultPvcTermSettings();
}

export function getPvcGrowthRequiredDataDays(
  termName: RecommendationTermName,
  termSettings?: RecommendationTermSetting[] | null,
  minTrendDays = PVC_DEFAULT_MIN_TREND_DAYS
): number {
  const settings = resolvePvcTermSettings(termSettings);
  const setting = settings.find(term => term.name === termName);
  const minData = setting?.min_data_days ?? PVC_DEFAULT_TERM_MIN_DATA[termName];
  return Math.max(minData, minTrendDays);
}

export function getPvcDataDays(rec: PvcRecommendationData): number | undefined {
  if (rec.data_days != null) {
    return rec.data_days;
  }
  if (rec.explanation?.data_days != null) {
    return rec.explanation.data_days;
  }
  return undefined;
}

/** Classify how growth projection should be shown for a PVC term card or explanation row. */
export function getPvcTrendDisplayState(
  rec: PvcRecommendationData,
  termName: RecommendationTermName,
  termSettings?: RecommendationTermSetting[] | null,
  minTrendDays = PVC_DEFAULT_MIN_TREND_DAYS
): PvcTrendDisplayState {
  if (rec.recommendation_type === 'orphaned') {
    return 'not_applicable';
  }
  if (rec.usage_ratio != null && rec.usage_ratio === 0) {
    return 'not_applicable';
  }

  const requiredDays = getPvcGrowthRequiredDataDays(termName, termSettings, minTrendDays);
  const dataDays = getPvcDataDays(rec);

  if (dataDays != null && dataDays < requiredDays) {
    return 'unavailable';
  }

  if (rec.days_to_full != null) {
    return 'projected';
  }

  if (dataDays != null && dataDays >= requiredDays) {
    return 'flat';
  }

  if (rec.growth_bytes_per_day != null && rec.growth_bytes_per_day > 0) {
    return 'projected';
  }

  return 'unavailable';
}
