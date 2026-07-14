---
titulo: "Flujo completo de una operación en BYMA"
modulo: "Módulo 05 — Operatoria"
orden: 1
descripcion: "Desde la idea hasta la ejecución: cómo se ingresa, gestiona y cierra una operación con opciones en el mercado argentino."
fuentes:
  - "BYMA — Manual operativo de opciones"
  - "IAMC — Cuadernos operativos"
---

## El flujo en 5 pasos

### 1. Definir la tesis

Antes de abrir la cadena, la pregunta es: *¿qué esperás que haga el papel y en qué plazo?*

| Escenario | Estrategia candidata |
|---|---|
| Sube moderadamente | Comprar call OTM cercano / Bull call spread |
| Sube explosivamente | Comprar call OTM / Straddle |
| Se queda quieto o sube poco | Lanzamiento cubierto (si tenés el papel) |
| Baja moderadamente | Bear put spread / Put protector |
| Movimiento fuerte, cualquier dirección | Straddle comprado |

### 2. Leer la cadena

Abrís `/cadena` y revisás para el vencimiento objetivo:
- **Spot**: ¿dónde está el papel ahora?
- **IV ATM**: ¿qué volatilidad implica el mercado?
- **Bid/Ask de los contratos que te interesan**: ¿hay liquidez real?
- **Volumen**: ¿alguien operó esto hoy?

Un contrato sin bid o con spread bid-ask mayor al 20% de la prima es prácticamente inoperable a precios razonables.

### 3. Estimar el payoff

Usás el simulador (`/simulador`) para armar la posición y revisar:
- Breakeven: ¿cuánto tiene que moverse el papel para no perder?
- Ganancia máxima y escenario en que ocurre
- Pérdida máxima y escenario en que ocurre
- DTE (días al vencimiento): ¿el theta trabaja a favor o en contra?

### 4. Ejecutar

En tu homebroker (Invertir Online, PPI, Bull Market, etc.):

- Seleccionás el ticker completo (ej: `GFGC5300JU`)
- Ingresás **precio límite** — nunca orden "al mercado" en opciones con spreads amplios
- Revisás el contrato (base, tipo, vencimiento) antes de confirmar

El tamaño mínimo es **1 lote = 100 acciones**. Para lanzar (vender) opciones en descubierto necesitás garantías previas.

### 5. Gestionar y cerrar

La posición no siempre se lleva al vencimiento. Las opciones se pueden:
- **Comprar de vuelta** para cerrar un lanzamiento antes de que el papel se acerque a la base.
- **Vender** para tomar ganancia antes del vencimiento (cuando la prima subió).
- **Rodar** (roll): recomprar la posición actual y abrir en el siguiente vencimiento o en una base diferente.

---

## El ciclo bimestral de BYMA

Los vencimientos son el **tercer viernes** de cada mes del ciclo bimestral: **FE, AB, JU, AG, OC, DI**.

```
Ene   Feb   Mar   Abr   May   Jun   Jul   Ago   Sep   Oct   Nov   Dic
       FE         AB          JU          AG          OC          DI
```

En cualquier momento hay típicamente 2 o 3 vencimientos con liquidez. El más próximo tiene el mayor volumen; el siguiente tiene suficiente para entrar y salir.

---

## Garantías para el lanzador

Cuando lanzás opciones (vendés) necesitás garantizar que podés cumplir la obligación:

- **Lanzamiento cubierto**: las acciones son la garantía (se bloquean en custodia).
- **Lanzamiento descubierto**: el broker exige garantías en efectivo o bonos equivalentes al delta de la posición × spot × factor de garantía.

Las garantías se calculan diariamente según el precio de las opciones. Si el papel se mueve en tu contra y la posición crece, podés recibir un **margin call** para depositar más garantías.

En IOL el margen mínimo para opciones es aproximadamente el **15-20% del valor del subyacente** cubierto. Chequeá con tu broker antes de lanzar.

---

## Los costos de operar

| Concepto | Referencia |
|---|---|
| Comisión broker | 0,25%-0,50% del monto operado (varía por broker) |
| Derechos de mercado | Fijo por operación (BYMA + MAE + COELSA) |
| Impuesto a las Ganancias | 15% sobre la ganancia neta para PF residentes |
| Sellos / IVA | Variable según provincia y tipo de operación |

Para un lote de call a $200 de prima ($20.000 de prima) la comisión suele ser $50-$100. Para spreads (dos patas) multiplicá por 2.

---

## Errores más comunes del principiante

1. **Entrada "al mercado" en opciones ilíquidas**: terminás pagando el ask o cobrando el bid. Siempre precio límite.
2. **Lanzar descubierto sin entender las garantías**: si el papel explota y no tenés efectivo para el margin call, el broker cierra la posición forzado.
3. **Olvidar el theta**: comprar opciones 3 semanas antes de una fecha que esperás que nunca llega. El tiempo destroza el valor.
4. **Confundir el ticker**: `GFGC5300JU` ≠ `GFGC5300AG`. Revisá el vencimiento antes de confirmar.
5. **No verificar el vencimiento en el calendario**: el vencimiento no siempre es el viernes que parece. El BYMA publica el calendario oficial.

---

## Ejercicios

1. Elegí una estrategia de la lista del paso 1 y ejecutala en papel: definí la tesis, leé la cadena en `/cadena`, armá la posición en `/simulador` y documentá: breakeven, pérdida máxima, ganancia máxima.
2. ¿Por qué las órdenes "al mercado" son especialmente peligrosas en opciones con spreads amplios?
3. Calculá el costo total de un bull call spread de 2 lotes (spread de $300 sobre base) incluyendo comisiones del 0,35% por pata.
