import { Card, CardBody, CardTitle, Title, Tooltip } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';
import { DecayCurveChart } from 'routes/optimizations/settings/decayCurveChart';

interface DecayInfoCardProps {
  halfLifeHours: number;
  termName: string;
  windowDays: number;
}

const DecayInfoCard: React.FC<DecayInfoCardProps> = ({ halfLifeHours, termName, windowDays }) => {
  const intl = useIntl();

  const halfLifeDays = halfLifeHours > 0 ? parseFloat((halfLifeHours / 24).toFixed(1)) : 0;
  const isUniform = halfLifeHours <= 0;

  return (
    <Card isCompact data-testid="decay-info-card">
      <CardTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Title headingLevel="h4" size="md">
            {intl.formatMessage(messages.decayInfoCardTitle)}
          </Title>
          {!isUniform && (
            <Tooltip content={intl.formatMessage(messages.decayInfoCardHalfLifeDesc, { halfLifeDays })}>
              <InfoCircleIcon color="var(--pf-t--global--text--color--subtle)" />
            </Tooltip>
          )}
        </div>
      </CardTitle>
      <CardBody>
        <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)' }}>
          {termName} — {intl.formatMessage(messages.decaySettingsHalfLifeHours)}: {halfLifeHours}h
        </div>
        <DecayCurveChart halfLifeHours={halfLifeHours} windowDays={windowDays} height={120} />
      </CardBody>
    </Card>
  );
};

export { DecayInfoCard };
