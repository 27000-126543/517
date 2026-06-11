import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  trend?: {
    value: number;
    isUp: boolean;
  };
  onClick?: () => void;
}

const colorSchemes = {
  blue: {
    bg: 'from-blue-900/80 to-blue-800/80',
    border: 'border-blue-500/50',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/30',
  },
  green: {
    bg: 'from-emerald-900/80 to-emerald-800/80',
    border: 'border-emerald-500/50',
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/30',
  },
  yellow: {
    bg: 'from-amber-900/80 to-amber-800/80',
    border: 'border-amber-500/50',
    icon: 'text-amber-400',
    glow: 'shadow-amber-500/30',
  },
  red: {
    bg: 'from-red-900/80 to-red-800/80',
    border: 'border-red-500/50',
    icon: 'text-red-400',
    glow: 'shadow-red-500/30',
  },
};

export function StatCard({ title, value, unit, icon, color, trend, onClick }: StatCardProps) {
  const scheme = colorSchemes[color];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-xl p-6 border backdrop-blur-sm bg-gradient-to-br transition-all duration-300 cursor-pointer',
        'hover:scale-[1.02] hover:shadow-lg',
        scheme.bg,
        scheme.border,
        scheme.glow,
        'shadow-lg'
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-300 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono tracking-tight">
                {value}
              </span>
              {unit && <span className="text-sm text-gray-400">{unit}</span>}
            </div>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={clsx(
                    'text-xs font-medium',
                    trend.isUp ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-400">较上周</span>
              </div>
            )}
          </div>
          <div className={clsx('p-3 rounded-lg bg-white/10', scheme.icon)}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
