// File: src/utils/dateUtils.js
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export function toDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function formatRelativeDate(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return '';
  const elapsed = Math.max(0, now - date.getTime());
  if (elapsed < MINUTE) return 'Just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < DAY * 7) return `${Math.floor(elapsed / DAY)}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() === new Date(now).getFullYear()
        ? undefined
        : 'numeric',
  }).format(date);
}
export function formatDate(value, options = {}) {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat(undefined, options).format(date) : '';
}
export const formatShortDate = (value) =>
  formatDate(value, { month: 'short', day: 'numeric', year: 'numeric' });
