'use client';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-permafrost-amber text-lg glow-amber mb-2">
        ACQUIRING DATA
      </p>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-permafrost-amber animate-blink"></span>
        <span className="w-2 h-2 bg-permafrost-amber animate-blink" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 bg-permafrost-amber animate-blink" style={{ animationDelay: '0.4s' }}></span>
      </div>
    </div>
  );
}
