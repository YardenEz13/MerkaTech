import React from 'react';
import { Switch } from '@/components/ui/switch';
import { getDatabase, ref, update } from 'firebase/database';

const AutonomousToggle = ({ isAutonomous, onToggle }) => {
  const handleAutonomousToggle = () => {
    const newMode = !isAutonomous;
    onToggle(newMode);
    update(ref(getDatabase()), {
      "/commands/autonomous": newMode,
    });
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-white">
        {isAutonomous ? "Autonomous" : "Manual"} Mode
      </span>
      <Switch
        checked={isAutonomous}
        onCheckedChange={handleAutonomousToggle}
      />
    </div>
  );
};

export default AutonomousToggle; 