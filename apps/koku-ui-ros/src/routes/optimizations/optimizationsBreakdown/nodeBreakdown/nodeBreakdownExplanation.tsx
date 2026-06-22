import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
} from '@patternfly/react-core';
import type { NodeExplanation } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

interface NodeBreakdownExplanationOwnProps {
  explanation?: NodeExplanation;
}

type NodeBreakdownExplanationProps = NodeBreakdownExplanationOwnProps;

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

const formatBasisPoints = (bp: number): string => `${(bp / 100).toFixed(1)}%`;

const hasNodeExplanation = (explanation?: NodeExplanation): boolean => {
  if (!explanation) {
    return false;
  }
  return Object.values(explanation).some(value => value !== null && value !== undefined);
};

const NodeBreakdownExplanation: React.FC<NodeBreakdownExplanationProps> = ({ explanation }) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasNodeExplanation(explanation)) {
    return null;
  }

  const items: { label: string; value: string }[] = [];

  if (explanation.confidence_level != null) {
    items.push({
      label: intl.formatMessage(messages.explanationConfidenceLevel),
      value: `${(explanation.confidence_level * 100).toFixed(1)}%`,
    });
  }
  if (explanation.data_days != null) {
    items.push({
      label: intl.formatMessage(messages.explanationDataDays),
      value: `${explanation.data_days}`,
    });
  }
  if (explanation.target_utilization_basis_points != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationTargetUtilization),
      value: formatBasisPoints(explanation.target_utilization_basis_points),
    });
  }
  if (explanation.current_cpu_millicores != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationCurrentCpu),
      value: formatMillicores(explanation.current_cpu_millicores),
    });
  }
  if (explanation.max_cpu_usage_p95_millicores != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationMaxCpuP95),
      value: formatMillicores(explanation.max_cpu_usage_p95_millicores),
    });
  }
  if (explanation.current_mem_kib != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationCurrentMemory),
      value: formatKiB(explanation.current_mem_kib),
    });
  }
  if (explanation.max_mem_usage_p95_kib != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationMaxMemP95),
      value: formatKiB(explanation.max_mem_usage_p95_kib),
    });
  }
  if (explanation.pod_scheduling_headroom_basis_points != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationPodHeadroom),
      value: formatBasisPoints(explanation.pod_scheduling_headroom_basis_points),
    });
  }
  if (explanation.ema_imbalance_basis_points != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationEmaImbalance),
      value: formatBasisPoints(explanation.ema_imbalance_basis_points),
    });
  }
  if (explanation.consolidation_applied != null) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationConsolidationApplied),
      value: explanation.consolidation_applied
        ? intl.formatMessage(messages.explanationYes)
        : intl.formatMessage(messages.explanationNo),
    });
  }
  if (explanation.sizing_formula) {
    items.push({
      label: intl.formatMessage(messages.nodeExplanationSizingFormula),
      value: explanation.sizing_formula,
    });
  }

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      onToggle={(_event, expanded) => setIsExpanded(expanded)}
      toggleText={intl.formatMessage(messages.explanationTitle)}
    >
      <DescriptionList isHorizontal isCompact>
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

export { NodeBreakdownExplanation };
