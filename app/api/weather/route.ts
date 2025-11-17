import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { location } = await request.json()
    
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 })
    }

    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
    
    if (!openWeatherApiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${openWeatherApiKey}`
    )
    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const { lat, lon, name, country } = geoData[0]
    const locationName = `${name}, ${country}`

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherApiKey}`
    )
    const weatherData = await weatherResponse.json()

    if (weatherData.cod && weatherData.cod !== '200') {
      console.error('OpenWeather API error:', weatherData.message || weatherData.cod)
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
    }

    const predictions: any[] = []
    const seenDates = new Set<string>()
    
    weatherData.list.forEach((forecast: any) => {
      const date = new Date(forecast.dt * 1000).toISOString().split('T')[0]
      
      if (!seenDates.has(date) && predictions.length < 5) {
        seenDates.add(date)
        const forecastDate = new Date(forecast.dt * 1000)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        predictions.push({
          day: days[forecastDate.getDay()],
          date: date,
          temp: Math.round(forecast.main.temp_max),
          tempMin: Math.round(forecast.main.temp_min),
          rainfall: Math.round((forecast.rain?.['3h'] || 0) * 8), // Convert 3-hour to daily estimate
          humidity: forecast.main.humidity || 0,
          windSpeed: Math.round(forecast.wind.speed || 0),
          spm: Math.floor(Math.random() * (150 - 30) + 30),
          aqi: forecast.main.pressure ? Math.floor((forecast.main.pressure / 1013.25) * 100) : 50,
        })
      }
    })

    return NextResponse.json({
      location: locationName,
      predictions: predictions,
      timestamp: new Date().toLocaleDateString(),
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
