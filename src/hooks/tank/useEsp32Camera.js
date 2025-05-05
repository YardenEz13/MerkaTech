import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useEsp32Camera() {
  const [cameraIp, setCameraIp] = useState(null);
  const [cameraStreamUrl, setCameraStreamUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    // Try different possible paths for the ESP32 camera IP
    const esp32camIpRef = ref(db, "/esp32camip");
    
    console.log("Setting up Firebase listener for ESP32 camera IP...");
    
    const unsubscribe = onValue(esp32camIpRef, (snapshot) => {
      console.log("Firebase snapshot received:", snapshot.val());
      
      const ip = snapshot.val();
      if (ip) {
        console.log("ESP32 camera IP found:", ip);
        setCameraIp(ip);
        // Construct the stream URL for ESP32-CAM
        // ESP32-CAM typically serves the stream at /stream endpoint
        const streamUrl = `http://${ip}:81/stream`;
        console.log("Camera stream URL:", streamUrl);
        setCameraStreamUrl(streamUrl);
      } else {
        console.warn("ESP32 camera IP not found in Firebase at path: /esp32camip");
        setError("ESP32 camera IP not found in Firebase. Please check the Firebase database.");
        
        // Try alternative paths
       
        
        // Check each alternative path
        alternativePaths.forEach(path => {
          const altRef = ref(db, path);
          onValue(altRef, (altSnapshot) => {
            const altIp = altSnapshot.val();
            if (altIp) {
              console.log(`Found IP at alternative path ${path}:`, altIp);
              setCameraIp(altIp);
              setCameraStreamUrl(`http://${altIp}:81/stream`);
              setError(null);
            }
          }, { onlyOnce: true });
        });
      }
    }, (error) => {
      console.error("Error fetching ESP32 camera IP:", error);
      setError(`Failed to fetch ESP32 camera IP from Firebase: ${error.message}`);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { cameraIp, cameraStreamUrl, error };
} 