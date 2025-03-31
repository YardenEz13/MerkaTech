import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getDatabase, ref, onValue } from 'firebase/database';
import JoystickControl from './JoystickControl';
import FireControl from './FireControl';
import AutonomousToggle from './AutonomousToggle';

const TankControl = () => {
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [distance, setDistance] = useState(null);
  const [canShoot, setCanShoot] = useState(false);
  const db = getDatabase();

  useEffect(() => {
    // Listen to the autonomous state from Firebase
    const autonomousRef = ref(db, "commands/autonomous");
    const unsubscribeAutonomous = onValue(autonomousRef, (snapshot) => {
      const autonomousState = snapshot.val();
      setIsAutonomous(autonomousState);
    });

    // Listen to the distance sensor and update canShoot accordingly
    const checkDistance = () => {
      const sensorDistanceRef = ref(db, "sensor/distance");
      onValue(sensorDistanceRef, (snapshot) => {
        const currentDistance = snapshot.val();
        setDistance(currentDistance);
        setCanShoot(currentDistance < 20);
      });
    };

    checkDistance();

    return () => {
      unsubscribeAutonomous();
    };
  }, []);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <FireControl canShoot={canShoot} />
          <JoystickControl isAutonomous={isAutonomous} />
          <AutonomousToggle 
            isAutonomous={isAutonomous} 
            onToggle={setIsAutonomous} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TankControl; 