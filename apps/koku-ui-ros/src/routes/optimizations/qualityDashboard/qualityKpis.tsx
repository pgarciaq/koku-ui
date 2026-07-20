import { Card, CardBody, CardTitle, Flex, FlexItem, Title } from '@patternfly/react-core';
import type { QualityRow } from 'api/ros/quality';
import messages from 'locales/messages';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

interface QualityKpisProps {
  data: QualityRow[];
}

const QualityKpis: React.FC<QualityKpisProps> = ({ data }) => {
  const intl = useIntl();

  const kpis = useMemo(() => {
    if (!data.length) {
      return { stabilityPct: 0, adoptionPct: 0, oomTotal: 0 };
    }

    const withStability = data.filter(r => r.stability_pct != null);
    const stabilityPct =
      withStability.length > 0
        ? (withStability.reduce((sum, r) => sum + (r.stability_pct ?? 0), 0) / withStability.length) * 100
        : 0;

    const adoptionPct = (data.filter(r => r.adoption_detected).length / data.length) * 100;

    const oomTotal = data.reduce((sum, r) => sum + (r.oom_events_after_rec ?? 0), 0);

    return { stabilityPct, adoptionPct, oomTotal };
  }, [data]);

  return (
    <Flex spaceItems={{ default: 'spaceItemsMd' }} style={{ marginBottom: 16 }}>
      <FlexItem flex={{ default: 'flex_1' }}>
        <Card isCompact>
          <CardTitle>{intl.formatMessage(messages.qualityKpiStability)}</CardTitle>
          <CardBody>
            <Title headingLevel="h2" size="2xl">
              {kpis.stabilityPct.toFixed(1)}%
            </Title>
          </CardBody>
        </Card>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        <Card isCompact>
          <CardTitle>{intl.formatMessage(messages.qualityKpiAdoption)}</CardTitle>
          <CardBody>
            <Title headingLevel="h2" size="2xl">
              {kpis.adoptionPct.toFixed(1)}%
            </Title>
          </CardBody>
        </Card>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        <Card isCompact>
          <CardTitle>{intl.formatMessage(messages.qualityKpiOom)}</CardTitle>
          <CardBody>
            <Title headingLevel="h2" size="2xl">
              {kpis.oomTotal}
            </Title>
          </CardBody>
        </Card>
      </FlexItem>
    </Flex>
  );
};

export { QualityKpis };
