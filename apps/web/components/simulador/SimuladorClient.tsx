"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  payoffAtExpiry,
  pnlToday,
  positionGreeks,
  breakevens as computeBreakevens,
  maxGainLoss,
  blackScholes,
  LOT_SIZE,
  type Leg,
  type OptionLeg,
  type Position,
} from "@opciones/core";
import { STRATEGIES } from "@opciones/core";
import type { ChainSnapshot, OptionContract } from "@opciones/data";
import { TriggerButton } from "@/components/TriggerButton";
import { PayoffChart } from "./PayoffChart";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  snapshot: ChainSnapshot;
  monthCodes: string[];
  snapshotTs: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysBetween(from: string, to: string) {
  return Math.max(
    0,
    Math.round(
      (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000,
    ),
  );
}

function fmt(n: number, dec = 0) {
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function fmtPnl(n: number) {
  const sign = n >= 0 ? "+" : "";
  return sign + fmt(Math.round(n));
}

function parseCapital(s: string) {
  return parseInt(s.replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
}

function formatCapital(s: string) {
  const digits = s.replace(/\D/g, "");
  const n = parseInt(digits, 10);
  return isNaN(n) ? "" : n.toLocaleString("es-AR");
}

/** Prima de mercado para una pata: ask para long, bid para short. */
function realPremium(
  contract: OptionContract | undefined,
  quoteMap: Map<string, { bid: number | null; ask: number | null; last: number | null }>,
  isLong: boolean,
  fallback: number,
): number {
  if (!contract) return fallback;
  const q = quoteMap.get(contract.ticker);
  const p = isLong ? (q?.ask ?? q?.last) : (q?.bid ?? q?.last);
  return p ?? fallback;
}

/** Contrato más cercano en strike para el tipo dado. */
function nearestContract(
  contracts: OptionContract[],
  type: "call" | "put",
  targetStrike: number,
): OptionContract | undefined {
  const filtered = contracts.filter((c) => c.optionType === type);
  if (!filtered.length) return undefined;
  return filtered.reduce((best, c) =>
    Math.abs(c.strike - targetStrike) < Math.abs(best.strike - targetStrike)
      ? c
      : best,
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-slate-800">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-slate-700"
      />
      <div className="flex justify-between text-xs text-slate-300">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function LegRow({
  leg,
  contracts,
  quoteMap,
  spot,
  onUpdate,
  onRemove,
}: {
  leg: Leg;
  contracts: OptionContract[];
  quoteMap: Map<string, { bid: number | null; ask: number | null; last: number | null }>;
  spot: number;
  onUpdate: (l: Leg) => void;
  onRemove: () => void;
}) {
  if (leg.kind === "stock") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <span className="w-6 text-base">📈</span>
        <span className="flex-1 text-sm font-medium text-slate-700">Acciones</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">Precio</span>
          <input
            type="number"
            value={leg.price}
            step={50}
            onChange={(e) =>
              onUpdate({ ...leg, price: Number(e.target.value) })
            }
            className="w-24 rounded border border-slate-200 px-2 py-0.5 text-right text-xs font-mono focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">Cant.</span>
          <input
            type="number"
            value={leg.shares}
            step={100}
            onChange={(e) =>
              onUpdate({ ...leg, shares: Number(e.target.value) })
            }
            className="w-20 rounded border border-slate-200 px-2 py-0.5 text-right text-xs font-mono focus:border-slate-400 focus:outline-none"
          />
        </div>
        <button onClick={onRemove} className="ml-1 text-slate-300 hover:text-red-400">
          ✕
        </button>
      </div>
    );
  }

  // Option leg
  const callContracts = contracts.filter((c) => c.optionType === "call");
  const putContracts = contracts.filter((c) => c.optionType === "put");
  const availableContracts = leg.type === "call" ? callContracts : putContracts;
  const isLong = leg.lots > 0;

  const handleTypeChange = (newType: "call" | "put") => {
    const filtered = contracts.filter((c) => c.optionType === newType);
    const nc = nearestContract(filtered, newType, leg.strike) ?? filtered[0];
    if (!nc) return;
    const prem = realPremium(nc, quoteMap, isLong, leg.premium);
    onUpdate({ ...leg, type: newType, strike: nc.strike, premium: prem });
  };

  const handleStrikeChange = (strikeStr: string) => {
    const strike = Number(strikeStr);
    const nc = availableContracts.find((c) => c.strike === strike);
    const prem = realPremium(nc, quoteMap, isLong, leg.premium);
    onUpdate({ ...leg, strike, premium: prem });
  };

  const handleLotsChange = (lotsStr: string) => {
    const lots = Number(lotsStr);
    if (lots === 0) return;
    const wasLong = leg.lots > 0;
    const nowLong = lots > 0;
    if (wasLong !== nowLong) {
      const nc = availableContracts.find((c) => c.strike === leg.strike);
      const prem = realPremium(nc, quoteMap, nowLong, leg.premium);
      onUpdate({ ...leg, lots, premium: prem });
    } else {
      onUpdate({ ...leg, lots });
    }
  };

  // Label for selected contract quote
  const selectedContract = availableContracts.find((c) => c.strike === leg.strike);
  const selectedQuote = selectedContract ? quoteMap.get(selectedContract.ticker) : null;
  const quoteLabel = selectedQuote
    ? `bid ${selectedQuote.bid != null ? `$${fmt(selectedQuote.bid, 0)}` : "—"} · ask ${selectedQuote.ask != null ? `$${fmt(selectedQuote.ask, 0)}` : "—"}`
    : null;

  const isCall = leg.type === "call";
  const isShort = leg.lots < 0;

  return (
    <div
      className={`space-y-1.5 rounded-lg border px-3 py-2.5 ${
        isCall ? "border-blue-100 bg-blue-50/30" : "border-rose-100 bg-rose-50/30"
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Call/Put toggle */}
        <div className="flex overflow-hidden rounded border border-slate-200 text-xs">
          <button
            onClick={() => handleTypeChange("call")}
            className={`px-2 py-0.5 transition-colors ${
              leg.type === "call"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Call
          </button>
          <button
            onClick={() => handleTypeChange("put")}
            className={`px-2 py-0.5 transition-colors ${
              leg.type === "put"
                ? "bg-rose-600 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Put
          </button>
        </div>

        {/* Long/Short badge */}
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            isShort
              ? "bg-orange-100 text-orange-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isShort ? "Lanzado" : "Comprado"}
        </span>

        <div className="flex-1" />
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 text-xs">
          ✕
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Strike selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">Base</span>
          <select
            value={leg.strike}
            onChange={(e) => handleStrikeChange(e.target.value)}
            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-mono focus:border-slate-400 focus:outline-none"
          >
            {availableContracts
              .sort((a, b) => a.strike - b.strike)
              .map((c) => {
                const q = quoteMap.get(c.ticker);
                const atm = Math.abs(c.strike - spot) < spot * 0.02;
                return (
                  <option key={c.strike} value={c.strike}>
                    ${fmt(c.strike, c.strike % 1 !== 0 ? 1 : 0)}
                    {atm ? " ◆" : ""}
                    {q?.bid ? ` b${fmt(q.bid, 0)}` : ""}
                    {q?.ask ? `/a${fmt(q.ask, 0)}` : ""}
                  </option>
                );
              })}
          </select>
        </div>

        {/* Lots */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">Lotes</span>
          <div className="flex items-center overflow-hidden rounded border border-slate-200">
            <button
              onClick={() => handleLotsChange(String(leg.lots - 1 === 0 ? -1 : leg.lots - 1))}
              className="px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
            >
              −
            </button>
            <input
              type="number"
              value={leg.lots}
              onChange={(e) => handleLotsChange(e.target.value)}
              className="w-10 bg-white px-1 py-0.5 text-center text-xs font-mono focus:outline-none"
            />
            <button
              onClick={() => handleLotsChange(String(leg.lots + 1 === 0 ? 1 : leg.lots + 1))}
              className="px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Premium */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">Prima</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-1.5 flex items-center text-xs text-slate-400">
              $
            </span>
            <input
              type="number"
              value={leg.premium}
              step={1}
              min={0}
              onChange={(e) =>
                onUpdate({ ...leg, premium: Number(e.target.value) })
              }
              className="w-20 rounded border border-slate-200 bg-white py-0.5 pr-1.5 pl-4 text-right text-xs font-mono focus:border-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quote hint */}
      {quoteLabel && (
        <p className="text-xs text-slate-400">{selectedContract?.ticker} · {quoteLabel}</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SimuladorClient({
  snapshot,
  monthCodes,
  snapshotTs,
}: Props) {
  const [monthCode, setMonthCode] = useState(monthCodes[0] ?? "");
  const [legs, setLegs] = useState<Leg[]>([]);
  const [capital, setCapital] = useState("");
  const [strategyId, setStrategyId] = useState<string | null>(null);

  const quoteMap = useMemo(
    () =>
      new Map(
        snapshot.quotes.map((q) => [
          q.ticker,
          { bid: q.bid, ask: q.ask, last: q.last },
        ]),
      ),
    [snapshot.quotes],
  );

  const contractsForMonth = useMemo(
    () => snapshot.contracts.filter((c) => c.monthCode === monthCode),
    [snapshot.contracts, monthCode],
  );

  const initialDte = useMemo(() => {
    const exp = contractsForMonth[0]?.expiration;
    return exp ? daysBetween(snapshot.date, exp) : 30;
  }, [contractsForMonth, snapshot.date]);

  const [scenarioSpot, setScenarioSpot] = useState(snapshot.spot);
  const [scenarioIv, setScenarioIv] = useState(0.72);
  const [scenarioDte, setScenarioDte] = useState(initialDte);
  const [scenarioRate, setScenarioRate] = useState(snapshot.rate);

  // Sync DTE slider when vencimiento changes
  useEffect(() => {
    setScenarioDte(initialDte);
  }, [initialDte]);

  // Load strategy with real data from snapshot
  const loadStrategy = useCallback(
    (id: string) => {
      const strategy = STRATEGIES.find((s) => s.id === id);
      if (!strategy) return;

      const templateLegs = strategy.build({
        spot: snapshot.spot,
        iv: scenarioIv,
        daysToExpiry: initialDte,
      });

      const realLegs: Leg[] = templateLegs.map((leg) => {
        if (leg.kind === "stock") {
          return { ...leg, price: snapshot.spot };
        }
        const nc = nearestContract(contractsForMonth, leg.type, leg.strike);
        const isLong = leg.lots > 0;
        const fallback = blackScholes({
          type: leg.type,
          spot: snapshot.spot,
          strike: leg.strike,
          timeToExpiry: initialDte / 365,
          rate: snapshot.rate,
          vol: scenarioIv,
        }).price;
        const prem = realPremium(nc, quoteMap, isLong, fallback);
        return {
          ...leg,
          strike: nc?.strike ?? leg.strike,
          premium: prem,
          iv: scenarioIv,
          daysToExpiry: initialDte,
        };
      });

      setLegs(realLegs);
      setStrategyId(id);
    },
    [snapshot, contractsForMonth, quoteMap, scenarioIv, initialDte],
  );

  // Position + scenario
  const position: Position = useMemo(
    () => ({ underlying: "GGAL", legs }),
    [legs],
  );

  const scenario = useMemo(
    () => ({
      spot: scenarioSpot,
      daysToExpiry: scenarioDte,
      rate: scenarioRate,
      iv: scenarioIv,
    }),
    [scenarioSpot, scenarioIv, scenarioDte, scenarioRate],
  );

  // Chart range: ±40% of entry spot
  const chartMin = snapshot.spot * 0.55;
  const chartMax = snapshot.spot * 1.45;

  // Payoff curve data
  const payoffData = useMemo(() => {
    if (!legs.length) return [];
    const steps = 150;
    const dx = (chartMax - chartMin) / steps;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const spot = chartMin + i * dx;
      return {
        spot: Math.round(spot),
        expiry: payoffAtExpiry(position, spot),
        today: pnlToday(position, { ...scenario, spot }),
      };
    });
  }, [position, scenario, chartMin, chartMax, legs.length]);

  const greeks = useMemo(
    () => (legs.length ? positionGreeks(position, scenario) : null),
    [position, scenario, legs.length],
  );

  const bkevens = useMemo(
    () =>
      legs.length
        ? computeBreakevens(position, { min: chartMin, max: chartMax })
        : [],
    [position, chartMin, chartMax, legs.length],
  );

  const { maxGain, maxLoss } = useMemo(
    () =>
      legs.length
        ? maxGainLoss(position, { min: chartMin, max: chartMax })
        : { maxGain: null, maxLoss: null },
    [position, chartMin, chartMax, legs.length],
  );

  const pnlExpiryAtScenario = useMemo(
    () => (legs.length ? payoffAtExpiry(position, scenarioSpot) : null),
    [position, scenarioSpot, legs.length],
  );

  const pnlTodayAtScenario = useMemo(
    () => (legs.length ? pnlToday(position, scenario) : null),
    [position, scenario, legs.length],
  );

  // Capital calculation
  const capitalNum = parseCapital(capital);
  const netDebit = useMemo(
    () =>
      legs.reduce((sum, leg) => {
        if (leg.kind === "stock") {
          return sum + (leg.shares > 0 ? leg.price * leg.shares : 0);
        }
        return sum + leg.premium * leg.lots * LOT_SIZE;
      }, 0),
    [legs],
  );
  const lotsWithCapital =
    netDebit > 0 && capitalNum > 0
      ? Math.floor(capitalNum / netDebit)
      : null;

  // Leg CRUD
  const updateLeg = (i: number, updated: Leg) => {
    setLegs((prev) => prev.map((l, idx) => (idx === i ? updated : l)));
    setStrategyId(null);
  };
  const removeLeg = (i: number) => {
    setLegs((prev) => prev.filter((_, idx) => idx !== i));
    setStrategyId(null);
  };
  const addOptionLeg = () => {
    const atmCall = contractsForMonth
      .filter((c) => c.optionType === "call")
      .reduce(
        (best, c) =>
          Math.abs(c.strike - snapshot.spot) <
          Math.abs(best.strike - snapshot.spot)
            ? c
            : best,
        contractsForMonth.find((c) => c.optionType === "call") ??
          ({ strike: snapshot.spot, ticker: "", optionType: "call" } as unknown as OptionContract),
      );
    const q = quoteMap.get(atmCall.ticker);
    const prem = q?.ask ?? q?.last ?? blackScholes({
      type: "call",
      spot: snapshot.spot,
      strike: atmCall.strike,
      timeToExpiry: initialDte / 365,
      rate: snapshot.rate,
      vol: scenarioIv,
    }).price;
    setLegs((prev) => [
      ...prev,
      {
        kind: "option",
        type: "call",
        strike: atmCall.strike,
        premium: prem,
        lots: 1,
        iv: scenarioIv,
        daysToExpiry: initialDte,
      },
    ]);
    setStrategyId(null);
  };
  const addStockLeg = () => {
    setLegs((prev) => [
      ...prev,
      { kind: "stock", price: snapshot.spot, shares: 100 },
    ]);
    setStrategyId(null);
  };
  const clearLegs = () => {
    setLegs([]);
    setStrategyId(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Simulador de estrategias</h1>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span>
              GGAL spot:{" "}
              <strong className="text-slate-900">${fmt(snapshot.spot)}</strong>
            </span>
            <span>
              Tasa:{" "}
              <strong className="text-slate-900">
                {(snapshot.rate * 100).toFixed(1)}%
              </strong>
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Snapshot: {snapshotTs}</span>
              <TriggerButton variant="compact" />
            </div>
          </div>
        </div>

        {/* Capital disponible */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">
            Capital disponible
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-slate-400">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={capital}
              onChange={(e) => setCapital(formatCapital(e.target.value))}
              placeholder="200.000"
              className="w-36 rounded-lg border border-slate-200 py-1.5 pr-3 pl-6 text-right text-sm font-mono focus:border-slate-400 focus:outline-none"
            />
          </div>
          {lotsWithCapital !== null && (
            <span className="whitespace-nowrap text-xs text-slate-500">
              → <strong className="text-slate-700">{lotsWithCapital} unidades</strong>
            </span>
          )}
          {netDebit <= 0 && capitalNum > 0 && legs.length > 0 && (
            <span className="text-xs text-slate-400">estrategia crediticia (margen)</span>
          )}
        </div>
      </div>

      {/* ── Strategy selector ─────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Estrategia
        </p>
        <div className="flex flex-wrap gap-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => loadStrategy(s.id)}
              title={s.descripcion}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                strategyId === s.id
                  ? "bg-slate-800 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {s.nombre}
            </button>
          ))}
          <button
            onClick={clearLegs}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              strategyId === null && legs.length === 0
                ? "border-slate-400 bg-slate-100 text-slate-600"
                : "border-dashed border-slate-300 text-slate-400 hover:border-slate-400"
            }`}
          >
            Limpiar
          </button>
        </div>
        {strategyId && strategyId !== null && (
          <p className="text-sm text-slate-500">
            {STRATEGIES.find((s) => s.id === strategyId)?.descripcion}
          </p>
        )}
      </div>

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT: legs + sliders */}
        <div className="space-y-5 lg:col-span-2">
          {/* Vencimiento */}
          {monthCodes.length > 1 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Vencimiento
              </p>
              <div className="flex gap-2">
                {monthCodes.map((code) => (
                  <button
                    key={code}
                    onClick={() => setMonthCode(code)}
                    className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                      code === monthCode
                        ? "bg-slate-800 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legs */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Posición ({legs.length} {legs.length === 1 ? "pata" : "patas"})
            </p>

            {legs.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                Elegí una estrategia o agregá patas manualmente
              </div>
            )}

            {legs.map((leg, i) => (
              <LegRow
                key={i}
                leg={leg}
                contracts={contractsForMonth}
                quoteMap={quoteMap}
                spot={snapshot.spot}
                onUpdate={(l) => updateLeg(i, l)}
                onRemove={() => removeLeg(i)}
              />
            ))}

            <div className="flex gap-2">
              <button
                onClick={addOptionLeg}
                className="flex-1 rounded border border-dashed border-blue-200 py-1.5 text-xs font-medium text-blue-600 hover:border-blue-400 hover:bg-blue-50"
              >
                + Opción
              </button>
              <button
                onClick={addStockLeg}
                className="flex-1 rounded border border-dashed border-slate-200 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-400 hover:bg-slate-50"
              >
                + Acciones
              </button>
            </div>
          </div>

          {/* Scenario sliders */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Escenario
            </p>
            <Slider
              label="Spot del subyacente"
              value={scenarioSpot}
              min={Math.round(snapshot.spot * 0.5 / 50) * 50}
              max={Math.round(snapshot.spot * 1.5 / 50) * 50}
              step={50}
              format={(v) => `$${fmt(v)}`}
              onChange={setScenarioSpot}
            />
            <Slider
              label="Volatilidad implícita"
              value={scenarioIv}
              min={0.1}
              max={2.0}
              step={0.01}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={setScenarioIv}
            />
            <Slider
              label="Días al vencimiento"
              value={scenarioDte}
              min={0}
              max={Math.max(initialDte, 60)}
              step={1}
              format={(v) => `${v}d`}
              onChange={setScenarioDte}
            />
            <Slider
              label="Tasa anual"
              value={scenarioRate}
              min={0.05}
              max={1.0}
              step={0.01}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={setScenarioRate}
            />
          </div>
        </div>

        {/* RIGHT: chart + stats + greeks */}
        <div className="space-y-5 lg:col-span-3">
          {/* Payoff chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {legs.length === 0 ? (
              <div className="flex h-56 items-center justify-center">
                <p className="text-sm text-slate-400">
                  Seleccioná una estrategia para ver el diagrama de P&L
                </p>
              </div>
            ) : (
              <PayoffChart
                data={payoffData}
                entrySpot={snapshot.spot}
                scenarioSpot={scenarioSpot}
                breakevens={bkevens}
              />
            )}
          </div>

          {/* P&L cards */}
          {legs.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "P&L ahora",
                  value: pnlTodayAtScenario,
                  sub: `spot $${fmt(scenarioSpot)}`,
                },
                {
                  label: "P&L a vto.",
                  value: pnlExpiryAtScenario,
                  sub: `spot $${fmt(scenarioSpot)}`,
                },
                {
                  label: "Máx ganancia",
                  value: maxGain,
                  sub: maxGain === null ? "ilimitada ↗" : undefined,
                },
                {
                  label: "Máx pérdida",
                  value: maxLoss,
                  sub: maxLoss === null ? "ilimitada ↘" : undefined,
                },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  {value !== null && value !== undefined ? (
                    <p
                      className={`text-lg font-bold ${value >= 0 ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {fmtPnl(value)}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-slate-400">
                      {sub ?? "—"}
                    </p>
                  )}
                  {sub && value !== null && (
                    <p className="text-xs text-slate-400">{sub}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Breakevens + capital row */}
          {legs.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">
                  Breakeven{bkevens.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {bkevens.length === 0
                    ? "—"
                    : bkevens
                        .map((b) => `$${fmt(Math.round(b / 50) * 50)}`)
                        .join(" · ")}
                </p>
              </div>

              {capitalNum > 0 && netDebit > 0 && (
                <div>
                  <p className="text-xs text-slate-500">
                    Con ${fmt(capitalNum)}
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {lotsWithCapital} unidad
                    {lotsWithCapital !== 1 ? "es" : ""}
                    <span className="ml-1 font-normal text-slate-400">
                      (${fmt(lotsWithCapital! * netDebit)} invertidos)
                    </span>
                  </p>
                </div>
              )}

              {capitalNum > 0 && netDebit > 0 && lotsWithCapital !== null && (
                <div>
                  <p className="text-xs text-slate-500">P&L máx con ese capital</p>
                  <p className="text-sm font-semibold">
                    {maxGain !== null ? (
                      <span className="text-emerald-700">
                        +${fmt(maxGain * lotsWithCapital)}
                      </span>
                    ) : (
                      <span className="text-slate-400">ilimitado</span>
                    )}
                    {" · "}
                    {maxLoss !== null ? (
                      <span className="text-red-600">
                        −${fmt(Math.abs(maxLoss) * lotsWithCapital)}
                      </span>
                    ) : (
                      <span className="text-slate-400">ilimitado</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Greeks */}
          {greeks && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Griegas de la posición
              </p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  {
                    label: "Δ Delta",
                    value: greeks.delta,
                    fmtFn: (v: number) => v.toFixed(1),
                    hint: "por $1 en spot",
                  },
                  {
                    label: "Γ Gamma",
                    value: greeks.gamma,
                    fmtFn: (v: number) => v.toFixed(4),
                    hint: "velocidad del Δ",
                  },
                  {
                    label: "Θ Theta",
                    value: greeks.theta,
                    fmtFn: (v: number) =>
                      (v >= 0 ? "+" : "") + fmt(Math.round(v)),
                    hint: "$/día",
                  },
                  {
                    label: "ν Vega",
                    value: greeks.vega,
                    fmtFn: (v: number) =>
                      (v >= 0 ? "+" : "") + fmt(Math.round(v)),
                    hint: "$/+1% vol",
                  },
                  {
                    label: "ρ Rho",
                    value: greeks.rho,
                    fmtFn: (v: number) =>
                      (v >= 0 ? "+" : "") + fmt(Math.round(v)),
                    hint: "$/+1% tasa",
                  },
                ].map(({ label, value, fmtFn, hint }) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-2">
                    <div className="text-xs font-medium text-slate-500">
                      {label}
                    </div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        value > 0
                          ? "text-emerald-700"
                          : value < 0
                            ? "text-red-600"
                            : "text-slate-500"
                      }`}
                    >
                      {fmtFn(value)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{hint}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
