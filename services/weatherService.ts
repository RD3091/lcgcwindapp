
import type { CurrentWeather, HourlyForecastItem, CurrentFetchResult } from '../types';
import { isWithinApiHours } from '../utils/weatherUtils';

const LAT = 52.2627;
const LON = -1.5217;
const OWM_API_KEY = '6390755e0fa1f175801e3b8fa2676699';

interface CurrentCachedData {
    data: CurrentWeather;
    timestamp: number;
}
interface HourlyCachedData {
    data: HourlyForecastItem[];
    timestamp: number;
}

const CURRENT_CACHE_KEY = 'currentWeatherCache';
const HOURLY_CACHE_KEY = 'hourlyForecastCache';
const CURRENT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const HOURLY_CACHE_DURATION = 60 * 60 * 1000; // 1 hour


const getDefaultCurrentWeather = (): CurrentWeather => ({
    dt: Math.floor(Date.now() / 1000),
    wind_speed: 9.8,
    wind_deg: 205, // SSW
});

const getDefaultHourlyForecast = (): HourlyForecastItem[] => {
    const now = Math.floor(Date.now() / 1000);
    const startOfHour = now - (now % 3600);
    return [
        { dt: startOfHour + 3600, wind_speed: 10, wind_deg: 205, temp: 7 },
        { dt: startOfHour + 7200, wind_speed: 9, wind_deg: 205, temp: 7 },
        { dt: startOfHour + 10800, wind_speed: 9, wind_deg: 210, temp: 6 },
    ];
};

const fetchWithTimeout = (url: string, options = {}, timeout = 5000): Promise<Response> => {
    return Promise.race([
        fetch(url, options),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeout)
        ),
    ]);
};

export const getCurrentConditions = async (): Promise<CurrentFetchResult> => {
    const now = Date.now();
    const cachedItem = localStorage.getItem(CURRENT_CACHE_KEY);
    let cached: CurrentCachedData | null = null;

    if (cachedItem) {
        cached = JSON.parse(cachedItem);
    }
    
    const serveStaleData = (error: string): CurrentFetchResult => {
      if (cached) {
        console.warn(`API fetch failed for current conditions: ${error}. Serving stale data.`);
        return { 
          data: cached.data, 
          timestamp: cached.timestamp, 
          error: `Failed to update: ${error}. Showing last available data.`,
          isStale: true 
        };
      }
      console.warn(`API fetch failed for current conditions: ${error}. Serving default placeholder data.`);
      return { 
          data: getDefaultCurrentWeather(), 
          timestamp: now, 
          error: `Could not fetch live data. Showing placeholder information.`,
          isStale: true 
      };
    };

    if (!isWithinApiHours()) {
        const outsideHoursMessage = "The course is now closed. Updates will resume at 7am.";
        console.log(outsideHoursMessage);
        const dataToShow = cached ? cached.data : getDefaultCurrentWeather();
        const timestamp = cached ? cached.timestamp : now;
        
        return {
            data: dataToShow,
            timestamp: timestamp,
            error: outsideHoursMessage,
            isStale: true,
        };
    }

    if (cached && (now - cached.timestamp < CURRENT_CACHE_DURATION)) {
        console.log("Returning fresh cached current conditions.");
        return { data: cached.data, timestamp: cached.timestamp };
    }
    
    if (!OWM_API_KEY) {
        const error = "OpenWeatherMap API key is not configured.";
        console.error(error);
        return serveStaleData(error);
    }

    try {
        console.log("Fetching current conditions from OpenWeatherMap...");
        const response = await fetchWithTimeout(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${OWM_API_KEY}&units=metric`);
        
        if (response.status === 401) {
             const error = "Invalid OpenWeatherMap API key.";
             console.error(error);
             return serveStaleData(error);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Current weather API request failed: ${errorText}`);
        }

        const data = await response.json();
        const mpsToMph = (mps: number) => mps * 2.23694;

        const newCurrentData: CurrentWeather = {
            dt: data.dt,
            wind_speed: mpsToMph(data.wind.speed),
            wind_deg: data.wind.deg,
        };
        
        const newCache: CurrentCachedData = {
            data: newCurrentData,
            timestamp: now,
        };

        localStorage.setItem(CURRENT_CACHE_KEY, JSON.stringify(newCache));
        console.log("Successfully fetched and cached new current conditions.");
        
        return { data: newCache.data, timestamp: newCache.timestamp };

    } catch (error) {
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Failed to fetch current conditions:", errorMessage);
        return serveStaleData(errorMessage);
    }
};


export const getHourlyForecast = async (): Promise<HourlyForecastItem[] | null> => {
    const now = Date.now();
    const cachedItem = localStorage.getItem(HOURLY_CACHE_KEY);
    let cached: HourlyCachedData | null = null;
    
    if(cachedItem) {
        cached = JSON.parse(cachedItem);
    }

    if(cached && (now - cached.timestamp < HOURLY_CACHE_DURATION)) {
        console.log("Returning fresh cached hourly forecast.");
        return cached.data;
    }

    if (!OWM_API_KEY) {
        console.error("OpenWeatherMap API key is not configured for hourly forecast.");
        if (cached) return cached.data;
        return getDefaultHourlyForecast();
    }

    try {
        console.log("Fetching hourly forecast from OpenWeatherMap...");
        const response = await fetchWithTimeout(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${OWM_API_KEY}&units=metric`);
        
        if (response.status === 401) {
             const error = "Invalid OpenWeatherMap API key for hourly forecast.";
             console.error(error);
             throw new Error(error);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hourly forecast API request failed: ${errorText}`);
        }

        const data = await response.json();
        const mpsToMph = (mps: number) => mps * 2.23694;

        const hourlyData: HourlyForecastItem[] = data.list.map((item: any) => ({
            dt: item.dt,
            wind_speed: mpsToMph(item.wind.speed),
            wind_deg: item.wind.deg,
            temp: item.main.temp,
        }));
        
        const newCache: HourlyCachedData = {
            data: hourlyData,
            timestamp: now,
        };

        localStorage.setItem(HOURLY_CACHE_KEY, JSON.stringify(newCache));
        console.log("Successfully fetched and cached new hourly forecast from OpenWeatherMap.");
        
        return hourlyData;

    } catch (error) {
        console.error("Failed to fetch hourly forecast:", error);
        if (cached) {
            console.warn("Serving stale hourly forecast due to error.");
            return cached.data;
        }
        console.warn("Serving default hourly forecast due to error.");
        return getDefaultHourlyForecast();
    }
};
