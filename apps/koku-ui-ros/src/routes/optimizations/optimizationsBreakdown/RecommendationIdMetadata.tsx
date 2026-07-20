import {
  Content,
  ContentVariants,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import messages from 'locales/messages';
import React from 'react';
import { useIntl } from 'react-intl';

interface RecommendationIdMetadataProps {
  recommendationId?: string;
  variant?: 'content' | 'descriptionList';
}

const RecommendationIdMetadata: React.FC<RecommendationIdMetadataProps> = ({
  recommendationId,
  variant = 'content',
}) => {
  const intl = useIntl();

  if (!recommendationId) {
    return null;
  }

  const label = intl.formatMessage(messages.optimizationsValues, { value: 'recommendation_id' });

  if (variant === 'descriptionList') {
    return (
      <DescriptionListGroup>
        <DescriptionListTerm>{label}</DescriptionListTerm>
        <DescriptionListDescription>{recommendationId}</DescriptionListDescription>
      </DescriptionListGroup>
    );
  }

  return (
    <>
      <Content component={ContentVariants.dt}>{label}</Content>
      <Content component={ContentVariants.dd}>{recommendationId}</Content>
    </>
  );
};

export { RecommendationIdMetadata };
