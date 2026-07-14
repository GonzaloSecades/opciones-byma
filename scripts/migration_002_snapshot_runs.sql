-- Migration 002: tabla de registro de runs del snapshot
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Propósito: trackear el uso de la API de IOL para no superar el límite mensual de 25.000 calls.

CREATE TABLE IF NOT EXISTS public.snapshot_runs (
  id           BIGSERIAL PRIMARY KEY,
  ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  month        TEXT NOT NULL,           -- YYYY-MM, para agrupar por mes
  underlying   TEXT NOT NULL DEFAULT 'GGAL',
  calls_total  INTEGER NOT NULL,        -- calls IOL de este run
  contracts_total  INTEGER DEFAULT 0,  -- contratos parseados
  with_puntas  INTEGER DEFAULT 0,       -- contratos con bid/ask activo
  spot         NUMERIC(12,4),
  status       TEXT NOT NULL DEFAULT 'ok',  -- ok | aborted | error
  notes        TEXT
);

CREATE INDEX IF NOT EXISTS snapshot_runs_month_idx ON snapshot_runs(month, underlying);
CREATE INDEX IF NOT EXISTS snapshot_runs_ts_idx    ON snapshot_runs(ts DESC);

ALTER TABLE snapshot_runs ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para la página /monitor)
CREATE POLICY "public read" ON snapshot_runs
  FOR SELECT USING (true);

-- Escritura solo desde el script (service role key bypasses RLS)
