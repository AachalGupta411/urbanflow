import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AXIS_TICK, CHART_TOOLTIP, GRID_STROKE } from './chartTheme';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
}

interface AnalyticsChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  dataKey?: string;
  secondaryKey?: string;
  color?: string;
  secondaryColor?: string;
  loading?: boolean;
}

export default function AnalyticsChart({
  title,
  description,
  data,
  dataKey = 'value',
  secondaryKey,
  color = '#3b82f6',
  secondaryColor = '#06b6d4',
  loading,
}: AnalyticsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[220px] animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
                {secondaryKey && (
                  <linearGradient id={`grad-${secondaryKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis
                dataKey="label"
                tick={{ fill: AXIS_TICK, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${dataKey})`}
              />
              {secondaryKey && (
                <Area
                  type="monotone"
                  dataKey={secondaryKey}
                  stroke={secondaryColor}
                  strokeWidth={2}
                  fill={`url(#grad-${secondaryKey})`}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
