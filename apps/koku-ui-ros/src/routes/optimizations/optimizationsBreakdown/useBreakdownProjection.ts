import { ROS_LIST_ENGINE, ROS_LIST_TERM } from 'api/ros/rosListParams';
import { useLocation } from 'react-router-dom';
import type { Interval, OptimizationType } from 'utils/commonTypes';

export interface BreakdownProjection {
  engine: OptimizationType;
  term: Interval;
}

export function useBreakdownProjection(queryStateName: string): BreakdownProjection {
  const location = useLocation();
  const listQueryState = location?.state?.[queryStateName] ?? {};

  return {
    term: (listQueryState.term ?? ROS_LIST_TERM) as Interval,
    engine: (listQueryState.engine ?? ROS_LIST_ENGINE) as OptimizationType,
  };
}
