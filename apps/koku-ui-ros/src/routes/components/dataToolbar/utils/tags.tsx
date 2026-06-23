import type { ToolbarLabelGroup } from '@patternfly/react-core';
import { ToolbarFilter, ToolbarItem } from '@patternfly/react-core';
import type { Tag, TagPathsType } from 'api/tags/tag';
import { intl } from 'components/i18n';
import messages from 'locales/messages';
import { cloneDeep, uniq, uniqBy } from 'lodash';
import React from 'react';
import { TagValue } from 'routes/components/dataToolbar/tagValue';
import type { SelectWrapperOption } from 'routes/components/selectWrapper';
import { SelectTypeaheadWrapper } from 'routes/components/selectWrapper';
import { tagKey, tagPrefix } from 'utils/props';

import type { Filters } from './common';
import { getChips, getFilter, hasFilters } from './common';

export const getTagKeySelect = ({
  currentCategory,
  currentTagKey,
  filters,
  isDisabled,
  onTagKeyClear,
  onTagKeySelect,
  tagReport,
}: {
  currentCategory?: string;
  currentTagKey?: string;
  filters?: Filters;
  isDisabled?: boolean;
  onTagKeyClear?: () => void;
  onTagKeySelect?: (event, selection: SelectWrapperOption) => void;
  tagReport?: Tag;
}) => {
  if (currentCategory !== tagKey) {
    return null;
  }

  const selectOptions = getTagKeyOptions(tagReport, undefined, true) as SelectWrapperOption[];

  return (
    <ToolbarItem>
      <SelectTypeaheadWrapper
        aria-label={intl.formatMessage(messages.filterByTagKeyAriaLabel)}
        id="tag-key-select"
        isDisabled={isDisabled && !hasFilters(filters)}
        onClear={onTagKeyClear}
        onSelect={onTagKeySelect}
        options={selectOptions}
        placeholder={intl.formatMessage(messages.chooseKeyPlaceholder)}
        selection={currentTagKey}
      />
    </ToolbarItem>
  );
};

export const getTagKeyOptions = (
  tagReport: Tag,
  filters: Filters,
  isSelectWrapperOption = false
): ToolbarLabelGroup[] | SelectWrapperOption[] => {
  const options = [];
  const reportOptions = getTagKeyOptionsFromReport(tagReport, isSelectWrapperOption);
  const filterOptions = getTagKeyOptionsFromFilters(filters, isSelectWrapperOption);

  const isTagKeyEqual = (a, b) => {
    if (isSelectWrapperOption) {
      return a.value === b.value;
    } else {
      return a.name === b.name;
    }
  };

  for (const reportOption of reportOptions) {
    if (!options.find(option => isTagKeyEqual(option, reportOption))) {
      options.push(reportOption);
    }
  }
  for (const filterOption of filterOptions) {
    if (!options.find(option => isTagKeyEqual(option, filterOption))) {
      options.push(filterOption);
    }
  }
  return options;
};

const getTagKeyOptionsFromFilters = (
  filter: Filters,
  isSelectWrapperOption = false
): ToolbarLabelGroup[] | SelectWrapperOption[] => {
  const options = [];

  if (!filter?.tag) {
    return options;
  }

  for (const key of Object.keys(filter.tag)) {
    options.push(
      isSelectWrapperOption
        ? {
            toString: () => key,
            value: key,
          }
        : {
            key,
            name: key,
          }
    );
  }
  return options;
};

const getTagKeyOptionsFromReport = (
  tagReport: Tag,
  isSelectWrapperOption = false
): ToolbarLabelGroup[] | SelectWrapperOption[] => {
  let options = [];

  if (!tagReport?.data) {
    return options;
  }

  let hasTagKeys = false;
  for (const item of tagReport.data) {
    if (item.hasOwnProperty('key')) {
      hasTagKeys = true;
      break;
    }
  }

  let data = uniq(tagReport.data);
  if (hasTagKeys) {
    const keepData = tagReport.data.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ type, ...keepProps }: any) => keepProps
    );
    data = uniqBy(keepData, 'key');
  }

  if (data.length > 0) {
    options = data.map(item => {
      const key = hasTagKeys ? item.key : item;
      return isSelectWrapperOption
        ? {
            toString: () => key,
            value: key,
          }
        : {
            key,
            name: key,
          };
    });
  }
  return options;
};

