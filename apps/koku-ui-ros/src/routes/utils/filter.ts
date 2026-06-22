import type { Query } from 'api/queries/query';

export interface Filter {
  isExcludes?: boolean;
  toString?: () => string;
  type?: string;
  value?: string;
}

enum QueryFilterType {
  filter = 'filter_by',
  exclude = 'exclude',
}

export const addFilterToQuery = (query: Query, filter: Filter) => {
  return addQueryFilter(
    query,
    filter.type,
    filter.value,
    filter.isExcludes ? QueryFilterType.exclude : QueryFilterType.filter
  );
};

export const addQueryFilter = (query: Query, filterType: string, filterValue: string, type: QueryFilterType) => {
  const newQuery = { ...JSON.parse(JSON.stringify(query)) };
  if (!newQuery[type]) {
    newQuery[type] = {};
  }

  // Filter by * won't generate a new request if group_by * already exists
  if (filterValue === '*' && newQuery.group_by[filterType] === '*') {
    return;
  }

  if (newQuery[type] && newQuery[type][filterType]) {
    let found = false;
    const filters = newQuery[type][filterType];
    if (!Array.isArray(filters)) {
      found = filterValue === newQuery[type][filterType];
    } else {
      for (const filter of filters) {
        if (filter === filterValue) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      if (Array.isArray(newQuery[type][filterType])) {
        newQuery[type][filterType] = [...newQuery[type][filterType], filterValue];
      } else {
        newQuery[type][filterType] = [newQuery[type][filterType], filterValue];
      }
    }
  } else {
    newQuery[type][filterType] = [filterValue];
  }
  return newQuery;
};

export const removeFilterFromQuery = (query: Query, filter: Filter) => {
  // Clear all
  if (filter === null) {
    const excludesQuery = removeQueryFilter(query, null, null, QueryFilterType.exclude);
    return removeQueryFilter(excludesQuery, null, null, QueryFilterType.filter);
  } else {
    return removeQueryFilter(
      query,
      filter.type,
      filter.value,
      filter.isExcludes ? QueryFilterType.exclude : QueryFilterType.filter
    );
  }
};

/**
 * Converts toolbar tag filter entries into the filter[tag:key]=value query
 * parameter format expected by the ROS API.
 *
 * Handles two formats:
 * 1. Legacy free-text: filter_by.tag = "key=value" or ["key=value", ...]
 * 2. Dropdown-selected: filter_by["tag:keyName"] = "value" or ["value", ...]
 *
 * Both are normalized to: { "filter[tag:key]": "value" }
 */
export const expandTagFilters = (filterBy: Record<string, any> | undefined): Record<string, any> => {
  if (!filterBy) {
    return {};
  }
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(filterBy)) {
    if (key === 'tag') {
      // Legacy free-text format: tag = "key=value"
      const values = Array.isArray(val) ? val : [val];
      for (const entry of values) {
        const eqIdx = String(entry).indexOf('=');
        if (eqIdx > 0) {
          const tagKey = String(entry).substring(0, eqIdx);
          const tagVal = String(entry).substring(eqIdx + 1);
          const paramKey = `filter[tag:${tagKey}]`;
          if (result[paramKey]) {
            result[paramKey] = Array.isArray(result[paramKey])
              ? [...result[paramKey], tagVal]
              : [result[paramKey], tagVal];
          } else {
            result[paramKey] = tagVal;
          }
        }
      }
    } else if (key.startsWith('tag:')) {
      // Dropdown-selected format: "tag:keyName" = "value"
      const paramKey = `filter[${key}]`;
      if (result[paramKey]) {
        const existing = Array.isArray(result[paramKey]) ? result[paramKey] : [result[paramKey]];
        const newValues = Array.isArray(val) ? val : [val];
        result[paramKey] = [...existing, ...newValues];
      } else {
        result[paramKey] = val;
      }
    } else {
      result[key] = val;
    }
  }
  return result;
};

export const removeQueryFilter = (query: Query, filterType: string, filterValue: string, type: QueryFilterType) => {
  const newQuery = { ...JSON.parse(JSON.stringify(query)) };
  if (!newQuery[type]) {
    newQuery[type] = {};
  }

  if (filterType === null) {
    newQuery[type] = undefined; // Clear all
  } else if (filterValue === null) {
    newQuery[type][filterType] = undefined; // Clear all values
  } else if (Array.isArray(newQuery[type][filterType])) {
    const index = newQuery[type][filterType].indexOf(filterValue);
    if (index > -1) {
      newQuery[type][filterType] = [
        ...query[type][filterType].slice(0, index),
        ...query[type][filterType].slice(index + 1),
      ];
    }
  } else {
    newQuery[type][filterType] = undefined;
  }
  return newQuery;
};
