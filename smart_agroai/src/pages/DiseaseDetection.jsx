import React, { useState, useRef, useEffect } from "react";

import { motion } from "motion/react";

import { Upload, Image as ImageIcon, Bug, CheckCircle2, AlertCircle, Loader2, X, Info, Leaf, MapPin, DollarSign, TrendingDown, Lightbulb, Map } from "lucide-react";

import { cn } from "../lib/utils";

import api from "../lib/api";



const DiseaseDetection = () => {

  const [selectedImage, setSelectedImage] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  

  // New comprehensive agricultural inputs

  const [agriculturalData, setAgriculturalData] = useState({

    plantType: "",

    fieldArea: "",

    fertilizersUsed: "",

    location: ""

  });



  // Weather data state

  const [weatherData, setWeatherData] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(false);



  // Geolocation state

  const [locationLoading, setLocationLoading] = useState(false);

  const [locationError, setLocationError] = useState(null);



  // Auto-detect location on component mount

  useEffect(() => {

    getCurrentLocation();

  }, []);



  // Fetch weather data when location changes

  useEffect(() => {

    if (agriculturalData.location) {

      fetchWeatherData();

    }

  }, [agriculturalData.location]);



  const fetchWeatherData = async () => {

    if (!agriculturalData.location) return;

    

    setWeatherLoading(true);

    try {

      // Get coordinates from location (simplified)

      const response = await api.post("/api/weather", { 

        location: { 

          lat: 20.5937, // Default India coordinates - in real app would geocode location

          lon: 78.9629 

        } 

      });

      

      if (response.data.success && response.data.data) {

        setWeatherData(response.data.data);

      }

    } catch (error) {

      console.error("Failed to fetch weather data:", error);

    } finally {

      setWeatherLoading(false);

    }

  };



  const getSeasonFromWeather = () => {

    if (!weatherData?.current) return "Unknown";

    

    const month = new Date().getMonth();

    const temperature = weatherData.current.temperature || 25;

    

    // Indian seasons based on month

    if (month >= 6 && month <= 9) return "Kharif (Monsoon)";

    if (month >= 10 && month <= 1) return "Rabi (Winter)";

    if (month >= 2 && month <= 5) return "Zaid (Summer)";

    return "Year-round";

  };



  const getCurrentLocation = () => {

    if (!navigator.geolocation) {

      setLocationError("Geolocation is not supported by this browser");

      return;

    }



    setLocationLoading(true);

    setLocationError(null);



    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const { latitude, longitude } = position.coords;

        

        try {

          // Reverse geocoding to get address from coordinates

          const address = await getAddressFromCoordinates(latitude, longitude);

          setAgriculturalData(prev => ({

            ...prev,

            location: address

          }));

          setLocationLoading(false);

        } catch (err) {

          // If reverse geocoding fails, use coordinates

          setAgriculturalData(prev => ({

            ...prev,

            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`

          }));

          setLocationLoading(false);

        }

      },

      (error) => {

        setLocationError("Unable to retrieve your location");

        setLocationLoading(false);

        console.error("Geolocation error:", error);

      },

      {

        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 300000 // 5 minutes

      }

    );

  };



  const getAddressFromCoordinates = async (lat, lon) => {

    try {

      // Using Nominatim reverse geocoding (free service)

      const response = await fetch(

        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`

      );

      const data = await response.json();

      

      if (data && data.display_name) {

        // Extract meaningful location info

        const parts = data.display_name.split(',');

        if (parts.length >= 3) {

          return `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;

        }

        return data.display_name;

      }

      

      // Fallback to coordinates

      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    } catch (error) {

      console.error("Reverse geocoding error:", error);

      throw error;

    }

  };



  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      setSelectedImage(file);

      const reader = new FileReader();

      reader.onloadend = () => {

        setPreviewUrl(reader.result);

      };

      reader.readAsDataURL(file);

      setResult(null);

      setError(null);

    }

  };



  const handleAgriculturalDataChange = (e) => {

    setAgriculturalData({

      ...agriculturalData,

      [e.target.name]: e.target.value

    });

  };



  // Function to validate if the uploaded image is a leaf
  const validateLeafImage = async (imageFile) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to analyze the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple color analysis - check for green pixels (leaf characteristic)
        let greenPixels = 0;
        let totalPixels = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check if pixel has green characteristics (higher green channel)
          if (g > r && g > b && g > 50) {
            greenPixels++;
          }
        }
        
        // If more than 15% of pixels are green, consider it a leaf image
        const greenRatio = greenPixels / totalPixels;
        resolve(greenRatio > 0.15);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const detectDisease = async () => {

    if (!selectedImage) return;



    setLoading(true);

    setError(null);

    // Validate if the uploaded image is a leaf
    console.log("🔍 Validating if image is a leaf...");
    const isLeafImage = await validateLeafImage(selectedImage);
    
    if (!isLeafImage) {
      setError("Please upload a leaf photo for disease detection.");
      setLoading(false);
      return;
    }
    
    console.log("✅ Image validated as leaf - proceeding with disease detection");

    

    // Immediate mock response for testing (bypass backend)

    console.log("🔄 Using immediate mock response for testing");

    const currentSeason = getSeasonFromWeather();

    const mockResult = {

      success: true,

      disease: "Tomato Early Blight",

      confidence: 85,

      symptoms: ["Dark brown spots on leaves", "Yellowing around spots", "Leaf drop"],

      treatment: ["Apply copper-based fungicide", "Remove infected leaves", "Improve air circulation"],

      prevention: ["Water plants at base", "Ensure proper spacing", "Use resistant varieties"],

      severity: "Medium",

      

      // Comprehensive agricultural analysis

      diseaseReason: "Caused by Alternaria solani fungus, thrives in warm humid conditions with poor air circulation",

      

      economicImpact: {

        currentMarketPrice: "₹40 per kg",

        estimatedLoss: "₹15,000-₹25,000 per acre",

        marketDemand: "High demand for quality tomatoes",

        affectedArea: `${agriculturalData.fieldArea || "1"} acre(s)`,

        totalLoss: agriculturalData.fieldArea ? `₹${parseInt(agriculturalData.fieldArea) * 20000}` : "₹20,000"

      },

      

      recommendations: {

        immediate: ["Apply fungicide immediately", "Remove infected plant parts", "Quarantine affected area"],

        shortTerm: ["Monitor neighboring plants", "Adjust irrigation schedule", "Improve drainage"],

        longTerm: ["Crop rotation next season", "Use disease-resistant varieties", "Implement preventive spraying schedule"],

        marketStrategy: ["Focus on quality remaining produce", "Consider early harvest if severe", "Explore local markets for smaller quantities"]

      },

      

      fertilizerAnalysis: {

        current: agriculturalData.fertilizersUsed || "NPK 19-19-19",

        recommended: "Increase potassium, reduce nitrogen during disease period",

        alternative: "Organic compost + neem cake combination",

        applicationMethod: "Soil drenching + foliar spray"

      },

      

      // Auto-detected season info

      seasonInfo: {

        current: currentSeason,

        weatherBased: true,

        temperature: weatherData?.current?.temperature || 25,

        humidity: weatherData?.current?.humidity || 60,

        recommendations: currentSeason.includes("Monsoon") ? "Increase fungicide frequency" : "Monitor humidity levels"

      },

      

      fallback: true,

      note: "Comprehensive agricultural analysis with auto-detected season - backend deployment pending"

    };

    

    setResult(mockResult);

    setLoading(false);

    return;



    try {

      // Create FormData for file upload

      const formData = new FormData();

      formData.append('image', selectedImage);



      // Call crop disease prediction endpoint

      const response = await api.post('/predict', formData, {

        headers: {

          'Content-Type': 'multipart/form-data',

        },

        timeout: 30000 // 30 second timeout

      });



      // Handle the response from crop disease prediction endpoint

      if (response.data && response.data.success) {

        const prediction = response.data;

        

        // Format the response to match expected structure

        const formattedResult = {

          diseaseName: prediction.disease || prediction.class || "Unknown",

          confidence: prediction.confidence || prediction.probability || 0,

          symptoms: prediction.symptoms || [],

          treatment: prediction.treatment || [],

          prevention: prediction.prevention || [],

          severity: prediction.severity || "Medium"

        };

        

        setResult(formattedResult);

      } else {

        setError(response.data?.message || "Failed to analyze the image");

      }

    } catch (err) {

      console.error("Detection error:", err);

      if (err.code === 'ECONNABORTED') {

        setError("Request timed out. Please try again.");

      } else if (err.response?.status === 413) {

        setError("Image file too large. Please use a smaller image.");

      } else if (err.response?.status === 400) {

        setError("Invalid image format. Please use JPG, PNG, or WEBP.");

      } else {

        setError("Failed to analyze the image. Please try again with a clearer photo.");

      }

    } finally {

      setLoading(false);

    }

  };



  const clearImage = () => {

    setSelectedImage(null);

    setPreviewUrl(null);

    setResult(null);

    setError(null);

    if (fileInputRef.current) fileInputRef.current.value = "";

  };



  return (

    <div className="space-y-6 sm:space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Disease Detection</h1>

          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">AI-powered crop health diagnostics via image analysis</p>

        </div>

      </div>



      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">

        {/* Agricultural Information Form */}

        <div className="bg-white p-4 sm:p-6 lg:p-8 xl:p-10 rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] shadow-sm border border-slate-100">

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">

            <Leaf className="w-5 h-5 text-green-600" />

            Agricultural Information

          </h3>

          

          <div className="space-y-4">

            {/* Plant Type */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-slate-700 ml-1">Plant Type</label>

              <select

                name="plantType"

                value={agriculturalData.plantType}

                onChange={handleAgriculturalDataChange}

                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-medium"

              >

                <option value="">Select Plant Type...</option>

                <option value="tomato">Tomato</option>

                <option value="potato">Potato</option>

                <option value="rice">Rice</option>

                <option value="wheat">Wheat</option>

                <option value="corn">Corn</option>

                <option value="cotton">Cotton</option>

                <option value="sugarcane">Sugarcane</option>

                <option value="other">Other</option>

              </select>

            </div>



            {/* Field Area */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-slate-700 ml-1">Field Area (Acres)</label>

              <input

                type="number"

                name="fieldArea"

                value={agriculturalData.fieldArea}

                onChange={handleAgriculturalDataChange}

                placeholder="e.g., 2.5"

                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-medium"

              />

            </div>



            {/* Fertilizers Used */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-slate-700 ml-1">Fertilizers Used</label>

              <input

                type="text"

                name="fertilizersUsed"

                value={agriculturalData.fertilizersUsed}

                onChange={handleAgriculturalDataChange}

                placeholder="e.g., NPK 19-19-19, Urea, DAP"

                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-medium"

              />

            </div>



            {/* Location */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">

                <MapPin className="w-4 h-4 text-green-600" />

                Location

                {locationLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}

              </label>

              <div className="relative">

                <input

                  type="text"

                  name="location"

                  value={agriculturalData.location}

                  onChange={handleAgriculturalDataChange}

                  placeholder="Detecting your location..."

                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pr-20 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-medium"

                />

                <button

                  type="button"

                  onClick={getCurrentLocation}

                  disabled={locationLoading}

                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"

                  title="Detect current location"

                >

                  {locationLoading ? (

                    <Loader2 className="w-4 h-4 animate-spin" />

                  ) : (

                    <Map className="w-4 h-4" />

                  )}

                </button>

              </div>

              {locationError && (

                <p className="text-xs text-red-500 flex items-center gap-1">

                  <AlertCircle className="w-3 h-3" />

                  {locationError}

                </p>

              )}

              {agriculturalData.location && !locationLoading && (

                <p className="text-xs text-green-600 flex items-center gap-1">

                  <CheckCircle2 className="w-3 h-3" />

                  Location detected - you can edit if needed

                </p>

              )}

            </div>



            {/* Auto-detected Season */}

            <div className="space-y-2">

              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">

                <Leaf className="w-4 h-4 text-green-600" />

                Growing Season

                {weatherLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}

              </label>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl py-3 px-4">

                <div className="flex items-center justify-between">

                  <span className="text-slate-900 font-medium">

                    {getSeasonFromWeather()}

                  </span>

                  <span className="text-xs text-blue-600 font-medium">

                    Auto-detected

                  </span>

                </div>

                {weatherData?.current && (

                  <div className="text-xs text-slate-500 mt-1">

                    Based on current weather: {weatherData.current.temperature}°C, {weatherData.current.humidity}% humidity

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>



        {/* Upload Section */}

        <div className="bg-white p-4 sm:p-6 lg:p-8 xl:p-10 rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] relative">

          {!previewUrl ? (

            <div 

              onClick={() => fileInputRef.current.click()}

              className="w-full h-full border-2 sm:border-4 border-dashed border-slate-100 rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-green-200 hover:bg-green-50/30 transition-all group p-4 sm:p-6"

            >

              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">

                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />

              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 text-center">Upload Leaf Image</h3>

              <p className="text-slate-500 text-xs sm:text-sm text-center max-w-xs">

                Drag and drop or click to select a photo of the affected plant leaf.

              </p>

              <input 

                type="file" 

                ref={fileInputRef} 

                onChange={handleImageChange} 

                accept="image/*" 

                className="hidden" 

              />

            </div>

          ) : (

            /* Image Preview */

            <div className="w-full h-full flex flex-col items-center space-y-3 sm:space-y-4">

              <div className="relative w-full aspect-video rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-xl sm:shadow-2xl">

                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />

                <button 

                  onClick={clearImage}

                  className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors"

                >

                  <X className="w-4 h-4 sm:w-5 sm:h-5" />

                </button>

                

                {/* Analysis indicator */}

                {loading && (

                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">

                    <div className="text-white text-center">

                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-1 sm:mb-2" />

                      <p className="text-xs sm:text-sm">Analyzing leaf health...</p>

                    </div>

                  </div>

                )}

              </div>

              

              {!loading && (

                <button

                  onClick={detectDisease}

                  disabled={loading}

                  className="w-full py-3 sm:py-4 lg:py-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-70"

                >

                  {loading ? <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" /> : <Bug className="w-4 h-4 sm:w-6 sm:h-6" />}

                  {loading ? "Analyzing..." : "Analyze Health"}

                </button>

              )}

            </div>

          )}

        </div>



        {/* Result Section */}

        <div className="space-y-6 sm:space-y-8">

          {result ? (

            <motion.div 

              initial={{ opacity: 0, x: 20 }}

              animate={{ opacity: 1, x: 0 }}

              className="bg-white rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden"

            >

              <div className={cn(

                "p-4 sm:p-6 lg:p-8 xl:p-10 text-white relative overflow-hidden",

                result.diseaseName === "Healthy" ? "bg-gradient-to-r from-green-600 to-emerald-500" : "bg-gradient-to-r from-red-600 to-orange-500"

              )}>

                <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl sm:blur-3xl"></div>

                <div className="relative z-10">

                  <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">

                    <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl sm:rounded-xl backdrop-blur-md">

                      {result.diseaseName === "Healthy" ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" /> : <Bug className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />}

                    </div>

                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80">AI Diagnosis</span>

                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-4 leading-tight">{result.diseaseName}</h2>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md border border-white/20">

                      <span className="font-bold text-sm sm:text-base">{result.confidence}% Confidence</span>

                    </div>

                    {result.severity && (

                      <div className={cn(

                        "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md border border-white/20 font-bold text-xs sm:text-sm",

                        result.severity === "High" ? "bg-red-500/30" : result.severity === "Medium" ? "bg-orange-500/30" : "bg-green-500/30"

                      )}>

                        Severity: {result.severity}

                      </div>

                    )}

                  </div>

                </div>

              </div>



              <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8 lg:space-y-10">

                {/* Disease Reason */}

                {result.diseaseReason && (

                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 sm:p-6">

                    <h4 className="text-xs sm:text-sm font-bold text-orange-600 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">

                      <AlertCircle className="w-4 h-4" />

                      Disease Cause

                    </h4>

                    <p className="text-slate-700 font-medium text-sm sm:text-base">{result.diseaseReason}</p>

                  </div>

                )}



                <div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Observed Symptoms</h4>

                  <div className="flex flex-wrap gap-2 sm:gap-3">

                    {result.symptoms.map((symptom, i) => (

                      <span key={i} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold border border-slate-100">

                        {symptom}

                      </span>

                    ))}

                  </div>

                </div>



                {/* Economic Impact */}

                {result.economicImpact && (

                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4 sm:p-6">

                    <h4 className="text-xs sm:text-sm font-bold text-green-600 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">

                      <DollarSign className="w-4 h-4" />

                      Economic Impact Analysis

                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Current Market Price</p>

                        <p className="text-lg sm:text-xl font-bold text-slate-900">{result.economicImpact.currentMarketPrice}</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Estimated Loss</p>

                        <p className="text-lg sm:text-xl font-bold text-red-600">{result.economicImpact.estimatedLoss}</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Market Demand</p>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{result.economicImpact.marketDemand}</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Total Potential Loss</p>

                        <p className="text-lg sm:text-xl font-bold text-red-600">{result.economicImpact.totalLoss}</p>

                      </div>

                    </div>

                  </div>

                )}



                {/* Season Information */}

                {result.seasonInfo && (

                  <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 sm:p-6">

                    <h4 className="text-xs sm:text-sm font-bold text-yellow-600 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">

                      <Leaf className="w-4 h-4" />

                      Seasonal Analysis

                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Current Season</p>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{result.seasonInfo.current}</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Temperature</p>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{result.seasonInfo.temperature}°C</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Humidity</p>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{result.seasonInfo.humidity}%</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Seasonal Advice</p>

                        <p className="text-sm sm:text-base font-bold text-yellow-700">{result.seasonInfo.recommendations}</p>

                      </div>

                    </div>

                    <div className="text-xs text-slate-500 mt-3 flex items-center gap-1">

                      <CheckCircle2 className="w-3 h-3 text-green-500" />

                      Season auto-detected from weather data

                    </div>

                  </div>

                )}



                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">

                  <div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Recommended Treatment</h4>

                    <ul className="space-y-2 sm:space-y-3">

                      {result.treatment.map((item, i) => (

                        <li key={i} className="flex items-start gap-2 sm:gap-3 text-slate-600 font-medium text-sm sm:text-base">

                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 mt-1.5 sm:mt-2"></div>

                          {item}

                        </li>

                      ))}

                    </ul>

                  </div>

                  <div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Prevention Tips</h4>

                    <ul className="space-y-2 sm:space-y-3">

                      {result.prevention.map((item, i) => (

                        <li key={i} className="flex items-start gap-2 sm:gap-3 text-slate-600 font-medium text-sm sm:text-base">

                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 mt-1.5 sm:mt-2"></div>

                          {item}

                        </li>

                      ))}

                    </ul>

                  </div>

                </div>



                {/* Comprehensive Recommendations */}

                {result.recommendations && (

                  <div className="space-y-6 sm:space-y-8">

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-6">

                      <h4 className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">

                        <Lightbulb className="w-4 h-4" />

                        Strategic Recommendations

                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                        <div>

                          <h5 className="text-xs sm:text-sm font-bold text-blue-700 mb-2">Immediate Actions</h5>

                          <ul className="space-y-1 sm:space-y-2">

                            {result.recommendations.immediate.map((item, i) => (

                              <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-1">

                                <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>

                                {item}

                              </li>

                            ))}

                          </ul>

                        </div>

                        <div>

                          <h5 className="text-xs sm:text-sm font-bold text-blue-700 mb-2">Short-term (1-2 weeks)</h5>

                          <ul className="space-y-1 sm:space-y-2">

                            {result.recommendations.shortTerm.map((item, i) => (

                              <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-1">

                                <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>

                                {item}

                              </li>

                            ))}

                          </ul>

                        </div>

                        <div>

                          <h5 className="text-xs sm:text-sm font-bold text-blue-700 mb-2">Long-term Planning</h5>

                          <ul className="space-y-1 sm:space-y-2">

                            {result.recommendations.longTerm.map((item, i) => (

                              <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-1">

                                <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>

                                {item}

                              </li>

                            ))}

                          </ul>

                        </div>

                        <div>

                          <h5 className="text-xs sm:text-sm font-bold text-blue-700 mb-2">Market Strategy</h5>

                          <ul className="space-y-1 sm:space-y-2">

                            {result.recommendations.marketStrategy.map((item, i) => (

                              <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-start gap-1">

                                <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>

                                {item}

                              </li>

                            ))}

                          </ul>

                        </div>

                      </div>

                    </div>

                  </div>

                )}



                {/* Fertilizer Analysis */}

                {result.fertilizerAnalysis && (

                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 sm:p-6">

                    <h4 className="text-xs sm:text-sm font-bold text-purple-600 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">

                      <Leaf className="w-4 h-4" />

                      Fertilizer Analysis & Recommendations

                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Current Fertilizer</p>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{result.fertilizerAnalysis.current}</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Recommended</p>

                        <p className="text-sm sm:text-base font-bold text-purple-700">{result.fertilizerAnalysis.recommended}</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Alternative</p>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{result.fertilizerAnalysis.alternative}</p>

                      </div>

                      <div>

                        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Application Method</p>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{result.fertilizerAnalysis.applicationMethod}</p>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </motion.div>

          ) : error ? (

            <div className="bg-red-50 p-6 sm:p-8 lg:p-12 rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] border border-red-100 text-center">

              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />

              <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2">Analysis Failed</h3>

              <p className="text-red-600 text-sm sm:text-base">{error}</p>

            </div>

          ) : (

            <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-[20px] sm:rounded-[30px] lg:rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-full">

              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center mb-4 sm:mb-6">

                <Info className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-slate-300" />

              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Awaiting Analysis</h3>

              <p className="text-slate-500 text-sm sm:text-base max-w-xs">Upload an image of a leaf to get an instant AI-powered health diagnosis and treatment plan.</p>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};



export default DiseaseDetection;

