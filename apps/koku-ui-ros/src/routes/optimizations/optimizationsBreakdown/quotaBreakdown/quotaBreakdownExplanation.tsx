import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
} from '@patternfly/react-core';
import type { QuotaExplanationAPI } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

interface QuotaBreakdownExplanationOwnProps {
  explanation?: QuotaExplanationAPI;
}

const formatBasisPoints = (bp: number): string => `${(bp / 100).toFixed(1)}%`;

const formatMillicores = (mc: number): string => {
  if (mc >= 1000) {
    return `${(mc / 1000).toFixed(2)} cores`;
  }
  return `${mc} millicores`;
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GiB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MiB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${bytes} B`;
};

const hasTechnicalDetails = (explanation?: QuotaExplanationAPI): boolean => {
  if (!explanation) {
    return false;
  }
  return (
    explanation.headroom_basis_points != null ||
    explanation.container_cpu_sum_millicores != null ||
    explanation.container_mem_sum_bytes != null ||
    explanation.signal_c_cpu_used_millicores != null ||
    explanation.max_utilization_basis_points != null ||
    explanation.risk_level != null
  );
};

const getExplanationMessage = (
  intl: ReturnType<typeof useIntl>,
  explanation?: QuotaExplanationAPI
): string | undefined => {
  const reason = explanation?.recommendation_reason;
  if (!reason) {
    return undefined;
  }
  const utilization =
    explanation?.max_utilization_basis_points != null
      ? formatBasisPoints(explanation.max_utilization_basis_points)
      : '—';
  const headroom =
    explanation?.headroom_basis_points != null
      ? formatBasisPoints(explanation.headroom_basis_points - 10000)
      : '—';

  switch (reason) {
    case 'raise':
      return intl.formatMessage(messages.quotaExplanationReasonRaise, { utilization });
    case 'tighten':
      return intl.formatMessage(messages.quotaExplanationReasonTighten, { utilization, headroom });
    case 'optimal':
      return intl.formatMessage(messages.quotaExplanationReasonOptimal, { utilization });
    default:
      return reason;
  }
};

const QuotaBreakdownExplanation: React.FC<QuotaBreakdownExplanationOwnProps> = ({ explanation }) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!explanation?.recommendation_reason && !hasTechnicalDetails(explanation)) {
    return null;
  }

  const explanationText = getExplanationMessage(intl, explanation);

  const technicalItems: { label: string; value: string }[] = [];

  if (explanation?.headroom_basis_points != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationHeadroom),
      value: formatBasisPoints(explanation.headroom_basis_points),
    });
  }
  if (explanation?.container_cpu_sum_millicores != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationContainerCpuSum),
      value: formatMillicores(explanation.container_cpu_sum_millicores),
    });
  }
  if (explanation?.container_mem_sum_bytes != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationContainerMemSum),
      value: formatBytes(explanation.container_mem_sum_bytes),
    });
  }
  if (explanation?.signal_c_cpu_used_millicores != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationSignalCpu),
      value: formatMillicores(explanation.signal_c_cpu_used_millicores),
    });
  }
  if (explanation?.max_utilization_basis_points != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationMaxUtilization),
      value: formatBasisPoints(explanation.max_utilization_basis_points),
    });
  }
  if (explanation?.risk_level) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaRiskLevel),
      value: explanation.risk_level,
    });
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {explanationText && (
        <Alert isInline title={intl.formatMessage(messages.quotaExplanationTitle)} variant="info">
          {explanationText}
        </Alert>
      )}
      {technicalItems.length > 0 && (
        <ExpandableSection
          isExpanded={isExpanded}
          onToggle={(_event, expanded) => setIsExpanded(expanded)}
          style={{ marginTop: explanationText ? 16 : 0 }}
          toggleText={intl.formatMessage(messages.quotaExplanationTechnicalDetails)}
        >
          <DescriptionList isCompact>
            {technicalItems.map(item => (
              <DescriptionListGroup key={item.label}>
                <DescriptionListTerm>{item.label}</DescriptionListTerm>
                <DescriptionListDescription>{item.value}</DescriptionListDescription>
              </DescriptionListGroup>
            ))}
          </DescriptionList>
        </ExpandableSection>
      )}
    </div>
  );
};

export { QuotaBreakdownExplanation };
