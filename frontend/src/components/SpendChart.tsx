import { useMemo, useState } from "react";
import { Card, Chip, Group, NativeSelect, Stack, Text } from "@mantine/core";
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
  { value: "all", label: "All time" },
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return { value: String(n), label: `Last ${n} year${n > 1 ? "s" : ""}` };
  }),
];

// Fixed viewBox; the SVG scales to the container width.
const W = 760;
const H = 300;
const MARGIN = { top: 16, right: 20, bottom: 34, left: 60 };
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
const MS_PER_MONTH = 30.44 * 24 * 3600 * 1000;

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

export default function SpendChart({ logs }: { logs: MaintenanceLog[] }) {
  const theme = useMantineTheme();
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    total: true,
    parts: true,
    labor: true,
  });
  const [range, setRange] = useState<string>("all");

  const colors: Record<SeriesKey, string> = {
    total: theme.colors.teal[6],
    parts: theme.colors.blue[6],
    labor: theme.colors.violet[6],
  };

  const toggle = (key: SeriesKey) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const data = useMemo<Point[]>(() => {
    const now = Date.now();
    const rows = [...logs]
      .map((l) => ({
        date: new Date(`${l.performed_on}T00:00:00`).getTime(),
        parts: l.cost != null ? Number(l.cost) : null,
        labor: l.labor_cost != null ? Number(l.labor_cost) : null,
      }))
      .sort((a, b) => a.date - b.date)
      .filter((r) =>
        range === "all" ? true : r.date >= now - Number(range) * MS_PER_YEAR
      );
    // Lines plot the SUM: each point is the cumulative spend up to that date.
    // Logs with a null cost/labor_cost do not produce a point on that series.
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
  }, [logs, range]);

  // X domain: fixed window for a selected range; otherwise span of the data.
  const { xStart, xEnd } = useMemo(() => {
    const now = Date.now();
    if (range !== "all") return { xStart: now - Number(range) * MS_PER_YEAR, xEnd: now };
    const first = data.length ? data[0].date : now - MS_PER_YEAR;
    return { xStart: Math.min(first, now - MS_PER_MONTH), xEnd: now };
  }, [data, range]);

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
              w={140}
              value={range}
              onChange={(e) => setRange(e.target.value)}
              data={RANGE_OPTIONS}
              aria-label="Time scale"
            />
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