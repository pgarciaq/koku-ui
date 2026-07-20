import { FetchStatus } from 'store/common';
import { resetState } from 'store/ui/uiActions';
import type { ActionType } from 'typesafe-actions';
import { getType } from 'typesafe-actions';

import { fetchProvidersFailure, fetchProvidersRequest, fetchProvidersSuccess } from './providersActions';
import { defaultState } from './providersCommon';
import type { ProvidersState } from './providersCommon';

export type { CachedProviders, ProvidersState } from './providersCommon';

export type ProvidersAction = ActionType<
  typeof fetchProvidersFailure | typeof fetchProvidersRequest | typeof fetchProvidersSuccess | typeof resetState
>;

export function providersReducer(state = defaultState, action: ProvidersAction): ProvidersState {
  switch (action.type) {
    case getType(resetState):
      state = defaultState;
      return state;

    case getType(fetchProvidersRequest):
      return {
        ...state,
        fetchStatus: new Map(state.fetchStatus).set(action.payload.fetchId, FetchStatus.inProgress),
      };
    case getType(fetchProvidersSuccess):
      return {
        ...state,
        fetchStatus: new Map(state.fetchStatus).set(action.meta.fetchId, FetchStatus.complete),
        byId: new Map(state.byId).set(action.meta.fetchId, {
          ...action.payload,
          timeRequested: Date.now(),
        }),
        errors: new Map(state.errors).set(action.meta.fetchId, null),
      };
    case getType(fetchProvidersFailure):
      return {
        ...state,
        fetchStatus: new Map(state.fetchStatus).set(action.meta.fetchId, FetchStatus.complete),
        errors: new Map(state.errors).set(action.meta.fetchId, action.payload),
      };
    default:
      return state;
  }
}
