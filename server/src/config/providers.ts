/** Weather API provider configuration */
export const PROVIDERS = {
  openMeteo: {
    name: 'open-meteo',
    baseUrl: 'https://marine-api.open-meteo.com/v1/marine',
    rateLimit: { maxPerDay: 10_000 },
  },
  openWeatherMap: {
    name: 'openweathermap',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    rateLimit: { maxPerMinute: 60 },
  },
} as const;
