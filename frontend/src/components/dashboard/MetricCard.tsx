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
  blue: 'from-blue-50 to-blue-100/50 text-blue-600',
  cyan: 'from-cyan-50 to-cyan-100/50 text-cyan-600',
  green: 'from-emerald-50 to-emerald-100/50 text-emerald-600',
  amber: 'from-amber-50 to-amber-100/50 text-amber-600',
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
        'glass-panel group animate-fade-in rounded-xl p-5 transition-all duration-300 hover:border-teal-200 hover:shadow-md',
        loading && 'animate-pulse'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg bg-gradient-to-br p-2.5', accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {loading ? '—' : typeof value === 'number' ? formatNumber(value) : value}
        </p>
        {changeLabel && <p className="mt-1 text-xs text-slate-500">{changeLabel}</p>}
      </div>
    </div>
  );
}
