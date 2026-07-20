import { runTag as runOcpTag } from './ocpTags';
import type { TagType } from './tag';
import { TagPathsType } from './tag';

export function runTag(tagPathsType: TagPathsType, tagType: TagType, query: string) {
  let result;
  switch (tagPathsType) {
    case TagPathsType.ocp:
      result = runOcpTag(tagType, query);
      break;
  }
  return result;
}
