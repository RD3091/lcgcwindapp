
import React from 'react';
import BackIcon from './icons/BackIcon';

interface HeaderProps {
  lastUpdated: string;
}

const Header: React.FC<HeaderProps> = ({ lastUpdated }) => {
  return (
    <header className="bg-[#1A3A3A] text-white p-4 pt-12 z-20 text-center relative">
        <button className="absolute left-4 top-12 text-white">
            <BackIcon />
        </button>
      <h1 className="text-xl font-bold">L&CGC - Wind Guide</h1>
      <p className="text-xs text-gray-300">Last updated: {lastUpdated}</p>
    </header>
  );
};

export default Header;