import React, { useEffect, useRef, useCallback } from 'react';
import nipplejs from 'nipplejs';
import { getDatabase, ref, update } from 'firebase/database';
import { auth } from '@/lib/firebase';

export const JoystickControl = ({ isAutonomous, onMove, isDemo = false }) => {
  const joystickRef = useRef(null);
  const joystickInstanceRef = useRef(null);

  const handleMove = useCallback((evt, data) => {
    const speed = Math.min(data.force / 2, 1);
    const angle = data.angle.radian;

    if (isDemo && onMove) {
      onMove(speed, angle);
    } else if (!isDemo && auth.currentUser) {
      update(ref(getDatabase()), {
        "/commands/movement/speed": speed,
        "/commands/movement/angle": angle,
      });
    }
  }, [isDemo, onMove]);

  const handleEnd = useCallback(() => {
    if (isDemo && onMove) {
      onMove(0, 0);
    } else if (!isDemo && auth.currentUser) {
      update(ref(getDatabase()), {
        "/commands/movement/speed": 0,
        "/commands/movement/angle": 0,
      });
    }
  }, [isDemo, onMove]);

  useEffect(() => {
    if (!joystickRef.current || isAutonomous) return;
    
    // Create new joystick only if it doesn't exist
    if (!joystickInstanceRef.current) {
      joystickInstanceRef.current = nipplejs.create({
        zone: joystickRef.current,
        mode: "semi",
        position: { left: "50%", top: "50%" },
        color: "blue",
        size: 100,
        restJoystick: true,
      });

      joystickInstanceRef.current.on("move", handleMove);
      joystickInstanceRef.current.on("end", handleEnd);
    }

    return () => {
      if (joystickInstanceRef.current) {
        joystickInstanceRef.current.destroy();
        joystickInstanceRef.current = null;
      }
    };
  }, [isAutonomous, handleMove, handleEnd]);

  return (
    <div className="flex-1 mx-8 hover:cursor-pointer">
      <div
        ref={joystickRef}
        className={isAutonomous ? "" : "bg-slate-800 rounded-lg relative w-40 h-40 mx-auto z-10"}
      />
    </div>
  );
}; 