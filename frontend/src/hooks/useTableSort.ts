import { useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

// Client-side table sorting: holds the active sort column and direction.
// Clicking the active header toggles the direction; clicking another
// column activates it ascending.
export function useTableSort() {
  const [sort, setSort] = useState<SortState>({ key: null, direction: "asc" });

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  return { sort, toggleSort };
}

// Sorts a copy of the rows; returns the original order when no column is
// active. null/undefined values always sort last, regardless of direction.
// Numbers compare numerically; everything else compares as text
// (numeric-aware, case-insensitive).
export function sortRows<T>(
  rows: T[],
  sort: Pick<SortState, "key" | "direction">,
  valueFor: (row: T) => string | number | null | undefined
): T[] {
  if (!sort.key) return rows;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = valueFor(a);
    const bv = valueFor(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    return cmp * dir;
  });
}
