import {
  Button,
  InputGroup,
  InputGroupItem,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { DownloadIcon, SearchIcon } from '@patternfly/react-icons';
import type { QualityEntityType } from 'api/ros/quality';
import { getQualityCsvUrl } from 'api/ros/quality';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

export interface QualityFilters {
  start_date?: string;
  end_date?: string;
  'filter[cluster]'?: string;
  'filter[project]'?: string;
  'filter[workload]'?: string;
  'filter[container]'?: string;
  'filter[engine]'?: string;
}

interface QualityToolbarProps {
  entityType?: QualityEntityType;
  filters: QualityFilters;
  onFiltersChange: (filters: QualityFilters) => void;
}

const QualityToolbar: React.FC<QualityToolbarProps> = ({ entityType = 'container', filters, onFiltersChange }) => {
  const intl = useIntl();
  const [clusterInput, setClusterInput] = useState(filters['filter[cluster]'] ?? '');
  const [projectInput, setProjectInput] = useState(filters['filter[project]'] ?? '');

  const handleSearch = () => {
    const newFilters = { ...filters };
    if (clusterInput.trim()) {
      newFilters['filter[cluster]'] = clusterInput.trim();
    } else {
      delete newFilters['filter[cluster]'];
    }
    if (projectInput.trim()) {
      newFilters['filter[project]'] = projectInput.trim();
    } else {
      delete newFilters['filter[project]'];
    }
    onFiltersChange(newFilters);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCsvDownload = () => {
    const params: Record<string, string> = {};
    for (const [key, val] of Object.entries(filters)) {
      if (val) {
        params[key] = val;
      }
    }
    const url = getQualityCsvUrl(params, entityType);
    window.open(url, '_blank');
  };

  return (
    <Toolbar style={{ marginBottom: 16 }}>
      <ToolbarContent>
        <ToolbarGroup variant="filter-group">
          <ToolbarItem>
            <InputGroup>
              <InputGroupItem>
                <TextInput
                  aria-label={intl.formatMessage(messages.qualityFilterCluster)}
                  onChange={(_event, value) => setClusterInput(value)}
                  onKeyPress={handleKeyPress}
                  placeholder={intl.formatMessage(messages.qualityFilterCluster)}
                  type="text"
                  value={clusterInput}
                />
              </InputGroupItem>
              <InputGroupItem>
                <TextInput
                  aria-label={intl.formatMessage(messages.qualityFilterProject)}
                  onChange={(_event, value) => setProjectInput(value)}
                  onKeyPress={handleKeyPress}
                  placeholder={intl.formatMessage(messages.qualityFilterProject)}
                  type="text"
                  value={projectInput}
                />
              </InputGroupItem>
              <InputGroupItem>
                <Button variant="control" aria-label="Search" onClick={handleSearch}>
                  <SearchIcon />
                </Button>
              </InputGroupItem>
            </InputGroup>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarItem align={{ default: 'alignEnd' }}>
          <Button variant="link" icon={<DownloadIcon />} onClick={handleCsvDownload}>
            {intl.formatMessage(messages.qualityCsvDownload)}
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export { QualityToolbar };
