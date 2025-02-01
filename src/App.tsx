import React, { useState, useEffect } from 'react';
import { Search, Cloud, Droplets, Wind, Thermometer, MapPin, Compass, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const API_KEY = '92ccd5c286601370fddb985fb8533b84';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

function App() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geolocating, setGeolocating] = useState(false);

  const fetchWeather = async (searchCity: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `${BASE_URL}/weather?q=${searchCity}&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('City not found');
      }
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('Could not find weather for this city');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Could not fetch weather data');
      }
      const data = await response.json();
      setWeather(data);
      setCity(data.name);
    } catch (err) {
      setError('Could not fetch weather data for your location');
      setWeather(null);
    } finally {
      setLoading(false);
      setGeolocating(false);
    }
  };

  const getLocation = () => {
    setGeolocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError('Could not get your location. Please allow location access.');
          setGeolocating(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setGeolocating(false);
    }
  };

  useEffect(() => {
    getLocation(); // Auto-detect location on load
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const getBackgroundImage = () => {
    if (!weather) return 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80';
    const condition = weather.weather[0].main.toLowerCase();
    const images = {
      clear: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80',
      clouds: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80',
      rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80',
      snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&q=80',
      thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80',
      drizzle: 'https://images.unsplash.com/photo-1541919329513-35f7af297129?auto=format&fit=crop&q=80',
    };
    return images[condition as keyof typeof images] || images.clear;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="text-white" size={24} />
              <span className="text-white font-bold text-xl">WeatherNow</span>
            </div>
            <button
              onClick={getLocation}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors"
              disabled={geolocating}
            >
              <Compass size={20} />
              {geolocating ? 'Detecting...' : 'Detect Location'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        className="flex-grow bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      >
        <div className="min-h-full bg-black/40 backdrop-blur-sm py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full px-4 py-3 pl-12 rounded-lg bg-white/20 backdrop-blur-md text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-4 top-3.5 text-white/70" size={20} />
                <button
                  type="submit"
                  className="absolute right-4 top-2 px-4 py-1.5 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {loading && (
              <div className="text-center text-white">Loading...</div>
            )}

            {error && (
              <div className="text-center text-red-300 bg-red-500/20 rounded-lg p-4">
                {error}
              </div>
            )}

            {weather && !loading && !error && (
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold flex items-center gap-2">
                      <MapPin className="inline-block" />
                      {weather.name}, {weather.sys.country}
                    </h1>
                    <p className="text-xl mt-1 capitalize">{weather.weather[0].description}</p>
                  </div>
                  <div className="text-6xl font-bold">
                    {Math.round(weather.main.temp)}°C
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                    <Thermometer size={24} />
                    <div>
                      <p className="text-sm opacity-70">Feels Like</p>
                      <p className="text-xl font-semibold">{Math.round(weather.main.feels_like)}°C</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                    <Droplets size={24} />
                    <div>
                      <p className="text-sm opacity-70">Humidity</p>
                      <p className="text-xl font-semibold">{weather.main.humidity}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                    <Wind size={24} />
                    <div>
                      <p className="text-sm opacity-70">Wind Speed</p>
                      <p className="text-xl font-semibold">{weather.wind.speed} m/s</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                    <Compass size={24} />
                    <div>
                      <p className="text-sm opacity-70">Wind Direction</p>
                      <p className="text-xl font-semibold">{weather.wind.deg}°</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                    <Cloud size={24} />
                    <div>
                      <p className="text-sm opacity-70">Pressure</p>
                      <p className="text-xl font-semibold">{weather.main.pressure} hPa</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/60 backdrop-blur-md text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg">WeatherNow</h3>
              <p className="text-sm text-white/70">Real-time weather information at your fingertips</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white/70 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="hover:text-white/70 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-white/70 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-white/70 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-white/50">
            © {new Date().getFullYear()} WeatherNow. Powered by OpenWeather API
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;