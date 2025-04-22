import { useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';

export function useJoystick(containerRef) {
  const joystickInstanceRef = useRef(null);
  const joystickValueRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    joystickInstanceRef.current = nipplejs.create({
      zone: containerRef.current,
      mode: 'semi',
      position: { left: '50%', top: '50%' },
      color: 'blue',
      size: 100,
    });

    const handleMove = (evt, data) => {
      joystickValueRef.current = {
        x: data.vector.x,
        y: data.vector.y
      };
    };

    joystickInstanceRef.current.on('move', handleMove);

    return () => {
      if (joystickInstanceRef.current) {
        joystickInstanceRef.current.destroy();
      }
    };
  }, []);

  return joystickValueRef.current;
} 