import type { Providers, ProviderType } from 'api/providers';
import type { ProvidersQuery } from 'api/queries/providersQuery';
import type { AxiosError } from 'axios';
import type { FetchStatus } from 'store/common';

export const stateKey = 'providers';
export const addProviderKey = 'add-provider';

export interface CachedProviders extends Providers {
  timeRequested: number;
}

export type ProvidersState = Readonly<{
  byId: Map<string, CachedProviders>;
  errors: Map<string, AxiosError>;
  fetchStatus: Map<string, FetchStatus>;
}>;

export const defaultState: ProvidersState = {
  byId: new Map(),
  errors: new Map(),
  fetchStatus: new Map(),
};

export const awsProvidersQuery: ProvidersQuery = {
  limit: 100,
  type: 'AWS',
};

export const azureProvidersQuery: ProvidersQuery = {
  limit: 100,
  type: 'Azure',
};

export const gcpProvidersQuery: ProvidersQuery = {
  limit: 100,
  type: 'GCP',
};

export const ocpProvidersQuery: ProvidersQuery = {
  limit: 100,
  type: 'OCP',
};

// Omitting the type param, returns all providers
export const providersQuery: ProvidersQuery = {
  limit: 1000,
};

export function getFetchId(type: ProviderType, provideQueryString: string) {
  return `${type}--${provideQueryString}`;
}
