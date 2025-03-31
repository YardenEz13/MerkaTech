import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getDatabase, ref, update } from 'firebase/database';

const FireControl = ({ canShoot }) => {
  const [isFiring, setIsFiring] = useState(false);
  const db = getDatabase();

  const handleFire = () => {
    if (isFiring || !canShoot) return;
    setIsFiring(true);
    update(ref(db), {
      "/commands/fire": true,
    });
    setTimeout(() => setIsFiring(false), 5000);
  };

  return (
    <>
      {canShoot && !isFiring && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Shoot Ready</AlertTitle>
          <AlertDescription>You can shoot now!</AlertDescription>
        </Alert>
      )}
      {isFiring && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Fire Success!</AlertTitle>
          <AlertDescription>Target neutralized.</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleFire}
        disabled={isFiring || !canShoot}
        className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
      >
        Fire
      </Button>
    </>
  );
};

export default FireControl; 