interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'blue' | 'green' | 'amber' | 'purple';
}

export default function StatCard({ label, value, hint, accent = 'blue' }: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${accent}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </article>
  );
}
