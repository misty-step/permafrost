'use client';

interface LoadingStateProps {
  progress?: { loaded: number; total: number } | null;
}

export default function LoadingState({ progress }: LoadingStateProps) {
  const pct = progress ? Math.round((progress.loaded / progress.total) * 100) : 0;
  
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-permafrost-amber text-lg glow-amber mb-4">
        ACQUIRING DATA
      </p>
      
      {progress ? (
        <div className="w-64">
          {/* Progress bar */}
          <div className="w-full h-2 border border-permafrost-amber/30 mb-2">
            <div 
              className="h-full bg-permafrost-amber transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-permafrost-green text-xs text-center font-mono glow-green">
            BLOCK {progress.loaded}/{progress.total} — {pct}%
          </p>
        </div>
      ) : (
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-permafrost-amber animate-blink"></span>
          <span className="w-2 h-2 bg-permafrost-amber animate-blink" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-permafrost-amber animate-blink" style={{ animationDelay: '0.4s' }}></span>
        </div>
      )}
    </div>
  );
}
