import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function VideoAI({ cameraStreamUrl, capturedBase64Image, triggerAnalysis }) {
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictedClass, setPredictedClass] = useState(null);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const prevTriggerRef = useRef(false);

 
  const classNames = ["IDF", "ENEMY"];

  // Load the model
  useEffect(() => {
    async function loadModel() {
      try {
        setIsModelLoading(true);
        const loadedModel = await tf.loadLayersModel("my_model/model.json");
        setModel(loadedModel);
        setIsModelLoading(false);
        console.log("AI model loaded successfully");
      } catch (err) {
        console.error("Failed to load model:", err);
        setError("Failed to load AI model. Please try again later.");
        setIsModelLoading(false);
      }
    }
    loadModel();

    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  // Handler when image is loaded
  const handleImageLoad = () => {
    setImageLoaded(true);
    console.log("Image loaded");
  };

  // Process image: resize to 224x224, normalize and get prediction result
  const processImage = async (imgElement) => {
    if (!model || !imgElement) return;
    
    try {
      const tensor = tf.browser.fromPixels(imgElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat();
      const normalizedTensor = tensor.div(tf.scalar(255));
      const inputTensor = normalizedTensor.expandDims(0); // Shape: [1,224,224,3]
      
      const results = await model.predict(inputTensor);
      const data = await results.data();
      const predictionsArray = Array.from(data);

      // Find index with highest probability
      const maxIndex = predictionsArray.indexOf(Math.max(...predictionsArray));
      const predicted = classNames[maxIndex] || "Unknown";

      setPrediction(predictionsArray);
      setPredictedClass(predicted);

      // Clean up tensors
      tensor.dispose();
      normalizedTensor.dispose();
      inputTensor.dispose();
      results.dispose();
    } catch (err) {
      console.error("Error processing image frame:", err);
      setError("Error processing image frame.");
    }
  };

  // Process image from stream
  const processImageFromStream = async () => {
    if (!imageLoaded || !imageRef.current) {
      console.log("Image not loaded yet");
      return;
    }
    await processImage(imageRef.current);
  };

  // Trigger processing when triggerAnalysis changes from false to true
  useEffect(() => {
    if (triggerAnalysis && !prevTriggerRef.current) {
      processImageFromStream();
    }
    prevTriggerRef.current = triggerAnalysis;
  }, [triggerAnalysis]);

  // Process image received as base64 (if exists)
  useEffect(() => {
    if (!capturedBase64Image || !model) return;
    
    const processBase64Image = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `data:image/jpeg;base64,${capturedBase64Image}`;
        img.onload = async () => {
          await processImage(img);
        };
      } catch (err) {
        console.error("Error processing base64 image:", err);
        setError("Error analyzing image");
      }
    };
    
    processBase64Image();
  }, [capturedBase64Image, model]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="aspect-video w-full overflow-hidden rounded-lg shadow-xl bg-gray-900 border border-gray-700">
        {cameraStreamUrl ? (
          <img
            ref={imageRef}
            src={cameraStreamUrl}
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            className="w-full h-full object-cover"
            alt="Camera Stream"
          />
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
}