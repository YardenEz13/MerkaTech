import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoAI from './VideoAI';

const TankCamera = ({ cameraStreamUrl }) => {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 hover:cursor-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          Video Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cameraStreamUrl ? (
          <video
            src={cameraStreamUrl}
            className="w-full aspect-video rounded-lg"
            autoPlay
            playsInline
            muted
            loop
          />
        ) : (
          <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
            <p className="text-slate-500">Waiting for camera...</p>
          </div>
        )}
        <VideoAI cameraStreamUrl={cameraStreamUrl} />
      </CardContent>
    </Card>
  );
};

export default TankCamera; 