
import React from 'react';
import ArrowIcon from './icons/ArrowIcon';
import { degreesToCardinal } from '../utils/weatherUtils';

interface CurrentConditionsProps {
  speed?: number;
  direction?: number;
  deviceHeading: number | null;
  permissionState: 'prompt' | 'granted' | 'denied';
  onRequestPermission: () => void;
}

const CurrentConditions: React.FC<CurrentConditionsProps> = ({ 
  speed, 
  direction,
  deviceHeading,
  permissionState,
  onRequestPermission
}) => {
  const hasData = typeof speed === 'number' && typeof direction === 'number';
  const cardinalDirection = hasData ? degreesToCardinal(direction) : '-';
  const displaySpeed = hasData ? speed.toFixed(1) : '-.-';

  const windDirection = direction ?? 0;
  const phoneHeading = deviceHeading ?? 0;
  const arrowRotation = windDirection - phoneHeading;

  return (
    <section>
      <h2 className="text-lg font-semibold text-[#1A3A3A] mb-4">Current Conditions</h2>
      <div className="relative flex justify-center items-center">
        <div className="p-2 bg-gradient-to-br from-[#E6C66E] via-[#D4AF37] to-[#B8860B] rounded-full relative">
            {permissionState === 'prompt' && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex flex-col justify-center items-center z-10 p-4">
                <button
                  onClick={onRequestPermission}
                  className="bg-[#D4AF37] hover:bg-[#B8860B] text-[#1A3A3A] font-bold py-2 px-4 rounded-lg shadow-md"
                >
                  Enable Live Compass
                </button>
                <p className="text-white text-xs mt-2 text-center">
                  Tap to use your phone's orientation.
                </p>
              </div>
            )}
            <div className="w-56 h-56 bg-[#1A3A3A] rounded-full flex flex-col justify-center items-center text-white relative shadow-inner">
                <div 
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ 
                        transform: `rotate(${arrowRotation}deg)`,
                        transition: 'transform 0.1s linear'
                    }}
                >
                    <ArrowIcon className="w-8 h-8 absolute top-3 left-1/2 -ml-4 text-[#FFA500]" />
                </div>
                <span className="text-sm font-medium tracking-widest">{cardinalDirection}</span>
                <span className="text-6xl font-bold my-1">{displaySpeed}</span>
                <span className="text-lg">mph</span>
            </div>
        </div>
      </div>
      {permissionState === 'denied' && (
        <p className="text-center text-xs text-gray-500 mt-2">
            Live compass access was denied. The arrow points North.
        </p>
      )}
    </section>
  );
};

export default CurrentConditions;