// Tag value select

export const getTagValueSelect = ({
  currentCategory,
  currentTagKey,
  filters,
  isDisabled,
  onDelete,
  onTagValueSelect,
  onTagValueInput,
  onTagValueInputChange,
  tagKeyValueInput,
  tagKeyOption,
  tagPathsType,
}: {
  currentCategory?: string;
  currentTagKey?: string;
  filters?: Filters;
  isDisabled?: boolean;
  onDelete?: (type: any, chip: any) => void;
  onTagValueSelect?: (event: any, selection) => void;
  onTagValueInput?: (event: any) => void;
  onTagValueInputChange?: (value: string) => void;
  tagKeyValueInput?: string;
  tagKeyOption?: ToolbarLabelGroup;
  tagPathsType?: TagPathsType;
}) => {
  const categoryName = {
    name: tagKeyOption.name,
    key: `${tagPrefix}${tagKeyOption.key}`,
  };

  return (
    <ToolbarFilter
      categoryName={categoryName}
      labels={getChips(filters?.tag?.[tagKeyOption.key])}
      deleteLabel={onDelete}
      key={tagKeyOption.key}
      showToolbarItem={currentCategory === tagKey && currentTagKey === tagKeyOption.key}
    >
      <TagValue
        isDisabled={isDisabled && !hasFilters(filters)}
        onTagValueSelect={onTagValueSelect}
        onTagValueInput={onTagValueInput}
        onTagValueInputChange={onTagValueInputChange}
        selections={filters?.tag?.[tagKeyOption.key]?.map(filter => filter.value)}
        tagKey={tagKeyOption.key}
        tagKeyValue={tagKeyValueInput}
        tagPathsType={tagPathsType}
      />
    </ToolbarFilter>
  );
};

export const onTagValueInput = ({
  currentFilters,
  currentTagKey,
  event,
  tagKeyValueInput,
}: {
  currentFilters?: Filters;
  currentTagKey?: string;
  event?: any;
  tagKeyValueInput?: string;
}) => {
  if ((event.key && event.key !== 'Enter') || tagKeyValueInput.trim() === '') {
    return {};
  }

  const filter = getFilter(`${tagPrefix}${currentTagKey}`, tagKeyValueInput);
  const newFilters: any = cloneDeep(
    currentFilters.tag && currentFilters.tag[currentTagKey] ? currentFilters.tag[currentTagKey] : []
  );

  for (const item of newFilters) {
    if (item.value === tagKeyValueInput) {
      return {
        filter,
        filters: {
          ...currentFilters,
        },
      };
    }
  }
  return {
    filter,
    filters: {
      ...currentFilters,
      tag: {
        ...currentFilters.tag,
        [currentTagKey]: [...newFilters, filter],
      },
    },
  };
};

export const onTagValueSelect = ({
  currentFilters,
  currentTagKey,
  event,
  selection,
}: {
  currentFilters?: Filters;
  currentTagKey?: string;
  event?: any;
  selection: SelectWrapperOption;
}) => {
  const checked = event.target.checked;
  let filter;
  if (checked) {
    filter = getFilter(`${tagPrefix}${currentTagKey}`, selection.value);
  } else if (currentFilters.tag[currentTagKey]) {
    filter = currentFilters.tag[currentTagKey].find(item => item.value === selection.value);
  }

  const newFilters: any = cloneDeep(currentFilters.tag[currentTagKey] ? currentFilters.tag[currentTagKey] : []);

  return {
    filter,
    filters: {
      ...currentFilters,
      tag: {
        ...currentFilters.tag,
        [currentTagKey]: checked ? [...newFilters, filter] : newFilters.filter(item => item.value !== filter.value),
      },
    },
  };
};
