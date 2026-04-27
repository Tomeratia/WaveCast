/** Canonical forecast shape — all adapters normalize to this */
export interface NormalizedForecast {
  swellHeight: number;       // meters
  swellPeriod: number;       // seconds
  swellDirection: number;    // degrees 0–360
  windSpeed: number;         // km/h
  windDirection: number;     // degrees 0–360
  windGusts: number;         // km/h
  temperature: number;       // °C
  pressure: number;          // hPa
  swellHeight2: number;      // secondary swell height, meters
  swellPeriod2: number;      // secondary swell period, seconds
  swellDirection2: number;   // secondary swell direction, degrees
  timestamp: string;         // ISO 8601
}

/** Tide data for scoring */
export interface TideData {
  height: number;            // meters relative to mean sea level
  type: 'rising' | 'falling' | 'high' | 'low';
  timestamp: string;         // ISO 8601
}

/** Surf spot as exposed to the client */
export interface SpotDTO {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  region: string;
}

/** Result of the scoring algorithm */
export interface ScoreResult {
  overall: number;           // 0–100 (clamped)
  breakdown: {
    swellHeight: number;     // 0–1 normalized
    swellPeriod: number;
    windSpeed: number;
    windDirection: number;
    tide: number;
  };
  label: ScoreLabel;
}

export type ScoreLabel = 'flat' | 'poor' | 'fair' | 'good' | 'epic';

/** Forecast + score combined for a single time slot */
export interface ForecastSlot {
  forecast: NormalizedForecast;
  tide: TideData | null;
  score: ScoreResult;
}

/** Full spot forecast response */
export interface SpotForecastDTO {
  spot: SpotDTO;
  current: ForecastSlot;
  hourly: ForecastSlot[];
}
