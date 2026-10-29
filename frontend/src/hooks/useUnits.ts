import { useLocalStorage } from "@mantine/hooks";
import { UNITS_STORAGE_KEY, type Units } from "../utils/units";

// Unit preference (Imperial vs Metric). Persisted to localStorage using the
// same mechanism as the mobile/theme preferences, so it survives reloads.
// Mantine's useLocalStorage dispatches a window event on change, so every
// component reading the same key updates live — toggling in Settings instantly
// updates the maintenance intervals shown on the Tasks page.
export function useUnits() {
  const [units, setUnits] = useLocalStorage<Units>({
    key: UNITS_STORAGE_KEY,
    defaultValue: "imperial",
  });

  return { units, setUnits };
}