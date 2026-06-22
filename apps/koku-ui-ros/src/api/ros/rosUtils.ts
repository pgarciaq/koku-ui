import {
  runNamespaceRosReport as runNamespaceRecommendation,
  runNamespaceRosReports as runNamespaceRecommendations,
  runNodeRosReport as runNodeRecommendation,
  runNodeRosReports as runNodeRecommendations,
  runRosReport as runRecommendation,
  runRosReports as runRecommendations,
} from './recommendations';
import { decodeRosDetailFetchQuery } from './rosListParams';
import type { RosType } from './ros';
import { RosPathsType } from './ros';

export function runRosReport(rosPathsType: RosPathsType, rosType: RosType, query: string) {
  let result;
  switch (rosPathsType) {
    case RosPathsType.namespaceRecommendation: {
      const { id, term, engine } = decodeRosDetailFetchQuery(query);
      result = runNamespaceRecommendation(rosType, id, term, engine);
      break;
    }
    case RosPathsType.namespaceRecommendations:
      result = runNamespaceRecommendations(rosType, query);
      break;
    case RosPathsType.nodeRecommendation: {
      const { id, term, engine } = decodeRosDetailFetchQuery(query);
      result = runNodeRecommendation(rosType, id, term, engine);
      break;
    }
    case RosPathsType.nodeRecommendations:
      result = runNodeRecommendations(rosType, query);
      break;
    case RosPathsType.recommendation: {
      const { id, term, engine } = decodeRosDetailFetchQuery(query);
      result = runRecommendation(rosType, id, term, engine);
      break;
    }
    case RosPathsType.recommendations:
      result = runRecommendations(rosType, query);
      break;
  }
  return result;
}
