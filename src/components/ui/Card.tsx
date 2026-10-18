import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'flat'
  | 'yellow' | 'lime' | 'limeLight' | 'green' | 'greenLight'
  | 'pink' | 'pinkLight' | 'red' | 'redLight'
  | 'cyan' | 'cyanLight' | 'blue' | 'blueLight'
  | 'orange' | 'orangeLight' | 'peach' | 'peachLight'
  | 'purple' | 'purpleLight' | 'violet' | 'violetLight'
  | 'brown' | 'brownLight' | 'tan' | 'tanLight'
  | 'neutral' | 'black' | 'white' | 'cream';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: CardVariant;
  children: React.ReactNode;
}

const COLOR: Partial<Record<CardVariant, string>> = {
  yellow: 'bg-[var(--nb-yellow)]', lime: 'bg-[var(--nb-lime)]', limeLight: 'bg-[var(--nb-lime-light)]',
  green: 'bg-[var(--nb-lime)]', greenLight: 'bg-[var(--nb-lime-light)]',
  pink: 'bg-[var(--nb-pink)]', pinkLight: 'bg-[var(--nb-pink-light)]', red: 'bg-[var(--nb-pink)]', redLight: 'bg-[var(--nb-pink-light)]',
  cyan: 'bg-[var(--nb-cyan)]', cyanLight: 'bg-[var(--nb-cyan-light)]', blue: 'bg-[var(--nb-cyan)]', blueLight: 'bg-[var(--nb-cyan-light)]',
  orange: 'bg-[var(--nb-orange)]', orangeLight: 'bg-[var(--nb-orange-light)]', peach: 'bg-[var(--nb-orange-light)]', peachLight: 'bg-[var(--nb-orange-light)]',
  purple: 'bg-[var(--nb-purple)]', purpleLight: 'bg-[var(--nb-purple-light)]', violet: 'bg-[var(--nb-purple)]', violetLight: 'bg-[var(--nb-purple-light)]',
  brown: 'bg-[var(--nb-brown)]', brownLight: 'bg-[var(--nb-brown-light)]', tan: 'bg-[var(--nb-brown-light)]', tanLight: 'bg-[var(--nb-brown-light)]',
  neutral: 'bg-[var(--nb-cream)]', black: 'bg-[var(--nb-black)] text-white', white: 'bg-[var(--nb-white)]', cream: 'bg-[var(--nb-cream)]',
};

export const Card: React.FC<CardProps> = ({ hoverable = false, variant = 'default', className = '', children, ...props }) => {
  const colorClass = COLOR[variant];
  const structural = colorClass ? '' : (variant === 'elevated' ? 'bg-[var(--bg-surface-elevated)]' : variant === 'flat' ? 'bg-[var(--bg-surface)] border-2 shadow-none' : 'bg-[var(--bg-surface)]');
  const hoverStyle = hoverable ? 'brutal-card-hover cursor-pointer' : '';
  return (
    <div className={`brutal-card p-4 ${colorClass ?? structural} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}
