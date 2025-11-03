
export interface CurrentWeather {
  dt: number;
  wind_speed: number;
  wind_deg: number;
}

export interface HourlyForecastItem {
  dt: number;
  wind_speed: number;
  wind_deg: number;
  temp: number;
}

export interface CurrentFetchResult {
    data: CurrentWeather | null;
    timestamp: number;
    error?: string;
    isStale?: boolean;
}
