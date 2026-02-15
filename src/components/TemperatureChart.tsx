'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { YearlyData, WeatherData } from '@/lib/types';
import { aggregateToMonthlyByDecade } from '@/lib/api';

interface TemperatureChartProps {
  yearlyData: YearlyData[];
  weatherData: WeatherData[];
  selectedDecades: number[];
  onDecadeToggle: (decade: number) => void;
  mode: 'yearly' | 'decade';
}

interface TooltipPayloadItem {
  color: string;
  name: string;
  value?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number | string;
}

interface MonthlyChartData {
  month: number;
  [key: `decade_${number}`]: number | undefined;
}

export default function TemperatureChart({
  yearlyData,
  weatherData,
  selectedDecades,
  onDecadeToggle,
  mode,
}: TemperatureChartProps) {
  const availableDecades = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  
  const decadeColors: Record<number, string> = {
    1940: '#ff8c00',
    1950: '#ffb733',
    1960: '#ffcc66',
    1970: '#00ff41',
    1980: '#33ff66',
    1990: '#66ff8c',
    2000: '#ff6464',
    2010: '#ff8585',
    2020: '#ff2020',
  };
  
  const getDecadeData = (): MonthlyChartData[] => {
    const result: MonthlyChartData[] = [];
    for (let m = 1; m <= 12; m++) {
      const entry: MonthlyChartData = { month: m };
      for (const decade of selectedDecades) {
        const monthlyData = aggregateToMonthlyByDecade(weatherData, decade);
        const monthData = monthlyData.find(d => d.month === m);
        if (monthData) {
          entry[`decade_${decade}`] = monthData.avgTempMax;
        }
      }
      result.push(entry);
    }
    return result;
  };
  
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="industrial-panel p-3">
          <p className="text-permafrost-amber text-sm mb-1">
            {mode === 'yearly' ? `YEAR: ${label}` : `MONTH: ${monthNames[(label as number) - 1]}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}°C
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full">
      {/* Decade selector */}
      <div className="mb-4">
        <p className="section-number mb-2">03. DECADE SELECTION</p>
        <div className="flex flex-wrap gap-2">
          {availableDecades.map((decade) => (
            <button
              key={decade}
              onClick={() => onDecadeToggle(decade)}
              className={`text-xs px-3 py-1 border transition-all ${
                selectedDecades.includes(decade)
                  ? 'border-permafrost-amber bg-permafrost-amber text-permafrost-bg'
                  : 'border-permafrost-border text-permafrost-muted hover:border-permafrost-amber'
              }`}
            >
              {decade}S
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="industrial-panel h-80">
        {mode === 'yearly' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a2c" />
              <XAxis 
                dataKey="year" 
                stroke="#4a6a6c" 
                tick={{ fill: '#4a6a6c', fontSize: 10 }}
                interval={Math.floor(yearlyData.length / 10)}
              />
              <YAxis 
                stroke="#4a6a6c" 
                tick={{ fill: '#4a6a6c', fontSize: 10 }}
                label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#4a6a6c' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgTempMax"
                name="MAX TEMP"
                stroke="#ff8c00"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="avgTempMin"
                name="MIN TEMP"
                stroke="#00ff41"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getDecadeData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a2c" />
              <XAxis 
                dataKey="month" 
                stroke="#4a6a6c" 
                tick={{ fill: '#4a6a6c', fontSize: 10 }}
                tickFormatter={(value: number) => monthNames[value - 1]}
              />
              <YAxis 
                stroke="#4a6a6c" 
                tick={{ fill: '#4a6a6c', fontSize: 10 }}
                label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#4a6a6c' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedDecades.map((decade) => (
                <Line
                  key={decade}
                  type="monotone"
                  dataKey={`decade_${decade}`}
                  name={`${decade}S`}
                  stroke={decadeColors[decade]}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
