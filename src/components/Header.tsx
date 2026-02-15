'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.toUTCString().slice(-12, -4);
      setTime(utc);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <header className="border-b border-permafrost-border py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-permafrost-red text-2xl">★</span>
          <h1 className="text-3xl md:text-4xl font-normal tracking-[0.2em] text-permafrost-amber glow-amber">
            PERMAFROST
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-permafrost-muted text-xs uppercase tracking-widest">UTC</p>
            <p className="text-permafrost-green text-xl glow-green font-mono">{time}</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-permafrost-muted text-xs uppercase tracking-widest">STATUS</p>
            <p className="text-permafrost-green text-sm">ONLINE</p>
          </div>
        </div>
      </div>
    </header>
  );
}
