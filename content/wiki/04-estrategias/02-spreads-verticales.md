---
titulo: "Spreads verticales: acotar riesgo y costo"
modulo: "Módulo 04 — Estrategias"
orden: 2
descripcion: "Bull call spread y bear put spread: estrategias con riesgo y ganancia máxima definidos desde el inicio."
fuentes:
  - "Hull, cap. 9"
  - "Cohen, Guy. 'The Bible of Options Strategies', cap. 4-5"
---

## El problema que resuelven los spreads

Comprás un call porque creés que GGAL va a subir. Pero el call puro tiene dos problemas:
1. **Cuesta caro** (la prima es alta en Argentina por la volatilidad).
2. **Si el papel sube mucho**, ganás mucho — pero si estimás que sube "hasta un punto razonable", estás pagando por una upside que no creés que ocurra.

La solución: **comprás el call que querés Y lanzás un call a una base más alta**. Así financiás parte del costo con la prima cobrada, a cambio de limitar tu ganancia máxima.

---

## Bull Call Spread

Creés que GGAL va a subir de $5.000 a ~$5.500 antes del vencimiento.

**La operación:**
- Comprás 1 lote call base $5.000 a $285
- Lanzás 1 lote call base $5.500 a $110
- **Costo neto**: $285 − $110 = **$175 por acción = $17.500 por lote**

**El payoff al vencimiento:**

| GGAL al vto. | Resultado |
|---|---|
| < $5.000 | Ambas vencen sin valor. Pérdida = **$17.500** (máxima) |
| $5.175 | Breakeven (recuperás lo invertido) |
| $5.500 | Call $5.000 vale $500, call $5.500 vale $0. Ganancia neta = $500 − $175 = **$325/acción = $32.500** (máxima) |
| > $5.500 | Igual: el call lanzado te limita. Ganancia máxima = **$32.500** |

**Relación riesgo/beneficio**: arriesgás $17.500 para ganar hasta $32.500 ≈ 1:1,9. Necesitás que GGAL suba $175 (+3,5%) para no perder.

---

## El diagrama del bull call spread

```
Ganancia
    |                       ___________  ← cap en $5.500
    |                  ____/
    |             ____/
    |        ____/
    |──────────────────────── spot al vencimiento
    |    ____|
−$17.500─────|
    |  5.000  5.175  5.500
```

Entre $5.000 y $5.500: ganás linealmente. Arriba de $5.500: ganancia fija. Abajo de $5.000: perdés todo lo invertido.

---

## Bear Put Spread

Para cuando creés que GGAL va a bajar (o para cobertura parcial más barata que el put protector puro).

**La operación** con GGAL en $5.000:
- Comprás 1 lote put base $5.000 a $190
- Lanzás 1 lote put base $4.500 a $65
- **Costo neto**: $190 − $65 = **$125/acción = $12.500 por lote**

**Ganancia máxima** si GGAL cae por debajo de $4.500: $(5.000 − 4.500) − $125 = **$375/acción = $37.500**.

---

## Ventajas y desventajas de los spreads

| Aspecto | Call puro | Bull call spread |
|---|---|---|
| Costo inicial | $28.500 | $17.500 |
| Ganancia máxima | Ilimitada | $32.500 (fija) |
| Breakeven | $5.285 | $5.175 |
| Riesgo máximo | $28.500 | $17.500 |

El spread es mejor si tu escenario central es moderado: *"GGAL sube pero no explota"*.

---

## El problema en BYMA: liquidez de la pata lanzada

Para que el spread funcione bien necesitás que ambas bases tengan liquidez. En BYMA los calls ATM y OTM cercanos de GGAL tienen liquidez aceptable. Pero si lanzás el call base $5.500 y hay muy poco volumen, el spread bid-ask puede ser de $30/$120 — pagás $120 cuando el "justo" sería $75. Eso destruye el beneficio del spread.

**Regla**: antes de entrar a un spread, chequeá en `/cadena` que la pata a lanzar tiene bid ≠ 0. Si el bid es "—", el spread no es ejecutable a precios razonables.

---

## Ejercicios

1. Construí en el simulador un bull call spread con GGAL $5.000: comprá call $5.000 y lanzá call $5.600. Usá primas actuales del snapshot (o las de ejemplo). ¿Cuál es tu breakeven, pérdida máxima y ganancia máxima?
2. ¿Por qué el bull call spread tiene un menor breakeven que comprar solo el call base $5.000?
3. Si creés que GGAL va a subir un 20% pero no más, ¿por qué el spread es mejor que el call puro en ese escenario específico?
4. Describí un escenario en el que el call puro gana más que el spread, y uno en el que el spread es claramente mejor.
