import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Power, 
  Droplets, 
  AlertTriangle, 
  Loader2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";

const MotorControl = () => {
  const [motorStatus, setMotorStatus] = useState('unknown'); // 'running', 'stopped', 'unknown'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple requests
  const [simulationMode, setSimulationMode] = useState(false); // Hardware simulation toggle

  useEffect(() => {
    // Test backend connection first
    testBackendConnection();
    fetchMotorStatus();
    const interval = setInterval(fetchMotorStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await api.get("/api/test");
      console.log("Backend connection test:", response.data);
    } catch (err) {
      console.error("Backend connection test failed:", err);
      setError("Backend connection failed. Please check if backend is running.");
    }
  };

  const fetchMotorStatus = async () => {
    try {
      const response = await api.get("/api/motor/status");
      setMotorStatus(response.data.motorStatus);
      setLastUpdate(response.data.lastUpdate);
      setError(null);
      console.log("Motor status updated:", response.data.motorStatus);
    } catch (err) {
      console.error("Failed to fetch motor status:", err);
      
      // Check if it's a network error (backend not running)
      if (err.code === 'ERR_NETWORK' || err.message.includes('Failed to fetch')) {
        setError("Backend server not running. Please start the backend server.");
        console.error("Backend server connection failed. Make sure the backend is running at https://agro-662z.onrender.com");
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        console.error("Authentication error:", err.response.data);
      } else if (err.response?.status === 404) {
        setError("Motor status endpoint not found. Check backend configuration.");
        console.error("Endpoint not found:", err.response.data);
      } else {
        setError(err.response?.data?.message || "Failed to get motor status");
        console.error("API error:", err.response?.data);
      }
      
      setMotorStatus('unknown');
    }
  };

  const controlMotor = async (action) => {
    // Prevent multiple simultaneous requests
    if (isProcessing || loading) {
      console.log("Motor control already in progress, ignoring request");
      return;
    }
    
    setLoading(true);
    setIsProcessing(true);
    setError(null);
    
    try {
      // Use simulation mode if enabled
      const endpoint = simulationMode ? "/api/motor/control?simulation=true" : "/api/motor/control";
      const response = await api.post(endpoint, { action });
      
      console.log(`Motor control response (${simulationMode ? 'simulation' : 'real'}):`, response.data);
      
      setLastAction({
        action: action,
        timestamp: response.data.timestamp,
        message: response.data.message,
        note: response.data.note,
        simulationMode: response.data.simulationMode
      });
      
      // Show simulation mode indicator in console
      if (response.data.simulationMode) {
        console.log("🔧 HARDWARE SIMULATION MODE - No actual hardware controlled");
      }
      
      // Refresh status after a short delay to allow ESP32 to sync
      setTimeout(() => {
        fetchMotorStatus();
      }, 2000);
      
    } catch (err) {
      console.error("Motor control error:", err);
      
      // Check if it's a network error (backend not running)
      if (err.code === 'ERR_NETWORK' || err.message.includes('Failed to fetch')) {
        setError("Backend server not running. Please start the backend server.");
        console.error("Backend server connection failed. Make sure the backend is running at https://agro-662z.onrender.com");
      } else if (err.response?.status === 429) {
        setError(`Rate limit exceeded. ${err.response.data.message || 'Please wait before trying again.'}`);
        console.error("Rate limit error:", err.response.data);
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        console.error("Authentication error:", err.response.data);
      } else if (err.response?.status === 404) {
        setError("Motor control endpoint not found. Check backend configuration.");
        console.error("Endpoint not found:", err.response.data);
      } else {
        setError(err.response?.data?.message || "Failed to control motor");
        console.error("API error:", err.response?.data);
      }
      
      setLastAction({
        action: action,
        timestamp: new Date(),
        message: `Failed to turn ${action} motor`,
        note: `Error: ${err.response?.data?.message || err.message}`
      });
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const isRunning = motorStatus === 'running';
  const isStopped = motorStatus === 'stopped';

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isRunning ? "bg-green-100" : isStopped ? "bg-slate-100" : "bg-orange-100"
          )}>
            <Power className={cn(
              "w-6 h-6",
              isRunning ? "text-green-600" : isStopped ? "text-slate-400" : "text-orange-600"
            )} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Irrigation Motor</h3>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isRunning ? "bg-green-500 animate-pulse" : isStopped ? "bg-slate-400" : "bg-orange-500 animate-pulse"
              )}></div>
              <span className="text-sm font-medium text-slate-600 capitalize">
                {motorStatus === 'unknown' ? 'Status Unknown' : motorStatus}
              </span>
              {lastUpdate && (
                <span className="text-xs text-slate-400">
                  • {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Simulation Mode Toggle */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={simulationMode}
              onChange={(e) => setSimulationMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-xs font-medium text-slate-600">
            {simulationMode ? 'Simulation' : 'Real'}
          </span>
        </div>
        
        {/* Toggle Switch */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => controlMotor(isRunning ? 'off' : 'on')}
          disabled={loading || motorStatus === 'unknown'}
          className={cn(
            "relative w-20 h-10 rounded-full transition-colors duration-300 flex items-center px-1",
            isRunning 
              ? "bg-green-500" 
              : isStopped 
              ? "bg-slate-300" 
              : "bg-orange-500",
            (loading || motorStatus === 'unknown') && "opacity-50 cursor-not-allowed"
          )}
        >
          <motion.div
            animate={{ x: isRunning ? 40 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : isRunning ? (
              <Droplets className="w-4 h-4 text-green-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Status Message */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-xl text-sm font-medium",
            lastAction.action === 'on' 
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-slate-50 text-slate-700 border border-slate-100"
          )}
        >
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4" />
            {lastAction.message}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {new Date(lastAction.timestamp).toLocaleString()}
            {lastAction.simulationMode && (
              <span className="ml-2 text-blue-600 font-semibold">
                🔧 Simulation Mode
              </span>
            )}
          </div>
          {lastAction.note && (
            <div className="text-xs opacity-75 mt-1 italic">
              ℹ️ {lastAction.note}
            </div>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-700"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => controlMotor('on')}
          disabled={loading || isProcessing || isRunning || motorStatus === 'unknown'}
          className={cn(
            "p-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            isRunning || motorStatus === 'unknown'
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
          )}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Droplets className="w-5 h-5" />
          )}
          {isProcessing ? 'Processing...' : 'Start Motor'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => controlMotor('off')}
          disabled={loading || isProcessing || isStopped || motorStatus === 'unknown'}
          className={cn(
            "p-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
            isStopped || motorStatus === 'unknown'
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
          )}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Power className="w-5 h-5" />
          )}
          {isProcessing ? 'Processing...' : 'Stop Motor'}
        </motion.button>
      </div>
    </div>
  );
};

export default MotorControl;
