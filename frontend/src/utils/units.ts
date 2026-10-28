export type Units = "imperial" | "metric";

// localStorage key for the user's unit preference.
export const UNITS_STORAGE_KEY = "vmt_units";

// 1 mile = 1.609344 km (exact). All distance conversions in the app use this.
const MILES_TO_KM = 1.609344;

// Miles is the canonical unit: it is what the backend stores (the
// maintenance_tasks.interval_miles and maintenance_logs.mileage columns are
// integer numbers of miles). Everything else (display, input) is derived from
// miles, so the whole app stays consistent when the user switches units.

/** Column/field label for a distance in the current unit. */
export function unitLabel(units: Units): string {
  return units === "metric" ? "Kilometers" : "Miles";
}

/**
 * Convert a stored miles value into the current display unit.
 * The calculation uses floats, e.g. 5000 miles -> 8046.72 km.
 */
export function toDisplayUnit(miles: number, units: Units): number {
  return units === "metric" ? miles * MILES_TO_KM : miles;
}

/** Convert a value entered in the current display unit back to miles (float). */
export function toMiles(value: number, units: Units): number {
  return units === "metric" ? value / MILES_TO_KM : value;
}

/**
 * Format a stored miles distance for display in the current unit.
 *
 * Works for both a task's maintenance interval and a log's mileage reading.
 * The conversion is done with floats; only the value that is shown is rounded
 * to an integer. Returns null when there is no distance to display.
 */
export function formatDistance(
  miles: number | null | undefined,
  units: Units
): number | null {
  if (miles === null || miles === undefined) return null;
  return Math.round(toDisplayUnit(miles, units));
}