// Helpers for converting between stored UTC ISO timestamps and the
// `<input type="datetime-local">` string format (`YYYY-MM-DDTHH:mm`),
// which is interpreted as the user's local time.

/**
 * Converts a UTC ISO timestamp (e.g. "2026-01-15T22:00:00.000Z") to a string
 * suitable for `<input type="datetime-local">` in the user's local timezone.
 * Returns the empty string when the input is falsy or unparseable.
 */
export function toLocalDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Returns today's date as YYYY-MM-DD in the user's local timezone. Use this
 * for "due today" comparisons and minDate constraints; toISOString().slice(0, 10)
 * is UTC and produces off-by-one-day errors near day boundaries.
 */
export function localTodayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
