'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import WeatherDashboard from '@/components/weather-dashboard'
import EmissionTracker from '@/components/emission-tracker'
import AnalyticsDashboard from '@/components/analytics-dashboard'

export default function Home() {
  const [location, setLocation] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'weather' | 'emissions' | 'analytics'>('weather')
  const [savedData, setSavedData] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('climateDashboardData')
    if (stored) {
      setSavedData(JSON.parse(stored))
    }
  }, [])

  const handleLocationSubmit = (loc: string) => {
    setLocation(loc)
  }

  const handleSaveReading = (data: any) => {
    const newData = [...savedData, { ...data, timestamp: new Date().toISOString() }]
    setSavedData(newData)
    localStorage.setItem('climateDashboardData', JSON.stringify(newData))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Environmental Monitor</h1>
          <p className="text-slate-300">Climate & EV Impact Tracking Dashboard</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          <Button
            onClick={() => setActiveTab('weather')}
            variant={activeTab === 'weather' ? 'default' : 'outline'}
            className={activeTab === 'weather' ? 'glass-light text-white border-emerald-400/50 bg-emerald-500/20 hover:bg-emerald-500/30' : 'glass border-white/20 text-slate-300 hover:bg-white/10'}
          >
            Weather
          </Button>
          <Button
            onClick={() => setActiveTab('emissions')}
            variant={activeTab === 'emissions' ? 'default' : 'outline'}
            className={activeTab === 'emissions' ? 'glass-light text-white border-emerald-400/50 bg-emerald-500/20 hover:bg-emerald-500/30' : 'glass border-white/20 text-slate-300 hover:bg-white/10'}
          >
            Emissions
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            className={activeTab === 'analytics' ? 'glass-light text-white border-emerald-400/50 bg-emerald-500/20 hover:bg-emerald-500/30' : 'glass border-white/20 text-slate-300 hover:bg-white/10'}
          >
            Analytics
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'weather' && (
          <WeatherDashboard location={location} onLocationSubmit={handleLocationSubmit} onSaveReading={handleSaveReading} />
        )}
        {activeTab === 'emissions' && (
          <EmissionTracker onSaveReading={handleSaveReading} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard data={savedData} />
        )}
      </div>
    </main>
  )
}
