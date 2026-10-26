import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact, formatCurrency, formatShortDate } from '../../lib/format';
import type { RevenuePoint } from '../../lib/stats';

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <section
      aria-labelledby="revenue-heading"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <h2 id="revenue-heading" className="mb-4 text-base font-semibold">
        Revenue, last 30 days
      </h2>
      <div role="img" aria-label="Line chart of daily revenue over the last 30 days" className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
            <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 12 }} minTickGap={24} />
            <YAxis tickFormatter={(value) => formatCompact(Number(value))} tick={{ fontSize: 12 }} width={48} />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
              labelFormatter={(label) => formatShortDate(String(label))}
            />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
