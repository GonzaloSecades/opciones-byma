---
titulo: "Straddle: apostar al movimiento, no a la dirección"
modulo: "Módulo 04 — Estrategias"
orden: 3
descripcion: "Comprar call y put ATM para ganar con cualquier movimiento grande. El caso de uso en eventos de alta incertidumbre."
fuentes:
  - "Natenberg, cap. 11 — Volatility spreads"
  - "Hull, cap. 9"
---

## Cuándo no sabés hacia dónde pero sabés que va a moverse

Imaginá que hay elecciones presidenciales en dos semanas. GGAL está en $5.000. Sabés que el resultado va a mover el papel brutalmente — puede subir a $7.000 si gana el candidato market-friendly o caer a $3.000 si gana el otro. Pero no sabés cuál gana.

¿Cómo apostás a ese movimiento sin apostar a la dirección?

**Comprás call ATM + put ATM**. Eso es un **straddle comprado**.

---

## La estructura

Con GGAL en $5.000, compra del call base $5.000 a $285 y put base $5.000 a $190:

- **Costo total**: $285 + $190 = **$475 por acción = $47.500 por par de lotes**
- **Breakeven superior**: $5.000 + $475 = **$5.475**
- **Breakeven inferior**: $5.000 − $475 = **$4.525**

---

## El payoff al vencimiento

| GGAL al vto. | Call | Put | Resultado neto |
|---|---|---|---|
| $7.000 | $2.000 | $0 | +$2.000 − $475 = **+$1.525** |
| $5.475 | $475 | $0 | Breakeven |
| $5.000 | $0 | $0 | **−$475** (máxima pérdida) |
| $4.525 | $0 | $475 | Breakeven |
| $3.000 | $0 | $2.000 | +$2.000 − $475 = **+$1.525** |

La pérdida máxima es el costo total ($47.500). Para ganar, el papel tiene que moverse más del 9,5% en cualquier dirección.

---

## El diagrama

```
Ganancia
    |    \              /
    |     \            /
    |      \          /
    |       \        /
    |        \      /
    ─────────────────────────── spot
    |    4.525  5.000  5.475
−$47.500     ────────
    |       pérdida máxima si el papel no se mueve
```

---

## El verdadero enemigo del straddle comprado: el tiempo

Pagás doble prima (call + put), y ambas tienen theta negativo. Si comprás el straddle 30 días antes del evento y el papel no se mueve, estás perdiendo $X por día en valor tiempo.

**El timing importa**: el straddle funciona mejor si el evento ocurre pronto después de la compra. Si comprás 60 días antes del evento, el theta te va a destruir incluso si el papel explota el día del evento.

---

## El volatility crush: el riesgo que no se ve

Antes de un evento grande (elecciones, resultados, reunión del BCRA), la VI sube — el mercado "paga" incertidumbre. El día del evento, la incertidumbre se resuelve y la VI colapsa. Ese fenómeno se llama **volatility crush**.

Si comprás el straddle cuando la VI está en 90% (justo antes del evento) y el día del evento la VI cae a 55%, el straddle puede perder valor aunque el papel se mueva bastante. El movimiento del papel sube una pata, pero el colapso de VI baja ambas.

**Regla práctica**: comprá el straddle *antes* de que la VI ya priceé el evento. Tarde es caro; demasiado tarde es trampa.

---

## El straddle vendido (corto)

La otra cara: **lanzar call + put ATM**. Cobrás la prima doble pero tenés riesgo ilimitado si el papel explota en cualquier dirección. Esta estrategia es para quienes creen que el mercado está sobreestimando el movimiento esperado (VI demasiado alta).

En Argentina, el straddle vendido es peligroso porque los movimientos extremos son frecuentes. No recomendado para principiantes.

---

## El strangle: más barato, más distancia

Una variante del straddle es el **strangle**: comprás call OTM + put OTM (bases distintas). Es más barato pero necesitás mayor movimiento para llegar al breakeven.

**Ejemplo** con GGAL en $5.000:
- Comprar call base $5.300 a $150 + put base $4.700 a $90 = **$240 costo total**
- Breakeven superior: $5.300 + $240 = $5.540
- Breakeven inferior: $4.700 − $240 = $4.460

Necesitás un movimiento mayor (+11% o −11% vs. +9,5% del straddle) pero pagás casi la mitad.

---

## Ejercicios

1. Construí un straddle en el simulador con GGAL en $5.000: long 1 lote call $5.000 + long 1 lote put $5.000. Calculá breakevens y pérdida máxima con las primas del snapshot actual.
2. Supongamos que comprás el straddle 20 días antes de las elecciones con VI en 85%. El día de las elecciones GGAL sube de $5.000 a $5.600 pero la VI cae a 50%. Usá el simulador para estimar cuánto vale tu straddle ese día (mové spot y bajá VI).
3. ¿Por qué el straddle comprado tiene gamma positivo? ¿Y qué implica eso sobre cómo el papel debería moverse para que la estrategia funcione?
