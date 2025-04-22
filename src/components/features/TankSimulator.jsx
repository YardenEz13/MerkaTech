import React, { useRef, useEffect } from 'react';
import { useJoystick } from '@/hooks/useJoystick';
import { useTankPosition } from '@/hooks/useTankPosition';

const TankSimulator = () => {
  const containerRef = useRef(null);
  const tankRef = useRef(null);
  const joystickContainerRef = useRef(null);
  const { tankPosition } = useTankPosition();
  
  useJoystick(joystickContainerRef);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-[90%] h-40 mx-auto border border-blue-500/20 rounded-lg overflow-hidden bg-slate-900 hover:bg-slate-800"
      >
        <div
          ref={tankRef}
          className="absolute w-8 h-8"
          style={{
            left: `${Math.min(Math.max(tankPosition.x, 5), 95)}%`,
            top: `${Math.min(Math.max(tankPosition.y, 7), 93)}%`,
            transform: "translate(-50%, -50%)"
          }}
        >
          <img 
            src="/photos-videos/merkava.png" 
            alt="Tank" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <div
        ref={joystickContainerRef}
        className="relative h-32 w-full mt-4 bg-slate-900/50 rounded-lg border border-blue-500/20 flex items-center justify-center"
      />
    </>
  );
};

export default TankSimulator; 