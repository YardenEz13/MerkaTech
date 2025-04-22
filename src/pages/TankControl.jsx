import React from "react";
import Navbar from "../components/Navbar";
import TankControl from "../components/tank/TankControl";
import VideoAI from "../components/VideoAI";

export default function TankControlPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto pt-20 p-4">
        <div className="grid gap-6 md:grid-cols-2">
          <VideoAI />
          <TankControl />
        </div>
      </div>
    </div>
  );
}
