import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CurrentConditions from './components/CurrentConditions';
import HourlyForecast from './components/HourlyForecast';
import { getCurrentConditions, getHourlyForecast } from './services/weatherService';
import type { CurrentWeather, HourlyForecastItem } from './types';
import RulesModal from './components/RulesModal';

const App: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [compassPermission, setCompassPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const fetchCurrent = useCallback(async () => {
    try {
      const result = await getCurrentConditions();
      
      if (result.data) {
        setCurrentWeather(result.data);
        setLastUpdated(new Date(result.timestamp));
        setError(null);

        if (result.isStale) {
          setNotification(result.error || 'Updates are paused. Showing last available data.');
        } else {
          setNotification(null);
        }
      } else if (result.error) {
        setError(result.error);
        setNotification(null);
      }
    } catch (err) {
      setError('Failed to fetch current conditions. Please try again later.');
      setNotification(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHourly = useCallback(async () => {
    try {
        const data = await getHourlyForecast();
        if (data) {
            setHourlyForecast(data);
        }
    } catch (err) {
        console.error("Failed to fetch hourly forecast:", err);
    }
  }, []);

  // Fetch current conditions on mount and every 30 minutes
  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCurrent]);
  
  // Fetch hourly forecast on mount, then schedule updates for the top of each hour
  useEffect(() => {
    let timeoutId: number;
    let intervalId: number;

    const startHourlyFetches = () => {
      fetchHourly();
      if (intervalId) window.clearInterval(intervalId);
      intervalId = window.setInterval(fetchHourly, 60 * 60 * 1000);
    };
    
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const msUntilNextHour = nextHour.getTime() - now.getTime();

    timeoutId = window.setTimeout(startHourlyFetches, msUntilNextHour);
    
    fetchHourly();

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [fetchHourly]);


  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchCurrent();
    setIsRefreshing(false);
  };

  const handleRequestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setCompassPermission('granted');
        } else {
          setCompassPermission('denied');
        }
      } catch (err) {
        console.error("Permission request error:", err);
        setCompassPermission('denied');
      }
    } else {
      setCompassPermission('granted');
    }
  };

  useEffect(() => {
    if (compassPermission !== 'granted') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const heading = (event as any).webkitCompassHeading ?? event.alpha;
      if (heading !== null) {
        setDeviceHeading(heading);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      console.warn("DeviceOrientationEvent not supported.");
      setCompassPermission('denied');
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [compassPermission]);

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return '...';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-[#0D1A1A] min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md bg-[#112020] shadow-2xl flex flex-col">
        <Header
          lastUpdated={formatLastUpdated(lastUpdated)}
          onRefreshClick={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="flex-grow bg-[#F0EEEA] p-6 rounded-t-3xl -mt-6 z-10 relative">
          {notification && (
             <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg relative text-center mb-6" role="alert">
                {notification}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading weather data...</p>
            </div>
          ) : (
             <>
              {error && !currentWeather && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div className="space-y-8">
                <CurrentConditions
                  speed={currentWeather?.wind_speed}
                  direction={currentWeather?.wind_deg}
                  deviceHeading={deviceHeading}
                  permissionState={compassPermission}
                  onRequestPermission={handleRequestPermission}
                />
                <HourlyForecast hourly={hourlyForecast} onShowRules={() => setIsRulesModalOpen(true)} />
              </div>
            </>
          )}
        </main>
      </div>
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
    </div>
  );
};

export default App;
