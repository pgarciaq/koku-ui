import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Popover,
} from '@patternfly/react-core';
import { TagIcon } from '@patternfly/react-icons/dist/esm/icons/tag-icon';
import React from 'react';

interface RecommendationTagsLinkProps {
  tags?: Record<string, string>;
}

const RecommendationTagsLink: React.FC<RecommendationTagsLinkProps> = ({ tags }) => {
  if (!tags || Object.keys(tags).length === 0) {
    return <>—</>;
  }

  const entries = Object.entries(tags);

  return (
    <Popover
      bodyContent={
        <DescriptionList isCompact>
          {entries.map(([key, value]) => (
            <DescriptionListGroup key={key}>
              <DescriptionListTerm>{key}</DescriptionListTerm>
              <DescriptionListDescription>{value}</DescriptionListDescription>
            </DescriptionListGroup>
          ))}
        </DescriptionList>
      }
      triggerAction="click"
    >
      <Button variant="link" isInline icon={<TagIcon aria-hidden />}>
        {entries.length}
      </Button>
    </Popover>
  );
};

export { RecommendationTagsLink };
