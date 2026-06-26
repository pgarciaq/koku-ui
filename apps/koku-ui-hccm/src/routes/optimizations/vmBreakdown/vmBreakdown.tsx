import { Bullseye, EmptyState, EmptyStateBody, PageSection } from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

const VmBreakdown: React.FC = () => {
  const intl = useIntl();

  return (
    <PageSection>
      <Bullseye>
        <EmptyState headingLevel="h2" titleText={intl.formatMessage(messages.virtualMachine)}>
          <EmptyStateBody>VM recommendation detail view coming soon.</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    </PageSection>
  );
};

export default VmBreakdown;
