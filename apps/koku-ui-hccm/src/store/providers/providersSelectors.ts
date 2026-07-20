import type { ProviderType } from 'api/providers';

import { addProviderKey, getFetchId, stateKey } from './providersCommon';
import type { ProvidersState } from './providersCommon';

// Narrow state slice to break circular dep: rootReducer → providers → selectors → rootReducer.
// RootState extends this shape, so callers (useSelector, thunks) pass it transparently.
type ProvidersSlice = Record<typeof stateKey, ProvidersState>;

export const selectProvidersState = (state: ProvidersSlice) => state[stateKey];

// Add provider

export const selectAddProviderFetchStatus = (state: ProvidersSlice) =>
  selectProvidersState(state).fetchStatus.get(addProviderKey);

export const selectAddProviderError = (state: ProvidersSlice) =>
  selectProvidersState(state).errors.get(addProviderKey);

// Fetch providers

export const selectProviders = (state: ProvidersSlice, providerType: ProviderType, provideQueryString: string) =>
  selectProvidersState(state).byId.get(getFetchId(providerType, provideQueryString));

export const selectProvidersFetchStatus = (
  state: ProvidersSlice,
  providerType: ProviderType,
  provideQueryString: string
) => selectProvidersState(state).fetchStatus.get(getFetchId(providerType, provideQueryString));

export const selectProvidersError = (state: ProvidersSlice, providerType: ProviderType, provideQueryString: string) =>
  selectProvidersState(state).errors.get(getFetchId(providerType, provideQueryString));
