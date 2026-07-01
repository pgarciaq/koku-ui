import { axiosInstance } from 'api';

export interface RecommendationTermSetting {
  decay_halflife_hours?: number;
  is_default?: boolean;
  locked?: boolean;
  min_data_days?: number;
  name: string;
  window_days: number;
}

export interface RecommendationTermSettingsResponse {
  recommendation_type: string;
  settings_locked?: boolean;
  terms: RecommendationTermSetting[];
}

export type RecommendationTermSettingsType = 'pvc' | 'container' | 'namespace' | 'node' | 'gpu' | 'vm';

/** Term field values for PUT requests. min_data_days is auto-derived if omitted. */
export interface RecommendationTermSettingUpdate {
  name: string;
  window_days: number;
  decay_halflife_hours: number;
  min_data_days?: number;
}

function buildTermsUrl(recommendationType: RecommendationTermSettingsType): string {
  if (recommendationType === 'vm') {
    return '/recommendations/openshift/settings/vm/terms';
  }
  const params = new URLSearchParams({ recommendation_type: recommendationType });
  return `/recommendations/openshift/settings/terms?${params.toString()}`;
}

export function fetchRecommendationTermSettings(recommendationType: RecommendationTermSettingsType) {
  return axiosInstance.get<RecommendationTermSettingsResponse>(buildTermsUrl(recommendationType));
}

export function updateRecommendationTermSettings(
  recommendationType: RecommendationTermSettingsType,
  terms: RecommendationTermSettingUpdate[]
) {
  return axiosInstance.put<RecommendationTermSettingsResponse>(buildTermsUrl(recommendationType), { terms });
}

export function resetRecommendationTermSettings(recommendationType: RecommendationTermSettingsType) {
  return axiosInstance.delete(buildTermsUrl(recommendationType));
}
