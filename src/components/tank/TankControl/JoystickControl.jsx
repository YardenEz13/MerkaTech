import React, { useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';
import { getDatabase, ref, update } from 'firebase/database';
import { auth } from '@/lib/firebase';

const JoystickControl = ({ isAutonomous }) => {
  const joystickRef = useRef(null);
  const joystickInstanceRef = useRef(null);

  useEffect(() => {
    if (!joystickRef.current || isAutonomous) return;
    
    // Destroy existing joystick if it exists
    if (joystickInstanceRef.current) {
      joystickInstanceRef.current.destroy();
      joystickInstanceRef.current = null;
    }
    
    // Create new joystick
    joystickInstanceRef.current = nipplejs.create({
      zone: joystickRef.current,
      mode: "semi",
      position: { left: "50%", top: "50%" },
      color: "blue",
      size: 100,
      restJoystick: true,
    });

    const db = getDatabase();

    joystickInstanceRef.current.on("move", (evt, data) => {
      if (!auth.currentUser) return;
      const speed = Math.min(data.force / 2, 1);
      const angle = data.angle.radian;
      update(ref(db), {
        "/commands/movement/speed": speed,
        "/commands/movement/angle": angle,
      });
    });

    joystickInstanceRef.current.on("end", () => {
      if (!auth.currentUser) return;
      update(ref(db), {
        "/commands/movement/speed": 0,
        "/commands/movement/angle": 0,
      });
    });

    return () => {
      if (joystickInstanceRef.current) {
        joystickInstanceRef.current.destroy();
        joystickInstanceRef.current = null;
      }
    };
  }, [isAutonomous]);

  return (
    <div className="flex-1 mx-8 hover:cursor-pointer">
      <div
        ref={joystickRef}
        className={isAutonomous ? "" : "bg-slate-800 rounded-lg relative w-40 h-40 mx-auto z-10"}
      />
    </div>
  );
};

export default JoystickControl; 