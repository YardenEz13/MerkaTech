"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Gamepad, Crosshair, BotIcon as Robot, Camera } from "lucide-react"
import { NavLink } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import TankSimulator from "@/components/features/TankSimulator"
import { FireControl } from "@/components/tank/TankControl/controls/FireControl"
import { AutonomousToggle } from "@/components/tank/TankControl/controls/AutonomousToggle"
import { JoystickControl } from "@/components/tank/TankControl/controls/JoystickControl"

export const TankExplanation = () => {
  const [autonomousMode, setAutonomousMode] = useState(false)
  const [canShoot, setCanShoot] = useState(true)
  const [isShot, setIsShot] = useState(false)
  const [tankPosition, setTankPosition] = useState({ x: 50, y: 50 })
  const [aiGuess, setAiGuess] = useState("IDF");

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * 100) + 1;
      console.log(random);
      setAiGuess(random > 50 ? "IDF" : "ENEMY");
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (isShot) {
      timer = setTimeout(() => {
        setIsShot(false);
      }, 5000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isShot]);

  const handleJoystickMove = useCallback((speed, angle) => {
    if (speed > 0) {
      setTankPosition(prev => {
        const moveX = Math.cos(angle) * speed * 1.5;
        const moveY = -Math.sin(angle) * speed * 1.5;
        return {
          x: Math.max(4, Math.min(96, prev.x + moveX)),
          y: Math.max(7, Math.min(93, prev.y + moveY))
        };
      });
    }
  }, []);

  const features = [
    {
      title: "Tank Control",
      icon: <Gamepad className="h-6 w-6" />,
      description: "Use the joystick to control the tank's movement.",
      content: (
        <div className="space-y-4">
          <div className="relative w-full aspect-video bg-[#0B1120] rounded-lg border border-slate-800/50 overflow-hidden">
            <img
              src="/photos-videos/merkava.png"
              alt="Tank"
              className="w-8 h-8 absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
              style={{
                left: `${tankPosition.x}%`,
                top: `${tankPosition.y}%`
              }}
            />
          </div>
          <div className="h-32 bg-[#0B1120] rounded-lg border border-slate-800/50">
            <JoystickControl
              isAutonomous={autonomousMode}
              isDemo={true}
              onMove={handleJoystickMove}
            />
          </div>
        </div>
      )
    },
    {
      title: "Fire Control",
      icon: <Crosshair className="h-6 w-6" />,
      description: "Wait for target detection, then click to fire.",
      content: (
        <div className="space-y-4">
          {isShot ? (
            <Alert variant="success">
              <AlertTitle>Target Hit!</AlertTitle>
              <AlertDescription>Target successfully eliminated.</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Target Detected!</AlertTitle>
              <AlertDescription>Click the fire button to engage.</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-center">
            <FireControl
              canShoot={canShoot}
              onShoot={() => setIsShot(true)}
              demo={true}
            />
          </div>
        </div>
      )
    },
    {
      title: "Autonomous Mode",
      icon: <Robot className="h-6 w-6" />,
      description: "Toggle between manual and autonomous control.",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <AutonomousToggle
            isAutonomous={autonomousMode}
            onToggle={setAutonomousMode}
          />
        </div>
      )
    },
    {
      title: "Camera System",
      icon: <Camera className="h-6 w-6" />,
      description: "Access live video feed and recordings.",
      content: (
        <div>
          <div className="w-full aspect-video bg-[#0B1120] rounded-lg border border-slate-800/50 flex items-center justify-center mb-4">
            <p className="text-slate-500">Camera Stream</p>
          </div>
          <Alert
            className={
              aiGuess === "IDF"
                ? "bg-green-900/50 p-3 rounded-md border border-green-700 mb-2"
                : "bg-red-900/50 p-3 rounded-md border border-red-700 mb-2"
            }
          >
            <AlertTitle
              className={
                aiGuess === "IDF"
                  ? "font-semibold text-green-400"
                  : "font-semibold text-red-400"
              }
            >
              {aiGuess}
            </AlertTitle>
            <AlertDescription
              className={
                aiGuess === "IDF"
                  ? "text-green-200 mt-1"
                  : "text-red-200 mt-1"
              }
            >
              (Demo) {aiGuess === "IDF" ? "IDF soldier detected by AI" : "Enemy detected by AI"}
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <Navbar />
      <div className="container mx-auto pt-20 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-[#0B1120]/80 rounded-lg p-6 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-white font-medium">{feature.title}</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">{feature.description}</p>
              {feature.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TankExplanation
