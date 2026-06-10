export const metadata = { title: "Simulador — Opciones BYMA" };

export default function SimuladorPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
      <h1 className="text-2xl font-bold">🧮 Simulador de estrategias</h1>
      <p className="text-slate-600">
        Acá vas a poder armar posiciones multi-pata (calls, puts y acciones),
        ver el diagrama de payoff a vencimiento, la curva de P&L de hoy,
        breakevens y griegas — con sliders de escenario para precio, días al
        vencimiento y volatilidad implícita.
      </p>
      <p className="text-sm text-slate-400">
        En construcción — llega en el hito M1. El motor de cálculo
        (Black-Scholes, payoffs, griegas) ya está implementado y testeado en{" "}
        <code>packages/core</code>.
      </p>
    </div>
  );
}
