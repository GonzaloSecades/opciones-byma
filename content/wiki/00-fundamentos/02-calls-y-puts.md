---
titulo: "Calls y puts: las cuatro operaciones básicas"
modulo: "Módulo 00 — Fundamentos"
orden: 2
descripcion: "Comprar/lanzar calls y puts, y qué espera del mercado cada una."
fuentes:
  - "Hull, 'Options, Futures, and Other Derivatives', cap. 9 (Properties of Stock Options)"
  - "BYMA — Manual de opciones sobre acciones"
---

## Dos contratos, cuatro posiciones

Hay solo dos tipos de opción:

- **Call (opción de compra)**: derecho a **comprar** el subyacente a la base.
- **Put (opción de venta)**: derecho a **vender** el subyacente a la base.

Y cada una se puede comprar o lanzar. Eso da exactamente cuatro posiciones básicas:

| Posición | Pagás/cobrás prima | Qué esperás del papel | Pérdida máxima | Ganancia máxima |
|---|---|---|---|---|
| **Compra de call** | pagás | que suba fuerte | la prima | ilimitada |
| **Lanzamiento de call** | cobrás | que no suba | ilimitada* | la prima |
| **Compra de put** | pagás | que baje fuerte | la prima | base − prima (si va a 0) |
| **Lanzamiento de put** | cobrás | que no baje | base − prima | la prima |

\* Por eso el lanzamiento de call "descubierto" (sin tener las acciones) exige garantías y es la posición más riesgosa de las cuatro. Si lanzás el call **teniendo las acciones**, el riesgo cambia por completo: eso es el lanzamiento cubierto (lo vemos en el módulo de estrategias).

## El payoff: el gráfico que lo explica todo

El **payoff** es cuánto ganás o perdés a vencimiento según el precio final del papel. Para una compra de call con base $4.700 y prima $250 (por acción):

```
Precio final    4.000   4.700   4.950   5.500   6.000
Vale ejercer?     no      no      sí      sí      sí
Resultado/acción -250    -250      0     +550   +1.050
```

- Por debajo de la base, la opción muere sin valor: perdés la prima y nada más.
- El **punto de equilibrio (breakeven)** es base + prima = $4.950.
- Por encima, ganás $1 por cada $1 que suba el papel.

Para el lanzador del mismo call, el gráfico es el **espejo exacto**: gana $250 si el papel queda debajo de $4.700, y pierde sin límite por encima de $4.950. En opciones, lo que uno gana el otro lo pierde (antes de comisiones).

## Valor intrínseco a vencimiento

A vencimiento, una opción vale exactamente su **valor intrínseco**:

- Call: `max(precio del papel − base, 0)`
- Put: `max(base − precio del papel, 0)`

Esta formulita es la pieza de Lego con la que se arma el payoff de **cualquier** estrategia, por compleja que sea: se suman los payoffs de cada pata. El simulador de este proyecto hace exactamente eso.

## Ejercicios

1. Dibujá a mano el payoff de una compra de put base $5.000, prima $160. ¿Dónde está el breakeven? ¿Cuál es la ganancia máxima?
2. ¿Por qué la ganancia máxima de un put comprado no es "ilimitada" como la del call?
3. Completá la tabla: lanzás un put base $4.700 y cobrás $62 de prima. ¿Cuál es tu resultado por acción si el papel termina en $4.000, $4.638, $4.700 y $5.500?
