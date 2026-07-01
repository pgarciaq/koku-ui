import type { RecommendationTermSettingsType } from 'api/ros/termSettings';
import { useTermDecayInfo } from 'hooks/useTermDecayInfo';
import React from 'react';
import type { Interval } from 'utils/commonTypes';

import { DecayInfoCard } from './decayInfoCard';

interface BreakdownDecayInfoCardProps {
  recommendationType: RecommendationTermSettingsType;
  term: Interval;
}

const BreakdownDecayInfoCard: React.FC<BreakdownDecayInfoCardProps> = ({ recommendationType, term }) => {
  const { decayInfo } = useTermDecayInfo(recommendationType, term);

  if (!decayInfo || decayInfo.decay_halflife_hours <= 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <DecayInfoCard
        halfLifeHours={decayInfo.decay_halflife_hours}
        termName={decayInfo.termName}
        windowDays={decayInfo.window_days}
      />
    </div>
  );
};

export { BreakdownDecayInfoCard };
