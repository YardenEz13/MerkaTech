import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useTankState() {
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [distance, setDistance] = useState(null);
  const [canShoot, setCanShoot] = useState(false);
  
  useEffect(() => {
    const db = getDatabase();
    const autonomousRef = ref(db, "commands/autonomous");
    const sensorDistanceRef = ref(db, "sensor/distance");

    const unsubscribeAutonomous = onValue(autonomousRef, (snapshot) => {
      setIsAutonomous(snapshot.val());
    });

    const unsubscribeDistance = onValue(sensorDistanceRef, (snapshot) => {
      const currentDistance = snapshot.val();
      setDistance(currentDistance);
      setCanShoot(currentDistance < 20);
    });

    return () => {
      unsubscribeAutonomous();
      unsubscribeDistance();
    };
  }, []);

  return {
    isAutonomous,
    setIsAutonomous,
    distance,
    canShoot
  };
} 