'use client';

import { useState } from 'react';
import { City, ComparisonCity } from '@/lib/types';
import { searchCities, fetchAllWeatherData, aggregateToYearly } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CityComparisonProps {
  onCompare: (cities: ComparisonCity[]) => void;
}

export default function CityComparison({ onCompare }: CityComparisonProps) {
  const [city1Query, setCity1Query] = useState('');
  const [city2Query, setCity2Query] = useState('');
  const [city1Results, setCity1Results] = useState<City[]>([]);
  const [city2Results, setCity2Results] = useState<City[]>([]);
  const [selectedCity1, setSelectedCity1] = useState<City | null>(null);
  const [selectedCity2, setSelectedCity2] = useState<City | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = async (query: string, which: 1 | 2) => {
    if (query.length < 2) {
      if (which === 1) setCity1Results([]);
      else setCity2Results([]);
      return;
    }
    
    const cities = await searchCities(query);
    if (which === 1) setCity1Results(cities);
    else setCity2Results(cities);
  };
  
  const handleSelect = (city: City, which: 1 | 2) => {
    if (which === 1) {
      setSelectedCity1(city);
      setCity1Query('');
      setCity1Results([]);
    } else {
      setSelectedCity2(city);
      setCity2Query('');
      setCity2Results([]);
    }
  };
  
  const loadComparison = async () => {
    if (!selectedCity1 || !selectedCity2) return;
    
    setIsLoading(true);
    try {
      const [data1, data2] = await Promise.all([
        fetchAllWeatherData(selectedCity1.latitude, selectedCity1.longitude),
        fetchAllWeatherData(selectedCity2.latitude, selectedCity2.longitude),
      ]);
      
      const comparison: ComparisonCity[] = [
        { city: selectedCity1, data: data1 },
        { city: selectedCity2, data: data2 },
      ];
      
      setComparisonData(comparison);
      onCompare(comparison);
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearComparison = () => {
    setSelectedCity1(null);
    setSelectedCity2(null);
    setComparisonData([]);
    onCompare([]);
  };
  
  const getComparisonChartData = () => {
    if (comparisonData.length < 2) return [];
    
    const yearly1 = aggregateToYearly(comparisonData[0].data);
    const yearly2 = aggregateToYearly(comparisonData[1].data);
    
    const merged = new Map<number, { temp1: number | null; temp2: number | null }>();
    
    for (const y of yearly1) {
      merged.set(y.year, { temp1: y.avgTempMax, temp2: null });
    }
    for (const y of yearly2) {
      if (merged.has(y.year)) {
        merged.get(y.year)!.temp2 = y.avgTempMax;
      } else {
        merged.set(y.year, { temp1: null, temp2: y.avgTempMax });
      }
    }
    
    return Array.from(merged.entries())
      .map(([year, temps]) => ({ year, ...temps }))
      .sort((a, b) => a.year - b.year);
  };
  
  const cityInput = (
    query: string,
    setQuery: (s: string) => void,
    results: City[],
    selected: City | null,
    which: 1 | 2
  ) => (
    <div className="relative">
      <input
        type="text"
        value={selected ? `${selected.name}, ${selected.country}` : query}
        onChange={(e) => {
          if (!selected) {
            setQuery(e.target.value);
            handleSearch(e.target.value, which);
          }
        }}
        placeholder={selected ? '' : `CITY ${which}...`}
        className="industrial-input w-full"
        disabled={!!selected}
      />
      {selected && (
        <button
          onClick={() => {
            if (which === 1) setSelectedCity1(null);
            else setSelectedCity2(null);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-permafrost-muted hover:text-permafrost-amber"
        >
          ✕
        </button>
      )}
      {results.length > 0 && !selected && (
        <div className="absolute z-50 w-full mt-1 industrial-panel max-h-40 overflow-y-auto">
          {results.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelect(city, which)}
              className="w-full text-left px-3 py-2 hover:bg-permafrost-border text-permafrost-amber text-sm"
            >
              {city.name}, {city.country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="industrial-panel">
      <p className="section-number mb-4">05. CITY COMPARISON</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {cityInput(city1Query, setCity1Query, city1Results, selectedCity1, 1)}
        {cityInput(city2Query, setCity2Query, city2Results, selectedCity2, 2)}
      </div>
      
      <div className="flex gap-2">
        {selectedCity1 && selectedCity2 ? (
          <>
            <button
              onClick={loadComparison}
              disabled={isLoading}
              className="industrial-btn flex-1"
            >
              {isLoading ? 'LOADING...' : 'COMPARE'}
            </button>
            <button onClick={clearComparison} className="industrial-btn">
              CLEAR
            </button>
          </>
        ) : (
          <p className="text-permafrost-muted text-sm">Select two cities to compare</p>
        )}
      </div>
      
      {comparisonData.length > 0 && (
        <div className="mt-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getComparisonChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a2c" />
                <XAxis dataKey="year" stroke="#4a6a6c" tick={{ fill: '#4a6a6c', fontSize: 10 }} />
                <YAxis stroke="#4a6a6c" tick={{ fill: '#4a6a6c', fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#4a6a6c' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="industrial-panel p-3">
                          <p className="text-permafrost-amber text-sm">YEAR: {label}</p>
                          {payload.map((entry, i) => (
                            <p key={i} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {entry.value?.toFixed(1)}°C
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="temp1" name={comparisonData[0].city.name} stroke="#ff8c00" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="temp2" name={comparisonData[1].city.name} stroke="#00ff41" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
