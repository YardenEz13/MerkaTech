import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import nipplejs from "nipplejs";
import { getDatabase, ref, update, onValue, push } from "firebase/database";
import { auth } from "@/lib/firebase";
import Navbar from "../components/Navbar";

export default function TankControl() {
  const joystickRef = useRef(null);
  const joystickInstanceRef = useRef(null);

  const [isFiring, setIsFiring] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(false);
  // We still keep laserStatus if needed for other logic
  const [laserStatus, setLaserStatus] = useState(false);
  const [cameraStreamUrl, setCameraStreamUrl] = useState("");
  
  // New states for distance and shoot permission
  const [distance, setDistance] = useState(null);
  const [canShoot, setCanShoot] = useState(false);
  
  // State for incident modal visibility and form data
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    description: "",
    detailedDescription: "",
    location: "",
  });
  const [capturedImage, setCapturedImage] = useState("");

  const db = getDatabase();

  useEffect(() => {
    // Listen to the laser status from sensor/laserStatus
    const checkLaserStatus = () => {
      const laserStatusRef = ref(db, "sensor/laserStatus");
      onValue(laserStatusRef, (snapshot) => {
        const status = snapshot.val();
        setLaserStatus(status);
      });
    };

    // Listen to the distance sensor and update canShoot accordingly
    const checkDistance = () => {
      const sensorDistanceRef = ref(db, "sensor/distance");
      onValue(sensorDistanceRef, (snapshot) => {
        const currentDistance = snapshot.val();
        setDistance(currentDistance);
        // If the distance is less than 50, allow shooting.
        if (currentDistance < 50) {
          setCanShoot(true);
        } else {
          setCanShoot(false);
        }
      });
    };

    // Update the camera stream URL from Firebase
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

    auth.onAuthStateChanged((user) => {
      if (user) {
        checkLaserStatus();
        checkDistance(); // Start listening to distance sensor
        updateCameraStream();
      } else {
        // Handle unauthenticated state (redirect or show message)
      }
    });

    // Listen to the captured photo in Firebase ("photos/latest/photo")
    const photoRef = ref(db, "photos/latest/photo");
    const unsubscribePhoto = onValue(photoRef, (snapshot) => {
      const base64Data = snapshot.val();
      if (base64Data) {
        const dataUrl = `data:image/jpeg;base64,${base64Data}`;
        setCapturedImage(dataUrl);
      }
    }, (error) => {
      console.error("Error fetching captured photo:", error);
    });

    // Create the joystick in manual mode
    if (joystickRef.current && !isAutonomous) {
      joystickInstanceRef.current = nipplejs.create({
        zone: joystickRef.current,
        mode: "semi",
        position: { left: "50%", top: "50%" },
        color: "blue",
        size: 100,
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
    }

    return () => {
      if (joystickInstanceRef.current) {
        joystickInstanceRef.current.destroy();
      }
      unsubscribePhoto();
    };
  }, [isAutonomous]);

  const handleFire = () => {
    // Now only allow firing if not already firing and canShoot is true
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
        console.log("Incident saved:", newIncident);
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
      joystickInstanceRef.current?.destroy();
      joystickInstanceRef.current = null;
    } else {
      if (joystickRef.current) {
        joystickInstanceRef.current = nipplejs.create({
          zone: joystickRef.current,
          mode: "dynamic",
          position: { left: "50%", top: "50%" },
          color: "blue",
          size: 100,
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
      }
    }
  };

  return (
    <>
      <Navbar />
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">דיווח מקרה</h2>
            {capturedImage ? (
              <div className="mb-4">
                <img src={capturedImage} alt="Captured" className="w-full rounded" />
              </div>
            ) : (
              <p className="mb-4 text-gray-600">No captured image available.</p>
            )}
            <div className="mb-4">
              <label className="block text-gray-700">תיאור קצר</label>
              <input
                type="text"
                name="description"
                value={incidentForm.description}
                onChange={handleIncidentFormChange}
                className="w-full border border-gray-300 p-2 rounded mt-1"
                placeholder="תיאור המקרה בקצרה"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">תיאור מפורט</label>
              <textarea
                name="detailedDescription"
                value={incidentForm.detailedDescription}
                onChange={handleIncidentFormChange}
                className="w-full border border-gray-300 p-2 rounded mt-1"
                placeholder="תיאור מפורט של המקרה"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">מיקום</label>
              <input
                type="text"
                name="location"
                value={incidentForm.location}
                onChange={handleIncidentFormChange}
                className="w-full border border-gray-300 p-2 rounded mt-1"
                placeholder="מיקום המקרה"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => setShowIncidentModal(false)} variant="outline">
                ביטול
              </Button>
              <Button onClick={handleIncidentSubmit}>אישור</Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6 flex-grow">
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
                <img
                  src={cameraStreamUrl || "/placeholder.svg"}
                  alt="Camera Stream"
                  className="w-full aspect-video rounded-lg"
                />
              ) : (
                <div className="w-full aspect-video bg-white rounded-lg" />
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Radar Display</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
              <div className="w-full h-full max-w-[400px] max-h-[400px] relative">
                <div className="absolute inset-0 border-t-2 rounded-t-full border-blue-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Display alert based on canShoot */}
        {canShoot && !isFiring && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="">Shoot Ready</AlertTitle>
            <AlertDescription>You can shoot now!</AlertDescription>
          </Alert>
        )}
        {isFiring && (
          <Alert variant="success" className="mb-4">
            <AlertTitle>Fire Success!</AlertTitle>
            <AlertDescription>Target neutralized.</AlertDescription>
          </Alert>
        )}

        {/* Control Panel */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={handleFire}
                // Now the button is disabled unless canShoot is true
                disabled={isFiring || !canShoot}
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Fire
              </Button>
              <div className="flex-1 mx-8 hover:cursor-pointer">
                <div
                  ref={joystickRef}
                  className={isAutonomous ? "" : "bg-slate-800 rounded-lg relative w-40 h-40 mx-auto z-10"}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white">
                  {isAutonomous ? "Autonomous" : "Manual"} Mode
                </span>
                <Switch
                  checked={isAutonomous}
                  onCheckedChange={handleAutonomousToggle}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}