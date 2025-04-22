import { useState, useEffect } from 'react';

export function useTankPosition() {
  const [tankPosition, setTankPosition] = useState({ x: 50, y: 50 });

  const updateTankPosition = (x, y) => {
    setTankPosition(prev => ({
      x: Math.min(Math.max(prev.x + x, 5), 95),
      y: Math.min(Math.max(prev.y + y, 7), 93)
    }));
  };

  return { tankPosition, updateTankPosition };
} 