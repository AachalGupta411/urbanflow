import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface PassengerStatRow {
  label: string;
  registered: number;
  active: number;
}

interface PassengerStatsProps {
  data: PassengerStatRow[];
  summary?: {
    total_registered: number;
    active_users: number;
  };
  loading?: boolean;
}

export default function PassengerStats({ data, summary, loading }: PassengerStatsProps) {
  return (
    <Card className="border-white/10 bg-ops-panel/80">
      <CardHeader>
        <CardTitle>Passenger Statistics</CardTitle>
        <CardDescription>Registrations and active sessions over time</CardDescription>
      </CardHeader>
      <CardContent>
        {summary && !loading && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
              <p className="text-xs text-muted-foreground">Total Registered</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(summary.total_registered)}</p>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
              <p className="text-xs text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-cyan-400">{formatNumber(summary.active_users)}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-[200px] animate-pulse rounded-lg bg-white/5" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
              <Line
                type="monotone"
                dataKey="registered"
                name="Registered"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="active"
                name="Active"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
