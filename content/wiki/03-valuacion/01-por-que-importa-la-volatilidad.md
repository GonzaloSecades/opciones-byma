---
titulo: "Por qué la volatilidad manda en el precio de una opción"
modulo: "Módulo 03 — Valuación"
orden: 1
descripcion: "La volatilidad histórica vs. implícita: cómo el mercado la precio y por qué Argentina es un mercado de primas altas."
fuentes:
  - "Natenberg, 'Option Volatility and Pricing', cap. 4"
  - "Hull, cap. 15 — The Black-Scholes-Merton model"
---

## El problema de valuar una opción

Ya sabés que la prima tiene dos partes: valor intrínseco y valor tiempo. El intrínseco es fácil de calcular (spot − base para un call ITM). El valor tiempo es el que le rompe la cabeza a todos.

¿Cuánto vale la *posibilidad* de que GGAL suba $800 antes del vencimiento? Depende de cuán probable sea ese movimiento. Y la probabilidad depende de **qué tanto se mueve el papel habitualmente** — es decir, su volatilidad.

---

## Volatilidad histórica: lo que el papel hizo

La **volatilidad histórica** (VH) mide la dispersión de los retornos diarios del papel en los últimos N días. Se expresa en forma anualizada.

Un ejemplo concreto con GGAL:

```
Retornos diarios últimos 30 días: 1.2%, -0.8%, 2.1%, -1.5%, 0.9%, …
Desvío estándar diario: ~1.4%
Anualizado (×√252): ~22%
```

Eso significa: si la VH es 22%, el modelo espera que en un año GGAL cotice dentro de un rango de ±22% con ~68% de probabilidad (1 desvío estándar).

### ¿Qué es "alta" volatilidad en Argentina?

En mercados desarrollados (S&P 500), una VH de 15-20% ya es normal en épocas calmas. En Argentina:

| Contexto | VH típica de GGAL |
|---|---|
| Período calmo, macro estable | 40-60% |
| Período electoral o macro inestable | 80-130% |
| Crisis / default / cepo | 150%+ |

Las primas argentinas son estructuralmente caras porque el papel genuinamente se mueve mucho. Cuando lanzás un call en BYMA y cobrás el 4-6% bimestral, es una compensación real por riesgo real.

---

## Volatilidad implícita: lo que el mercado cree que va a pasar

La **volatilidad implícita** (VI) funciona al revés. En lugar de calcular la VH a partir de los retornos históricos, tomás el precio al que se negocia la opción y despejás la volatilidad que "justifica" ese precio según Black-Scholes.

```
precio de mercado  →  Black-Scholes invertido  →  volatilidad implícita
```

La VI es un consenso de mercado en tiempo real. Si el call base 5.000 de junio cotiza a $350 con GGAL en $5.000 y 40 días al vencimiento, el modelo dice: "para que esa prima tenga sentido, el mercado está esperando una volatilidad del 72% anual".

### Por qué la VI importa más que la VH para el trader

Cuando comprás o vendés una opción, **pagás o cobrás la VI**, no la VH. Si la VI está en 85% pero vos estimás que la VH de ahora en más va a ser 60%, las opciones están "caras" — el mercado exige una prima mayor de la que el movimiento histórico justifica. Esa diferencia es donde está la ganancia o pérdida.

---

## El cono de volatilidad

Una forma de visualizarlo: imaginá un cono que se abre hacia adelante en el tiempo.

```
Precio
    |               /
    |              /  ← + 1σ (72% VI anualizada)
    |       ______/
    | ____5.000
    |       ______\
    |              \  ← − 1σ
    |               \
    ───────────────────────────────────── tiempo
    hoy            40 días      80 días
```

El cono representa la distribución esperada de precios según la VI. A mayor VI, más ancho el cono, más cara la opción.

En la cadena, la columna "IV" que muestra `/cadena` calcula la VI de cada strike a partir del último precio operado — es un mapa de qué volatilidad "está cobrando" el mercado en cada base.

---

## La sonrisa de volatilidad (y por qué en Argentina es rara)

En mercados desarrollados aparece la "sonrisa": las opciones muy OTM y muy ITM tienen mayor VI que las ATM. En Argentina es más difícil de observar porque los puts casi no operan. Si ves en la cadena que las VI de calls profundamente ITM son extrañas, probablemente el último precio está viejo y la IV calculada no refleja el mercado real.

---

## Ejercicios

1. GGAL tiene VH (30 días) de 68%. El call base $5.300 vto. 40 días cotiza a $180 con el papel en $5.000. Abrí el simulador (`/simulador`), ingresá esa posición y mové el slider de volatilidad hasta obtener prima $180. ¿Qué VI te da el modelo? ¿Está "caro" o "barato" respecto a la VH?
2. ¿Por qué en un año electoral la VI de GGAL sube incluso antes de la elección? ¿Qué fenómeno captura?
3. Si la VI de todos los calls de un vencimiento sube en forma pareja (digamos, de 65% a 80%), ¿cómo afecta eso al dueño de calls comprados? ¿Y al lanzador cubierto?
