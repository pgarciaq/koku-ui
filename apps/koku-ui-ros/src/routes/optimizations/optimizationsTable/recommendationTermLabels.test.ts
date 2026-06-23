import {
  buildRecommendationTermSelectOptions,
  defaultPvcTermSettings,
  formatRecommendationTermWindowLabel,
  getRecommendationTermLabel,
  PVC_DEFAULT_TERM_WINDOWS,
} from './recommendationTermLabels';
import { Interval } from 'utils/commonTypes';

const intl = {
  formatMessage: (descriptor: { defaultMessage?: string }, values?: Record<string, number>) => {
    const template = descriptor.defaultMessage ?? '';
    if (!values) {
      return template;
    }
    return template
      .replace('{windowDays, number}', String(values.windowDays))
      .replace('{windowDays, plural, one {day} other {days}}', values.windowDays === 1 ? 'day' : 'days');
  },
} as any;

describe('recommendationTermLabels', () => {
  it('formats window labels with day count', () => {
    expect(formatRecommendationTermWindowLabel(intl, 7)).toBe('Last 7 days');
    expect(formatRecommendationTermWindowLabel(intl, 1)).toBe('Last 1 day');
  });

  it('builds select options from settings terms in short/medium/long order', () => {
    const options = buildRecommendationTermSelectOptions(intl, [
      { name: 'long', window_days: 90 },
      { name: 'short', window_days: 7 },
      { name: 'medium', window_days: 30 },
    ]);

    expect(options).toEqual([
      { value: Interval.short_term, label: 'Last 7 days' },
      { value: Interval.medium_term, label: 'Last 30 days' },
      { value: Interval.long_term, label: 'Last 90 days' },
    ]);
  });

  it('uses PVC plugin defaults when settings are unavailable', () => {
    expect(defaultPvcTermSettings().map(term => term.window_days)).toEqual([
      PVC_DEFAULT_TERM_WINDOWS.short,
      PVC_DEFAULT_TERM_WINDOWS.medium,
      PVC_DEFAULT_TERM_WINDOWS.long,
    ]);
  });

  it('resolves API term names to select labels', () => {
    const options = buildRecommendationTermSelectOptions(intl, defaultPvcTermSettings());
    expect(getRecommendationTermLabel(options, 'medium')).toBe('Last 30 days');
  });
});
