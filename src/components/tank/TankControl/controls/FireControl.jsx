import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getDatabase, ref, update, push, set } from 'firebase/database';
import { IncidentReport } from '../modals/IncidentReport';
import VideoAI from '../../TankCamera/VideoAI';

export const FireControl = ({ canShoot, onShoot, videoRef, demo, distance }) => {
  const [isFiring, setIsFiring] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showVideoAI, setShowVideoAI] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const db = getDatabase();

  // Reset states when VideoAI is shown
  useEffect(() => {
    if (showVideoAI) {
      console.log("VideoAI shown, resetting states");
      setCapturedImage(null);
      setPrediction(null);
      setShowReport(false);
    }
  }, [showVideoAI]);

  const handleVideoAIClose = async (data) => {
    console.log("=== Starting VideoAI Close Handler ===");
    console.log("Received data from VideoAI:", {
      hasImage: !!data?.image,
      hasPrediction: !!data?.prediction,
      imageSize: data?.image?.length,
      currentDistance: distance
    });

    setShowVideoAI(false);
    
    if (data?.image) {
      console.log("📸 Processing captured image...");
      
      setCapturedImage(data.image);
      setPrediction(data.prediction || "Unknown");
      
      // Store the image and prediction in Firebase
      try {
        console.log("🔥 Storing data in Firebase...");
        
        // Store in history collection
        const incidentRef = push(ref(db, 'history'));
        console.log("📝 Creating new incident record...");
        await update(incidentRef, {
          timestamp: Date.now(),
          image: "data:image/jpeg;base64,"+data.image,
          prediction: data.prediction || "Unknown",
          distance: distance || 0
        });
        console.log("✅ Incident stored successfully");

        // Store as latest photo - simplify to just store the raw data
        console.log("📤 Updating latest photo...");
        try {
          // Extract the base64 data part if it has a prefix
          let photoData = data.image;
          if (photoData.startsWith('data:image/jpeg;base64,')) {
            photoData = photoData.replace('data:image/jpeg;base64,', '');
          }
          
          const latestPhotoRef = ref(db, 'photos/latest/photo');
          await set(latestPhotoRef, photoData);
          console.log("✅ Latest photo updated successfully");
        } catch (photoError) {
          console.error("❌ Error updating photo:", photoError);
        }

        // Store metadata separately
        const latestMetaRef = ref(db, 'photos/latest/meta');
        await set(latestMetaRef, {
          timestamp: Date.now(),
          prediction: data.prediction || "Unknown",
          distance: distance || 0
        });
        console.log("✅ Latest photo metadata updated");

        console.log("=== Firebase Storage Complete ===");
        
        // Show the report now that everything is done
        setShowReport(true);
        setIsFiring(false);
      } catch (error) {
        console.error("❌ Error storing data in Firebase:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        setIsFiring(false);
      }
    } else {
      console.log("❌ No image data received from VideoAI");
      setIsFiring(false);
    }
  };

  const handleFire = async () => {
    if (isFiring || !canShoot) return;
    console.log("=== Starting Fire Operation ===");
    console.log("Current state:", { isFiring, canShoot, distance });
    
    setIsFiring(true);
    
    try {
      // Update fire command
      console.log("🔥 Sending fire command to Firebase...");
      await update(ref(db), {
        "/commands/fire": true,
      });
      console.log("✅ Fire command sent successfully");

      // Get camera stream URL directly from videoRef
      const cameraUrl = videoRef?.current?.src;
      console.log("📸 Camera URL:", cameraUrl);
      
      if (!cameraUrl) {
        throw new Error("No camera URL available");
      }

      // Show VideoAI to capture a new photo
      console.log("📸 Showing VideoAI for image capture...");
      setShowVideoAI(true);
      
      if (onShoot) {
        onShoot();
      }
    } catch (error) {
      console.error("❌ Error during fire operation:", error);
      setIsFiring(false);
    }
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setCapturedImage(null);
    setPrediction(null);
  };

  return (
    <>
      <Button
        onClick={handleFire}
        disabled={isFiring || !canShoot}
        className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
      >
        Fire
      </Button>

      {showVideoAI && (
        <VideoAI
          cameraStreamUrl={videoRef?.current?.src}
          distance={0} // Force capture by setting distance to 0
          onClose={handleVideoAIClose}
        />
      )}

      {!demo && (
        <IncidentReport 
          isOpen={showReport}
          onClose={handleCloseReport}
          imageData={capturedImage}
          prediction={prediction}
        />
      )}
    </>
  );
}; 