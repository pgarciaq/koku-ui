import { EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

interface ColdStartStateOwnProps {
  currentDays?: number;
  minDays?: number;
}

type ColdStartStateProps = ColdStartStateOwnProps;

const ColdStartState: React.FC<ColdStartStateProps> = ({ currentDays = 0, minDays = 3 }) => {
  const intl = useIntl();
  return (
    <EmptyState
      headingLevel="h1"
      icon={InProgressIcon}
      titleText={intl.formatMessage(messages.nodeColdStartTitle)}
      variant={EmptyStateVariant.lg}
      className="pf-m-redhat-font"
    >
      <EmptyStateBody>
        {intl.formatMessage(messages.nodeColdStartDesc, {
          minDays,
          currentDays,
        })}
      </EmptyStateBody>
    </EmptyState>
  );
};

export { ColdStartState };
