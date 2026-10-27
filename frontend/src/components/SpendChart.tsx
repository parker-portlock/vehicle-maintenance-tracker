import { useMemo, useState } from "react";
import { Card, Chip, Group, NativeSelect, Stack, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMantineTheme } from "@mantine/core";
import type { MaintenanceLog } from "../api/types";

type SeriesKey = "total" | "parts" | "labor";
type MantineColor = "teal" | "blue" | "violet";

// Series definition: order, labels, and the Mantine color of each line.
// These must stay in sync with the spend badges in VehicleDetail (Total=teal, Parts=blue, Labor=violet).
const SERIES: { key: SeriesKey; label: string; color: MantineColor }[] = [
  { key: "total", label: "Total", color: "teal" },
  { key: "parts", label: "Parts", color: "blue" },
  { key: "labor", label: "Labor", color: "violet" },
];

const RANGE_OPTIONS = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 180 days" },
  { value: "365", label: "Last year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

// Fixed viewBox; the SVG scales to the container width.
const W = 760;
const H = 300;
const MARGIN = { top: 16, right: 20, bottom: 34, left: 60 };
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
const MS_PER_MONTH = 30.44 * 24 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;

interface Point {
  date: number;
  // null means no value was recorded for that series, so no point is plotted
  total: number | null;
  parts: number | null;
  labor: number | null;
}

// Round up to 1/2/5 * 10^n so axis maxima stay readable.
function niceCeil(v: number): number {
  if (v <= 0) return 100;
  const base = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / base;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * base;
}

function fmtMoney(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return `$${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `$${Math.round(v)}`;
}

function fmtTick(d: Date): string {
  return `${d.toLocaleDateString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
}

export default function SpendChart({
  logs,
  getPartsCost,
}: {
  logs: MaintenanceLog[];
  // Returns a log's inventory parts cost (sum of used parts' inventory cost × quantity).
  // Defaults to 0, so charts keep working with plain additional-parts-cost only.
  getPartsCost?: (log: MaintenanceLog) => number;
}) {
  const theme = useMantineTheme();
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    total: true,
    parts: true,
    labor: true,
  });
  const [range, setRange] = useState<string>("all");
  // Custom start/end dates, used when range === "custom"
  const [customRange, setCustomRange] = useState<[Date | null, Date | null]>([null, null]);

  const colors: Record<SeriesKey, string> = {
    total: theme.colors.teal[6],
    parts: theme.colors.blue[6],
    labor: theme.colors.violet[6],
  };

  const toggle = (key: SeriesKey) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  // Time window: preset (last N days), all time, or a custom start/end range
  const windowRange = useMemo(() => {
    const now = Date.now();
    const firstLog = logs.length
      ? Math.min(...logs.map((l) => new Date(`${l.performed_on}T00:00:00`).getTime()))
      : now - MS_PER_MONTH;
    if (range === "all") {
      return { start: Math.min(firstLog, now - MS_PER_MONTH), end: now };
    }
    if (range === "custom") {
      const start = customRange[0]
        ? customRange[0].getTime()
        : Math.min(firstLog, now - MS_PER_YEAR);
      const endD = new Date(customRange[1] ? customRange[1].getTime() : now);
      endD.setHours(23, 59, 59, 999);
      return { start, end: endD.getTime() };
    }
    return { start: now - Number(range) * DAY_MS, end: now };
  }, [range, customRange, logs]);

  const data = useMemo<Point[]>(() => {
    const rows = [...logs]
      .map((l) => {
        // Parts spend = inventory parts cost (from the parts used) + additional parts cost
        const inventoryPartsCost = getPartsCost ? getPartsCost(l) : 0;
        const hasParts = inventoryPartsCost > 0 || l.cost != null;
        return {
          date: new Date(`${l.performed_on}T00:00:00`).getTime(),
          parts: hasParts
            ? inventoryPartsCost + (l.cost != null ? Number(l.cost) : 0)
            : null,
          labor: l.labor_cost != null ? Number(l.labor_cost) : null,
        };
      })
      .sort((a, b) => a.date - b.date)
      .filter(
        (r) => r.date >= windowRange.start && r.date <= windowRange.end
      );
    // Lines plot the SUM: each point is the cumulative spend up to that date.
    // Logs with no parts cost (or a null additional parts cost) do not produce a point on the parts series.
    let partsSum = 0;
    let laborSum = 0;
    return rows.map((r) => {
      const hasParts = r.parts != null;
      const hasLabor = r.labor != null;
      if (hasParts) partsSum += r.parts as number;
      if (hasLabor) laborSum += r.labor as number;
      return {
        date: r.date,
        parts: hasParts ? partsSum : null,
        labor: hasLabor ? laborSum : null,
        total: hasParts || hasLabor ? partsSum + laborSum : null,
      };
    });
  }, [logs, windowRange, getPartsCost]);

  const { start: xStart, end: xEnd } = windowRange;

  // Y domain: 0..nice(max of visible series)
  const yMax = useMemo(() => {
    let max = 0;
    for (const p of data) {
      if (visible.total && p.total != null) max = Math.max(max, p.total);
      if (visible.parts && p.parts != null) max = Math.max(max, p.parts);
      if (visible.labor && p.labor != null) max = Math.max(max, p.labor);
    }
    return niceCeil(max);
  }, [data, visible]);

  const x = (ms: number) =>
    MARGIN.left + ((ms - xStart) / (xEnd - xStart)) * (W - MARGIN.left - MARGIN.right);
  const y = (v: number) => MARGIN.top + (1 - v / yMax) * (H - MARGIN.top - MARGIN.bottom);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);

  const xTicks = useMemo(() => {
    const spanMonths = (xEnd - xStart) / MS_PER_MONTH;
    const step =
      spanMonths <= 12 ? 1 : spanMonths <= 24 ? 2 : spanMonths <= 48 ? 3 : spanMonths <= 96 ? 6 : 12;
    const ticks: Date[] = [];
    let d = new Date(xStart);
    d = new Date(d.getFullYear(), d.getMonth(), 1);
    if (d.getTime() < xStart) d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    while (d.getTime() <= xEnd) {
      ticks.push(d);
      d = new Date(d.getFullYear(), d.getMonth() + step, 1);
    }
    return ticks;
  }, [xStart, xEnd]);

  const axisColor = theme.colors.gray[4];
  const hasPoints = data.some(
    (p) => p.total != null || p.parts != null || p.labor != null
  );

  return (
    <Card withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Text fw={700}>Spending Trends</Text>
          <Group gap="xs" align="center" wrap="wrap">
            {SERIES.map((s) => (
              <Chip
                key={s.key}
                color={s.color}
                variant={visible[s.key] ? "filled" : "light"}
                checked={visible[s.key]}
                onChange={() => toggle(s.key)}
                aria-label={`Toggle ${s.label} line`}
              >
                {s.label}
              </Chip>
            ))}
            <Text size="sm" c="dimmed">Time scale</Text>
            <NativeSelect
              w={150}
              value={range}
              onChange={(e) => {
                const v = e.target.value;
                setRange(v);
                if (v === "custom" && (!customRange[0] || !customRange[1])) {
                  const first = logs.length
                    ? new Date(
                        Math.min(
                          ...logs.map((l) => new Date(`${l.performed_on}T00:00:00`).getTime())
                        )
                      )
                    : new Date(Date.now() - MS_PER_YEAR);
                  setCustomRange([first, new Date()]);
                }
              }}
              data={RANGE_OPTIONS}
              aria-label="Time scale"
            />
            {range === "custom" && (
              <DatePickerInput
                type="range"
                label="Custom range"
                value={customRange}
                onChange={(v) => setCustomRange(v as [Date | null, Date | null])}
                clearable={false}
              />
            )}
          </Group>
        </Group>

        {!hasPoints ? (
          <Text c="dimmed" ta="center" py="xl">
            No spending in this time range
          </Text>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Cumulative spending over time line chart">
            {/* Horizontal grid + Y tick labels */}
            {yTicks.map((v) => (
              <g key={v}>
                <line
                  x1={MARGIN.left}
                  x2={W - MARGIN.right}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={axisColor}
                  strokeDasharray={v === 0 ? undefined : "4 4"}
                  opacity={v === 0 ? 1 : 0.5}
                />
                <text
                  x={MARGIN.left - 8}
                  y={y(v) + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill={theme.colors.gray[7]}
                >
                  {fmtMoney(v)}
                </text>
              </g>
            ))}

            {/* X tick labels */}
            {xTicks.map((d) => (
              <text
                key={d.getTime()}
                x={x(d.getTime())}
                y={H - MARGIN.bottom + 18}
                textAnchor="middle"
                fontSize={12}
                fill={theme.colors.gray[7]}
              >
                {fmtTick(d)}
              </text>
            ))}

            {/* Series fills, lines + points (null series values are not plotted) */}
            {SERIES.filter((s) => visible[s.key]).map((s) => {
              const pts = data
                .filter((p) => p[s.key] != null)
                .map((p) => ({ cx: x(p.date), cy: y(p[s.key] as number) }));
              const baseline = y(0);
              return (
                <g key={s.key}>
                  {pts.length > 1 && (
                    <>
                      <path
                        d={`M ${pts[0].cx} ${baseline} L ${pts
                          .map((p) => `${p.cx} ${p.cy}`)
                          .join(" L ")} L ${pts[pts.length - 1].cx} ${baseline} Z`}
                        fill={colors[s.key]}
                        opacity={0.12}
                      />
                      <polyline
                        points={pts.map((p) => `${p.cx},${p.cy}`).join(" ")}
                        fill="none"
                        stroke={colors[s.key]}
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                  {pts.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.cx}
                      cy={p.cy}
                      r={3.5}
                      fill="#fff"
                      stroke={colors[s.key]}
                      strokeWidth={2}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        )}
      </Stack>
    </Card>
  );
}