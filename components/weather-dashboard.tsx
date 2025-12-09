"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cloud, CloudRain, Wind, Droplets, Eye } from "lucide-react"

interface WeatherDashboardProps {
  location: string
  onLocationSubmit: (location: string) => void
  onSaveReading: (data: any) => void
}

export default function WeatherDashboard({ location, onLocationSubmit, onSaveReading }: WeatherDashboardProps) {
  const [locationInput, setLocationInput] = useState("")
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchWeather = async (loc: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: loc }),
      })

      if (!response.ok) {
        throw new Error("Location not found or API error")
      }

      const data = await response.json()
      setWeather(data)
      onLocationSubmit(data.location)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      console.error("Weather fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLocation = () => {
    if (locationInput.trim()) {
      fetchWeather(locationInput)
      setLocationInput("")
    }
  }

  const handleSaveReading = () => {
    if (weather) {
      onSaveReading(weather)
      alert("Weather data saved successfully!")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-light p-6 animate-fade-in-up">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddLocation()}
            placeholder="Enter location (e.g., New York, Delhi, London)"
            className="flex-1 px-4 py-2 glass-strong text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
            disabled={loading}
          />
          <Button
            onClick={handleAddLocation}
            className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-100 border border-emerald-400/50 backdrop-blur-md transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Loading..." : "Add Location"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-300 mb-2 animate-fade-in">Error: {error}</p>}
        {location && !error && (
          <p className="text-sm text-emerald-300 animate-fade-in">
            Currently tracking: <span className="font-semibold">{location}</span>
          </p>
        )}
      </Card>

      {/* Weather Predictions */}
      {weather && (
        <div className="space-y-4">
          <div className="flex justify-between items-center animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white">7-Day Weather Forecast</h2>
            <Button
              onClick={handleSaveReading}
              className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-100 border border-emerald-400/50 backdrop-blur-md transition-all duration-300"
            >
              Save Reading
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weather.predictions.map((day: any, idx: number) => (
              <Card
                key={idx}
                className="glass-light p-4 hover:glass-strong transition-all duration-300 animate-fade-in-up hover:scale-105 cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <h3 className="font-semibold text-white mb-2">{day.day}</h3>
                <p className="text-xs text-slate-400 mb-4">{day.date}</p>

                <div className="space-y-3 text-sm">
                  {/* Temperature */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Cloud size={16} className="text-orange-300" />
                      Temperature
                    </span>
                    <span className="font-semibold text-orange-300">{day.temp}°C</span>
                  </div>

                  {/* Min Temperature */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Min Temp</span>
                    <span className="font-semibold text-orange-200">{day.tempMin}°C</span>
                  </div>

                  {/* Feels Like Temperature */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Feels Like</span>
                    <span className="font-semibold text-orange-200">{day.feelsLike}°C</span>
                  </div>

                  {/* Rainfall */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2">
                      <CloudRain size={16} className="text-blue-300" />
                      Rainfall
                    </span>
                    <span className="font-semibold text-blue-300">{day.rainfall} mm</span>
                  </div>

                  {/* Humidity */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Droplets size={16} className="text-cyan-300" />
                      Humidity
                    </span>
                    <span className="font-semibold text-cyan-300">{day.humidity}%</span>
                  </div>

                  {/* Wind Speed */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Wind size={16} className="text-blue-200" />
                      Wind
                    </span>
                    <span className="font-semibold text-blue-200">{day.windSpeed} km/h</span>
                  </div>

                  {/* SPM */}
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 flex items-center gap-2">
                        <Eye size={16} className="text-yellow-300" />
                        SPM
                      </span>
                      <span className="font-semibold text-yellow-300">{day.spm} µg/m³</span>
                    </div>
                  </div>

                  {/* Air Quality Index */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">AQI</span>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`font-semibold px-2 py-1 rounded text-xs backdrop-blur-md transition-all duration-300 ${
                          day.aqi <= 50
                            ? "bg-green-500/20 text-green-300 border border-green-400/30"
                            : day.aqi <= 100
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                              : day.aqi <= 150
                                ? "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                                : day.aqi <= 200
                                  ? "bg-red-500/20 text-red-300 border border-red-400/30"
                                  : day.aqi <= 300
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                                    : "bg-maroon-500/20 text-maroon-300 border border-maroon-400/30"
                        }`}
                      >
                        {day.aqi}
                      </span>
                      <span className="text-xs text-slate-400">{day.aqiCategory}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!weather && !error && (
        <Card className="glass-light p-12 text-center animate-fade-in-up">
          <p className="text-slate-300 mb-2">Enter a location to view weather predictions</p>
          <p className="text-sm text-slate-400">
            The system will fetch real 7-day forecasts with temperature, rainfall, humidity, wind speed, and air quality
            data.
          </p>
        </Card>
      )}
    </div>
  )
}
