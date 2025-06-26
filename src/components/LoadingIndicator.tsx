import React from 'react';
import { LoadingIndicatorProps } from '../types';

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  isLoading = true, 
  message = 'Processing...', 
  size = 'medium' 
}) => {
  if (!isLoading) return null;

  return (
    <div className={`loading-indicator loading-indicator-${size}`} role="status" aria-live="polite">
      <div className={`loading-spinner loading-spinner-${size}`}></div>
      {size !== 'small' && <span className="loading-text">{message}</span>}
    </div>
  );
};

export default LoadingIndicator;