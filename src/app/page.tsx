'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CitySearch from '@/components/CitySearch';
import TemperatureChart from '@/components/TemperatureChart';
import StatsPanel from '@/components/StatsPanel';
import CityComparison from '@/components/CityComparison';
import LoadingState from '@/components/LoadingState';
import { City, WeatherData, YearlyData, WeatherStats, ComparisonCity } from '@/lib/types';
import { fetchAllWeatherData, aggregateToYearly, calculateStats } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
  },
});

function PermafrostApp() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [stats, setStats] = useState<WeatherStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDecades, setSelectedDecades] = useState<number[]>([1980, 2000, 2020]);
  const [chartMode, setChartMode] = useState<'yearly' | 'decade'>('yearly');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setComparisonCities] = useState<ComparisonCity[]>([]);
  
  useEffect(() => {
    if (weatherData.length > 0) {
      const yearly = aggregateToYearly(weatherData);
      setYearlyData(yearly);
      
      const statsData = calculateStats(weatherData);
      setStats(statsData);
    }
  }, [weatherData]);
  
  const handleCitySelect = async (city: City | null) => {
    if (!city) {
      setSelectedCity(null);
      setWeatherData([]);
      setYearlyData([]);
      setStats(null);
      return;
    }
    
    setSelectedCity(city);
    setIsLoading(true);
    setLoadProgress(null);
    setError(null);
    
    try {
      // Default to last 30 years for faster initial load
      const endYear = new Date().getFullYear();
      const startYear = endYear - 30;
      
      const data = await fetchAllWeatherData(
        city.latitude,
        city.longitude,
        startYear,
        endYear,
        (loaded, total) => setLoadProgress({ loaded, total })
      );
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDecadeToggle = (decade: number) => {
    setSelectedDecades(prev => {
      if (prev.includes(decade)) {
        return prev.filter(d => d !== decade);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), decade];
      }
      return [...prev, decade];
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 md:p-6">
        {/* Search Section */}
        <div className="mb-6">
          <p className="section-number mb-2">01. LOCATION</p>
          <CitySearch 
            onCitySelect={handleCitySelect} 
            selectedCity={selectedCity}
          />
        </div>
        
        {/* Mode Toggle */}
        {selectedCity && weatherData.length > 0 && (
          <div className="mb-4">
            <p className="section-number mb-2">02. DISPLAY MODE</p>
            <div className="flex gap-2">
              <button
                onClick={() => setChartMode('yearly')}
                className={`industrial-btn ${chartMode === 'yearly' ? 'bg-permafrost-amber text-permafrost-bg' : ''}`}
              >
                YEARLY TREND
              </button>
              <button
                onClick={() => setChartMode('decade')}
                className={`industrial-btn ${chartMode === 'decade' ? 'bg-permafrost-amber text-permafrost-bg' : ''}`}
              >
                DECADE COMPARISON
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 border border-permafrost-red text-permafrost-red">
            {error}
          </div>
        )}
        
        {/* Main Content Grid */}
        {isLoading ? (
          <LoadingState progress={loadProgress} />
        ) : selectedCity && weatherData.length > 0 && stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2">
              <TemperatureChart
                yearlyData={yearlyData}
                weatherData={weatherData}
                selectedDecades={selectedDecades}
                onDecadeToggle={handleDecadeToggle}
                mode={chartMode}
              />
            </div>
            
            {/* Right Column - Stats */}
            <div>
              <StatsPanel stats={stats!} cityName={`${selectedCity.name}, ${selectedCity.country}`} />
            </div>
          </div>
        ) : (
          <div className="industrial-panel text-center py-12">
            <p className="text-permafrost-muted text-lg mb-2">
              SELECT A LOCATION TO BEGIN
            </p>
            <p className="text-permafrost-muted text-sm">
              Search for a city to view historical weather data from the last 30 years
            </p>
          </div>
        )}
        
        {/* City Comparison Section */}
        <div className="mt-8">
          <CityComparison onCompare={setComparisonCities} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermafrostApp />
    </QueryClientProvider>
  );
}
