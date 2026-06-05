// Location: urban-harvest-hub/backend/routes/weather.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Sri Lankan district center weather fallbacks
const sriLankaRegions = {
  colombo: { province: 'Western', temp: 29, cond: 'Partly Cloudy', humidity: 78, wind: 14, uv: 9, rain: 40 },
  kandy: { province: 'Central', temp: 24, cond: 'Scattered Showers', humidity: 85, wind: 8, uv: 7, rain: 70 },
  jaffna: { province: 'Northern', temp: 31, cond: 'Sunny', humidity: 65, wind: 18, uv: 11, rain: 5 },
  galle: { province: 'Southern', temp: 28, cond: 'Thunderstorm', humidity: 82, wind: 16, uv: 8, rain: 80 },
  anuradhapura: { province: 'North Central', temp: 32, cond: 'Sunny', humidity: 60, wind: 12, uv: 10, rain: 10 },
  trincomalee: { province: 'Eastern', temp: 33, cond: 'Sunny', humidity: 58, wind: 15, uv: 10, rain: 15 },
  badulla: { province: 'Uva', temp: 22, cond: 'Mist', humidity: 90, wind: 6, uv: 6, rain: 50 },
  ratnapura: { province: 'Sabaragamuwa', temp: 26, cond: 'Heavy Rain', humidity: 88, wind: 8, uv: 5, rain: 90 },
  kurunegala: { province: 'North Western', temp: 30, cond: 'Sunny', humidity: 70, wind: 10, uv: 10, rain: 20 },
};

function getMockWeather(locationName) {
  const query = (locationName || 'colombo').toLowerCase().trim();
  let matchedKey = 'colombo';
  
  for (const key of Object.keys(sriLankaRegions)) {
    if (query.includes(key) || key.includes(query)) {
      matchedKey = key;
      break;
    }
  }

  const base = sriLankaRegions[matchedKey];
  const capitalizedLocation = locationName ? locationName.charAt(0).toUpperCase() + locationName.slice(1) : 'Colombo';

  // Generate hourly forecast (24 hours)
  const hourly = [];
  const startHour = new Date().getHours();
  for (let i = 0; i < 24; i++) {
    const hr = (startHour + i) % 24;
    const hourStr = hr === 0 ? '12 AM' : hr === 12 ? '12 PM' : hr > 12 ? `${hr - 12} PM` : `${hr} AM`;
    // Slight variation in temperature based on hour
    const hourFactor = Math.sin(((hr - 6) / 24) * 2 * Math.PI); // warmest at 2-3 PM, coolest at 5-6 AM
    const hrTemp = Math.round(base.temp + hourFactor * 4);
    hourly.push({
      time: hourStr,
      temp: hrTemp,
      feelsLike: hrTemp - 1,
      humidity: Math.round(base.humidity - hourFactor * 10),
      windSpeed: Math.round(base.wind + hourFactor * 3),
      uvIndex: hr >= 6 && hr <= 18 ? Math.round(base.uv * Math.sin(((hr - 6) / 12) * Math.PI)) : 0,
      condition: hrTemp > base.temp + 1 ? 'Sunny' : hrTemp < base.temp - 2 ? 'Scattered Showers' : base.cond,
      rainChance: base.rain
    });
  }

  // Generate 7-day forecast
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const forecast7Day = [];
  for (let i = 0; i < 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    const dayName = i === 0 ? 'Today' : daysOfWeek[futureDate.getDay()];
    // Add some random variation per day
    const dayTempMax = Math.round(base.temp + (Math.sin(i) * 2) + (Math.random() * 2));
    const dayTempMin = Math.round(base.temp - 5 + (Math.sin(i) * 1) - (Math.random() * 2));
    forecast7Day.push({
      day: dayName,
      date: futureDate.toISOString().split('T')[0],
      tempMax: dayTempMax,
      tempMin: dayTempMin,
      condition: i % 3 === 0 ? 'Partly Cloudy' : i % 3 === 1 ? 'Sunny' : base.cond,
      rainChance: Math.min(100, Math.max(0, base.rain + Math.round(Math.sin(i) * 15)))
    });
  }

  return {
    location: capitalizedLocation,
    province: base.province,
    current: {
      temp: base.temp,
      feelsLike: base.temp + 1,
      humidity: base.humidity,
      windSpeed: base.wind,
      uvIndex: base.uv,
      condition: base.cond,
      rainChance: base.rain,
      sunrise: '05:54 AM',
      sunset: '06:22 PM',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    hourly,
    forecast: forecast7Day
  };
}

// Fetch weather
router.get('/', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    
    // Check if API key is configured
    const apiKey = process.env.WEATHER_API_KEY;
    if (apiKey && apiKey !== 'your_weather_api_key_here') {
      let url = '';
      if (lat && lon) {
        url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
      } else if (city) {
        url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&aqi=no&alerts=no`;
      }

      if (url) {
        const response = await axios.get(url, { timeout: 3000 });
        const data = response.data;
        
        // Map real API response to our standardized schema
        const mappedData = {
          location: data.location.name,
          province: data.location.region,
          current: {
            temp: Math.round(data.current.temp_c),
            feelsLike: Math.round(data.current.feelslike_c),
            humidity: data.current.humidity,
            windSpeed: Math.round(data.current.wind_kph),
            uvIndex: Math.round(data.current.uv),
            condition: data.current.condition.text,
            rainChance: data.forecast.forecastday[0].day.daily_chance_of_rain || 20,
            sunrise: data.forecast.forecastday[0].astro.sunrise,
            sunset: data.forecast.forecastday[0].astro.sunset,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          hourly: data.forecast.forecastday[0].hour.map(h => ({
            time: new Date(h.time).toLocaleTimeString([], { hour: 'numeric' }),
            temp: Math.round(h.temp_c),
            feelsLike: Math.round(h.feelslike_c),
            humidity: h.humidity,
            windSpeed: Math.round(h.wind_kph),
            uvIndex: Math.round(h.uv),
            condition: h.condition.text,
            rainChance: h.chance_of_rain
          })).filter((_, idx) => idx % 2 === 0), // Subsample every 2 hours to keep size clean
          forecast: data.forecast.forecastday.map(d => ({
            day: new Date(d.date).toLocaleDateString([], { weekday: 'long' }),
            date: d.date,
            tempMax: Math.round(d.day.maxtemp_c),
            tempMin: Math.round(d.day.mintemp_c),
            condition: d.day.condition.text,
            rainChance: d.day.daily_chance_of_rain
          }))
        };
        return res.json(mappedData);
      }
    }
    
    // Fall back to generated mock data ( Colombo is default )
    const mockData = getMockWeather(city || 'colombo');
    res.json(mockData);

  } catch (error) {
    console.error('Error fetching weather (falling back to mock):', error.message);
    const fallbackData = getMockWeather(req.query.city || 'colombo');
    res.json(fallbackData);
  }
});

export default router;
