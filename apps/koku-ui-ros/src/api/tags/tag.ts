import type { PagedMetaData, PagedResponse } from 'api/api';

export interface TagData {
  enabled?: boolean;
  key?: string;
  values?: string[];
}

export interface TagMeta extends PagedMetaData {
  group_by?: {
    [group: string]: string[];
  };
  order_by?: {
    [order: string]: string;
  };
  filter?: {
    [filter: string]: any;
  };
}

export type Tag = PagedResponse<TagData, TagMeta>;

export const enum TagType {
  tag = 'tag',
}

export const enum TagPathsType {
  ocp = 'ocp',
}
