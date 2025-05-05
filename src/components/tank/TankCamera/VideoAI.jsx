import React, { useEffect, useRef, useState, forwardRef } from 'react';
import * as tf from "@tensorflow/tfjs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const VideoAI = forwardRef(({ cameraStreamUrl, distance = null, onClose }, ref) => {
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictedClass, setPredictedClass] = useState(null);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isModelActive, setIsModelActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const hasProcessedImage = useRef(false);
  const processingTimeoutRef = useRef(null);
  const refsInitialized = useRef(false);
  const prevDistanceRef = useRef(null);
  const modelLoadAttempted = useRef(false);
  const isVisible = useRef(false);

  const classNames = ["IDF", "ENEMY"];

  // Reset processing state when component is shown
  useEffect(() => {
    if (cameraStreamUrl) {
      console.log("Resetting VideoAI state for new capture");
      hasProcessedImage.current = false;
      setPrediction(null);
      setPredictedClass(null);
      setError(null);
      setImageLoaded(false);
      setIsProcessing(false);
      isVisible.current = true;
      
      // Force a new image load
      if (imageRef.current) {
        const timestamp = new Date().getTime();
        console.log("Loading new image with timestamp:", timestamp);
        imageRef.current.src = cameraStreamUrl + '?t=' + timestamp;
      }
    }
  }, [cameraStreamUrl]);

  // Force image capture when component is shown
  useEffect(() => {
    if (isVisible.current && cameraStreamUrl) {
      console.log("Component shown, forcing image capture");
      setIsModelActive(true); // Force model to be active
      
      // Use a direct approach for capture mode
      if (distance === 0) {
        console.log("In capture mode - using direct image fetch approach");
        
        // Try to load the image directly using fetch
        const loadImageDirectly = async () => {
          try {
            const timestamp = new Date().getTime();
            const imageUrl = `${cameraStreamUrl}?t=${timestamp}`;
            console.log("Fetching image directly from:", imageUrl);
            
            // Create a new image element
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            // Wait for image to load or timeout
            const imagePromise = new Promise((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error("Failed to load image"));
              
              // Set a timeout in case the image never loads
              setTimeout(() => reject(new Error("Image load timeout")), 5000);
            });
            
            // Set the source to start loading
            img.src = imageUrl;
            
            // Wait for the image to load
            console.log("Waiting for image to load...");
            const loadedImg = await imagePromise;
            console.log("✅ Image loaded directly with size:", loadedImg.width, "x", loadedImg.height);
            
            // Draw to canvas immediately
            if (canvasRef.current && ctxRef.current) {
              console.log("Drawing loaded image to canvas...");
              ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctxRef.current.drawImage(loadedImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
              
              // Capture as base64
              const capturedImage = canvasRef.current.toDataURL('image/jpeg', 0.8);
              console.log("✅ Image captured successfully, size:", capturedImage.length);
              
              // Send image back
              console.log("📤 Sending directly captured image");
              if (onClose) {
                hasProcessedImage.current = true;
                onClose({
                  image: capturedImage,
                  prediction: "Unknown" // Skip prediction in direct capture mode
                });
              }
            } else {
              throw new Error("Canvas not initialized");
            }
          } catch (error) {
            console.error("❌ Direct image capture failed:", error);
            
            // Use fallback image
            if (onClose) {
              console.log("⚠️ Using fallback image after direct capture failed");
              hasProcessedImage.current = true;
              onClose({
                image: "data:image/jpeg;base64,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", // Tiny black JPEG
                prediction: "Unknown"
              });
            }
          }
        };
        
        // Start direct image loading
        loadImageDirectly();
      } else {
        // Use the standard approach for normal mode
        setTimeout(() => {
          if (imageRef.current) {
            const timestamp = new Date().getTime();
            console.log("Updating image source with timestamp:", timestamp);
            imageRef.current.src = cameraStreamUrl + '?t=' + timestamp;
            
            // Force process after a short delay to ensure image is loaded
            setTimeout(() => {
              console.log("Force processing image after delay");
              setImageLoaded(true);
              processSingleImage();
            }, 1500);
          }
        }, 500);
      }
    }
  }, [isVisible.current, cameraStreamUrl, distance, onClose]);

  // Initialize canvas context
  useEffect(() => {
    const initializeCanvas = () => {
      console.log("Initializing canvas...");
      if (canvasRef.current) {
        try {
          ctxRef.current = canvasRef.current.getContext('2d');
          if (!ctxRef.current) {
            console.error("Failed to get canvas context");
            return false;
          }
          canvasRef.current.width = 224;
          canvasRef.current.height = 224;
          refsInitialized.current = true;
          console.log("Canvas initialized successfully:", {
            width: canvasRef.current.width,
            height: canvasRef.current.height,
            hasContext: !!ctxRef.current
          });
          return true;
        } catch (err) {
          console.error("Error initializing canvas:", err);
          return false;
        }
      } else {
        console.log("Canvas ref not available yet");
        return false;
      }
    };

    // Try to initialize immediately
    if (!initializeCanvas()) {
      // If initialization fails, try again after a short delay
      const retryInterval = setInterval(() => {
        if (initializeCanvas()) {
          clearInterval(retryInterval);
        }
      }, 100);

      // Cleanup interval after 5 seconds
      const timeout = setTimeout(() => {
        clearInterval(retryInterval);
        if (!refsInitialized.current) {
          console.error("Failed to initialize canvas after timeout");
        }
      }, 5000);

      return () => {
        clearInterval(retryInterval);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Load the model
  useEffect(() => {
    if (modelLoadAttempted.current) return;
    
    async function loadModel() {
      try {
        setIsModelLoading(true);
        console.log("Attempting to load model from:", "my_model/model.json");
        const loadedModel = await tf.loadLayersModel("my_model/model.json");
        console.log("Model loaded successfully:", loadedModel);
        setModel(loadedModel);
        setIsModelLoading(false);
        modelLoadAttempted.current = true;
      } catch (err) {
        console.error("Failed to load model:", err);
        setError("Failed to load AI model. Please try again later.");
        setIsModelLoading(false);
        modelLoadAttempted.current = true;
      }
    }
    
    loadModel();

    return () => {
      if (model) {
        model.dispose();
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Check if model should be active based on distance
  useEffect(() => {
    if (distance !== null) {
      const shouldBeActive = distance < 20;
      console.log("Distance:", distance, "Should be active:", shouldBeActive, "refsInitialized:", refsInitialized.current);
      
      // Check if we're crossing the threshold from above to below
      const wasAboveThreshold = prevDistanceRef.current !== null && prevDistanceRef.current >= 20;
      const isNowBelowThreshold = distance < 20;
      const crossingThreshold = wasAboveThreshold && isNowBelowThreshold;
      
      // Update previous distance
      prevDistanceRef.current = distance;
      
      // Only update if the state is changing
      if (shouldBeActive !== isModelActive) {
        setIsModelActive(shouldBeActive);
        
        // Reset processed flag when distance goes above threshold
        if (!shouldBeActive) {
          hasProcessedImage.current = false;
          setPrediction(null);
          setPredictedClass(null);
        }
      }
      
      // If we're crossing the threshold from above to below, trigger processing
      if (crossingThreshold && imageLoaded && !hasProcessedImage.current && !isProcessing && refsInitialized.current) {
        console.log("Crossing threshold from above to below, triggering image processing");
        processSingleImage();
      }
    }
  }, [distance, isModelActive, imageLoaded, isProcessing]);

  // Process image when it's loaded
  useEffect(() => {
    if (imageLoaded && !hasProcessedImage.current && !isProcessing && refsInitialized.current) {
      console.log("Image loaded, processing...");
      processSingleImage();
    }
  }, [imageLoaded, isProcessing]);

  // Handler when image/video is loaded
  const handleMediaLoad = () => {
    console.log("Media loaded, isModelActive:", isModelActive, "hasProcessedImage:", hasProcessedImage.current);
    setImageLoaded(true);
    
    // Always process image when it loads if we're in capture mode
    if (distance === 0 && !hasProcessedImage.current && !isProcessing && refsInitialized.current) {
      console.log("Image loaded in capture mode, triggering image processing");
      processSingleImage();
    }
  };

  // Handler for image loading errors
  const handleMediaError = (error) => {
    console.error("Error loading media:", error);
    setError("Failed to load camera stream. Please check the connection.");
    setImageLoaded(false);
    
    // If in capture mode, try to close with a fallback
    if (distance === 0 && onClose) {
      console.log("⚠️ Media load error in capture mode, using fallback");
      onClose({
        image: "data:image/jpeg;base64,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", // Tiny black JPEG
        prediction: "Unknown"
      });
    }
  };

  // Process single image and close after prediction
  const processSingleImage = async () => {
    console.log("=== Starting Image Processing ===");
    console.log("Current state:", {
      hasModel: !!model,
      hasImageRef: !!imageRef.current,
      isModelActive,
      hasProcessedImage: hasProcessedImage.current,
      isProcessing,
      refsInitialized: refsInitialized.current,
      distance,
      imageLoaded,
      currentImageSrc: imageRef.current?.src
    });

    // Skip if we already processed in the direct capture method
    if (hasProcessedImage.current) {
      console.log("❌ Already processed image, skipping");
      return;
    }

    if (!refsInitialized.current) {
      console.log("❌ Refs not initialized yet, waiting...");
      return;
    }

    if (!model) {
      console.log("❌ Model not loaded yet");
      // If in capture mode, use fallback
      if (distance === 0 && onClose && !hasProcessedImage.current) {
        console.log("⚠️ In capture mode but model not ready, using fallback");
        hasProcessedImage.current = true;
        onClose({
          image: "data:image/jpeg;base64,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", // Tiny black JPEG
          prediction: "Unknown"
        });
      }
      return;
    }

    if (!imageRef.current || !isModelActive || hasProcessedImage.current || isProcessing) {
      console.log("❌ Skipping image processing - conditions not met:", {
        hasModel: !!model,
        hasImageRef: !!imageRef.current,
        isModelActive,
        hasProcessedImage: hasProcessedImage.current,
        isProcessing,
        refsInitialized: refsInitialized.current,
        imageLoaded
      });
      return;
    }
    
    try {
      console.log("🔄 Starting image capture and processing...");
      setIsProcessing(true);
      
      // Double-check that all required refs are available
      if (!canvasRef.current || !ctxRef.current || !imageRef.current) {
        console.error("❌ Missing required refs for image processing:", {
          hasCanvasRef: !!canvasRef.current,
          hasCtxRef: !!ctxRef.current,
          hasImageRef: !!imageRef.current
        });
        setError("Missing required refs for image processing");
        if (distance === 0 && onClose && !hasProcessedImage.current) {
          console.log("⚠️ Missing refs in capture mode, using fallback");
          hasProcessedImage.current = true;
          onClose({
            image: "data:image/jpeg;base64,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", // Tiny black JPEG
            prediction: "Unknown"
          });
        }
        return;
      }

      // For capture mode, try a different approach if the standard one isn't working
      if (distance === 0) {
        console.log("📸 In capture mode - trying alternative capture approach");
        
        try {
          // Use fetch to get the image directly as a blob if possible
          const timestamp = new Date().getTime();
          const response = await fetch(`${cameraStreamUrl}?t=${timestamp}`, {
            mode: 'cors',
            cache: 'no-cache'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          // Create a new image from the blob
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          // Load the image
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
          });
          
          // Draw to canvas
          ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctxRef.current.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Release the object URL
          URL.revokeObjectURL(imageUrl);
          
          // Get the base64
          const capturedImage = canvasRef.current.toDataURL('image/jpeg', 0.8);
          
          if (onClose && !hasProcessedImage.current) {
            console.log("📤 Sending alternatively captured image");
            hasProcessedImage.current = true;
            onClose({
              image: "data:image/jpeg;base64,"+capturedImage,
              prediction: "Unknown"
            });
          }
          
          return;
        } catch (fetchError) {
          console.error("❌ Alternative capture failed:", fetchError);
          // Continue with standard approach as fallback
        }
      }

      // Skip network loading and just use the current image
      console.log("📸 Using current image from imageRef");
      
      // Make sure the image is loaded - we'll try multiple times with a max timeout
      let attempts = 0;
      const maxAttempts = 5;
      const retryInterval = 500;
      
      while ((!imageRef.current.complete || imageRef.current.naturalWidth === 0) && attempts < maxAttempts) {
        console.log(`⚠️ Current image not fully loaded, waiting (attempt ${attempts + 1}/${maxAttempts})...`);
        // Wait a short time for image to load
        await new Promise(resolve => setTimeout(resolve, retryInterval));
        attempts++;
      }
      
      // Check if image is now ready
      if (!imageRef.current.complete || imageRef.current.naturalWidth === 0) {
        console.log("❌ Image failed to load after all attempts");
        if (distance === 0 && onClose && !hasProcessedImage.current) {
          console.log("⚠️ Image load failed in capture mode, using fallback");
          hasProcessedImage.current = true;
          onClose({
            image: "data:image/jpeg;base64,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", // Tiny black JPEG
            prediction: "Unknown"
          });
        }
        throw new Error("Image not loaded after multiple attempts");
      }
      
      console.log("📸 Capturing image from canvas...");
      // Clear the canvas first
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw the current image to the canvas
      ctxRef.current.drawImage(
        imageRef.current,
        0, 0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // Capture the current frame as a base64 data URL
      const capturedImage = canvasRef.current.toDataURL('image/jpeg', 0.8);

      console.log("✅ Image captured successfully, size:", capturedImage.length);
      console.log("=== BASE64 PHOTO DATA ===");
      console.log(capturedImage.substring(0, 100) + "..."); // Only log the beginning
      console.log("=== END BASE64 PHOTO DATA ===");
      
      // Verify the base64 string is valid
      if (!capturedImage.startsWith('data:image/jpeg;base64,')) {
        console.log("❌ Invalid base64 format");
        if (distance === 0 && onClose && !hasProcessedImage.current) {
          console.log("⚠️ Invalid base64 in capture mode, using fallback");
          hasProcessedImage.current = true;
          onClose({
            image: "data:image/jpeg;base64,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", // Tiny black JPEG
            prediction: "Unknown"
          });
        }
        throw new Error("Invalid base64 image format");
      }
      
      // If we're in capture mode, return the image immediately
      if (distance === 0 && onClose && !hasProcessedImage.current) {
        console.log("📤 Capture mode - sending image immediately");
        hasProcessedImage.current = true;
        onClose({
          image: capturedImage,
          prediction: "Unknown" // We're skipping prediction in capture mode
        });
        console.log("=== Image Capture Complete (skipping prediction) ===");
        return;
      }
      
      console.log("🔄 Converting image to tensor...");
      // Convert canvas to tensor
      const tensor = tf.browser.fromPixels(canvasRef.current)
        .resizeNearestNeighbor([224, 224])
        .toFloat();
      const normalizedTensor = tensor.div(tf.scalar(255));
      const inputTensor = normalizedTensor.expandDims(0);
      
      console.log("🤖 Running model prediction...");
      // Get prediction
      const results = await model.predict(inputTensor);
      const data = await results.data();
      const predictionsArray = Array.from(data);

      const maxIndex = predictionsArray.indexOf(Math.max(...predictionsArray));
      const predicted = classNames[maxIndex] || "Unknown";

      console.log("✅ Prediction results:", {
        predicted,
        predictionsArray
      });

      setPrediction(predictionsArray);
      setPredictedClass(predicted);
      hasProcessedImage.current = true;

      // Clean up tensors
      tensor.dispose();
      normalizedTensor.dispose();
      inputTensor.dispose();
      results.dispose();

      console.log("📤 Sending image and prediction to parent component...");
      // Pass the captured image and prediction to the parent component
      if (onClose) {
        onClose({
          image: capturedImage,
          prediction: predicted
        });
      }
      console.log("=== Image Processing Complete ===");
    } catch (err) {
      console.error("❌ Error processing image:", err);
      setError("Error processing image: " + err.message);
      
      // If capture fails, try to close with a fallback
      if (distance === 0 && onClose && !hasProcessedImage.current) {
        console.log("⚠️ Using fallback image and prediction after error");
        hasProcessedImage.current = true;
        onClose({
          image: "data:image/jpeg;base64,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", // Tiny black JPEG
          prediction: "Unknown"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Effect to trigger image processing when model becomes active
  useEffect(() => {
    console.log("Checking processing trigger:", {
      isModelActive,
      imageLoaded,
      hasProcessedImage: hasProcessedImage.current,
      isProcessing,
      refsInitialized: refsInitialized.current,
      distance
    });

    if (isModelActive && imageLoaded && !hasProcessedImage.current && !isProcessing && refsInitialized.current) {
      console.log("Model became active, processing image...");
      processSingleImage();
    }
  }, [isModelActive, imageLoaded, isProcessing, distance]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="aspect-video w-full overflow-hidden rounded-lg shadow-xl bg-gray-900 border border-gray-700 relative">
        {cameraStreamUrl ? (
          <>
            <img
              ref={(el) => {
                imageRef.current = el;
                if (typeof ref === 'function') {
                  ref(el);
                } else if (ref) {
                  ref.current = el;
                }
              }}
              src={cameraStreamUrl}
              crossOrigin="anonymous"
              onLoad={handleMediaLoad}
              onError={handleMediaError}
              className="w-full h-full object-cover"
              alt="Camera Stream"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
              width="224"
              height="224"
            />
            
            {!isModelActive && distance !== null && (
              <div className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-medium">
                Distance: {typeof distance === 'number' ? distance.toFixed(1) : 'N/A'}cm
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 p-4">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 font-medium">No Stream Available</p>
            </div>
          </div>
        )}
      </div>

      {isModelLoading && (
        <Alert className="mt-4 border-blue-500 bg-blue-50 text-blue-800">
          <AlertTitle className="font-semibold">Loading AI Model</AlertTitle>
          <AlertDescription className="mt-1">
            Please wait while the object detection model is loading...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle className="font-semibold">Error</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
      )}

      {isProcessing && (
        <Alert className="mt-4 border-yellow-500 bg-yellow-50 text-yellow-800">
          <AlertTitle className="font-semibold">Processing Image</AlertTitle>
          <AlertDescription className="mt-1">
            Analyzing image with AI model...
          </AlertDescription>
        </Alert>
      )}

      {(prediction || predictedClass) && (
        <div className="bg-slate-800 p-4 rounded-lg text-white mt-4 shadow-md">
          <h3 className="font-medium text-lg mb-2 border-b border-slate-600 pb-2">AI Analysis Results</h3>
          
          {predictedClass === "IDF" && (
            <Alert className="bg-green-900/50 p-3 rounded-md border border-green-700 mb-2">
              <AlertTitle className="font-semibold text-green-400">IDF</AlertTitle>
              <AlertDescription className="text-green-200 mt-1">IDF soldier detected</AlertDescription>
            </Alert>
          )}
          
          {predictedClass === "ENEMY" && (
            <Alert className="bg-red-900/50 p-3 rounded-md border border-red-700 mb-2">
              <AlertTitle className="font-semibold text-red-400">ENEMY</AlertTitle>
              <AlertDescription className="text-red-200 mt-1">Enemy detected</AlertDescription>
            </Alert>
          )}
          
          {prediction && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Confidence scores:</p>
              <div className="bg-slate-900 p-2 rounded text-xs font-mono">
                {prediction.map((score, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span>{classNames[index] || `Class ${index}`}:</span>
                    <span>{(score * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default VideoAI; 