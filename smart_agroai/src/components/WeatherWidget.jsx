import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge,
  Thermometer,
  Sunrise,
  Sunset,
  MapPin,
  Loader2,
  AlertTriangle,
  Search,
  X,
  ChevronDown
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: 20.5937, lon: 78.9629 }); // Default: India
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState("Detecting...");

  useEffect(() => {
    fetchWeather();
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setLocation(newLocation);
          fetchWeather(newLocation.lat, newLocation.lon);
        },
        (err) => {
          console.log("Location access denied, using default location");
          fetchWeather();
        }
      );
    } else {
      fetchWeather();
    }
  }, []);

  const fetchWeather = async (lat = location.lat, lon = location.lon) => {
    setLoading(true);
    setError(null);
    try {
      console.log("WeatherWidget: Fetching weather data for location:", { lat, lon });
      const response = await api.post("/api/weather", { location: { lat, lon } });
      console.log("WeatherWidget: Weather data response:", response.data);
      
      // Handle new modular backend response structure
      if (response.data.success && response.data.data) {
        setWeather(response.data.data);
        setCurrentLocationName(response.data.data.location.name);
        console.log("WeatherWidget: Set weather data:", response.data.data);
        console.log("WeatherWidget: Current temperature:", response.data.data.current?.temperature);
      } else {
        // Handle old response structure or error
        setWeather(response.data);
        setCurrentLocationName(response.data.location?.name || "Unknown Location");
        console.log("WeatherWidget: Using old response structure");
      }
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error("WeatherWidget error:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Using OpenStreetMap Nominatim API for location search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      const results = data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        country: item.address?.country || '',
        state: item.address?.state || ''
      }));
      
      setSearchResults(results);
    } catch (err) {
      console.error("Location search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation({ lat: selectedLocation.lat, lon: selectedLocation.lon });
    setCurrentLocationName(selectedLocation.name.split(',')[0]);
    fetchWeather(selectedLocation.lat, selectedLocation.lon);
    setShowLocationSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': Sun, '01n': Sun,     // Clear
      '02d': Cloud, '02n': Cloud,   // Few clouds
      '03d': Cloud, '03n': Cloud,   // Scattered clouds
      '04d': Cloud, '04n': Cloud,   // Broken clouds
      '09d': CloudRain, '09n': CloudRain, // Shower rain
      '10d': CloudRain, '10n': CloudRain, // Rain
      '11d': Cloud, '11n': Cloud,   // Thunderstorm
      '13d': Cloud, '13n': Cloud,   // Snow
      '50d': Cloud, '50n': Cloud,   // Mist
    };
    const Icon = iconMap[iconCode] || Cloud;
    return <Icon className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <div className="relative">
            <button
              onClick={() => setShowLocationSearch(!showLocationSearch)}
              className="flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
            >
              <h3 className="font-bold text-slate-900">{currentLocationName}</h3>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            
            {/* Location Search Dropdown */}
            <AnimatePresence>
              {showLocationSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50"
                >
                  <div className="p-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search for a city..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          searchLocations(e.target.value);
                        }}
                        className="flex-1 px-2 py-1 text-sm border-none outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => setShowLocationSearch(false)}
                        className="p-1 hover:bg-slate-100 rounded-lg"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleLocationSelect(result)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900 text-sm">
                            {result.name.split(',')[0]}
                          </div>
                          <div className="text-xs text-slate-500">
                            {result.state && `${result.state}, `}{result.country}
                          </div>
                        </button>
                      ))
                    ) : searchQuery ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No locations found
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        Type to search for a location
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {weather && (
            <span className="text-sm text-slate-500">{weather.location.country}</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Live Weather</div>
          <div className="text-xs text-slate-500">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-blue-500">
            {getWeatherIcon(weather.current.icon)}
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">
              {weather.current.temperature}°C
            </div>
            <div className="text-sm text-slate-500 capitalize">
              {weather.current.description}
            </div>
            <div className="text-xs text-slate-400">
              Feels like {weather.current.feelsLike}°C
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Sunrise className="w-4 h-4" />
            {new Date(weather.current.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Sunset className="w-4 h-4" />
            {new Date(weather.current.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-blue-900">{weather.current.humidity}%</div>
          <div className="text-xs text-blue-600">Humidity</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <Wind className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-green-900">{weather.current.windSpeed} m/s</div>
          <div className="text-xs text-green-600">Wind</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <Gauge className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-orange-900">{weather.current.pressure} hPa</div>
          <div className="text-xs text-orange-600">Pressure</div>
        </div>
      </div>

      {/* Farming Advice */}
      {weather.farmingAdvice && weather.farmingAdvice.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Farming Advisory
          </h4>
          <div className="space-y-1">
            {weather.farmingAdvice.map((advice, index) => (
              <div key={index} className="text-sm text-green-800">
                {advice}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Day Forecast */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <h4 className="font-bold text-slate-900 mb-4">3-Day Forecast</h4>
        <div className="grid grid-cols-3 gap-3">
          {weather.forecast.slice(0, 3).map((day, index) => (
            <div key={index} className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="text-xs font-medium text-slate-600 mb-2">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </div>
              <div className="text-blue-500 mb-2">
                {getWeatherIcon(day.icon)}
              </div>
              <div className="text-sm font-bold text-slate-900">
                {day.temperature.max}° / {day.temperature.min}°
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {day.description}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                💧 {day.precipitation.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
