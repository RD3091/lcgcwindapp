import React from 'react';
import RefreshIcon from './icons/RefreshIcon';

interface HeaderProps {
  lastUpdated: string;
  onRefreshClick: () => void;
  isRefreshing: boolean;
}

const Header: React.FC<HeaderProps> = ({ lastUpdated, onRefreshClick, isRefreshing }) => {
  return (
    <header className="bg-[#1A3A3A] text-white p-4 pt-12 z-20 relative flex items-center justify-between">
      <div className="w-10 h-10 flex items-center justify-center">
        <button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh weather data"
        >
          <RefreshIcon className={`w-6 h-6 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="text-center">
        <h1 className="text-xl font-bold">L&CGC - Wind Guide</h1>
        <p className="text-xs text-gray-300">Last updated: {lastUpdated}</p>
      </div>
      
      <div className="w-10 h-10"></div>
    </header>
  );
};

export default Header;
