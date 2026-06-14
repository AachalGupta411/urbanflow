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
import { AXIS_TICK, CHART_TOOLTIP, GRID_STROKE } from './chartTheme';

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
    <Card>
      <CardHeader>
        <CardTitle>Passenger Statistics</CardTitle>
        <CardDescription>Registrations and active sessions over time</CardDescription>
      </CardHeader>
      <CardContent>
        {summary && !loading && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs text-slate-500">Total Registered</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(summary.total_registered)}</p>
            </div>
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-3">
              <p className="text-xs text-slate-500">Active Users</p>
              <p className="text-2xl font-bold text-cyan-600">{formatNumber(summary.active_users)}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-[200px] animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="label" tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP} />
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
