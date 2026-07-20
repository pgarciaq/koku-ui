import { Card, CardBody, CardTitle, Grid, GridItem, Label } from '@patternfly/react-core';
import type { PvcRecommendationData } from 'api/ros/recommendations';
import { useRecommendationTermOptions } from 'hooks/useRecommendationTermOptions';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  getRecommendationTermLabel,
  type RecommendationTermName,
} from 'routes/optimizations/optimizationsTable/recommendationTermLabels';
import {
  formatMoneyCell,
  formatStorageBytes,
  formatUsageRatio,
} from 'routes/optimizations/optimizationsTable/storageTableUtils';

import { PvcTrendSummary } from './pvcTrendSummary';

interface PvcBreakdownTermCardsOwnProps {
  activeTermKey: string;
  terms?: Record<string, PvcRecommendationData>;
}

const TERM_ORDER: RecommendationTermName[] = ['short', 'medium', 'long'];

const PvcBreakdownTermCards: React.FC<PvcBreakdownTermCardsOwnProps> = ({ activeTermKey, terms }) => {
  const intl = useIntl();
  const { termOptions, termSettings } = useRecommendationTermOptions('pvc');

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
                {getRecommendationTermLabel(termOptions, term)}
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
                <PvcTrendSummary rec={rec} termName={term} termSettings={termSettings} />
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
