import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const VideoAI = ({ cameraStreamUrl }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  
  // Create refs for the elements and model variables
  const modelRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const labelContainerRef = useRef(null);
  const maxPredictionsRef = useRef(0);
  const videoContainerRef = useRef(null);
  const animationRef = useRef(null);
  const ctxRef = useRef(null);

  // The URL to your model from Teachable Machine
  const URL = "https://teachablemachine.withgoogle.com/models/1P_dUzahg/";

  // Initialize the canvas for capturing frames from the ESP32 camera
  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  // Load the image model and setup the ESP32 camera stream
  const init = async () => {
    if (isInitialized || isLoading || !isLibraryLoaded) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting initialization...');
      
      if (!cameraStreamUrl) {
        throw new Error("Camera stream URL is required");
      }

      // Check if libraries are loaded
      if (!window.tmImage) {
        throw new Error("Teachable Machine library not loaded yet");
      }
      
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      console.log('Loading model from:', modelURL);
      
      // Load the model and metadata
      modelRef.current = await window.tmImage.load(modelURL, metadataURL);
      maxPredictionsRef.current = modelRef.current.getTotalClasses();
      console.log('Model loaded with', maxPredictionsRef.current, 'classes');

      // Set up video element for ESP32 camera stream
      if (videoRef.current) {
        videoRef.current.src = cameraStreamUrl;
        videoRef.current.onloadedmetadata = () => {
          // Set canvas dimensions to match video
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          
          // Start the prediction loop
          animationRef.current = window.requestAnimationFrame(loop);
          setIsInitialized(true);
          setIsLoading(false);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('Error loading video:', e);
          setError(`Failed to load video stream: ${e.message || 'Unknown error'}`);
          setIsLoading(false);
        };
        
        // Start playing the video
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setError(`Failed to play video: ${err.message}`);
          setIsLoading(false);
        });
      }
      
      // Create label elements
      if (labelContainerRef.current) {
        labelContainerRef.current.innerHTML = ''; // Clear existing content
        for (let i = 0; i < maxPredictionsRef.current; i++) {
          const div = document.createElement("div");
          div.className = "text-white text-sm";
          labelContainerRef.current.appendChild(div);
        }
      }
      
    } catch (error) {
      console.error('Error initializing model:', error);
      setError(`Failed to initialize: ${error.message}`);
      setIsLoading(false);
    }
  };

  const loop = () => {
    if (videoRef.current && canvasRef.current && ctxRef.current) {
      // Draw the current video frame to the canvas
      ctxRef.current.drawImage(
        videoRef.current, 
        0, 0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
      
      predict();
      animationRef.current = window.requestAnimationFrame(loop);
    }
  };

  const predict = async () => {
    if (!modelRef.current || !canvasRef.current) return;
    
    try {
      // Predict using the canvas with the ESP32 camera frame
      const prediction = await modelRef.current.predict(canvasRef.current);
      
      // Update labels with predictions
      for (let i = 0; i < maxPredictionsRef.current; i++) {
        const classPrediction = 
          prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        
        if (labelContainerRef.current && labelContainerRef.current.childNodes[i]) {
          labelContainerRef.current.childNodes[i].innerHTML = classPrediction;
        }
      }
    } catch (error) {
      console.error('Error during prediction:', error);
    }
  };

  // Add script loading for teachable machine libraries
  useEffect(() => {
    let scriptsLoaded = 0;
    const requiredScripts = 2;

    const checkLibrariesLoaded = () => {
      scriptsLoaded++;
      console.log(`Scripts loaded: ${scriptsLoaded}/${requiredScripts}`);
      
      if (scriptsLoaded === requiredScripts) {
        console.log('All required libraries loaded');
        // Add a small delay to ensure libraries are fully initialized
        setTimeout(() => {
          setIsLibraryLoaded(true);
          // Initialize if we have a camera stream URL
          if (cameraStreamUrl) {
            console.log('Starting initialization with camera stream:', cameraStreamUrl);
            init();
          }
        }, 100);
      }
    };

    // Load TensorFlow.js if not already loaded
    if (!window.tf) {
      console.log('Loading TensorFlow.js...');
      const tfScript = document.createElement('script');
      tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js";
      tfScript.async = true;
      tfScript.onload = () => {
        console.log('TensorFlow.js loaded successfully');
        checkLibrariesLoaded();
      };
      tfScript.onerror = (error) => {
        console.error('Error loading TensorFlow.js:', error);
        setError('Failed to load TensorFlow.js');
      };
      document.body.appendChild(tfScript);
    } else {
      console.log('TensorFlow.js already loaded');
      checkLibrariesLoaded();
    }
    
    // Load Teachable Machine Image library if not already loaded
    if (!window.tmImage) {
      console.log('Loading Teachable Machine Image library...');
      const tmScript = document.createElement('script');
      tmScript.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js";
      tmScript.async = true;
      tmScript.onload = () => {
        console.log('Teachable Machine Image library loaded successfully');
        checkLibrariesLoaded();
      };
      tmScript.onerror = (error) => {
        console.error('Error loading Teachable Machine Image library:', error);
        setError('Failed to load Teachable Machine Image library');
      };
      document.body.appendChild(tmScript);
    } else {
      console.log('Teachable Machine Image library already loaded');
      checkLibrariesLoaded();
    }
    
    // Clean up on component unmount
    return () => {
      // Stop video if it exists
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      
      // Cancel animation frame if it exists
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Initialize when cameraStreamUrl changes
  useEffect(() => {
    if (cameraStreamUrl && isLibraryLoaded && !isInitialized) {
      console.log('Camera stream URL changed, checking libraries before initialization...');
      // Add a small delay to ensure libraries are fully initialized
      setTimeout(() => {
        if (window.tf && window.tmImage) {
          console.log('Libraries confirmed loaded, initializing...');
          init();
        } else {
          console.log('Libraries not ready yet, waiting...');
        }
      }, 100);
    }
  }, [cameraStreamUrl, isLibraryLoaded]);

  return (
    <div className="mt-4">
      <div className="text-white mb-2">AI Detection</div>
      
      <Button 
        type="button" 
        onClick={init} 
        disabled={isInitialized || isLoading || !isLibraryLoaded || !cameraStreamUrl}
        className="mb-2"
      >
        {isLoading ? 'Initializing...' : !isLibraryLoaded ? 'Loading Libraries...' : !cameraStreamUrl ? 'Waiting for Camera...' : isInitialized ? 'Model Initialized' : 'Start AI Detection'}
      </Button>
      
      {error && <div className="text-red-500 mb-2">{error}</div>}
      
      <div ref={videoContainerRef} id="video-container" className="mb-2">
        {/* ESP32 camera stream will be displayed here */}
        <video 
          ref={videoRef} 
          width="200" 
          height="200" 
          style={{ display: 'block' }}
          playsInline
          muted
        />
        <canvas 
          ref={canvasRef} 
          width="200" 
          height="200" 
          style={{ display: 'none' }} 
        />
      </div>
      
      <div ref={labelContainerRef} id="label-container" className="space-y-1">
        {/* Prediction labels will be inserted here */}
      </div>
    </div>
  );
};

export default VideoAI; 