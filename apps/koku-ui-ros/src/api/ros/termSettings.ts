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

export function fetchRecommendationTermSettings(recommendationType: RecommendationTermSettingsType) {
  const params = new URLSearchParams({ recommendation_type: recommendationType });
  return axiosInstance.get<RecommendationTermSettingsResponse>(
    `/recommendations/openshift/settings/terms?${params.toString()}`
  );
}
