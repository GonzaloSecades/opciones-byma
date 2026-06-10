export const metadata = { title: "Backtest — Opciones BYMA" };

export default function BacktestPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
      <h1 className="text-2xl font-bold">⏪ Backtesting de estrategias</h1>
      <p className="text-slate-600">
        Definí una estrategia (entrada, salida, rolls) y corrla contra
        snapshots históricos del mercado para medir P&L, drawdown y win rate.
      </p>
      <p className="text-sm text-slate-400">
        En construcción — llega en el hito M3, una vez que el script de
        snapshots haya acumulado historia de datos reales.
      </p>
    </div>
  );
}
