import { Label } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import type { QuotaRecommendationType, QuotaRiskLevel } from './quotaTableUtils';

const recommendationTypeColors: Record<
  QuotaRecommendationType,
  'blue' | 'orange' | 'green' | 'grey'
> = {
  tighten: 'blue',
  raise: 'orange',
  optimal: 'green',
  none: 'grey',
};

const riskLevelColors: Record<QuotaRiskLevel, 'red' | 'orange' | 'yellow' | 'grey'> = {
  high: 'red',
  medium: 'orange',
  low: 'yellow',
  none: 'grey',
};

export function QuotaRecommendationTypeBadge({ type }: { type?: string }) {
  const intl = useIntl();
  const key = type as QuotaRecommendationType;
  const messageKey = key ? (`quotaRecommendationType${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof typeof messages) : undefined;
  if (!messageKey || !messages[messageKey]) {
    return <>{type ?? '—'}</>;
  }
  return (
    <Label color={recommendationTypeColors[key] ?? 'grey'} isCompact>
      {intl.formatMessage(messages[messageKey])}
    </Label>
  );
}

export function QuotaRiskLevelBadge({ level }: { level?: string }) {
  const intl = useIntl();
  const key = level as QuotaRiskLevel;
  const messageKey = key ? (`quotaRiskLevel${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof typeof messages) : undefined;
  if (!messageKey || !messages[messageKey]) {
    return <>{level ?? '—'}</>;
  }
  return (
    <Label color={riskLevelColors[key] ?? 'grey'} isCompact>
      {intl.formatMessage(messages[messageKey])}
    </Label>
  );
}
