// File: src/utils/formatters.js
export function formatCurrency(value, currency = 'USD', locale = undefined) {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    Number.isNaN(Number(value))
  )
    return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}
export function formatSalary(min, max, currency = 'USD', locale = undefined) {
  const lower = formatCurrency(min, currency, locale);
  const upper = formatCurrency(max, currency, locale);
  if (lower && upper) return `${lower} - ${upper}`;
  return lower || upper || 'Salary not disclosed';
}
export function formatCompactNumber(value, locale = undefined) {
  return value === null || value === undefined
    ? ''
    : new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(Number(value));
}
export function formatPercent(value, locale = undefined) {
  return value === null || value === undefined
    ? ''
    : new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: 1,
      }).format(Number(value));
}
