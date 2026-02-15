'use client';

import { WeatherStats } from '@/lib/types';

interface StatsPanelProps {
  stats: WeatherStats;
  cityName: string;
}

export default function StatsPanel({ stats, cityName }: StatsPanelProps) {
  const formatTrend = (slope: number) => {
    if (slope > 0) return `+${slope.toFixed(4)}`;
    return slope.toFixed(4);
  };
  
  const getTrendColor = (slope: number) => {
    if (slope > 0.01) return 'text-permafrost-red';
    if (slope < -0.01) return 'text-permafrost-green';
    return 'text-permafrost-muted';
  };
  
  return (
    <div className="industrial-panel h-full">
      <p className="section-number mb-4">04. STATISTICS</p>
      
      <div className="mb-6">
        <h3 className="text-permafrost-muted text-xs uppercase tracking-widest mb-1">Location</h3>
        <p className="text-permafrost-amber text-lg glow-amber">{cityName}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-permafrost-muted text-xs uppercase tracking-widest mb-1">All-Time High</h4>
          <p className="text-permafrost-red text-2xl glow-red">{stats.allTimeHigh}°C</p>
        </div>
        <div>
          <h4 className="text-permafrost-muted text-xs uppercase tracking-widest mb-1">All-Time Low</h4>
          <p className="text-permafrost-green text-2xl glow-green">{stats.allTimeLow}°C</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-permafrost-muted text-xs uppercase tracking-widest mb-2">Total Precipitation</h4>
        <p className="text-permafrost-amber text-xl">{stats.totalPrecipitation.toLocaleString()} mm</p>
      </div>
      
      <div className="mb-6">
        <h4 className="text-permafrost-muted text-xs uppercase tracking-widest mb-2">Temperature Trend</h4>
        <p className={`text-xl ${getTrendColor(stats.trendSlope)}`}>
          {formatTrend(stats.trendSlope)}°C / year
        </p>
        <p className="text-permafrost-muted text-xs mt-1">
          {stats.trendSlope > 0 ? '▲ WARMING' : stats.trendSlope < 0 ? '▼ COOLING' : '▶ STABLE'}
        </p>
      </div>
      
      <div>
        <h4 className="text-permafrost-muted text-xs uppercase tracking-widest mb-2">Average by Decade</h4>
        <div className="space-y-2">
          {stats.avgTempByDecade.map((item) => (
            <div key={item.decade} className="flex justify-between items-center">
              <span className="text-permafrost-muted text-sm">{item.decade}s</span>
              <span className="text-permafrost-amber">{item.avgTemp}°C</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
