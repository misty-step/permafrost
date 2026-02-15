'use client';

import { useState, useEffect, useRef } from 'react';
import { City } from '@/lib/types';
import { searchCities } from '@/lib/api';

interface CitySearchProps {
  onCitySelect: (city: City | null) => void;
  selectedCity: City | null;
}

export default function CitySearch({ onCitySelect, selectedCity }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);
  
  const handleSelect = (city: City) => {
    onCitySelect(city);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };
  
  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : query}
          onChange={(e) => {
            if (!selectedCity) setQuery(e.target.value);
          }}
          placeholder={selectedCity ? '' : "SEARCH LOCATION..."}
          className="industrial-input w-full"
          disabled={!!selectedCity}
        />
        {selectedCity && (
          <button
            onClick={() => onCitySelect(null)}
            className="industrial-btn"
          >
            CLEAR
          </button>
        )}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 industrial-panel max-h-64 overflow-y-auto">
          {results.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className="w-full text-left px-3 py-2 hover:bg-permafrost-border transition-colors text-permafrost-amber"
            >
              <span className="text-sm">{city.name}</span>
              <span className="text-xs text-permafrost-muted ml-2">
                {city.admin1 && `${city.admin1}, `}{city.country}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <span className="text-permafrost-muted text-sm acquiring"></span>
        </div>
      )}
    </div>
  );
}
