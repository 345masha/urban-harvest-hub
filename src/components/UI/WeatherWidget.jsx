// Location: urban-harvest-hub/src/components/UI/WeatherWidget.jsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useGeolocation } from '../../hooks/useGeolocation';

function WeatherWidget() {
  const { t } = useLanguage();
  const { location: geoLoc, error: geoErr, loading: geoLoading } = useGeolocation();
  
  const [cityInput, setCityInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useGeo, setUseGeo] = useState(true);

  const fetchWeather = async (params) => {
    setLoading(true);
    setError(null);
    try {
      let query = '';
      if (params.lat && params.lng) {
        query = `lat=${params.lat}&lon=${params.lng}`;
      } else if (params.city) {
        query = `city=${encodeURIComponent(params.city)}`;
      } else {
        query = 'city=Colombo'; // fallback
      }

      const response = await fetch(`http://localhost:5000/api/weather?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve live weather details. Showing offline simulation.');
      
      // Fallback local mock data for PWA offline capability
      const baseTemp = 28;
      setWeatherData({
        location: params.city ? params.city : 'Colombo',
        province: 'Local',
        current: {
          temp: baseTemp,
          feelsLike: baseTemp + 2,
          humidity: 80,
          windSpeed: 12,
          uvIndex: 8,
          condition: 'Partly Cloudy',
          rainChance: 40,
          sunrise: '06:00 AM',
          sunset: '06:15 PM',
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        hourly: Array.from({length: 6}).map((_, i) => ({
          time: `${(new Date().getHours() + i) % 24}:00`,
          temp: baseTemp + Math.round(Math.sin(i) * 3),
          feelsLike: baseTemp + 1 + Math.round(Math.sin(i) * 3),
          humidity: 80 - (i * 2),
          windSpeed: 12 + i,
          uvIndex: i < 3 ? 8 : 0,
          condition: 'Partly Cloudy',
          rainChance: 40
        })),
        forecast: Array.from({length: 7}).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return {
            day: i === 0 ? 'Today' : d.toLocaleDateString([], { weekday: 'long' }),
            date: d.toISOString().split('T')[0],
            tempMax: baseTemp + 4,
            tempMin: baseTemp - 3,
            condition: 'Partly Cloudy',
            rainChance: 40
          };
        })
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load or GPS coordinate updates
  useEffect(() => {
    if (useGeo && geoLoc) {
      fetchWeather({ lat: geoLoc.lat, lng: geoLoc.lng });
    } else if (useGeo && !geoLoading && geoErr) {
      // Fallback to Colombo if GPS is denied or fails
      fetchWeather({ city: 'Colombo' });
    } else if (!useGeo) {
      // Manual mode
      fetchWeather({ city: cityInput || 'Colombo' });
    }
  }, [useGeo, geoLoc, geoErr, geoLoading]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setUseGeo(false);
      fetchWeather({ city: cityInput.trim() });
    }
  };

  const handleUseGPS = () => {
    setUseGeo(true);
    setCityInput('');
    if (geoLoc) {
      fetchWeather({ lat: geoLoc.lat, lng: geoLoc.lng });
    } else {
      fetchWeather({ city: 'Colombo' });
    }
  };

  const getWeatherEmoji = (condition) => {
    const cond = (condition || '').toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return '☀️';
    if (cond.includes('thunder') || cond.includes('storm')) return '⛈️';
    if (cond.includes('rain') || cond.includes('shower')) return '🌧️';
    if (cond.includes('cloud') || cond.includes('overcast')) return '⛅';
    if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze')) return '🌫️';
    return '⛅';
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-800/20 text-slate-800 dark:text-slate-100 max-w-full md:max-w-4xl mx-auto transition-all animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-700/50 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-forest-700 dark:text-sage-300">
            <span>⛅</span> {t('weatherTitle')}
          </h2>
          {weatherData && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {weatherData.location}, {weatherData.province} Province {useGeo && '📍 (GPS)'}
            </p>
          )}
        </div>

        {/* Location selector form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder={t('weatherEnter')}
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-forest-500 w-44"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition"
          >
            {t('search')}
          </button>
          <button
            type="button"
            onClick={handleUseGPS}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              useGeo
                ? 'bg-sage-600 border-sage-600 text-white hover:bg-sage-700'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            title="Use GPS Geolocation"
          >
            🛰️ {t('weatherUseGeo')}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600 dark:border-sage-400"></div>
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('loading')}</span>
        </div>
      ) : error && !weatherData ? (
        <div className="py-6 text-center text-red-500 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Current weather status */}
          <div className="lg:col-span-1 bg-white/30 dark:bg-slate-900/30 rounded-xl p-5 border border-white/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {weatherData.current.temp}°C
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('weatherFeels')}: {weatherData.current.feelsLike}°C
                </p>
              </div>
              <span className="text-5xl" role="img" aria-label={weatherData.current.condition}>
                {getWeatherEmoji(weatherData.current.condition)}
              </span>
            </div>

            <div className="my-4">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-forest-100 text-forest-800 dark:bg-forest-900/50 dark:text-forest-200">
                {weatherData.current.condition}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
              <div>
                <p className="text-slate-500 dark:text-slate-400">{t('weatherHumidity')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{weatherData.current.humidity}%</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">{t('weatherWind')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{weatherData.current.windSpeed} km/h</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">{t('weatherUV')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{weatherData.current.uvIndex}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">{t('weatherRainChance')}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{weatherData.current.rainChance}%</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-4 border-t border-slate-200/30 pt-2">
              <span>🌅 {weatherData.current.sunrise}</span>
              <span>🌇 {weatherData.current.sunset}</span>
            </div>
          </div>

          {/* Column 2: Hourly and 7-day forecast details */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Hourly strip */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('weatherHourly')}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {weatherData.hourly.map((h, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex flex-col items-center bg-white/20 dark:bg-slate-900/20 border border-white/5 dark:border-slate-800/5 rounded-xl p-3 w-16 text-center"
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{h.time}</span>
                    <span className="text-lg my-1.5">{getWeatherEmoji(h.condition)}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{h.temp}°</span>
                    <span className="text-[9px] text-blue-500 mt-1">💧{h.rainChance}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-day Forecast list */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('weatherForecast')}
              </h3>
              <div className="bg-white/20 dark:bg-slate-900/20 border border-white/5 dark:border-slate-800/5 rounded-xl p-4 flex flex-col gap-3.5">
                {weatherData.forecast.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200">
                    <span className="w-20 font-medium">{f.day}</span>
                    <span className="text-base" role="img" aria-label={f.condition}>
                      {getWeatherEmoji(f.condition)}
                    </span>
                    <span className="w-16 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {f.condition}
                    </span>
                    <span className="w-12 text-right text-blue-500 font-medium">💧{f.rainChance}%</span>
                    <div className="flex gap-2 w-16 justify-end font-semibold">
                      <span className="text-slate-900 dark:text-white">{f.tempMax}°</span>
                      <span className="text-slate-400 dark:text-slate-500">{f.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;
