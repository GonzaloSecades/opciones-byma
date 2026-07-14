---
titulo: "Black-Scholes: qué calcula y cómo usarlo sin las ecuaciones"
modulo: "Módulo 03 — Valuación"
orden: 2
descripcion: "La fórmula que priceas el mundo en 5 inputs. Intuición práctica sin derivadas."
fuentes:
  - "Hull, cap. 15"
  - "Black, F. & Scholes, M. (1973). 'The Pricing of Options and Corporate Liabilities'"
  - "Natenberg, cap. 6"
---

## El modelo en una línea

Black-Scholes (BS) toma cinco datos y devuelve un precio "justo" para la opción:

| Input | Símbolo | Ejemplo GGAL |
|---|---|---|
| Precio del subyacente | S | $5.000 |
| Precio de ejercicio (base) | K | $5.300 |
| Tiempo al vencimiento (en años) | T | 40/365 = 0,110 |
| Tasa libre de riesgo anual | r | 35% (equivalente continuo) |
| Volatilidad implícita anual | σ (sigma) | 72% |

Con esos cinco números, BS produce:

```
prima del call  =  S·N(d₁)  −  K·e^(−rT)·N(d₂)
```

No necesitás memorizarla. Lo que sí necesitás entender es qué captura cada factor.

---

## Qué hace cada input

### Spot (S) y base (K)

La relación S/K determina el moneyness: cuán ITM o OTM está la opción. Si S sube, el call vale más (N(d₁) crece).

### Tiempo (T)

Más tiempo = más prima. A medida que pasa el tiempo y T se achica, la prima decae. Ese decaimiento es **theta** y lo vemos en la próxima lección.

### Tasa (r)

Encarece los calls y abarata los puts. En Argentina con tasas del 35-80% anual, la tasa impacta materialmente en la valuación. Un call de 60 días con tasa 40% tiene una prima notablemente mayor que el mismo call en un mercado con tasa 5%.

La razón: comprar el call y poner el capital restante en renta fija le gana al que compra el papel directamente. Ese arbitraje se refleja en el precio del call.

### Volatilidad (σ)

El factor dominante en el valor tiempo. Doblá la volatilidad y la prima casi se duplica. Es el único input que no se observa directamente — se estima o se lee del mercado como VI.

---

## El modelo es una distribución normal (y eso es una limitación)

BS asume que los retornos del subyacente siguen una distribución normal (técnicamente log-normal). En la realidad, los mercados tienen "colas gordas" — los eventos extremos ocurren más seguido de lo que predice la campana de Gauss.

En Argentina esto es especialmente relevante: devaluaciones, defaults y cepos son eventos discretos que el modelo no captura bien. Por eso:

- Las opciones muy OTM pueden cotizar con VI más alta de lo que BS "pide" — el mercado le pone un sobreprecio al riesgo de tail.
- En el lanzamiento cubierto, la prima recibida no cubre escenarios de colapso.

---

## Cómo usar BS sin calcular a mano

En el proyecto hay dos formas:

**1. `packages/core` → `blackScholes()`**

```ts
import { blackScholes } from "@opciones/core";

const prima = blackScholes({
  spot: 5000,
  strike: 5300,
  timeToExpiry: 40 / 365,
  rate: 0.35,
  volatility: 0.72,
  type: "call",
});
// → ~$185
```

**2. El simulador (`/simulador`)**

Ingresás los legs manualmente y los sliders de spot y volatilidad recalculan el payoff en tiempo real usando la misma función.

---

## Opciones americanas y el ajuste local

BS estricto es para opciones europeas (solo ejercibles al vencimiento). Las opciones de BYMA son **americanas** — se pueden ejercer en cualquier momento antes del vencimiento.

Para calls sobre acciones sin dividendos, no ejercer temprano es (casi siempre) óptimo — el valor tiempo que perdés al ejercer vale más que el intrínseco que capturás. Por eso BS sigue siendo una buena aproximación para los calls de GGAL en la práctica.

Donde sí importa el ejercicio temprano es en los puts: con tasas muy altas, un put profundo ITM puede convenir ejercer antes para cobrar la base y ponerla en renta fija. El modelo de precio correcto en ese caso es binomial o Barone-Adesi-Whaley, no BS puro.

---

## Ejercicios

1. Usá `packages/core` o el simulador para calcular la prima del call base $4.800 de GGAL con spot $5.000, tasa 35%, volatilidad 68% y 40 días. ¿Cuánto es intrínseco y cuánto valor tiempo?
2. Manteniendo todo igual, variá solo la tasa: calculá la prima con 10%, 35% y 60%. ¿Cómo afecta la tasa a un call OTM (sin intrínseco)?
3. ¿Por qué un put americano muy ITM podría ejercerse temprano en Argentina pero raramente en EE.UU.?
