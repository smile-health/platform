// Several list/report endpoints accept startDate/endDate query params and
// gate their date-range SQL filter on `params.startDate && params.endDate`
// being truthy. That's not the same as being a *valid* date: the frontend's
// shared date-range picker sends the literal string "-" as its "nothing
// selected" placeholder rather than omitting the params, and "-" is truthy
// in JS. Passed straight into a `::timestamp` cast, Postgres correctly
// rejects it (error 22007, invalid_datetime_format) — unlike MySQL, which
// silently tolerated bad date literals in non-strict mode, so this never
// surfaced against the original. Callers should gate on isValidDateString
// instead of a plain truthy check.
export function isValidDateString(value: string | undefined | null): value is string {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

// Same check for call sites where the raw string was already parsed into a
// Date upstream (service layer) before reaching the repository — `new
// Date("-")` doesn't throw, it silently produces an Invalid Date, which
// Postgres then rejects the same way as the raw string.
export function isValidDate(value: Date | undefined | null): value is Date {
  if (!value) return false;
  return !Number.isNaN(value.getTime());
}
