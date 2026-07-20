import type { RecommendationTermSetting, RecommendationTermSettingsType } from 'api/ros/termSettings';
import { useRecommendationTermOptions } from 'hooks/useRecommendationTermOptions';
import { useMemo } from 'react';

export interface TermDecayInfo {
  decay_halflife_hours: number;
  window_days: number;
  termName: string;
}

/**
 * Returns decay info for a specific term within a recommendation type.
 * @param recommendationType - The plugin type (container, namespace, node, etc.)
 * @param termName - The term name to look up (short, medium, long)
 */
export function useTermDecayInfo(
  recommendationType: RecommendationTermSettingsType,
  termName?: string
): { isLoading: boolean; decayInfo: TermDecayInfo | null } {
  const { isLoading, termSettings } = useRecommendationTermOptions(recommendationType);

  const decayInfo = useMemo(() => {
    if (!termName || !termSettings.length) {
      return null;
    }
    const normalizedName = termName.replace('_term', '');
    const term: RecommendationTermSetting | undefined = termSettings.find(t => t.name === normalizedName);
    if (!term) {
      return null;
    }
    return {
      decay_halflife_hours: term.decay_halflife_hours ?? 0,
      window_days: term.window_days,
      termName: normalizedName,
    };
  }, [termName, termSettings]);

  return { isLoading, decayInfo };
}
