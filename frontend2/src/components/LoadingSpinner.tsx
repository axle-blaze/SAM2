import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Spinning circle */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        
        {/* Inner pulse */}
        <div className="absolute inset-0 animate-pulse-slow rounded-full h-12 w-12 border-t-2 border-blue-300"></div>
      </div>
      
      <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
