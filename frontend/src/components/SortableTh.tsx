import { Table } from "@mantine/core";
import { IconArrowsSort, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import type { SortDirection } from "../hooks/useTableSort";

interface SortableThProps {
  label: string;
  sortKey: string;
  activeKey: string | null;
  direction: SortDirection;
  onSort: (key: string) => void;
}

// Clickable table header cell that toggles column sorting.
export default function SortableTh({ label, sortKey, activeKey, direction, onSort }: SortableThProps) {
  const active = activeKey === sortKey;
  const Icon = active ? (direction === "asc" ? IconChevronUp : IconChevronDown) : IconArrowsSort;

  return (
    <Table.Th>
      <button
        type="button"
        aria-label={`Sort by ${label}`}
        title={
          active
            ? `Sort ${direction === "asc" ? "descending" : "ascending"}`
            : `Sort ${label} ascending`
        }
        onClick={() => onSort(sortKey)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: 0,
          font: "inherit",
          color: "inherit",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        {label}
        <Icon size={14} style={{ opacity: active ? 1 : 0.5 }} />
      </button>
    </Table.Th>
  );
}
