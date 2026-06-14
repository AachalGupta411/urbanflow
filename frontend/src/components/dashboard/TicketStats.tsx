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

export default function TicketStats({ data, summary, loading }: TicketStatsProps) {
  return (
    <Card className="border-white/10 bg-ops-panel/80">
      <CardHeader>
        <CardTitle>Ticketing Statistics</CardTitle>
        <CardDescription>Bookings, cancellations & revenue by mode</CardDescription>
      </CardHeader>
      <CardContent>
        {summary && !loading && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-lg font-bold text-foreground">{summary.tickets_created}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">Cancelled</p>
              <p className="text-lg font-bold text-amber-400">{summary.tickets_cancelled}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(summary.total_revenue)}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-[200px] animate-pulse rounded-lg bg-white/5" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="created" name="Created" radius={[4, 4, 0, 0]}>
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
