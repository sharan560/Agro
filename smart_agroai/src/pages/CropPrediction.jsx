import React, { useState, useEffect } from "react";

import { motion } from "motion/react";

import { Sprout, RefreshCw, Cpu, Droplets, Thermometer, Wind, CheckCircle2, AlertCircle, Loader2, User, ArrowRight } from "lucide-react";

import axios from "axios";

import { GoogleGenAI } from "@google/genai";

import { cn } from "../lib/utils";

import api from "../lib/api";



const CropPrediction = () => {

  const [soilData, setSoilData] = useState({

    soilType: "",

  });

  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [sensorData, setSensorData] = useState(null);

  const [weatherData, setWeatherData] = useState(null);

  const [location, setLocation] = useState({ lat: 20.5937, lon: 78.9629 }); // Default: India

  const [refreshingWeather, setRefreshingWeather] = useState(false);



  // Fetch sensor data from ThingSpeak via backend

  const fetchSensorData = async () => {

    try {

      console.log("Fetching sensor data from ThingSpeak...");

      

      // Use the sensors/latest endpoint which returns ThingSpeak data

      const response = await api.get("/api/sensors/latest");

      console.log("Sensor data response:", response.data);

      

      if (response.data.success && response.data.data) {

        const data = response.data.data;

        setSensorData(data);

        console.log("Set sensor data:", data);

        return data;

      } else {

        console.log("No sensor data available");

        return null;

      }

    } catch (err) {

      console.error("Failed to fetch sensor data:", err);

      return null;

    }

  };



  // Fetch weather data from API

  const fetchWeatherData = async (lat = location.lat, lon = location.lon) => {

    try {

      console.log("Fetching weather data for location:", { lat, lon });

      const response = await api.post("/api/weather", { location: { lat, lon } });

      console.log("Weather data response:", response.data);

      

      if (response.data.success && response.data.data) {

        setWeatherData(response.data.data);

        console.log("Set weather data:", response.data.data);

        console.log("Environment temperature:", response.data.data.current?.temperature);

        return response.data.data;

      } else {

        console.log("No weather data available");

        return null;

      }

    } catch (err) {

      console.error("Failed to fetch weather data:", err);

      return null;

    }

  };



  // Get user location on component mount

  useEffect(() => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const newLocation = {

            lat: position.coords.latitude,

            lon: position.coords.longitude

          };

          setLocation(newLocation);

          fetchWeatherData(newLocation.lat, newLocation.lon);

        },

        (err) => {

          console.log("Location access denied, using default location");

          fetchWeatherData();

        }

      );

    } else {

      fetchWeatherData();

    }

  }, []);



  useEffect(() => {

    fetchSensorData();

    // Refresh sensor data every 30 seconds

    const interval = setInterval(fetchSensorData, 30000);

    return () => clearInterval(interval);

  }, []);



  const handleInputChange = (e) => {

    setSoilData({ ...soilData, [e.target.name]: e.target.value });

  };



  const handleWeatherRefresh = async () => {

    setRefreshingWeather(true);

    await fetchWeatherData(location.lat, location.lon);

    setRefreshingWeather(false);

  };



  const handlePredict = async (e) => {

    e.preventDefault();

    if (!soilData.soilType) {

      setError("Please select a soil type to proceed.");

      return;

    }



    setLoading(true);

    setError(null);

    setResults(null);



    try {

      // Get latest sensor data

      const sensors = await fetchSensorData();

      

      // Prepare input for ML model

      const modelInput = {

        soil_type: soilData.soilType,

        soil_temp: sensors?.temperature || 25, // Use sensor temperature as soil temp

        env_temp: weatherData?.temperature || sensors?.temperature || 30, // Use weather API temp for env temp

        moisture: sensors?.soilMoisture || 50, // Use sensor moisture

      };



      console.log("Sending to ML model:", modelInput);



      // Call backend API instead of direct ML model

      const response = await api.post("/predict", modelInput);

      

      console.log("ML model response:", response.data);



      if (response.data && response.data.top_predictions) {

        setResults(response.data.top_predictions);

      } else {

        throw new Error("Invalid response format from ML model");

      }



    } catch (err) {

      console.error("Prediction error:", err);

      setError(err.response?.data?.message || "Prediction failed. Could not connect to ML model.");

      

      // Fallback to mock data if API fails

      const fallbackResults = [

        { crop: "Papaya", suitability: 64.0415 },

        { crop: "Coconut", suitability: 30.1440 },

        { crop: "Orange", suitability: 2.3602 },

        { crop: "Jute", suitability: 1.3415 },

        { crop: "Rice", suitability: 1.0259 }

      ];

      setResults(fallbackResults);

    } finally {

      setLoading(false);

    }

  };



  const dashboardCards = [

    { label: "Soil Temp", value: sensorData?.temperature || 25, unit: "°C", color: "text-orange-500", icon: <Thermometer className="w-4 h-4" /> },

    { label: "Env Temp", value: weatherData?.temperature || 30, unit: "°C", color: "text-red-500", icon: <Thermometer className="w-4 h-4" /> },

    { label: "Moisture", value: sensorData?.soilMoisture || 50, unit: "%", color: "text-blue-500", icon: <Droplets className="w-4 h-4" /> },

  ];



  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Crop Advisor</h1>

          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">Manual Soil Category + Dashboard Metrics</p>

        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full">

           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>

           <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live Sync: ACTIVE</span>

        </div>

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Input & Dashboard Metrics */}

        <div className="lg:col-span-4 space-y-6">

          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">

            <h3 className="text-lg font-black text-slate-900 mb-6 relative z-10 flex items-center gap-2">

               <User className="w-4 h-4 text-green-600" />

               Manual Soil Category

            </h3>



            <div className="space-y-4 relative z-10">

              <div className="space-y-1.5">

                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Soil Category</label>

                <div className="relative group">

                  <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-green-600 transition-colors" />

                  <select

                    name="soilType"

                    value={soilData.soilType}

                    onChange={handleInputChange}

                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none transition-all text-slate-900 font-bold text-sm appearance-none"

                  >

                    <option value="">Select Soil Type...</option>

                    <option value="clay">Clay Soil</option>

                    <option value="sandy">Sandy Soil</option>

                    <option value="loamy">Loamy Soil</option>

                    <option value="silt">Silt Soil</option>

                    <option value="peaty">Peaty Soil</option>

                  </select>

                </div>

              </div>



              <button

                onClick={handlePredict}

                disabled={loading}

                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm shadow-xl hover:bg-green-600 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 group"

              >

                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Parameters"}

                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />}

              </button>

            </div>

          </div>



          <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200">

             <div className="flex items-center justify-between mb-4 px-1">

                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">

                   <RefreshCw className="w-3 h-3 animate-spin-slow" />

                   Live Dashboard

                </h4>

                <button

                  onClick={handleWeatherRefresh}

                  disabled={refreshingWeather}

                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"

                  title="Refresh weather data"

                >

                  <RefreshCw className={cn("w-4 h-4 text-slate-600", refreshingWeather && "animate-spin")} />

                </button>

             </div>

             <div className="grid grid-cols-1 gap-2">

                {dashboardCards.map((m) => (

                   <div key={m.label} className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">

                      <div className="flex items-center gap-2">

                        <div className="p-1.5 rounded-lg bg-slate-50">{m.icon}</div>

                        <span className="text-[10px] font-black text-slate-400 uppercase">{m.label}</span>

                      </div>

                      <div className="flex items-center gap-1">

                        <span className={cn("text-base font-black leading-tight", m.color)}>{m.value}</span>

                        <span className="text-[9px] font-bold text-slate-300 uppercase">{m.unit}</span>

                      </div>

                   </div>

                ))}

             </div>

          </div>

        </div>



        {/* Right: Suggested Top 5 Crops */}

        <div className="lg:col-span-8">

          {loading ? (

             <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">

               <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 animate-bounce">

                 <Sprout className="w-10 h-10 text-green-600" />

               </div>

               <h3 className="text-xl font-black text-slate-900">Analyzing soil match...</h3>

             </div>

          ) : results ? (

            <motion.div 

              initial={{ opacity: 0, x: 20 }}

              animate={{ opacity: 1, x: 0 }}

              className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"

            >

                <h3 className="text-xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-50 flex justify-between items-center">

                   Optimal Pairings

                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Top 5</span>

                </h3>



                <div className="flex flex-col gap-3">

                  {results.map((pred, i) => (

                    <motion.div 

                      key={pred.crop}

                      initial={{ opacity: 0, y: 10 }}

                      animate={{ opacity: 1, y: 0 }}

                      transition={{ delay: i * 0.1 }}

                      className={cn(

                        "group p-3 rounded-2xl border transition-all duration-300",

                        i === 0 ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white text-slate-900 border-slate-100 hover:border-green-100 shadow-sm"

                      )}

                    >

                      <div className="flex items-center justify-between mb-2">

                        <div className="flex items-center gap-3">

                           <div className={cn(

                             "w-8 h-8 rounded-lg flex items-center justify-center",

                             i === 0 ? "bg-white/10" : "bg-green-50"

                           )}>

                              <Sprout className={cn("w-4 h-4", i === 0 ? "text-green-400" : "text-green-600")} />

                           </div>

                           <div>

                              <h4 className={cn("font-black tracking-tight", i === 0 ? "text-lg" : "text-base")}>{pred.crop}</h4>

                           </div>

                        </div>

                        <div className="text-right">

                           <h5 className={cn("font-black italic", i === 0 ? "text-xl text-green-400" : "text-lg text-green-600")}>{pred.suitability.toFixed(1)}%</h5>

                        </div>

                      </div>

                      <div className={cn("relative h-1 rounded-full overflow-hidden", i === 0 ? "bg-white/20" : "bg-slate-100")}>

                        <motion.div 

                          initial={{ width: 0 }}

                          animate={{ width: `${pred.suitability}%` }}

                          transition={{ duration: 0.8, delay: 0.5 }}

                          className={cn("h-full rounded-full transition-all duration-300", i === 0 ? "bg-green-400" : "bg-green-600")}

                        />

                      </div>

                    </motion.div>

                  ))}

                </div>

            </motion.div>

          ) : (

            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center px-10">

               <Wind className="w-10 h-10 text-slate-200 mb-4 animate-spin-slow" />

               <h3 className="text-lg font-black text-slate-400">Ready to Analyze</h3>

               <p className="text-slate-300 text-xs mt-2 max-w-[180px]">Select a soil category to see the best farming matches.</p>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};



export default CropPrediction;