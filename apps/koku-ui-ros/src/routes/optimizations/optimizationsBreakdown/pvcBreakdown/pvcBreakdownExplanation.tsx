import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
} from '@patternfly/react-core';
import type { PvcExplanation } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { formatStorageBytes, formatUsageRatio } from 'routes/optimizations/optimizationsTable/storageTableUtils';

interface PvcBreakdownExplanationOwnProps {
  explanation?: PvcExplanation;
}

const hasExplanation = (explanation?: PvcExplanation): boolean => {
  if (!explanation) {
    return false;
  }
  return Object.values(explanation).some(value => value !== null && value !== undefined && value !== '');
};

const PvcBreakdownExplanation: React.FC<PvcBreakdownExplanationOwnProps> = ({ explanation }) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasExplanation(explanation)) {
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
  if (explanation?.growth_bytes_per_day != null) {
    items.push({
      label: intl.formatMessage(messages.pvcGrowthPerDay),
      value: `${formatStorageBytes(explanation.growth_bytes_per_day)}/day`,
    });
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
