import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getDatabase, ref, update } from 'firebase/database';

export const FireControl = ({ canShoot, onShoot }) => {
  const [isFiring, setIsFiring] = useState(false);
  const db = getDatabase();

  const handleFire = () => {
    if (isFiring || !canShoot) return;
    setIsFiring(true);
    update(ref(db), {
      "/commands/fire": true,
    });
    if (onShoot) {
      onShoot();
    }
    setTimeout(() => setIsFiring(false), 5000);
  };

  return (
    <Button
      onClick={handleFire}
      disabled={isFiring || !canShoot}
      className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
    >
      Fire
    </Button>
  );
}; 