import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
} from '@patternfly/react-core';
import type { PvcRecommendationData } from 'api/ros/recommendations';
import { useRecommendationTermOptions } from 'hooks/useRecommendationTermOptions';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import type { RecommendationTermName } from 'routes/optimizations/optimizationsTable/recommendationTermLabels';
import { formatStorageBytes, formatUsageRatio } from 'routes/optimizations/optimizationsTable/storageTableUtils';

import {
  getPvcGrowthRequiredDataDays,
  getPvcTrendDisplayState,
} from './pvcTrendUtils';

interface PvcBreakdownExplanationOwnProps {
  termName: RecommendationTermName;
  termRec?: PvcRecommendationData;
}

const hasExplanation = (termRec?: PvcRecommendationData): boolean => {
  const explanation = termRec?.explanation;
  if (!explanation && !termRec) {
    return false;
  }
  if (explanation && Object.values(explanation).some(value => value !== null && value !== undefined && value !== '')) {
    return true;
  }
  return termRec != null;
};

const PvcBreakdownExplanation: React.FC<PvcBreakdownExplanationOwnProps> = ({ termName, termRec }) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);
  const { termSettings } = useRecommendationTermOptions('pvc');
  const explanation = termRec?.explanation;

  if (!hasExplanation(termRec)) {
    return null;
  }

  const items: { label: string; value: string }[] = [];

  if (explanation?.classification_reason) {
    items.push({
      label: intl.formatMessage(messages.pvcClassificationReason),
      value: explanation.classification_reason,
    });
  }
  if (explanation?.confidence_level != null) {
    items.push({
      label: intl.formatMessage(messages.explanationConfidenceLevel),
      value: `${(explanation.confidence_level * 100).toFixed(1)}%`,
    });
  }
  if (explanation?.data_days != null) {
    items.push({
      label: intl.formatMessage(messages.explanationDataDays),
      value: `${explanation.data_days}`,
    });
  }
  if (explanation?.usage_ratio != null) {
    items.push({
      label: intl.formatMessage(messages.pvcUsagePercent),
      value: formatUsageRatio(explanation.usage_ratio),
    });
  }

  if (termRec) {
    const trendState = getPvcTrendDisplayState(termRec, termName, termSettings);
    if (trendState === 'unavailable') {
      const requiredDays = getPvcGrowthRequiredDataDays(termName, termSettings);
      const dataDays = termRec.data_days ?? explanation?.data_days ?? 0;
      items.push({
        label: intl.formatMessage(messages.pvcGrowthPerDay),
        value: intl.formatMessage(messages.pvcTrendUnavailable, { dataDays, requiredDays }),
      });
    } else if (trendState === 'flat') {
      items.push({
        label: intl.formatMessage(messages.pvcGrowthPerDay),
        value: intl.formatMessage(messages.pvcTrendNoGrowth),
      });
    } else if (trendState === 'projected' && explanation?.growth_bytes_per_day != null) {
      items.push({
        label: intl.formatMessage(messages.pvcGrowthPerDay),
        value: `${formatStorageBytes(explanation.growth_bytes_per_day)}/day`,
      });
    } else if (termRec.growth_bytes_per_day != null && termRec.growth_bytes_per_day > 0) {
      items.push({
        label: intl.formatMessage(messages.pvcGrowthPerDay),
        value: `${formatStorageBytes(termRec.growth_bytes_per_day)}/day`,
      });
    }
  }

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      onToggle={(_event, expanded) => setIsExpanded(expanded)}
      toggleText={intl.formatMessage(messages.pvcExplanationTitle)}
    >
      <DescriptionList isCompact>
        {items.map(item => (
          <DescriptionListGroup key={item.label}>
            <DescriptionListTerm>{item.label}</DescriptionListTerm>
            <DescriptionListDescription>{item.value}</DescriptionListDescription>
          </DescriptionListGroup>
        ))}
      </DescriptionList>
    </ExpandableSection>
  );
};

export { PvcBreakdownExplanation };
