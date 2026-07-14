---
titulo: "La volatilidad implícita en la cadena: leer el mapa de miedos del mercado"
modulo: "Módulo 03 — Valuación"
orden: 4
descripcion: "Cómo interpretar la columna IV de la cadena para detectar opciones caras, baratas, y el sentimiento del mercado."
fuentes:
  - "Natenberg, cap. 9 — Volatility revisited"
  - "Cohen, Guy. 'The Bible of Options Strategies', cap. 2"
---

## La cadena de opciones como mapa de IV

Cuando abrís `/cadena` y ves la columna **IV**, estás leyendo la volatilidad que el mercado "pide" en cada base. Cada celda es una respuesta a la pregunta: *¿a qué velocidad tiene que moverse GGAL para que esta prima tenga sentido?*

Un ejemplo de lo que podés ver:

| Base | Call IV | Put IV |
|---|---|---|
| $4.500 (ITM) | 68% | — |
| $4.800 (ITM) | 70% | — |
| **$5.000 (ATM)** | **72%** | **71%** |
| $5.300 (OTM) | 75% | — |
| $5.600 (OTM) | 78% | — |

Las IV no son iguales en todas las bases. Eso tiene nombre y consecuencias.

---

## El skew de volatilidad

En un mundo perfectamente BS, la IV debería ser igual en todas las bases para el mismo vencimiento (la fórmula usa σ como constante). En la práctica, no lo es. Esa asimetría se llama **skew** (sesgo).

### Por qué existe el skew

1. **Demanda de protección**: los inversores compran puts OTM para proteger su cartera. Esa demanda adicional sube el precio de los puts → sube su IV. En mercados desarrollados la curva de IV es pronunciada "hacia abajo" (los puts OTM muy baratos en delta son caros en IV).

2. **Asimetría de caídas**: los mercados caen más rápido de lo que suben. El modelo normal subestima los eventos de cola negativa.

3. **En BYMA**: el skew de puts casi no se ve porque los puts operan muy poco. La IV que calculamos en la cadena para puts puede ser irrelevante si el último precio tiene semanas. Los calls OTM sí muestran un leve skew creciente — el mercado le cobra más por los calls muy OTM porque en el mercado local un rally explosivo también es posible.

---

## Cómo detectar opciones "caras" y "baratas"

### Comparar VI con VH

Si la VI es 72% y la VH (30 días) es 55%:
- Las opciones están **caras** en términos históricos
- Los compradores pagan más de lo que el movimiento pasado justifica
- Los lanzadores están en terreno favorable

Si la VI es 60% y la VH es 80%:
- Las opciones están **baratas** — el mercado está subestimando la movida habitual del papel
- Puede ser oportunidad de compra (o señal de que el papel se calmó)

### La VI como termómetro del miedo

Cuando hay incertidumbre macro (resultado electoral inminente, fecha de vencimiento de deuda), la VI sube incluso si el papel no se movió. El mercado "paga" más por protección o apuesta. Después del evento, la VI colapsa — fenómeno conocido como "volatility crush" — y los compradores de opciones que se quedaron para el evento suelen perder por eso.

---

## Qué hacer con esta información

| Situación | Lectura | Estrategia posible |
|---|---|---|
| VI >> VH histórica | Opciones caras | Lanzar (cobrar la prima cara) |
| VI << VH histórica | Opciones baratas | Comprar (pagar poco por el movimiento) |
| VI sube pero el papel no | Evento esperado próximo | Precaución antes de vender |
| VI colapsa post-evento | Volatility crush | No comprar opciones justo antes de eventos |

---

## La IV en la cadena del proyecto

La columna IV en `/cadena` se calcula con `impliedVol()` de `packages/core`, que usa bisección sobre Black-Scholes con el **último precio operado**. Hay dos limitaciones importantes:

1. Si no hay transacciones recientes, el "último" es de días atrás y la IV calculada es histórica, no del mercado actual.
2. Para strikes con bid/ask pero sin último, la IV muestra `—`. Buscá en la columna de Bid y Ask para tener referencia del precio real.

Los contratos con buenos bid/ask (los que el snapshot captura en la columna "Con bid/ask") son los únicos donde la IV es confiable en tiempo real.

---

## Ejercicios

1. Abrí `/cadena` y observá la columna IV de los calls. ¿Hay un skew visible (IV crece al alejarse del ATM)? ¿En qué dirección?
2. Si la VI ATM de GGAL es 75% y la VH de los últimos 30 días es 50%, ¿qué le diría eso a alguien que está considerando comprar un call para apostar a una suba?
3. Describí en palabras qué pasa con tu posición si tenés 3 lotes de call base $5.300 comprados y a los 3 días el papel no se movió pero la VI cayó de 75% a 60%.
