import * as utils from './query';

export interface RosFilters extends utils.Filters {
  project?: string | number;
}

type RosGroupByValue = string | string[];

interface RosGroupBys {
  cluster?: RosGroupByValue;
  namespace?: RosGroupByValue;
  node?: RosGroupByValue;
  project?: RosGroupByValue;
}

export interface RosQuery extends utils.Query {
  after?: string;
  category?: string;
  delta?: string;
  engine?: string;
  filter?: RosFilters;
  group_by?: RosGroupBys;
  limit?: number;
  offset?: number;
  order_by?: any;
  term?: string;
}

// filter_by props are converted and returned with logical OR/AND prefix
export function getQuery(query: RosQuery) {
  return utils.getQuery(query);
}

// filter_by props are not converted
export function getQueryRoute(query: RosQuery) {
  return utils.getQueryRoute(query);
}

export function parseQuery<T = any>(query: string): T {
  return utils.parseQuery(query);
}
