import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TankRadar = () => {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white">Radar Display</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
        <div className="w-full h-full max-w-[400px] max-h-[400px] relative">
          <div className="absolute inset-0 border-t-2 rounded-t-full border-blue-500/20" />
          {/* Radar circles */}
          <div className="absolute inset-0 border-2 rounded-full border-blue-500/10" style={{ transform: 'scale(0.25)' }} />
          <div className="absolute inset-0 border-2 rounded-full border-blue-500/10" style={{ transform: 'scale(0.5)' }} />
          <div className="absolute inset-0 border-2 rounded-full border-blue-500/10" style={{ transform: 'scale(0.75)' }} />
          <div className="absolute inset-0 border-2 rounded-full border-blue-500/10" />
          
          {/* Radar sweep animation */}
          <div className="absolute inset-0 origin-bottom">
            <div 
              className="absolute bottom-0 left-1/2 h-1/2 w-0.5 bg-blue-500/60 -translate-x-1/2 origin-bottom animate-spin"
              style={{ animationDuration: '4s' }}
            >
              <div className="absolute top-0 left-1/2 h-4 w-4 bg-blue-500/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-sm" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TankRadar; 