"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Gamepad, Crosshair, BotIcon as Robot, Radio, Camera } from "lucide-react"
import { NavLink } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import nipplejs from "nipplejs"
import { auth } from "@/lib/firebase"

import Navbar from "../components/Navbar"

export const TankExplanation = () => {
  const [autonomousMode, setAutonomousMode] = useState(false)
  const [targetDetected, setTargetDetected] = useState(false)
  const [fireSuccess, setFireSuccess] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [tankPosition, setTankPosition] = useState({ x: 50, y: 50 }) // מיקום התחלתי באחוזים
  const [hoveredCard, setHoveredCard] = useState(null)
  const [cameraStreamUrl, setCameraStreamUrl] = useState(null)
  const tankRef = useRef(null)
  const containerRef = useRef(null)
  const joystickContainerRef = useRef(null)
  const joystickInstanceRef = useRef(null)
  const animationFrameRef = useRef(null)
  const joystickValueRef = useRef({ x: 0, y: 0 })

  // יצירת הג'ויסטיק – אנחנו משתמשים כאן בג'ויסטיק ידני כדי להדגים את עדכון הערכים
  useEffect(() => {
    const updateCameraStream = () => {
      auth.currentUser?.getIdToken().then((idToken) => {
        fetch(`${import.meta.env.VITE_APP_DATABASE_URL}/esp32camip.json?auth=${idToken}`)
          .then((response) => response.json())
          .then((ip) => {
            if (ip) {
              setCameraStreamUrl(`http://${ip}:81/stream`);
              console.log("Camera IP:", ip);
            }
          })
          .catch((error) => console.error("Error fetching camera IP:", error));
      });
    };
    if (!joystickContainerRef.current) return

    joystickInstanceRef.current = nipplejs.create({
      zone: joystickContainerRef.current,
      mode: "static",
      position: { left: "50%", top: "50%" },
      color: "#3b82f6",
      size: 100,
      lockX: false,
      lockY: false,
      dynamicPage: true,
    })

    // עדכון הערכים באופן רציף
    joystickInstanceRef.current.on("move", (evt, data) => {
      const normalizedX = data.vector.x
      const normalizedY = data.vector.y
      // עדכון הערכים – כאן נשמור את הערכים ב־ref
      joystickValueRef.current = { x: normalizedX, y: normalizedY }
      
    })
    auth.onAuthStateChanged((user) => {
      if (user) {
        
        updateCameraStream();
      } else {
        // Redirect to login page or handle unauthenticated state
        console.log("User not authenticated");
      }
    });

    joystickInstanceRef.current.on("end", () => {
      joystickValueRef.current = { x: 0, y: 0 }
      console.log("Joystick released")
    })

    return () => {
      if (joystickInstanceRef.current) {
        joystickInstanceRef.current.destroy()
      }
    }
  }, [])

  // לולאת עדכון מיקום הטנק – כאן נעביר את ערך ה־Y בהיפוך כדי להניע מעלה כאשר הג'ויסטיק דוחף מעלה
  useEffect(() => {
    const targetDetectionInterval = setInterval(() => {
      setTargetDetected(Math.random() > 0.5)
    }, 5000)

    const updateTankPosition = () => {
      setTankPosition((prev) => {
        const { x, y } = joystickValueRef.current
        return {
          x: Math.max(0, Math.min(100, prev.x + x * 0.5)),
          // כאן הופכנו את הכיוון של y כדי שהטנק יעבור מעלה כאשר המשתמש דוחף את הג'ויסטיק מעלה
          y: Math.max(0, Math.min(100, prev.y - y * 0.5)),
        }
      })
      animationFrameRef.current = requestAnimationFrame(updateTankPosition)
     
    }
    animationFrameRef.current = requestAnimationFrame(updateTankPosition)

    return () => {
      clearInterval(targetDetectionInterval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const handleFire = () => {
    if (targetDetected) {
      setFireSuccess(true)
      setTimeout(() => setFireSuccess(false), 3000)
    }
  }

  const features = [
    {
      title: "Tank Control",
      icon: <Gamepad className="h-6 w-6" />,
      description: "Use the joystick to control the tank's movement.",
      content: (
        <>
          <div
            ref={containerRef}
            className="relative w-[90%] h-40 mx-auto border border-blue-500/20 rounded-lg overflow-hidden bg-slate-900 hover:bg-slate-800"
          >
            <div
              ref={tankRef}
              className="absolute w-8 h-8"
              style={{
                left: `${Math.min(Math.max(tankPosition.x, 5), 95)}%`,
                top: `${Math.min(Math.max(tankPosition.y, 7), 93)}%`,
                transform: "translate(-50%, -50%)"
              }}
            >
              <img 
                src="/photos-videos/merkava.png" 
                alt="Tank" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div
            ref={joystickContainerRef}
            className="relative h-32 w-full mt-4 bg-slate-900/50 rounded-lg border border-blue-500/20 flex items-center justify-center"
          />
        </>
      ),
    },
    {
      title: "Fire Control",
      icon: <Crosshair className="h-6 w-6" />,
      description: "Wait for target detection, then click to fire.",
      content: (
        <>
          {targetDetected && (
            <Alert variant={fireSuccess ? "success" : "destructive"} className="mb-4">
              <AlertTitle>{fireSuccess ? "Fire Success!" : "Target Detected!"}</AlertTitle>
              <AlertDescription>
                {fireSuccess ? "Target neutralized." : "You need to shoot!"}
              </AlertDescription>
            </Alert>
          )}
          <Button
            variant="destructive"
            className="w-12 h-12 rounded-4xl flex items-center justify-center mx-auto bg-red-500 hover:bg-red-600"
            disabled={!targetDetected}
            onClick={handleFire}
          >
            Fire
          </Button>
        </>
      ),
    },
    {
      title: "Autonomous Mode",
      icon: <Robot className="h-6 w-6" />,
      description: "Toggle between manual and autonomous control.",
      content: (
        <div className="flex items-center justify-between">
          <span className="text-gray-400">{autonomousMode ? "Autonomous" : "Manual"}</span>
          <Switch
            checked={autonomousMode}
            onCheckedChange={setAutonomousMode}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>
      ),
    },
   
    {
      title: "Camera System",
      icon: <Camera className="h-6 w-6" />,
      description: "Access live video feed and recordings.",
      content: (
        <>
          <div className="relative w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4 border border-blue-500/20">
          {cameraStreamUrl ? (
                <img
                  src={cameraStreamUrl || "/placeholder.svg"}
                  alt="Camera Stream"
                  className="w-full aspect-video rounded-lg"
                />
              ) : (
                <div className="w-full aspect-video bg-white rounded-lg" />
              )}
            
          </div>
          <Button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "w-full",
              isRecording
                ? "bg-red-800 hover:bg-red-700 text-white"
                : "bg-blue-500/10 text-white hover:bg-blue-600"
            )}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </>
      ),
    },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold text-center mb-8 mt-8 text-white">Tank Control System</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="relative group"
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <AnimatePresence>
                  {hoveredCard === idx && (
                    <motion.span
                      className="absolute inset-0 h-full w-full bg-blue-500/10 dark:bg-blue-800/20 block rounded-lg z-0"
                      layoutId="hoverBackground"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 0.15 },
                      }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.15, delay: 0.2 },
                      }}
                    />
                  )}
                </AnimatePresence>
                <FeatureCard
                  title={feature.title}
                  icon={feature.icon}
                  description={feature.description}
                  isHovered={hoveredCard === idx}
                >
                  {feature.content}
                </FeatureCard>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500/20"
            >
              <NavLink to="/control">Go to Control Page</NavLink>
             
            </Button>
           
             
            
          </div>
        </div>
      </div>
    </>
  )
}

const FeatureCard = ({ title, icon, description, children, isHovered }) => (
  <Card
    className={cn(
      "bg-slate-900/50 border-blue-500/20 backdrop-blur-sm relative z-10 transition-all duration-300 h-full flex flex-col",
      isHovered && "border-blue-400/40"
    )}
  >
    <CardHeader className="border-b border-blue-500/20 flex-shrink-0">
      <CardTitle className="flex items-center space-x-2 text-white">
        {icon}
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6 flex-grow flex flex-col">
      <p className="mb-6 text-gray-400 flex-shrink-0">{description}</p>
      <div className="flex-grow flex flex-col justify-center">{children}</div>
    </CardContent>
  </Card>
)

export default TankExplanation
