import { City, WeatherData, YearlyData, MonthlyData, WeatherStats } from './types';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const ARCHIVE_API = 'https://archive-api.open-meteo.com/v1/archive';

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export async function searchCities(query: string): Promise<City[]> {
  if (!query || query.length < 2) return [];
  
  const res = await fetch(`${GEO_API}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
  const data = await res.json();
  
  if (!data.results) return [];
  
  return data.results.map((r: GeocodingResult) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

async function fetchWeatherData(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  const url = `${ARCHIVE_API}?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.daily) return [];
  
  return data.daily.time.map((date: string, i: number) => ({
    date,
    temperatureMax: data.daily.temperature_2m_max[i],
    temperatureMin: data.daily.temperature_2m_min[i],
    precipitation: data.daily.precipitation_sum[i],
  }));
}

export async function fetchAllWeatherData(
  lat: number,
  lng: number,
  startYear: number = 1940,
  endYear: number = new Date().getFullYear(),
  onProgress?: (loaded: number, total: number) => void
): Promise<WeatherData[]> {
  const allData: WeatherData[] = [];
  
  // Build 10-year chunks to avoid overwhelming the API
  const chunks: { start: string; end: string }[] = [];
  for (let year = startYear; year <= endYear; year += 10) {
    const chunkEnd = Math.min(year + 9, endYear);
    chunks.push({
      start: `${year}-01-01`,
      end: `${chunkEnd}-12-31`,
    });
  }
  
  // Fetch with concurrency limit of 3
  const CONCURRENCY = 3;
  let loaded = 0;
  
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(chunk => fetchWeatherData(lat, lng, chunk.start, chunk.end))
    );
    
    for (const result of results) {
      allData.push(...result);
    }
    
    loaded += batch.length;
    onProgress?.(loaded, chunks.length);
  }
  
  return allData.sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateToYearly(data: WeatherData[]): YearlyData[] {
  const yearlyMap = new Map<number, { tempsMax: number[]; tempsMin: number[]; precip: number[]; count: number }>();
  
  for (const d of data) {
    if (!d.temperatureMax && !d.temperatureMin && !d.precipitation) continue;
    
    const year = new Date(d.date).getFullYear();
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, { tempsMax: [], tempsMin: [], precip: [], count: 0 });
    }
    
    const entry = yearlyMap.get(year)!;
    if (d.temperatureMax !== null) entry.tempsMax.push(d.temperatureMax);
    if (d.temperatureMin !== null) entry.tempsMin.push(d.temperatureMin);
    if (d.precipitation !== null) entry.precip.push(d.precipitation);
    entry.count++;
  }
  
  const result: YearlyData[] = [];
  yearlyMap.forEach((value, year) => {
    const avgMax = value.tempsMax.length > 0 
      ? value.tempsMax.reduce((a, b) => a + b, 0) / value.tempsMax.length 
      : 0;
    const avgMin = value.tempsMin.length > 0 
      ? value.tempsMin.reduce((a, b) => a + b, 0) / value.tempsMin.length 
      : 0;
    const avgPrecip = value.precip.length > 0 
      ? value.precip.reduce((a, b) => a + b, 0) 
      : 0;
    
    result.push({
      year,
      avgTempMax: Math.round(avgMax * 10) / 10,
      avgTempMin: Math.round(avgMin * 10) / 10,
      avgPrecipitation: Math.round(avgPrecip * 10) / 10,
    });
  });
  
  return result.sort((a, b) => a.year - b.year);
}

export function aggregateToMonthlyByDecade(data: WeatherData[], decade: number): MonthlyData[] {
  const startYear = decade;
  const endYear = decade + 9;
  
  const monthlyMap = new Map<string, { tempsMax: number[]; tempsMin: number[] }>();
  
  for (const d of data) {
    const year = new Date(d.date).getFullYear();
    if (year < startYear || year > endYear) continue;
    if (!d.temperatureMax && !d.temperatureMin) continue;
    
    const month = new Date(d.date).getMonth() + 1;
    const key = `${year}-${month}`;
    
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { tempsMax: [], tempsMin: [] });
    }
    
    const entry = monthlyMap.get(key)!;
    if (d.temperatureMax !== null) entry.tempsMax.push(d.temperatureMax);
    if (d.temperatureMin !== null) entry.tempsMin.push(d.temperatureMin);
  }
  
  const result: MonthlyData[] = [];
  for (let m = 1; m <= 12; m++) {
    const monthTemps: number[] = [];
    const monthMins: number[] = [];
    
    monthlyMap.forEach((value, key) => {
      const month = parseInt(key.split('-')[1]);
      if (month === m) {
        monthTemps.push(...value.tempsMax);
        monthMins.push(...value.tempsMin);
      }
    });
    
    const avgMax = monthTemps.length > 0 
      ? monthTemps.reduce((a, b) => a + b, 0) / monthTemps.length 
      : 0;
    const avgMin = monthMins.length > 0 
      ? monthMins.reduce((a, b) => a + b, 0) / monthMins.length 
      : 0;
    
    result.push({
      month: m,
      year: decade,
      avgTempMax: Math.round(avgMax * 10) / 10,
      avgTempMin: Math.round(avgMin * 10) / 10,
    });
  }
  
  return result;
}

export function calculateStats(data: WeatherData[]): WeatherStats {
  let allTimeHigh = -Infinity;
  let allTimeLow = Infinity;
  let totalPrecipitation = 0;
  
  const decadeTemps = new Map<number, { temps: number[]; count: number }>();
  
  for (const d of data) {
    if (d.temperatureMax !== null && d.temperatureMax > allTimeHigh) {
      allTimeHigh = d.temperatureMax;
    }
    if (d.temperatureMin !== null && d.temperatureMin < allTimeLow) {
      allTimeLow = d.temperatureMin;
    }
    if (d.precipitation !== null) {
      totalPrecipitation += d.precipitation;
    }
    
    const year = new Date(d.date).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    const temp = (d.temperatureMax !== null && d.temperatureMin !== null) 
      ? (d.temperatureMax + d.temperatureMin) / 2 
      : null;
    
    if (temp !== null) {
      if (!decadeTemps.has(decade)) {
        decadeTemps.set(decade, { temps: [], count: 0 });
      }
      const entry = decadeTemps.get(decade)!;
      entry.temps.push(temp);
      entry.count++;
    }
  }
  
  const avgTempByDecade: { decade: number; avgTemp: number }[] = [];
  decadeTemps.forEach((value, decade) => {
    const avg = value.temps.reduce((a, b) => a + b, 0) / value.temps.length;
    avgTempByDecade.push({ decade, avgTemp: Math.round(avg * 10) / 10 });
  });
  avgTempByDecade.sort((a, b) => a.decade - b.decade);
  
  // Calculate trend slope (simple linear regression on yearly averages)
  const yearly = aggregateToYearly(data);
  const n = yearly.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (const y of yearly) {
    sumX += y.year;
    sumY += y.avgTempMax;
    sumXY += y.year * y.avgTempMax;
    sumX2 += y.year * y.year;
  }
  
  const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
  
  return {
    allTimeHigh: allTimeHigh === -Infinity ? 0 : Math.round(allTimeHigh * 10) / 10,
    allTimeLow: allTimeLow === Infinity ? 0 : Math.round(allTimeLow * 10) / 10,
    avgTempByDecade,
    totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
    trendSlope: Math.round(slope * 10000) / 10000,
  };
}
