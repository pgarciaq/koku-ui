import {
  runNamespaceRosReport as runNamespaceRecommendation,
  runNamespaceRosReports as runNamespaceRecommendations,
  runNodeRosReports as runNodeRecommendations,
  runRosReport as runRecommendation,
  runRosReports as runRecommendations,
} from './recommendations';
import type { RosType } from './ros';
import { RosPathsType } from './ros';

export function runRosReport(rosPathsType: RosPathsType, rosType: RosType, query: string) {
  let result;
  switch (rosPathsType) {
    case RosPathsType.namespaceRecommendation:
      result = runNamespaceRecommendation(rosType, query);
      break;
    case RosPathsType.namespaceRecommendations:
      result = runNamespaceRecommendations(rosType, query);
      break;
    case RosPathsType.nodeRecommendations:
      result = runNodeRecommendations(rosType, query);
      break;
    case RosPathsType.recommendation:
      result = runRecommendation(rosType, query);
      break;
    case RosPathsType.recommendations:
      result = runRecommendations(rosType, query);
      break;
  }
  return result;
}
