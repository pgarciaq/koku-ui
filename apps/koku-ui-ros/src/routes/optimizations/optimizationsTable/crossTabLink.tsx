import { Button } from '@patternfly/react-core';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { CrossTabNavTarget } from './crossTabNavigation';
import { buildCrossTabUrl, buildSameTabFilterUrl } from './crossTabNavigation';

export interface CrossTabLinkProps {
  children: React.ReactNode;
  target: CrossTabNavTarget;
}

export const CrossTabLink: React.FC<CrossTabLinkProps> = ({ children, target }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = buildCrossTabUrl(target);
    navigate(url);
  };

  return (
    <Button variant="link" isInline onClick={handleClick}>
      {children}
    </Button>
  );
};

export interface SameTabFilterLinkProps {
  children: React.ReactNode;
  filterKey: string;
  filterValue: string;
  prefix: string;
}

export const SameTabFilterLink: React.FC<SameTabFilterLinkProps> = ({ children, filterKey, filterValue, prefix }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = buildSameTabFilterUrl(location.search, prefix, filterKey, filterValue);
    navigate(url);
  };

  return (
    <Button variant="link" isInline onClick={handleClick}>
      {children}
    </Button>
  );
};
