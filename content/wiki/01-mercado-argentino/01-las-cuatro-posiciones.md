---
titulo: "Las cuatro posiciones básicas"
modulo: "Módulo 01 — Mercado Argentino"
orden: 1
descripcion: "El tablero completo: comprar o lanzar, call o put. Qué gana y qué pierde cada uno."
fuentes:
  - "Hull, 'Options, Futures, and Other Derivatives', cap. 1-2"
  - "BYMA — Especificaciones de contratos de opciones: https://www.byma.com.ar/productos/opciones/"
---

## El tablero de dos por dos

Con opciones solo hay dos decisiones: **comprar o lanzar** (vender) y **call o put**. Eso da cuatro posiciones posibles. Todo lo que viene después — estrategias, spreads, coberturas — es combinaciones de estas cuatro.

| | **Call** | **Put** |
|---|---|---|
| **Comprar** | Derecho a comprar el papel a la base | Derecho a vender el papel a la base |
| **Lanzar** | Obligación de vender el papel a la base | Obligación de comprar el papel a la base |

Una regla que nunca falla: **comprador y lanzador son siempre la imagen especular**. Lo que gana uno lo pierde el otro, exactamente.

---

## 1. Comprar un call (long call)

Pagás la prima. A cambio, si el papel sube por encima de la base, podés comprarlo barato.

**Ejemplo**: GGAL a $5.000. Comprás 1 lote del call base $5.300 a prima $92. Costo total: $9.200 (92 × 100 acciones).

| GGAL al vencimiento | Lo que recibís | Tu resultado |
|---|---|---|
| $5.000 | Nada (OTM, no ejercés) | −$9.200 |
| $5.300 | Nada (ATM, sin intrínseco) | −$9.200 |
| $5.392 | +$92 por acción (breakeven) | $0 |
| $5.600 | +$300 por acción | +$30.000 − $9.200 = **+$20.800** |
| $4.000 | Nada (el papel cayó, no ejercés) | −$9.200 |

**Pérdida máxima**: la prima pagada ($9.200). **Ganancia máxima**: ilimitada (mientras el papel suba).

---

## 2. Lanzar un call (short call)

Cobrás la prima. A cambio, si el papel sube por encima de la base, tenés que vendérselo al comprador a ese precio.

Usando el mismo ejemplo: lanzás el call base $5.300 y cobrás $92. Recibís $9.200 en tu cuenta ahora mismo.

| GGAL al vencimiento | Lo que pagás | Tu resultado |
|---|---|---|
| $5.000 | Nada (comprador no ejerce) | **+$9.200** |
| $5.300 | Nada | **+$9.200** |
| $5.392 | Breakeven del comprador | $0 |
| $5.600 | −$300 por acción al comprador | +$9.200 − $30.000 = −$20.800 |

**Ganancia máxima**: la prima cobrada ($9.200). **Pérdida máxima**: ilimitada (en teoría, si el papel sube indefinidamente).

> En Argentina el lanzamiento de calls **desnudos** (sin tener el papel) es poco común para minoristas. Lo habitual es el **lanzamiento cubierto**: lanzás el call porque ya tenés las acciones. Eso transforma la pérdida ilimitada en "dejé de ganar por encima del strike". Próxima lección.

---

## 3. Comprar un put (long put)

Pagás la prima. A cambio, si el papel cae por debajo de la base, podés venderlo caro.

**Ejemplo**: GGAL a $5.000. Comprás 1 lote del put base $5.000 a prima $160. Costo: $16.000.

| GGAL al vencimiento | Lo que recibís | Tu resultado |
|---|---|---|
| $5.000 | Nada (ATM, sin intrínseco) | −$16.000 |
| $4.840 | +$160 por acción (breakeven) | $0 |
| $4.500 | +$500 por acción | +$50.000 − $16.000 = **+$34.000** |
| $5.500 | Nada (OTM, no ejercés) | −$16.000 |

El put es el **seguro** del mercado de opciones. Lo compra quien tiene el papel y quiere limitar su caída.

---

## 4. Lanzar un put (short put)

Cobrás la prima a cambio de obligarte a comprar el papel a la base si cae.

**Ejemplo**: lanzás el put base $5.000 y cobrás $160. Recibís $16.000.

| GGAL al vencimiento | Tu resultado |
|---|---|
| $5.000 o más | **+$16.000** (comprador no ejerce) |
| $4.840 | $0 (breakeven) |
| $4.500 | +$16.000 − $50.000 = −$34.000 |

Lanzar un put es equivalente a decir: *"si el papel cae a $5.000, lo compro a ese precio"*. Se usa cuando querés entrar al papel pero a un precio más bajo, cobrar la prima mientras esperás, y aceptar comprarlo si baja.

---

## Resumen: quién quiere que pase qué

| Posición | Necesitás que el papel... | Tiempo a favor | Riesgo |
|---|---|---|---|
| Comprar call | Suba | En contra (theta te come) | Prima pagada |
| Lanzar call | No suba (o baje) | A favor | Ilimitado sin cobertura |
| Comprar put | Baje | En contra | Prima pagada |
| Lanzar put | No baje (o suba) | A favor | Hasta $0 del papel |

---

## Ejercicios

1. GGAL a $5.000. Comprás 2 lotes del put base $4.700 a $62. ¿Cuál es tu breakeven? ¿Cuánto ganás si GGAL cae a $4.000?
2. Lanzás 1 lote del call base $5.600 a $36. GGAL sube a $5.900 al vencimiento. ¿Cuánto perdés? ¿Qué pasaría distinto si tuvieras las 100 acciones de GGAL en cartera?
3. ¿Cuál es la diferencia entre "lanzar un put base $4.700" y "poner una orden de compra limitada de GGAL a $4.700 − $62 = $4.638"? ¿Son exactamente equivalentes?
