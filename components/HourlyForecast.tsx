
import React, { useState } from 'react';
import type { HourlyForecastItem } from '../types';
import { degreesToCardinal } from '../utils/weatherUtils';
import RulesModal from './RulesModal';
import InfoIcon from './icons/InfoIcon';

interface HourlyForecastProps {
  hourly?: HourlyForecastItem[];
}

const ForecastArrow: React.FC<{ direction: number }> = ({ direction }) => (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-[#FFA500]"
        style={{ transform: `rotate(${direction}deg)`}}
    >
        <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
);


const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }).replace(' ', '');
  };

  const nowInSeconds = Date.now() / 1000;
  const upcomingForecasts = hourly ? hourly.filter(item => item.dt > nowInSeconds) : [];

  const hasData = upcomingForecasts.length > 0;

  return (
    <section>
       <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#1A3A3A]">Forecast</h2>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
                aria-label="Show usage and rules information"
            >
                <InfoIcon className="w-4 h-4" />
                <span>Usage / Rules</span>
            </button>
       </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-4 text-center text-xs text-gray-500 font-semibold pb-2 border-b">
          <div className="text-left">Time</div>
          <div>Wind</div>
          <div>Direction</div>
          <div>Temp</div>
        </div>
        <div className="space-y-2 pt-2">
          {hasData ? (
            upcomingForecasts.slice(0, 3).map((item, index) => (
                <div key={item.dt} className={`grid grid-cols-4 text-center items-center text-sm ${index < 2 ? 'pb-2' : ''}`}>
                <div className="font-semibold text-left text-[#1A3A3A] flex items-center">
                    <span className="text-[#FFA500] mr-2 text-lg">→</span> {formatTime(item.dt)}
                </div>
                <div className="text-gray-700">{item.wind_speed.toFixed(0)} mph</div>
                <div className="flex justify-center items-center gap-2 text-gray-700">
                    <span>{degreesToCardinal(item.wind_deg)}</span>
                    <ForecastArrow direction={item.wind_deg} />
                </div>
                <div className="text-gray-700">{item.temp.toFixed(0)}°C</div>
                </div>
            ))
          ) : (
            [...Array(3)].map((_, index) => (
                <div key={index} className={`grid grid-cols-4 text-center items-center text-sm ${index < 2 ? 'pb-2' : ''}`}>
                    <div className="font-semibold text-left text-[#1A3A3A] flex items-center">
                        <span className="text-[#FFA500] mr-2 text-lg">→</span> --:--
                    </div>
                    <div className="text-gray-700">- mph</div>
                    <div className="flex justify-center items-center gap-2 text-gray-700">
                        <span>--</span>
                        <ForecastArrow direction={0} />
                    </div>
                    <div className="text-gray-700">-°C</div>
                </div>
            ))
          )}
        </div>
      </div>
      <RulesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default HourlyForecast;