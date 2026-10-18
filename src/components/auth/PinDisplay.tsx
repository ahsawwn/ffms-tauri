import React from 'react';

export interface PinDisplayProps {
  pinLength: number;
  maxLength?: number;
  error?: string;
}

export const PinDisplay: React.FC<PinDisplayProps> = ({ pinLength, maxLength = 4, error }) => (
  <div className="w-full">
    <div className="brutal-card p-3 bg-[#F4F0EA] flex justify-center items-center gap-3 border-3 border-black min-h-[56px]">
      {Array.from({ length: maxLength }).map((_, idx) => (
        <div
          key={idx}
          className={`w-4 h-4 rounded-full border-2 border-black transition-all duration-150 ${
            idx < pinLength ? 'bg-black scale-125' : 'bg-white'
          }`}
        />
      ))}
    </div>
    {error && (
      <p className="text-xs font-black text-center text-[#FF6B8B] uppercase mt-2 tracking-wide animate-pulse">
        {error}
      </p>
    )}
  </div>
);
