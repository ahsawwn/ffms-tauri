import React from 'react';

export type ThemeId = 'default' | 'lemon-lith' | 'lime-lith' | 'mint-lith' | 'peach-lith' | 'lavender-lith' | 'rose-lith';

const THEMES: Record<ThemeId, { label: string; accent: string }> = {
  default: { label: 'Cream (Default)', accent: '#FFE600' },
  'lemon-lith': { label: 'Lemon Lith', accent: '#FFE600' },
  'lime-lith': { label: 'Lime Lith', accent: '#A3E635' },
  'mint-lith': { label: 'Mint Lith', accent: '#22D3EE' },
  'peach-lith': { label: 'Peach Lith', accent: '#FF8800' },
  'lavender-lith': { label: 'Lavender Lith', accent: '#C084FC' },
  'rose-lith': { label: 'Rose Lith', accent: '#FF6B8B' },
};

export interface ThemeSectionProps {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export const ThemeSection: React.FC<ThemeSectionProps> = ({ theme, onThemeChange }) => {
  return (
    <div className="brutal-card p-4 bg-white flex flex-col gap-3">
      <h3 className="font-black uppercase text-sm border-b-3 border-black pb-1">Theme</h3>
      <p className="text-[10px] font-bold text-black/60 uppercase">Neo-brutalist lith tones</p>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(THEMES).map(([id, t]) => {
          const active = id === theme;
          return (
            <button
              key={id}
              onClick={() => onThemeChange(id as ThemeId)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-sm border-3 border-black transition-all ${
                active ? 'ring-4 ring-offset-2 ring-black bg-[var(--nb-yellow)]' : 'bg-[var(--nb-cream)] hover:shadow-[4px_4px_0px_#000]'
              }`}
            >
              <div className={`w-8 h-8 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000] ${active ? 'ring-2 ring-black' : ''}`} style={{ backgroundColor: t.accent }} />
              <span className="text-[10px] font-black uppercase text-center leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
