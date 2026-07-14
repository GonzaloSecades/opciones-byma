"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";

interface DataPoint {
  spot: number;
  expiry: number;
  today: number;
}

interface Props {
  data: DataPoint[];
  entrySpot: number;
  scenarioSpot: number;
  breakevens: number[];
}

function fmtSpot(v: number) {
  return `$${(v / 1000).toFixed(1)}k`;
}

function fmtPnl(v: number) {
  if (v === undefined || v === null) return "";
  const abs = Math.abs(v);
  const sign = v >= 0 ? "+" : "-";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

// Ticks every 500 pesos
function computeXTicks(min: number, max: number): number[] {
  const step = Math.ceil((max - min) / 8 / 500) * 500;
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max; v += step) ticks.push(v);
  return ticks;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-slate-600">
        Spot: ${Number(label).toLocaleString("es-AR")}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name === "expiry" ? "A vencimiento" : "Hoy (BS)"}: {fmtPnl(p.value)}
        </p>
      ))}
    </div>
  );
}

export function PayoffChart({ data, entrySpot, scenarioSpot, breakevens }: Props) {
  if (!data.length) return null;

  const allY = data.flatMap((d) => [d.expiry, d.today]);
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  const yPad = (yMax - yMin) * 0.1 || 5000;
  const domainMin = yMin - yPad;
  const domainMax = yMax + yPad;

  const xMin = data[0].spot;
  const xMax = data[data.length - 1].spot;
  const xTicks = computeXTicks(xMin, xMax);

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Diagrama de P&L
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="spot"
            type="number"
            domain={[xMin, xMax]}
            ticks={xTicks}
            tickFormatter={fmtSpot}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtPnl}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[domainMin, domainMax]}
            width={52}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Zero line */}
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />

          {/* Entry spot: solid grey */}
          <ReferenceLine
            x={entrySpot}
            stroke="#64748b"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            label={{ value: "entrada", position: "top", fontSize: 9, fill: "#64748b" }}
          />

          {/* Scenario spot: orange (moves with slider) */}
          {scenarioSpot !== entrySpot && (
            <ReferenceLine
              x={scenarioSpot}
              stroke="#f97316"
              strokeWidth={1.5}
              label={{ value: "escenario", position: "top", fontSize: 9, fill: "#f97316" }}
            />
          )}

          {/* Breakevens: green dashed */}
          {breakevens.map((be, i) => (
            <ReferenceLine
              key={i}
              x={Math.round(be)}
              stroke="#10b981"
              strokeWidth={1}
              strokeDasharray="3 3"
              label={{ value: `BE $${Math.round(be / 100) * 100}`, position: "insideTop", fontSize: 8, fill: "#10b981" }}
            />
          ))}

          <Line
            type="monotone"
            dataKey="expiry"
            name="expiry"
            stroke="#1e40af"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="today"
            name="today"
            stroke="#7c3aed"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            isAnimationActive={false}
          />

          <Legend
            formatter={(v) => (v === "expiry" ? "A vencimiento" : "Hoy (BS)")}
            wrapperStyle={{ fontSize: 11 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
