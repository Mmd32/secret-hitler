import React from 'react';

const HUES = [28, 200, 160, 340, 262, 48, 12, 184, 300, 90];

export const hueFor = (name: string): number => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length];
};

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  dead?: boolean;
  ring?: string;
  className?: string;
}

/** Round monogram avatar with a stable per-name colour. */
export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', dead, ring, className = '' }) => {
  const hue = hueFor(name || '?');
  const dim = { sm: 'h-7 w-7 text-xs', md: 'h-10 w-10 text-base', lg: 'h-14 w-14 text-xl' }[size];
  const initial = Array.from((name || '?').trim())[0] || '?';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ${dim} ${
        dead ? 'grayscale opacity-60' : ''
      } ${ring ?? ''} ${className}`}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 55% 46%), hsl(${hue} 60% 30%))`,
        boxShadow: '0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -6px rgba(0,0,0,.7)',
      }}
    >
      {initial.toUpperCase()}
    </span>
  );
};

/** Small section label used above panels. */
export const SectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }> = ({
  icon,
  children,
  right,
}) => (
  <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-200">
      {icon}
      <span>{children}</span>
    </div>
    {right}
  </div>
);
