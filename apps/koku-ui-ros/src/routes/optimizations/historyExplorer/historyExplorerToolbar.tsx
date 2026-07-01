import {
  Button,
  DatePicker,
  InputGroup,
  InputGroupItem,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, ExportIcon } from '@patternfly/react-icons';
import messages from 'locales/messages';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

export interface HistoryExplorerFilters {
  cluster?: string[];
  project?: string[];
  workload?: string[];
  container?: string[];
  term?: string;
  engine?: string;
  start_date?: string;
  end_date?: string;
}

interface HistoryExplorerToolbarProps {
  filters: HistoryExplorerFilters;
  onFiltersChange: (filters: HistoryExplorerFilters) => void;
  onExport: () => void;
  pagination?: React.ReactNode;
  isDisabled?: boolean;
}

const HistoryExplorerToolbar: React.FC<HistoryExplorerToolbarProps> = ({
  filters,
  onFiltersChange,
  onExport,
  pagination,
  isDisabled = false,
}) => {
  const intl = useIntl();
  const [currentCategory, setCurrentCategory] = useState('cluster');
  const [currentValue, setCurrentValue] = useState('');
  const [isTermOpen, setIsTermOpen] = useState(false);
  const [isEngineOpen, setIsEngineOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoryOptions = [
    { key: 'cluster', name: intl.formatMessage(messages.historyFilterCluster) },
    { key: 'project', name: intl.formatMessage(messages.historyFilterProject) },
    { key: 'workload', name: intl.formatMessage(messages.historyFilterWorkload) },
    { key: 'container', name: intl.formatMessage(messages.historyFilterContainer) },
  ];

  const termOptions = [
    { key: '', name: intl.formatMessage(messages.historyAllTerms) },
    { key: 'short', name: intl.formatMessage(messages.historyTermShort) },
    { key: 'medium', name: intl.formatMessage(messages.historyTermMedium) },
    { key: 'long', name: intl.formatMessage(messages.historyTermLong) },
  ];

  const engineOptions = [
    { key: '', name: intl.formatMessage(messages.historyAllEngines) },
    { key: 'cost', name: intl.formatMessage(messages.historyEngineCost) },
    { key: 'performance', name: intl.formatMessage(messages.historyEnginePerformance) },
  ];

  const handleAddFilter = () => {
    if (!currentValue.trim()) {
      return;
    }
    const key = currentCategory as 'cluster' | 'project' | 'workload' | 'container';
    const existing = filters[key] || [];
    if (!existing.includes(currentValue.trim())) {
      onFiltersChange({
        ...filters,
        [key]: [...existing, currentValue.trim()],
      });
    }
    setCurrentValue('');
  };

  const handleRemoveFilter = (category: string, value: string) => {
    const key = category as 'cluster' | 'project' | 'workload' | 'container';
    const existing = filters[key] || [];
    onFiltersChange({
      ...filters,
      [key]: existing.filter(v => v !== value),
    });
  };

  const handleTermSelect = (_event: any, value: string) => {
    onFiltersChange({ ...filters, term: value || undefined });
    setIsTermOpen(false);
  };

  const handleEngineSelect = (_event: any, value: string) => {
    onFiltersChange({ ...filters, engine: value || undefined });
    setIsEngineOpen(false);
  };

  const handleStartDateChange = (_event: any, value: string) => {
    onFiltersChange({ ...filters, start_date: value || undefined });
  };

  const handleEndDateChange = (_event: any, value: string) => {
    onFiltersChange({ ...filters, end_date: value || undefined });
  };

  const getFilterLabels = (category: string): string[] => {
    return (filters[category as keyof HistoryExplorerFilters] as string[]) || [];
  };

  return (
    <Toolbar clearAllFilters={() => onFiltersChange({ start_date: filters.start_date, end_date: filters.end_date })}>
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <Select
                isOpen={isCategoryOpen}
                onOpenChange={setIsCategoryOpen}
                onSelect={(_event, value) => {
                  setCurrentCategory(value as string);
                  setIsCategoryOpen(false);
                }}
                selected={currentCategory}
                toggle={toggleRef => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsCategoryOpen(!isCategoryOpen)} isExpanded={isCategoryOpen}>
                    {categoryOptions.find(o => o.key === currentCategory)?.name}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {categoryOptions.map(opt => (
                    <SelectOption key={opt.key} value={opt.key}>
                      {opt.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
            <ToolbarItem>
              <InputGroup>
                <InputGroupItem isFill>
                  <SearchInput
                    aria-label={intl.formatMessage(messages.historyFilterSearch)}
                    onChange={(_event, value) => setCurrentValue(value)}
                    onClear={() => setCurrentValue('')}
                    onSearch={handleAddFilter}
                    placeholder={intl.formatMessage(messages.historyFilterPlaceholder, {
                      category: categoryOptions.find(o => o.key === currentCategory)?.name?.toLowerCase(),
                    })}
                    value={currentValue}
                  />
                </InputGroupItem>
              </InputGroup>
            </ToolbarItem>

            {categoryOptions.map(cat => (
              <ToolbarFilter
                key={cat.key}
                labels={getFilterLabels(cat.key)}
                deleteLabel={(_category, label) => handleRemoveFilter(cat.key, label as string)}
                deleteLabelGroup={() => onFiltersChange({ ...filters, [cat.key]: [] })}
                categoryName={cat.name}
                showToolbarItem={false}
              >
                {null}
              </ToolbarFilter>
            ))}
          </ToolbarGroup>

          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <Select
                isOpen={isTermOpen}
                onOpenChange={setIsTermOpen}
                onSelect={handleTermSelect}
                selected={filters.term || ''}
                toggle={toggleRef => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsTermOpen(!isTermOpen)} isExpanded={isTermOpen}>
                    {termOptions.find(o => o.key === (filters.term || ''))?.name}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {termOptions.map(opt => (
                    <SelectOption key={opt.key} value={opt.key}>
                      {opt.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
            <ToolbarItem>
              <Select
                isOpen={isEngineOpen}
                onOpenChange={setIsEngineOpen}
                onSelect={handleEngineSelect}
                selected={filters.engine || ''}
                toggle={toggleRef => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsEngineOpen(!isEngineOpen)} isExpanded={isEngineOpen}>
                    {engineOptions.find(o => o.key === (filters.engine || ''))?.name}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {engineOptions.map(opt => (
                    <SelectOption key={opt.key} value={opt.key}>
                      {opt.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
          </ToolbarGroup>

          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <DatePicker
                aria-label={intl.formatMessage(messages.historyStartDate)}
                onChange={handleStartDateChange}
                placeholder={intl.formatMessage(messages.historyStartDate)}
                value={filters.start_date || ''}
              />
            </ToolbarItem>
            <ToolbarItem>
              <DatePicker
                aria-label={intl.formatMessage(messages.historyEndDate)}
                onChange={handleEndDateChange}
                placeholder={intl.formatMessage(messages.historyEndDate)}
                value={filters.end_date || ''}
              />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>

        <ToolbarItem variant="separator" />

        <ToolbarItem>
          <Button variant="plain" aria-label={intl.formatMessage(messages.historyExport)} onClick={onExport} isDisabled={isDisabled}>
            <ExportIcon />
          </Button>
        </ToolbarItem>

        <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
          {pagination}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export { HistoryExplorerToolbar };
export type { HistoryExplorerToolbarProps };
