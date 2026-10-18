import React from 'react';

export type BadgeVariant =
  | 'yellow' | 'lime' | 'limeLight' | 'green' | 'greenLight'
  | 'pink' | 'pinkLight' | 'red' | 'redLight'
  | 'cyan' | 'cyanLight' | 'blue' | 'blueLight'
  | 'orange' | 'orangeLight' | 'peach' | 'peachLight'
  | 'purple' | 'purpleLight' | 'violet' | 'violetLight'
  | 'brown' | 'brownLight' | 'tan' | 'tanLight'
  | 'neutral' | 'black' | 'white' | 'cream' | 'dark';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const V: Record<BadgeVariant, string> = {
  yellow: 'bg-[var(--nb-yellow)] text-black',
  lime: 'bg-[var(--nb-lime)] text-black',
  limeLight: 'bg-[var(--nb-lime-light)] text-black',
  green: 'bg-[var(--nb-lime)] text-black',
  greenLight: 'bg-[var(--nb-lime-light)] text-black',
  pink: 'bg-[var(--nb-pink)] text-black',
  pinkLight: 'bg-[var(--nb-pink-light)] text-black',
  red: 'bg-[var(--nb-pink)] text-black',
  redLight: 'bg-[var(--nb-pink-light)] text-black',
  cyan: 'bg-[var(--nb-cyan)] text-black',
  cyanLight: 'bg-[var(--nb-cyan-light)] text-black',
  blue: 'bg-[var(--nb-cyan)] text-black',
  blueLight: 'bg-[var(--nb-cyan-light)] text-black',
  orange: 'bg-[var(--nb-orange)] text-black',
  orangeLight: 'bg-[var(--nb-orange-light)] text-black',
  peach: 'bg-[var(--nb-orange-light)] text-black',
  peachLight: 'bg-[var(--nb-orange-light)] text-black',
  purple: 'bg-[var(--nb-purple)] text-black',
  purpleLight: 'bg-[var(--nb-purple-light)] text-black',
  violet: 'bg-[var(--nb-purple)] text-black',
  violetLight: 'bg-[var(--nb-purple-light)] text-black',
  brown: 'bg-[var(--nb-brown)] text-black',
  brownLight: 'bg-[var(--nb-brown-light)] text-black',
  tan: 'bg-[var(--nb-brown-light)] text-black',
  tanLight: 'bg-[var(--nb-brown-light)] text-black',
  neutral: 'bg-[var(--nb-cream)] text-black',
  black: 'bg-[var(--nb-black)] text-white',
  white: 'bg-[var(--nb-white)] text-black',
  cream: 'bg-[var(--nb-cream)] text-black',
  dark: 'bg-black text-white',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'yellow', className = '', children, ...props }) => (
  <span className={`brutal-badge inline-flex items-center gap-1.5 ${V[variant]} ${className}`} {...props}>
    {children}
  </span>
);
