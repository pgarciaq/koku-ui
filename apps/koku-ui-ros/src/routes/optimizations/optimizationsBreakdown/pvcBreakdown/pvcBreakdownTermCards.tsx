import { Card, CardBody, CardTitle, Grid, GridItem, Label } from '@patternfly/react-core';
import type { PvcRecommendationData } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  formatMoneyCell,
  formatStorageBytes,
  formatUsageRatio,
} from 'routes/optimizations/optimizationsTable/storageTableUtils';

interface PvcBreakdownTermCardsOwnProps {
  activeTermKey: string;
  terms?: Record<string, PvcRecommendationData>;
}

const TERM_ORDER = ['short', 'medium', 'long'] as const;

const termLabel = (term: string, intl: ReturnType<typeof useIntl>) => {
  switch (term) {
    case 'short':
      return intl.formatMessage(messages.optimizationsShortTerm);
    case 'medium':
      return intl.formatMessage(messages.optimizationsMediumTerm);
    case 'long':
      return intl.formatMessage(messages.optimizationsLongTerm);
    default:
      return term;
  }
};

const PvcBreakdownTermCards: React.FC<PvcBreakdownTermCardsOwnProps> = ({ activeTermKey, terms }) => {
  const intl = useIntl();

  if (!terms || Object.keys(terms).length === 0) {
    return null;
  }

  return (
    <Grid hasGutter>
      {TERM_ORDER.filter(term => terms[term]).map(term => {
        const rec = terms[term];
        const savings = formatMoneyCell(rec.estimated_monthly_savings);
        const isActive = term === activeTermKey;

        return (
          <GridItem key={term} md={4} sm={12}>
            <Card isCompact isSelected={isActive}>
              <CardTitle>
                {termLabel(term, intl)}
                {isActive && (
                  <Label color="blue" isCompact style={{ marginLeft: 8 }}>
                    {intl.formatMessage(messages.pvcActiveTerm)}
                  </Label>
                )}
              </CardTitle>
              <CardBody>
                <div>{intl.formatMessage(messages.pvcUsagePercent)}: {formatUsageRatio(rec.usage_ratio)}</div>
                {rec.recommended_bytes != null && (
                  <div>
                    {intl.formatMessage(messages.recommended)}: {formatStorageBytes(rec.recommended_bytes)}
                  </div>
                )}
                {rec.days_to_full != null && (
                  <div>
                    {intl.formatMessage(messages.pvcDaysToFull)}: {rec.days_to_full}
                  </div>
                )}
                {rec.growth_bytes_per_day != null && (
                  <div>
                    {intl.formatMessage(messages.pvcGrowthPerDay)}: {formatStorageBytes(rec.growth_bytes_per_day)}/day
                  </div>
                )}
                {savings && (
                  <div>
                    {intl.formatMessage(messages.savingsEstimatedMonthly)}: {savings}
                  </div>
                )}
                {rec.resize_note && <div style={{ marginTop: 8 }}>{rec.resize_note}</div>}
              </CardBody>
            </Card>
          </GridItem>
        );
      })}
    </Grid>
  );
};

export { PvcBreakdownTermCards };
