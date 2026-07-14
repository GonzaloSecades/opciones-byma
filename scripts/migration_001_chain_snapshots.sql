-- Migration 001: chain_snapshots
-- Ejecutar en: Supabase → SQL Editor
-- Propósito: almacenar snapshots de la cadena de opciones de BYMA
--
-- Estructura JSONB sigue el schema de packages/data/src/schema.ts:
--   contracts: OptionContract[]  → { ticker, underlying, optionType, strike, expiration, monthCode, lotSize }
--   quotes:    OptionQuote[]     → { ticker, ts, bid, ask, last, volume, openInterest }

-- =============================================================================
-- TABLA
-- =============================================================================
CREATE TABLE public.chain_snapshots (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  underlying    text        NOT NULL,           -- ej. "GGAL"
  snapshot_date date        NOT NULL,           -- ej. 2026-06-10  (columna propia para filtrar por fecha sin timezone math)
  ts            timestamptz NOT NULL,           -- timestamp exacto del snapshot (con zona horaria)
  spot          numeric(12, 2) NOT NULL,        -- precio del subyacente al momento del snapshot
  rate          numeric(8, 6) NOT NULL,         -- tasa libre de riesgo anualizada (decimal, ej. 0.199)
  contracts     jsonb       NOT NULL DEFAULT '[]', -- array de OptionContract
  quotes        jsonb       NOT NULL DEFAULT '[]', -- array de OptionQuote
  created_at    timestamptz DEFAULT now(),

  CONSTRAINT unique_underlying_ts UNIQUE (underlying, ts)
);

COMMENT ON TABLE  public.chain_snapshots                IS 'Snapshots periódicos de la cadena de opciones de BYMA';
COMMENT ON COLUMN public.chain_snapshots.underlying     IS 'Ticker del subyacente: GGAL, YPFD, PAMP, ...';
COMMENT ON COLUMN public.chain_snapshots.snapshot_date  IS 'Fecha local Argentina del snapshot (para agrupar intradía)';
COMMENT ON COLUMN public.chain_snapshots.ts             IS 'Timestamp exacto del momento de captura';
COMMENT ON COLUMN public.chain_snapshots.rate           IS 'Tasa libre de riesgo usada para valuación (decimal anualizado)';
COMMENT ON COLUMN public.chain_snapshots.contracts      IS 'Contratos listados: ticker, tipo, strike, vencimiento, lotSize';
COMMENT ON COLUMN public.chain_snapshots.quotes         IS 'Cotizaciones: bid, ask, last, volumen por contrato';

-- =============================================================================
-- ÍNDICES
-- =============================================================================

-- Consultas más frecuentes: "los N últimos snapshots de GGAL"
CREATE INDEX idx_chain_snapshots_underlying_ts
  ON public.chain_snapshots (underlying, ts DESC);

-- Consultas por fecha: "todos los snapshots de GGAL del día X"
CREATE INDEX idx_chain_snapshots_underlying_date
  ON public.chain_snapshots (underlying, snapshot_date DESC);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.chain_snapshots ENABLE ROW LEVEL SECURITY;

-- Lectura pública: los datos de mercado son información pública
CREATE POLICY "chain_snapshots_public_read"
  ON public.chain_snapshots
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Escritura: solo desde el snapshot script con SERVICE_ROLE_KEY (bypasses RLS)
-- No se crean políticas de INSERT/UPDATE/DELETE para anon/authenticated a propósito.

-- =============================================================================
-- REALTIME (para el hook useChainRealtime en la web)
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.chain_snapshots;
