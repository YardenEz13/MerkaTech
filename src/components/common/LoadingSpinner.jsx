import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-2',
    large: 'h-16 w-16 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-t-transparent border-blue-500 ${sizeClasses[size] || sizeClasses.medium}`} 
      />
      {message && <p className="mt-3 text-sm text-gray-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner; 