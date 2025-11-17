'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, Calendar } from 'lucide-react'

interface AnalyticsDashboardProps {
  data: any[]
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const weatherData = data.filter(d => d.predictions)
  const emissionData = data.filter(d => d.category === 'emissions')

  // Prepare chart data
  const co2Trends = emissionData.map((d, i) => ({
    day: `Day ${i + 1}`,
    saved: d.co2Saved || 0,
    plantAbsorbed: d.plantCo2Absorption || 0,
  }))

  const avgTemp = weatherData.length > 0
    ? weatherData[0].predictions?.map((p: any, i: number) => ({
        day: p.day,
        temp: p.temp,
        rainfall: p.rainfall,
      }))
    : []

  const stats = {
    totalCo2Saved: emissionData.reduce((sum, d) => sum + (d.co2Saved || 0), 0),
    avgPlantCount: emissionData.length > 0 
      ? (emissionData.reduce((sum, d) => sum + (d.plantCount || 0), 0) / emissionData.length).toFixed(1)
      : 0,
    totalReadings: data.length,
  }

  const maxTemp = avgTemp.length > 0 ? Math.max(...avgTemp.map(t => t.temp)) : 30
  const maxRainfall = avgTemp.length > 0 ? Math.max(...avgTemp.map(t => t.rainfall)) : 100

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-light p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total CO₂ Saved</p>
              <p className="text-2xl font-bold text-emerald-300">{(stats.totalCo2Saved / 1000).toFixed(2)} kg</p>
            </div>
            <TrendingUp size={32} className="text-emerald-400/30" />
          </div>
        </Card>

        <Card className="glass-light p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Avg Plants Tracked</p>
              <p className="text-2xl font-bold text-green-300">{stats.avgPlantCount}</p>
            </div>
            <Calendar size={32} className="text-green-400/30" />
          </div>
        </Card>

        <Card className="glass-light p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Readings</p>
              <p className="text-2xl font-bold text-blue-300">{stats.totalReadings}</p>
            </div>
            <Calendar size={32} className="text-blue-400/30" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {co2Trends.length > 0 && (
          <Card className="glass-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">CO₂ Impact Trend</h3>
            <div className="space-y-3">
              {co2Trends.map((trend, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>{trend.day}</span>
                    <span className="text-green-300 font-semibold">{trend.saved.toFixed(0)}g</span>
                  </div>
                  <div className="w-full glass-strong rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-green-400 h-full rounded-full" 
                      style={{ width: `${Math.min((trend.saved / 5000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {avgTemp.length > 0 && (
          <Card className="glass-light p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Temperature & Rainfall Pattern</h3>
            <div className="space-y-4">
              {avgTemp.map((day, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-300">{day.day}</span>
                    <div className="flex gap-4">
                      <span className="text-orange-300 font-semibold">{day.temp}°C</span>
                      <span className="text-blue-300 font-semibold">{day.rainfall}mm</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="glass-strong rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-red-400 h-full rounded-full" 
                          style={{ width: `${(day.temp / maxTemp) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="glass-strong rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full" 
                          style={{ width: `${(day.rainfall / maxRainfall) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Data Insights */}
      {data.length === 0 && (
        <Card className="glass-light p-12 text-center">
          <p className="text-slate-300 mb-2">No data recorded yet</p>
          <p className="text-sm text-slate-400">Start by adding a location and recording weather/emission data to see analytics</p>
        </Card>
      )}

      {/* Recent Readings */}
      {data.length > 0 && (
        <Card className="glass-light p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Readings</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.slice().reverse().map((reading, idx) => (
              <div key={idx} className="flex items-center justify-between glass-strong p-3 rounded-lg text-sm">
                <div>
                  <p className="text-slate-200 font-medium">
                    {reading.location || reading.category === 'emissions' ? 'Emission Reading' : 'Weather Reading'}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {new Date(reading.timestamp).toLocaleDateString()} at {new Date(reading.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-emerald-300 font-semibold">
                  {reading.co2Saved ? `${(reading.co2Saved / 1000).toFixed(2)}kg CO₂` : 'Weather'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
