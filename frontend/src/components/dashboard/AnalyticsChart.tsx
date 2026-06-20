import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  chartType?: 'area' | 'bar';
}

function numericMax(data: ChartDataPoint[], ...keys: string[]): number {
  let peak = 0;
  for (const row of data) {
    for (const key of keys) {
      const raw = key === 'value' ? row.value : key === 'secondary' ? row.secondary : undefined;
      const value = Number(raw ?? 0);
      if (value > peak) peak = value;
    }
  }
  return Math.max(5, Math.ceil(peak * 1.4));
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
  chartType = 'area',
}: AnalyticsChartProps) {
  const yMax = numericMax(data, dataKey, ...(secondaryKey ? [secondaryKey] : []));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[220px] animate-pulse rounded-lg bg-slate-100" />
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Route activity will appear after tickets and GPS events are recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            {chartType === 'bar' ? (
              <BarChart
                data={data}
                barCategoryGap="30%"
                barGap={4}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: AXIS_TICK, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: AXIS_TICK, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  domain={[0, yMax]}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={dataKey} name="Tickets" fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
                {secondaryKey && (
                  <Bar
                    dataKey={secondaryKey}
                    name="GPS events"
                    fill={secondaryColor}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                )}
              </BarChart>
            ) : (
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
              <YAxis
                tick={{ fill: AXIS_TICK, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, yMax]}
              />
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
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
