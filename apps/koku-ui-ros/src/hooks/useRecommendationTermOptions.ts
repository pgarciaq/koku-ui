import type { RecommendationTermSetting, RecommendationTermSettingsType } from 'api/ros/termSettings';
import { fetchRecommendationTermSettings } from 'api/ros/termSettings';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  buildRecommendationTermSelectOptions,
  defaultPvcTermSettings,
  type RecommendationTermSelectOption,
} from 'routes/optimizations/optimizationsTable/recommendationTermLabels';

const termSettingsCache = new Map<RecommendationTermSettingsType, Promise<RecommendationTermSetting[]>>();

function loadTermSettings(recommendationType: RecommendationTermSettingsType): Promise<RecommendationTermSetting[]> {
  const cached = termSettingsCache.get(recommendationType);
  if (cached) {
    return cached;
  }

  const pending = fetchRecommendationTermSettings(recommendationType)
    .then(response => response.data.terms)
    .catch(() => {
      if (recommendationType === 'pvc') {
        return defaultPvcTermSettings();
      }
      return [];
    });

  termSettingsCache.set(recommendationType, pending);
  return pending;
}

export interface UseRecommendationTermOptionsResult {
  isLoading: boolean;
  termOptions: RecommendationTermSelectOption[];
}

export function useRecommendationTermOptions(
  recommendationType: RecommendationTermSettingsType
): UseRecommendationTermOptionsResult {
  const intl = useIntl();
  const [terms, setTerms] = useState<RecommendationTermSetting[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTermSettings(recommendationType).then(loadedTerms => {
      if (!cancelled) {
        setTerms(loadedTerms);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [recommendationType]);

  const termOptions = useMemo(() => {
    const source =
      terms ?? (recommendationType === 'pvc' ? defaultPvcTermSettings() : []);
    return buildRecommendationTermSelectOptions(intl, source);
  }, [intl, recommendationType, terms]);

  return {
    isLoading: terms === null,
    termOptions,
  };
}

/** Visible for unit tests that need a fresh settings fetch. */
export function clearRecommendationTermSettingsCache(): void {
  termSettingsCache.clear();
}
