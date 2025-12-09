import { type NextRequest, NextResponse } from "next/server"

const calculateEPAAQI = (pm25: number, pm10: number): number => {
  // US EPA AQI calculation for PM2.5 (primary pollutant)
  let aqi: number

  if (pm25 <= 12) {
    aqi = (pm25 / 12) * 50 // Good (0-50)
  } else if (pm25 <= 35.4) {
    aqi = 50 + ((pm25 - 12) / (35.4 - 12)) * 50 // Moderate (51-100)
  } else if (pm25 <= 55.4) {
    aqi = 100 + ((pm25 - 35.4) / (55.4 - 35.4)) * 50 // Unhealthy for Sensitive Groups (101-150)
  } else if (pm25 <= 150.4) {
    aqi = 150 + ((pm25 - 55.4) / (150.4 - 55.4)) * 50 // Unhealthy (151-200)
  } else if (pm25 <= 250.4) {
    aqi = 200 + ((pm25 - 150.4) / (250.4 - 150.4)) * 50 // Very Unhealthy (201-300)
  } else {
    aqi = 300 + ((pm25 - 250.4) / 500) * 99 // Hazardous (301+)
  }

  return Math.round(aqi)
}

const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy for Sensitive Groups"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
}

export async function POST(request: NextRequest) {
  try {
    const { location } = await request.json()

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 })
    }

    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY

    if (!openWeatherApiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${openWeatherApiKey}`,
    )
    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    const { lat, lon, name, country } = geoData[0]
    const locationName = `${name}, ${country}`

    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherApiKey}`,
    )
    const weatherData = await weatherResponse.json()

    if (weatherData.cod && weatherData.cod !== "200") {
      console.error("OpenWeather API error:", weatherData.message || weatherData.cod)
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }

    const pollutionResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`,
    )
    const pollutionData = await pollutionResponse.json()
    const pollutionList = pollutionData.list || []

    const predictions: any[] = []
    const seenDates = new Set<string>()

    weatherData.list.forEach((forecast: any) => {
      const date = new Date(forecast.dt * 1000).toISOString().split("T")[0]

      if (!seenDates.has(date) && predictions.length < 5) {
        seenDates.add(date)
        const forecastDate = new Date(forecast.dt * 1000)
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        const pollutionForecasts = pollutionList.filter((poll: any) => {
          const pollDate = new Date(poll.dt * 1000).toISOString().split("T")[0]
          return pollDate === date
        })

        const pollutionIndex = pollutionForecasts.length > 0 ? pollutionForecasts[0] : pollutionList[0]
        const components = pollutionIndex?.components || {}

        const pm25 = components.pm2_5 || 0
        const pm10 = components.pm10 || 0
        const spm = Math.round((pm10 + pm25) / 2)

        const aqi = calculateEPAAQI(pm25, pm10)
        const aqiCategory = getAQICategory(aqi)

        predictions.push({
          day: days[forecastDate.getDay()],
          date: date,
          temp: Math.round(forecast.main.temp_max),
          tempMin: Math.round(forecast.main.temp_min),
          feelsLike: Math.round(forecast.main.feels_like),
          rainfall: Math.round((forecast.rain?.["3h"] || 0) * 8),
          humidity: forecast.main.humidity || 0,
          windSpeed: Math.round(forecast.wind.speed || 0),
          spm: spm,
          aqi: aqi,
          aqiCategory: aqiCategory,
          pm25: Math.round(pm25),
          pm10: Math.round(pm10),
        })
      }
    })

    return NextResponse.json({
      location: locationName,
      predictions: predictions,
      timestamp: new Date().toLocaleDateString(),
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
