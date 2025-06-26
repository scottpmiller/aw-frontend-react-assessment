import React from 'react';
import { HeaderProps } from '../types';

const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading }) => {
  return (
    <div className="header">
      <h1>Task Management App</h1>
      <p>Manage your daily tasks efficiently</p>
      <button 
        onClick={onRefresh} 
        className="refresh-button"
        aria-label="Refresh tasks from storage"
        disabled={isLoading}
      >
        Refresh
      </button>
    </div>
  );
};

export default Header;