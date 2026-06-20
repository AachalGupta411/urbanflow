import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { AXIS_TICK, CHART_TOOLTIP, GRID_STROKE } from './chartTheme';

interface TicketStatRow {
  label: string;
  created: number;
  cancelled: number;
  revenue: number;
}

interface TicketStatsProps {
  data: TicketStatRow[];
  summary?: {
    tickets_created: number;
    tickets_cancelled: number;
    total_revenue: number;
  };
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981'];

function yAxisMax(data: TicketStatRow[]): number {
  const peak = Math.max(...data.map((row) => row.created), 0);
  return Math.max(5, Math.ceil(peak * 1.4));
}

export default function TicketStats({ data, summary, loading }: TicketStatsProps) {
  const chartMax = yAxisMax(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticketing Statistics</CardTitle>
        <CardDescription>Bookings, cancellations & revenue by mode</CardDescription>
      </CardHeader>
      <CardContent>
        {summary && !loading && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-lg font-bold text-slate-900">{summary.tickets_created}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-center">
              <p className="text-xs text-slate-500">Cancelled</p>
              <p className="text-lg font-bold text-amber-600">{summary.tickets_cancelled}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center">
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(summary.total_revenue)}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-[220px] animate-pulse rounded-lg bg-slate-100" />
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Ticket breakdown by vehicle type will appear after bookings are recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              barCategoryGap="35%"
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: AXIS_TICK, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, chartMax]}
              />
              <Tooltip contentStyle={CHART_TOOLTIP} />
              <Bar dataKey="created" name="Created" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
