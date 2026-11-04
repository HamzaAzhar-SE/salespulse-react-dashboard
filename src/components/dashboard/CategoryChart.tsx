import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompact, formatCurrency } from '../../lib/format';
import type { CategorySales } from '../../lib/stats';

const tick = { fontSize: 12, fill: 'currentColor' };
const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg)',
  color: 'var(--tooltip-fg)',
  border: '1px solid var(--tooltip-border)',
  borderRadius: 8,
};

export default function CategoryChart({ data }: { data: CategorySales[] }) {
  return (
    <section
      aria-labelledby="category-heading"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <h2 id="category-heading" className="mb-4 text-base font-semibold">
        Sales by category
      </h2>
      <div
        role="img"
        aria-label="Bar chart of sales for each product category"
        className="h-72 text-slate-500 dark:text-slate-400"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
            <XAxis dataKey="category" tick={tick} />
            <YAxis tickFormatter={(value) => formatCompact(Number(value))} tick={tick} width={48} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: 'var(--tooltip-fg)' }}
              cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
              formatter={(value) => [formatCurrency(Number(value)), 'Sales']}
            />
            <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
