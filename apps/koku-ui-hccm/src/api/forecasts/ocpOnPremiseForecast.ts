import { axiosInstance } from 'api';

import type { Forecast, ForecastData, ForecastMeta } from './forecast';
import { ForecastType } from './forecast';

export interface OcpOnPremiseForecastMeta extends ForecastMeta {}

export interface OcpOnPremiseForecastData extends ForecastData {}

export interface OcpOnPremiseForecast extends Forecast {
  meta: OcpOnPremiseForecastMeta;
  data: OcpOnPremiseForecastData[];
}

export const ForecastTypePaths: Partial<Record<ForecastType, string>> = {
  [ForecastType.cost]: 'forecasts/openshift/infrastructures/on-premise/costs/',
};

export function runForecast(forecastType: ForecastType, query: string) {
  const path = ForecastTypePaths[forecastType];
  return axiosInstance.get<OcpOnPremiseForecast>(`${path}?${query}`);
}

