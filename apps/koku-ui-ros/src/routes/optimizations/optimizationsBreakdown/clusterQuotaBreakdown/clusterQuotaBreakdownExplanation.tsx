import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
} from '@patternfly/react-core';
import type { ClusterQuotaExplanationAPI } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

interface ClusterQuotaBreakdownExplanationOwnProps {
  explanation?: ClusterQuotaExplanationAPI;
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

const hasTechnicalDetails = (explanation?: ClusterQuotaExplanationAPI): boolean => {
  if (!explanation) {
    return false;
  }
  return (
    explanation.headroom_basis_points != null ||
    explanation.ns_quota_cpu_sum_millicores != null ||
    explanation.ns_quota_mem_sum_bytes != null ||
    explanation.base_cpu_millicores != null ||
    explanation.max_utilization_basis_points != null
  );
};

const ClusterQuotaBreakdownExplanation: React.FC<ClusterQuotaBreakdownExplanationOwnProps> = ({ explanation }) => {
  const intl = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!explanation?.recommendation_reason && !hasTechnicalDetails(explanation)) {
    return null;
  }

  const technicalItems: { label: string; value: string }[] = [];

  if (explanation?.headroom_basis_points != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationHeadroom),
      value: formatBasisPoints(explanation.headroom_basis_points),
    });
  }
  if (explanation?.ns_quota_cpu_sum_millicores != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationNsQuotaCpuSum),
      value: formatMillicores(explanation.ns_quota_cpu_sum_millicores),
    });
  }
  if (explanation?.ns_quota_mem_sum_bytes != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationNsQuotaMemSum),
      value: formatBytes(explanation.ns_quota_mem_sum_bytes),
    });
  }
  if (explanation?.base_cpu_millicores != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationBaseCpu),
      value: formatMillicores(explanation.base_cpu_millicores),
    });
  }
  if (explanation?.max_utilization_basis_points != null) {
    technicalItems.push({
      label: intl.formatMessage(messages.quotaExplanationMaxUtilization),
      value: formatBasisPoints(explanation.max_utilization_basis_points),
    });
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {explanation?.recommendation_reason && (
        <Alert isInline title={intl.formatMessage(messages.quotaExplanationTitle)} variant="info">
          {explanation.recommendation_reason}
        </Alert>
      )}
      {technicalItems.length > 0 && (
        <ExpandableSection
          isExpanded={isExpanded}
          onToggle={(_event, expanded) => setIsExpanded(expanded)}
          style={{ marginTop: explanation?.recommendation_reason ? 16 : 0 }}
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

export { ClusterQuotaBreakdownExplanation };
