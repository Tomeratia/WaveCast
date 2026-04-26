import type { NormalizedForecast } from '@wavecast/shared';

/** All weather providers must implement this interface */
export interface WeatherProvider {
  readonly name: string;
  fetch(lat: number, lon: number): Promise<NormalizedForecast[]>;
}
