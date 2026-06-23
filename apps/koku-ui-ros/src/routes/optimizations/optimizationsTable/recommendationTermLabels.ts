import type { RecommendationTermSetting } from 'api/ros/termSettings';
import messages from 'locales/messages';
import type { IntlShape } from 'react-intl';
import { Interval } from 'utils/commonTypes';

export const TERM_NAME_ORDER = ['short', 'medium', 'long'] as const;

export type RecommendationTermName = (typeof TERM_NAME_ORDER)[number];

export const TERM_NAME_TO_INTERVAL: Record<RecommendationTermName, Interval> = {
  short: Interval.short_term,
  medium: Interval.medium_term,
  long: Interval.long_term,
};

export const INTERVAL_TO_TERM_NAME: Record<string, RecommendationTermName> = {
  [Interval.short_term]: 'short',
  [Interval.medium_term]: 'medium',
  [Interval.long_term]: 'long',
};

/** PVC plugin defaults from ros-ocp-backend/internal/plugins/pvc/plugin.go */
export const PVC_DEFAULT_TERM_WINDOWS: Record<RecommendationTermName, number> = {
  short: 7,
  medium: 30,
  long: 90,
};

export interface RecommendationTermSelectOption {
  label: string;
  value: string;
}

export function formatRecommendationTermWindowLabel(intl: IntlShape, windowDays: number): string {
  return intl.formatMessage(messages.recommendationTermWindowDays, { windowDays });
}

export function defaultPvcTermSettings(): RecommendationTermSetting[] {
  return TERM_NAME_ORDER.map(name => ({
    name,
    window_days: PVC_DEFAULT_TERM_WINDOWS[name],
  }));
}

export function buildRecommendationTermSelectOptions(
  intl: IntlShape,
  terms: RecommendationTermSetting[]
): RecommendationTermSelectOption[] {
  return TERM_NAME_ORDER.map(name => terms.find(term => term.name === name))
    .filter((term): term is RecommendationTermSetting => term != null)
    .map(term => ({
      value: TERM_NAME_TO_INTERVAL[term.name as RecommendationTermName],
      label: formatRecommendationTermWindowLabel(intl, term.window_days),
    }));
}

export function getRecommendationTermLabel(
  termOptions: RecommendationTermSelectOption[],
  termName: RecommendationTermName
): string {
  const interval = TERM_NAME_TO_INTERVAL[termName];
  return termOptions.find(option => option.value === interval)?.label ?? termName;
}
