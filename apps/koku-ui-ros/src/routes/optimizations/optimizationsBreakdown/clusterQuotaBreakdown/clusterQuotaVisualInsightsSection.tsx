import { Card, CardBody, CardTitle, Title } from '@patternfly/react-core';
import type { ClusterQuotaExplanationAPI, QuotaResourceValues, QuotaUtilizationPercents } from 'api/ros/recommendations';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

import { ClusterQuotaUtilizationGauges } from './clusterQuotaUtilizationGauges';

interface ClusterQuotaVisualInsightsSectionOwnProps {
  explanation?: ClusterQuotaExplanationAPI;
  quotaHard?: QuotaResourceValues;
  quotaUsed?: QuotaResourceValues;
  utilization?: QuotaUtilizationPercents;
}

const ClusterQuotaVisualInsightsSection: React.FC<ClusterQuotaVisualInsightsSectionOwnProps> = ({
  explanation,
  quotaHard,
  quotaUsed,
  utilization,
}) => {
  const intl = useIntl();

  const hasAnyValidHard =
    (quotaHard?.cpu_limit_millicores != null && quotaHard.cpu_limit_millicores > 0) ||
    (quotaHard?.memory_limit_bytes != null && quotaHard.memory_limit_bytes > 0) ||
    (quotaHard?.pods != null && quotaHard.pods > 0);

  if (!hasAnyValidHard) {
    return null;
  }

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="lg">
          {intl.formatMessage(messages.visualInsights)}
        </Title>
      </CardTitle>
      <CardBody>
        <ClusterQuotaUtilizationGauges
          headroomBasisPoints={explanation?.headroom_basis_points}
          quotaHard={quotaHard}
          quotaUsed={quotaUsed}
          utilization={utilization}
        />
      </CardBody>
    </Card>
  );
};

export { ClusterQuotaVisualInsightsSection };
