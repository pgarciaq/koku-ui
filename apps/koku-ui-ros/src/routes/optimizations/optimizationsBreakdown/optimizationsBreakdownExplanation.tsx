import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
} from '@patternfly/react-core';
import type { RecommendationExplanation } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

interface OptimizationsBreakdownExplanationProps {
  explanation?: RecommendationExplanation;
}

const formatMillicores = (mc: number): string => {
  if (mc >= 1000) {
    return `${(mc / 1000).toFixed(2)} cores`;
  }
  return `${mc} millicores`;
};

const formatKiB = (kib: number): string => {
  if (kib >= 1048576) {
    return `${(kib / 1048576).toFixed(2)} GiB`;
  }
  if (kib >= 1024) {
    return `${(kib / 1024).toFixed(1)} MiB`;
  }
  return `${kib} KiB`;
};

const formatBasisPoints = (bp: number): string => {
  return `${(bp / 100).toFixed(1)}%`;
};

const hasAnyExplanation = (explanation?: RecommendationExplanation): boolean => {
  if (!explanation) {
    return false;
  }
  return Object.values(explanation).some(v => v !== null && v !== undefined);
};

export const OptimizationsBreakdownExplanation: React.FC<OptimizationsBreakdownExplanationProps> = ({
  explanation,
}) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasAnyExplanation(explanation)) {
    return null;
  }

  const items: { label: string; value: string }[] = [];

  if (explanation.data_days != null) {
    items.push({
      label: intl.formatMessage(messages.explanationDataDays),
      value: `${explanation.data_days}`,
    });
  }

  if (explanation.cpu_usage_p95_millicores != null) {
    items.push({
      label: intl.formatMessage(messages.explanationCpuP95),
      value: formatMillicores(explanation.cpu_usage_p95_millicores),
    });
  }

  if (explanation.cpu_usage_p50_millicores != null) {
    items.push({
      label: intl.formatMessage(messages.explanationCpuP50),
      value: formatMillicores(explanation.cpu_usage_p50_millicores),
    });
  }

  if (explanation.cpu_usage_mean_millicores != null) {
    items.push({
      label: intl.formatMessage(messages.explanationCpuMean),
      value: formatMillicores(explanation.cpu_usage_mean_millicores),
    });
  }

  if (explanation.cpu_adaptive_margin_basis_points != null) {
    items.push({
      label: intl.formatMessage(messages.explanationCpuMargin),
      value: formatBasisPoints(explanation.cpu_adaptive_margin_basis_points),
    });
  }

  if (explanation.cpu_trend_slope != null) {
    items.push({
      label: intl.formatMessage(messages.explanationCpuTrend),
      value: explanation.cpu_trend_slope.toFixed(4),
    });
  }

  if (explanation.mem_usage_p95_kib != null) {
    items.push({
      label: intl.formatMessage(messages.explanationMemP95),
      value: formatKiB(explanation.mem_usage_p95_kib),
    });
  }

  if (explanation.mem_usage_p50_kib != null) {
    items.push({
      label: intl.formatMessage(messages.explanationMemP50),
      value: formatKiB(explanation.mem_usage_p50_kib),
    });
  }

  if (explanation.mem_usage_mean_kib != null) {
    items.push({
      label: intl.formatMessage(messages.explanationMemMean),
      value: formatKiB(explanation.mem_usage_mean_kib),
    });
  }

  if (explanation.mem_adaptive_margin_basis_points != null) {
    items.push({
      label: intl.formatMessage(messages.explanationMemMargin),
      value: formatBasisPoints(explanation.mem_adaptive_margin_basis_points),
    });
  }

  if (explanation.mem_trend_slope != null) {
    items.push({
      label: intl.formatMessage(messages.explanationMemTrend),
      value: explanation.mem_trend_slope.toFixed(4),
    });
  }

  if (explanation.oom_count_sum != null && explanation.oom_count_sum > 0) {
    items.push({
      label: intl.formatMessage(messages.explanationOomCount),
      value: `${explanation.oom_count_sum}`,
    });
  }

  if (explanation.oom_bump_applied != null) {
    items.push({
      label: intl.formatMessage(messages.explanationOomBump),
      value: explanation.oom_bump_applied
        ? intl.formatMessage(messages.explanationYes)
        : intl.formatMessage(messages.explanationNo),
    });
  }

  if (explanation.cpu_floor_applied != null) {
    items.push({
      label: intl.formatMessage(messages.explanationCpuFloor),
      value: explanation.cpu_floor_applied
        ? intl.formatMessage(messages.explanationYes)
        : intl.formatMessage(messages.explanationNo),
    });
  }

  if (explanation.is_idle === true) {
    items.push({
      label: intl.formatMessage(messages.explanationIdle),
      value: intl.formatMessage(messages.explanationYes),
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <ExpandableSection
      toggleText={intl.formatMessage(messages.explanationTitle)}
      onToggle={(_event, expanded) => setIsExpanded(expanded)}
      isExpanded={isExpanded}
    >
      <Content component="small">
        {intl.formatMessage(messages.explanationDataDays)}: {explanation.data_days ?? '—'}
      </Content>
      <DescriptionList isHorizontal isCompact horizontalTermWidthModifier={{ default: '14ch', sm: '18ch', md: '22ch' }}>
        {items.map((item, index) => (
          <DescriptionListGroup key={index}>
            <DescriptionListTerm>{item.label}</DescriptionListTerm>
            <DescriptionListDescription>{item.value}</DescriptionListDescription>
          </DescriptionListGroup>
        ))}
      </DescriptionList>
    </ExpandableSection>
  );
};
