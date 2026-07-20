import type { PvcRecommendationData } from 'api/ros/recommendations';
import type { RecommendationTermSetting } from 'api/ros/termSettings';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import type { RecommendationTermName } from 'routes/optimizations/optimizationsTable/recommendationTermLabels';
import { formatStorageBytes } from 'routes/optimizations/optimizationsTable/storageTableUtils';

import {
  getPvcDataDays,
  getPvcGrowthRequiredDataDays,
  getPvcTrendDisplayState,
} from './pvcTrendUtils';

interface PvcTrendSummaryOwnProps {
  rec: PvcRecommendationData;
  termName: RecommendationTermName;
  termSettings?: RecommendationTermSetting[] | null;
}

const unavailableStyle: React.CSSProperties = {
  color: 'var(--pf-t--global--text--color--subtle)',
  fontStyle: 'italic',
};

const PvcTrendSummary: React.FC<PvcTrendSummaryOwnProps> = ({ rec, termName, termSettings }) => {
  const intl = useIntl();
  const trendState = getPvcTrendDisplayState(rec, termName, termSettings);
  const dataDays = getPvcDataDays(rec);

  if (trendState === 'not_applicable') {
    return null;
  }

  if (trendState === 'unavailable') {
    const requiredDays = getPvcGrowthRequiredDataDays(termName, termSettings);
    return (
      <div style={unavailableStyle}>
        {intl.formatMessage(messages.pvcTrendUnavailable, {
          dataDays: dataDays ?? 0,
          requiredDays,
        })}
      </div>
    );
  }

  if (trendState === 'flat') {
    return (
      <div>
        {intl.formatMessage(messages.pvcGrowthPerDay)}: {intl.formatMessage(messages.pvcTrendNoGrowth)}
      </div>
    );
  }

  return (
    <>
      {rec.days_to_full != null && (
        <div>
          {intl.formatMessage(messages.pvcDaysToFull)}: {rec.days_to_full}
        </div>
      )}
      {rec.growth_bytes_per_day != null && rec.growth_bytes_per_day > 0 && (
        <div>
          {intl.formatMessage(messages.pvcGrowthPerDay)}: {formatStorageBytes(rec.growth_bytes_per_day)}/day
        </div>
      )}
    </>
  );
};

export { PvcTrendSummary };
