import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { JoystickControl } from './controls/JoystickControl';
import { FireControl } from './controls/FireControl';
import { AutonomousToggle } from './controls/AutonomousToggle';
import { DistanceIndicator } from './indicators/DistanceIndicator';
import { useTankState } from '@/hooks/tank/useTankState';

const TankControl = () => {
  const {
    isAutonomous,
    setIsAutonomous,
    canShoot,
    distance
  } = useTankState();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-6">
        <div className="flex flex-col h-full space-y-6">
          {/* Top Row - Fire Control */}
          <div className="flex justify-start">
            <FireControl canShoot={canShoot} />
          </div>

          {/* Middle Row - Joystick */}
          <div className="flex-1 flex items-center justify-center">
            <JoystickControl isAutonomous={isAutonomous} />
          </div>

          {/* Bottom Row - Mode Toggle and Distance */}
          <div className="flex items-center justify-between">
            <AutonomousToggle 
              isAutonomous={isAutonomous} 
              onToggle={setIsAutonomous} 
            />
            <DistanceIndicator distance={distance} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TankControl; 