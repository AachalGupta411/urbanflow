import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  accent?: 'blue' | 'cyan' | 'green' | 'amber';
  loading?: boolean;
}

const accentMap = {
  blue: 'from-blue-500/20 to-blue-600/5 text-blue-400',
  cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400',
  green: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/5 text-amber-400',
};

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  accent = 'blue',
  loading,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        'glass-panel group animate-fade-in rounded-xl p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-glow',
        loading && 'animate-pulse'
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'rounded-lg bg-gradient-to-br p-2.5',
            accentMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {loading ? '—' : typeof value === 'number' ? formatNumber(value) : value}
        </p>
        {changeLabel && (
          <p className="mt-1 text-xs text-muted-foreground">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
