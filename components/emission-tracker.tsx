'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Leaf, TreePine, AlertCircle } from 'lucide-react'

interface EmissionTrackerProps {
  onSaveReading: (data: any) => void
}

export default function EmissionTracker({ onSaveReading }: EmissionTrackerProps) {
  const [evMiles, setEvMiles] = useState<number>(0)
  const [traditionalMiles, setTraditionalMiles] = useState<number>(0)
  const [indoorPlants, setIndoorPlants] = useState<any[]>([])
  const [plantName, setPlantName] = useState('')

  // CO2 reduction calculation: Average car emits ~404g CO2 per mile
  const co2FromTraditional = traditionalMiles * 404 // grams
  const co2Saved = co2FromTraditional
  
  // Plant CO2 absorption: Average indoor plant absorbs ~21g CO2 per day
  const plantCo2Absorption = indoorPlants.length * 21

  // O2 production: Average plant produces ~120ml O2 per day (about 0.17g)
  const plantO2Production = indoorPlants.length * 0.17

  const handleAddPlant = () => {
    if (plantName.trim()) {
      setIndoorPlants([...indoorPlants, { name: plantName, id: Date.now() }])
      setPlantName('')
    }
  }

  const handleRemovePlant = (id: number) => {
    setIndoorPlants(indoorPlants.filter(p => p.id !== id))
  }

  const handleSaveReading = () => {
    onSaveReading({
      category: 'emissions',
      evMiles,
      traditionalMiles,
      co2Saved,
      plantCount: indoorPlants.length,
      plantCo2Absorption,
      plantO2Production,
    })
    alert('Emission data saved successfully!')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EV Impact Section */}
        <Card className="glass-light p-6">
          <h2 className="text-xl font-bold text-white mb-4">EV Impact</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">EV Miles Driven (Today)</label>
              <input
                type="number"
                value={evMiles}
                onChange={(e) => setEvMiles(Number(e.target.value))}
                className="w-full px-3 py-2 glass-strong text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Traditional Car Miles (for comparison)</label>
              <input
                type="number"
                value={traditionalMiles}
                onChange={(e) => setTraditionalMiles(Number(e.target.value))}
                className="w-full px-3 py-2 glass-strong text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
              />
            </div>

            <div className="glass-strong p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-emerald-300" />
                <p className="text-sm font-semibold text-emerald-300">Carbon Impact</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">CO₂ from Traditional Car:</span>
                  <span className="font-semibold text-orange-300">{co2FromTraditional.toFixed(0)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">CO₂ Saved by EV:</span>
                  <span className="font-semibold text-emerald-300">{co2Saved.toFixed(0)}g</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Your EV usage prevented {(co2Saved / 1000).toFixed(2)}kg of CO₂ emissions
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Indoor Plants Section */}
        <Card className="glass-light p-6">
          <h2 className="text-xl font-bold text-white mb-4">Indoor Plants (CO₂/O₂ Tracking)</h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlant()}
                placeholder="e.g., Pothos, Snake Plant"
                className="flex-1 px-3 py-2 glass-strong text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-sm transition-all"
              />
              <Button
                onClick={handleAddPlant}
                className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-100 border border-emerald-400/50 backdrop-blur-md"
              >
                Add
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {indoorPlants.length === 0 ? (
                <p className="text-sm text-slate-400">No plants added yet</p>
              ) : (
                indoorPlants.map(plant => (
                  <div key={plant.id} className="flex items-center justify-between glass-strong p-3 rounded-lg">
                    <span className="flex items-center gap-2 text-sm text-slate-200">
                      <Leaf size={16} className="text-green-300" />
                      {plant.name}
                    </span>
                    <button
                      onClick={() => handleRemovePlant(plant.id)}
                      className="text-xs px-2 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded border border-red-400/30 transition-all backdrop-blur-md"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {indoorPlants.length > 0 && (
              <div className="glass-strong p-4 rounded-lg mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <TreePine size={18} className="text-green-300" />
                  <p className="text-sm font-semibold text-green-300">Plant Impact (Daily)</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">CO₂ Absorbed:</span>
                    <span className="font-semibold text-green-300">{plantCo2Absorption.toFixed(0)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">O₂ Produced:</span>
                    <span className="font-semibold text-cyan-300">{plantO2Production.toFixed(2)}g</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    {indoorPlants.length} plant(s) absorbing CO₂ and producing fresh air
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveReading}
          className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-100 border border-emerald-400/50 backdrop-blur-md px-8"
        >
          Save All Data
        </Button>
      </div>
    </div>
  )
}
