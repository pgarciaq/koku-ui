import type { PvcRecommendationData } from 'api/ros/recommendations';
import { defaultPvcTermSettings } from 'routes/optimizations/optimizationsTable/recommendationTermLabels';

import {
  getPvcGrowthRequiredDataDays,
  getPvcTrendDisplayState,
} from './pvcTrendUtils';
import { PVC_DEFAULT_TERM_MIN_DATA } from 'routes/optimizations/optimizationsTable/recommendationTermLabels';

const baseRec: PvcRecommendationData = {
  recommendation_type: 'oversized',
  usage_ratio: 0.1,
  data_days: 6,
  growth_bytes_per_day: 0,
};

describe('pvcTrendUtils', () => {
  it('requires max(term min_data_days, min_trend_days) digest days', () => {
    expect(getPvcGrowthRequiredDataDays('short', defaultPvcTermSettings())).toBe(
      PVC_DEFAULT_TERM_MIN_DATA.short
    );
    expect(getPvcGrowthRequiredDataDays('medium', defaultPvcTermSettings())).toBe(
      PVC_DEFAULT_TERM_MIN_DATA.medium
    );
    expect(getPvcGrowthRequiredDataDays('long', defaultPvcTermSettings())).toBe(
      PVC_DEFAULT_TERM_MIN_DATA.long
    );
  });

  it('marks trend unavailable when data_days is below the term threshold', () => {
    expect(getPvcTrendDisplayState({ ...baseRec, data_days: 6 }, 'medium')).toBe('unavailable');
    expect(getPvcTrendDisplayState({ ...baseRec, data_days: 2 }, 'short')).toBe('unavailable');
  });

  it('shows projected trend when days_to_full is present', () => {
    expect(
      getPvcTrendDisplayState(
        { ...baseRec, data_days: 6, days_to_full: 120, growth_bytes_per_day: 1024 },
        'short'
      )
    ).toBe('projected');
  });

  it('shows flat growth when enough data exists but slope is non-positive', () => {
    expect(getPvcTrendDisplayState({ ...baseRec, data_days: 20 }, 'medium')).toBe('flat');
  });

  it('skips trend for orphaned or zero-usage PVCs', () => {
    expect(
      getPvcTrendDisplayState(
        { ...baseRec, recommendation_type: 'orphaned', usage_ratio: 0 },
        'medium'
      )
    ).toBe('not_applicable');
    expect(getPvcTrendDisplayState({ ...baseRec, usage_ratio: 0 }, 'medium')).toBe(
      'not_applicable'
    );
  });
});
