const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const formatCurrency = (value: number) => currency.format(value);
export const formatNumber = (value: number) => plain.format(value);
export const formatCompact = (value: number) => compact.format(value);

/** "2026-10-12" -> "Oct 12". Uses UTC so the day never shifts with the time zone. */
export function formatShortDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
