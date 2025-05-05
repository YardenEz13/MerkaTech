import React, { useRef, useEffect } from "react";
import TankControl from "../components/tank/TankControl";
import VideoAI from "../components/tank/TankCamera/VideoAI";
import { useEsp32Camera } from "@/hooks/tank/useEsp32Camera";
import { useTankState } from "@/hooks/tank/useTankState";
import Layout from "@/components/Layout";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function TankControlPage() {
  const { cameraStreamUrl, error } = useEsp32Camera();
  const { distance, canShoot } = useTankState();
  const videoRef = useRef(null);

  return (
    <Layout>
      <div className="container mx-auto pt-20 p-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Camera Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <VideoAI 
              cameraStreamUrl={cameraStreamUrl} 
              distance={distance}
              ref={videoRef}
            />
          </div>
          <div>
            <TankControl videoRef={videoRef} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
