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

// ---------------------------------------------------------------------------
// Part capacity (volume or weight)
// ---------------------------------------------------------------------------

// 1 liter = 1.056688 US liquid quarts; 1 kilogram = 2.20462262 pounds.
const LITERS_TO_QUARTS = 1.056688;
const KG_TO_LBS = 2.20462262;

// Canonical capacity unit stored in the database, always metric so the stored
// number has one unambiguous meaning: "L" for a volume, "kg" for a weight.
// The display unit (qt / lbs) is derived from the user's unit preference,
// exactly like miles -> km for maintenance intervals.
export type CapacityType = "L" | "kg";

/** Display label for a canonical capacity unit in the current setting. */
export function capacityUnit(type: CapacityType, units: Units): string {
  if (type === "L") return units === "metric" ? "L" : "qt";
  return units === "metric" ? "kg" : "lbs";
}

/** Convert a stored (metric) capacity into the current display unit (float). */
export function toDisplayCapacity(
  capacity: number,
  type: CapacityType,
  units: Units
): number {
  if (type === "L") {
    return units === "metric" ? capacity : capacity * LITERS_TO_QUARTS;
  }
  return units === "metric" ? capacity : capacity * KG_TO_LBS;
}

/** Convert a value entered in the current display unit back to metric. */
export function toCanonicalCapacity(
  value: number,
  type: CapacityType,
  units: Units
): number {
  if (type === "L") {
    return units === "metric" ? value : value / LITERS_TO_QUARTS;
  }
  return units === "metric" ? value : value / KG_TO_LBS;
}

/** Format a number with up to 2 decimals, dropping trailing zeros. */
function trimNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Format a part's capacity for display: the quantity converted into the
 * current unit with the unit label appended (e.g. "5L", "4qt"). A capacity
 * with no unit shows as a bare number.
 */
export function formatCapacity(
  capacity: number | null | undefined,
  type: CapacityType | null,
  units: Units
): string {
  if (capacity === null || capacity === undefined) return "—";
  if (type === null) return trimNumber(capacity);
  return trimNumber(toDisplayCapacity(capacity, type, units)) + capacityUnit(type, units);
}