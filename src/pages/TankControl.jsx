import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import nipplejs from "nipplejs";
import { getDatabase, ref, update, onValue, push } from "firebase/database";
import { auth } from "@/lib/firebase";
import Navbar from "../components/Navbar";
import VideoAI from "../components/VideoAI";

export default function TankControl() {
  const joystickRef = useRef(null);
  const joystickInstanceRef = useRef(null);

  const [isFiring, setIsFiring] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [laserStatus, setLaserStatus] = useState(false);
  const [cameraStreamUrl, setCameraStreamUrl] = useState("");
  const [distance, setDistance] = useState(null);
  const [canShoot, setCanShoot] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    description: "",
    detailedDescription: "",
    location: "",
  });
  const [capturedImage, setCapturedImage] = useState("");
  
  const db = getDatabase();

  const createJoystick = () => {
    if (!joystickRef.current) return;

    if (joystickInstanceRef.current) {
      joystickInstanceRef.current.destroy();
      joystickInstanceRef.current = null;
    }

    joystickInstanceRef.current = nipplejs.create({
      zone: joystickRef.current,
      mode: "semi",
      position: { left: "50%", top: "50%" },
      color: "#3b82f6",
      size: 150,
      restJoystick: true,
    });

    joystickInstanceRef.current.on("move", (evt, data) => {
      if (!auth.currentUser) return;
      const speed = Math.min(data.force / 2, 1);
      const angle = data.angle.radian;
      update(ref(db), {
        "/commands/movement/speed": speed,
        "/commands/movement/angle": angle,
      });
    });

    joystickInstanceRef.current.on("end", () => {
      if (!auth.currentUser) return;
      update(ref(db), {
        "/commands/movement/speed": 0,
        "/commands/movement/angle": 0,
      });
    });
  };

  useEffect(() => {
    // Listener for autonomous mode from Firebase
    const autonomousRef = ref(db, "commands/autonomous");
    const unsubscribeAutonomous = onValue(autonomousRef, (snapshot) => {
      const autonomousState = snapshot.val();
      setIsAutonomous(autonomousState);

      if (!autonomousState) {
        createJoystick();
      } else {
        if (joystickInstanceRef.current) {
          joystickInstanceRef.current.destroy();
          joystickInstanceRef.current = null;
        }
      }
    });

    // Listener for laser status
    const checkLaserStatus = () => {
      const laserStatusRef = ref(db, "sensor/laserStatus");
      onValue(laserStatusRef, (snapshot) => {
        const status = snapshot.val();
        setLaserStatus(status);
      });
    };

    // Listener for distance sensor
    const checkDistance = () => {
      const sensorDistanceRef = ref(db, "sensor/distance");
      onValue(sensorDistanceRef, (snapshot) => {
        const currentDistance = snapshot.val();
        setDistance(currentDistance);
        if (currentDistance < 20) {
          setCanShoot(true);
        } else {
          setCanShoot(false);
        }
      });
    };

    // Update camera stream address
    const updateCameraStream = () => {
      auth.currentUser?.getIdToken().then((idToken) => {
        fetch(`${import.meta.env.VITE_APP_DATABASE_URL}/esp32camip.json?auth=${idToken}`)
          .then((response) => response.json())
          .then((ip) => {
            if (ip) {
              setCameraStreamUrl(`http://${ip}:81/stream`);
            }
          })
          .catch((error) => console.error("Error fetching camera IP:", error));
      });
    };

    auth.onAuthStateChanged((user) => {
      if (user) {
        checkLaserStatus();
        checkDistance();
        updateCameraStream();
      }
    });

    // Listener for captured photo in Firebase
    const photoRef = ref(db, "photos/latest/photo");
    const unsubscribePhoto = onValue(photoRef, (snapshot) => {
      const base64Data = snapshot.val();
      if (base64Data) {
        const dataUrl = `data:image/jpeg;base64,${base64Data}`;
        setCapturedImage(dataUrl);
      }
    });

    return () => {
      if (joystickInstanceRef.current) {
        joystickInstanceRef.current.destroy();
      }
      unsubscribePhoto();
      unsubscribeAutonomous();
    };
  }, []);

  const handleFire = () => {
    if (isFiring || !canShoot) return;
    setIsFiring(true);
    update(ref(db), {
      "/commands/fire": true,
    });
    setShowIncidentModal(true);
    setTimeout(() => setIsFiring(false), 5000);
  };

  const handleIncidentFormChange = (e) => {
    setIncidentForm({ ...incidentForm, [e.target.name]: e.target.value });
  };

  const handleIncidentSubmit = () => {
    const newIncidentRef = push(ref(db, "history"));
    const incidentId = newIncidentRef.key;
    const timestamp = new Date().toLocaleString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const newIncident = {
      id: incidentId,
      timestamp,
      description: incidentForm.description,
      imageUrl: capturedImage || cameraStreamUrl,
      alt: "Tank Image",
      detailedDescription: incidentForm.detailedDescription,
      location: incidentForm.location,
      status: "מבצע הושלם בהצלחה",
    };
    update(newIncidentRef, newIncident)
      .then(() => {
        setShowIncidentModal(false);
        setIncidentForm({
          description: "",
          detailedDescription: "",
          location: "",
        });
      })
      .catch((error) => {
        console.error("Error saving incident:", error);
      });
  };

  const handleAutonomousToggle = () => {
    const newMode = !isAutonomous;
    setIsAutonomous(newMode);
    update(ref(db), {
      "/commands/autonomous": newMode,
    });
    if (newMode) {
      if (joystickInstanceRef.current) {
        joystickInstanceRef.current.destroy();
        joystickInstanceRef.current = null;
      }
    } else {
      createJoystick();
    }
  };

  return (
    <>
      <Navbar />
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 text-white p-6 rounded-lg w-full max-w-xl max-h-screen overflow-y-auto border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              Incident Report
            </h2>
            {capturedImage ? (
              <div className="mb-4">
                <img src={capturedImage} alt="Captured" className="w-full rounded border border-slate-600" />
              </div>
            ) : (
              <div className="mb-4 bg-slate-700 p-4 rounded text-slate-400 text-center">
                <p>No captured image available</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-slate-300 mb-1">Brief Description</label>
              <input
                type="text"
                name="description"
                value={incidentForm.description}
                onChange={handleIncidentFormChange}
                className="w-full bg-slate-700 border border-slate-600 p-2 rounded mt-1 text-white"
                placeholder="Brief incident description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-300 mb-1">Detailed Description</label>
              <textarea
                name="detailedDescription"
                value={incidentForm.detailedDescription}
                onChange={handleIncidentFormChange}
                className="w-full bg-slate-700 border border-slate-600 p-2 rounded mt-1 text-white h-24"
                placeholder="Detailed incident description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-300 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={incidentForm.location}
                onChange={handleIncidentFormChange}
                className="w-full bg-slate-700 border border-slate-600 p-2 rounded mt-1 text-white"
                placeholder="Incident location"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => setShowIncidentModal(false)} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancel
              </Button>
              <Button onClick={handleIncidentSubmit} className="bg-blue-600 hover:bg-blue-700">
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-full mx-auto">
        {/* Main layout grid for large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-grow">
          <Card className="bg-slate-900 border-slate-800 shadow-lg overflow-hidden xl:col-span-2 xl:row-span-2">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-white flex items-center gap-2 hover:cursor-auto">Camera Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-full">
                <VideoAI cameraStreamUrl={cameraStreamUrl} triggerAnalysis={canShoot} className="w-full h-full min-h-[500px] lg:min-h-[700px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-lg xl:row-span-2 flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-800">
              <CardTitle className="text-white flex items-center gap-2">Control Panel</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col justify-between">
              <div className="flex justify-center mb-8">
                <Button onClick={handleFire} disabled={isFiring || !canShoot} className={`h-24 w-24 rounded-full text-xl font-bold cursor-pointer transition-all duration-300 flex items-center justify-center ${isFiring || !canShoot ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/30"}`}>
                  Fire
                </Button>
              </div>
              <div className="flex-1 mx-auto hover:cursor-pointer mb-8">
                {!isAutonomous && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg"></div>
                    <div ref={joystickRef} className="bg-slate-800 rounded-lg relative w-48 h-48 mx-auto z-10 border border-slate-700 shadow-inner" />
                  </div>
                )}
                {isAutonomous && (
                  <div className="w-48 h-48 mx-auto flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="text-center text-slate-400">
                      <span className="text-sm">Autonomous Mode Active</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className={`text-sm font-medium ${isAutonomous ? "text-blue-400" : "text-slate-300"}`}>
                    {isAutonomous ? "Autonomous" : "Manual"} Mode
                  </span>
                  <Switch checked={isAutonomous} onCheckedChange={handleAutonomousToggle} className="data-[state=checked]:bg-blue-600" />
                </div>
                {distance !== null && (
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center">
                    <span className="text-slate-300 text-sm">
                      Distance: <span className={distance < 20 ? "text-green-400 font-medium" : "text-slate-400"}>{distance} meters</span>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          {canShoot && !isFiring && (
            <Alert className="border-red-600 bg-red-900/30 text-red-400">
              <AlertTitle className="font-semibold">Target Locked</AlertTitle>
              <AlertDescription className="text-red-300">System ready to engage!</AlertDescription>
            </Alert>
          )}

          {isFiring && (
            <Alert className="border-blue-600 bg-blue-900/30 text-blue-400">
              <AlertTitle className="font-semibold">Fire Success!</AlertTitle>
              <AlertDescription className="text-blue-300">Target neutralized.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}
