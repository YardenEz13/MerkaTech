import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { JoystickControl } from './controls/JoystickControl';
import { FireControl } from './controls/FireControl';
import { AutonomousToggle } from './controls/AutonomousToggle';
import { DistanceIndicator } from './indicators/DistanceIndicator';
import { useTankState } from '@/hooks/tank/useTankState';

const TankControl = ({ videoRef }) => {
  const { 
    distance,
    canShoot,
    isAutonomous,
    setIsAutonomous
  } = useTankState();

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <DistanceIndicator distance={distance} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <JoystickControl isAutonomous={isAutonomous} />
            <div className="space-y-4">
              <FireControl 
                canShoot={canShoot} 
                videoRef={videoRef}
              />
              <AutonomousToggle 
                isAutonomous={isAutonomous}
                onToggle={setIsAutonomous}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TankControl; 