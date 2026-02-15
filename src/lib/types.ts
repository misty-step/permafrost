export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface WeatherData {
  date: string;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitation: number | null;
}

export interface YearlyData {
  year: number;
  avgTempMax: number;
  avgTempMin: number;
  avgPrecipitation: number;
}

export interface MonthlyData {
  month: number;
  year: number;
  avgTempMax: number;
  avgTempMin: number;
}

export interface DecadeData {
  decade: number;
  monthlyData: MonthlyData[];
}

export interface WeatherStats {
  allTimeHigh: number;
  allTimeLow: number;
  avgTempByDecade: { decade: number; avgTemp: number }[];
  totalPrecipitation: number;
  trendSlope: number;
}

export interface ComparisonCity {
  city: City;
  data: WeatherData[];
}
