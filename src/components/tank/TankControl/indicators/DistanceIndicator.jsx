import React from 'react';

export const DistanceIndicator = ({ distance }) => {
  return (
    <div className="text-white">
      Distance: {distance ? `${distance.toFixed(2)}m` : '---'}
    </div>
  );
}; 