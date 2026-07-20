import type { RosPathsType, RosType } from 'api/ros/ros';
import { getRosCountCacheKey } from 'api/ros/rosListParams';
import type { RootState } from 'store/rootReducer';

import { getFetchId, rosStateKey } from './rosCommon';

export const selectRosState = (state: RootState) => state[rosStateKey];

export const selectRos = (state: RootState, rosPathsType: RosPathsType, rosType: RosType, rosQueryString: string) =>
  selectRosState(state).byId.get(getFetchId(rosPathsType, rosType, rosQueryString));

export const selectRosCount = (
  state: RootState,
  rosPathsType: RosPathsType,
  rosType: RosType,
  countQueryString: string
) => selectRosState(state).counts.get(getRosCountCacheKey(rosPathsType, rosType, countQueryString));

export const selectRosFetchStatus = (
  state: RootState,
  rosPathsType: RosPathsType,
  rosType: RosType,
  rosQueryString: string
) => selectRosState(state).fetchStatus.get(getFetchId(rosPathsType, rosType, rosQueryString));

export const selectRosError = (
  state: RootState,
  rosPathsType: RosPathsType,
  rosType: RosType,
  rosQueryString: string
) => selectRosState(state).errors.get(getFetchId(rosPathsType, rosType, rosQueryString));
