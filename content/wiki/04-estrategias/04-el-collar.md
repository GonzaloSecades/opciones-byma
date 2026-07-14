---
titulo: "El collar: cobertura financiada"
modulo: "Módulo 04 — Estrategias"
orden: 4
descripcion: "Combinar lanzamiento cubierto con put protector para limitar pérdidas sin costo adicional. La estrategia de las grandes carteras."
fuentes:
  - "McMillan, 'Options as a Strategic Investment', cap. 4"
  - "Cohen, cap. 7 — The Collar"
---

## El problema que resuelve el collar

Ya conocés el lanzamiento cubierto (cobrar prima lanzando un call). Ya conocés el put protector (pagar prima comprando un put). El collar combina ambos:

- **Lanzás un call OTM** → cobrás prima
- **Comprás un put OTM** → pagás prima
- El call financia total o parcialmente el put

Si los precios se alinean bien, armás cobertura a costo nulo (o casi).

---

## La estructura

Con GGAL en $5.000:
- **Lanzás call base $5.400** → cobrás $130
- **Comprás put base $4.600** → pagás $95
- **Costo neto: $35/acción = $3.500 por lote** (prácticamente gratis)

---

## El payoff

| GGAL al vto. | Call lanzado | Put comprado | Resultado |
|---|---|---|---|
| $6.000 | Asignado: vendés a $5.400 | $0 | Ganás $400/acción + $35 de prima = **$43.500 lote** |
| $5.400 | Vence sin valor | $0 | Ganás $400 + $35 = **$43.500** (máximo) |
| $5.000 | $0 | $0 | Sin cambio − $35 costo = **−$3.500** |
| $4.600 | $0 | Vence sin valor (ATM) | Perdés $400 − $35 = **−$43.500** |
| $3.000 | $0 | Vale $1.600×100=$160.000 | Acciones bajan $200.000 + put $160.000 − $3.500 = **−$43.500** |

La pérdida está **limitada en $43.500** pase lo que pase. La ganancia está **limitada en $43.500** también.

---

## El diagrama

```
Ganancia
+$43.500 ────────────────────────────
    |                              /
    |                             / ← sin opciones
    |                            /
    |─────────────────────────────────── spot
    |    4.600    5.000    5.400
−$43.500 ──────────────────────────
```

El collar es un rango acotado. No participás de los movimientos extremos en ninguna dirección.

---

## ¿Para quién es el collar?

**El inversor en acciones que no quiere vender** pero le preocupa un escenario de caída fuerte:
- Un inversor institucional con 100.000 acciones de GGAL que no puede venderlas en el corto plazo.
- Un empleado con acciones del employer que tiene restricciones de venta.
- Alguien que tiene ganancia acumulada y quiere protegerla sin pagar impuestos por vender.

En Argentina también se usa para "asegurar" el valor en dólares de una posición durante un período de incertidumbre cambiaria.

---

## El collar de costo cero

Si lográs que la prima del call lanzado sea igual a la del put comprado, el collar no tiene costo inicial. En la práctica esto implica:
- Base del call más cerca del spot (mayor prima cobrada)
- Base del put más lejos del spot (menor prima pagada)

Cuanto más estrecho el rango, más barato — pero más te limitás. El collar perfecto de costo cero es un balance entre protección real y restricción de upside.

---

## Comparando estrategias de cobertura

| Estrategia | Costo inicial | Protección | Upside |
|---|---|---|---|
| Solo acciones | $0 | Sin límite de pérdida | Ilimitado |
| Lanzamiento cubierto | Cobra prima | Ninguna (solo amortiguador) | Limitado a la base |
| Put protector | Paga prima | Pérdida limitada | Ilimitado |
| **Collar** | Bajo o cero | Pérdida limitada | Limitado |

El collar es la única estrategia que da protección real sin costo significativo.

---

## Ejercicios

1. Armá un collar en el simulador: 100 acciones GGAL $5.000 + lanzar call $5.500 + comprar put $4.500. Usá primas del snapshot. ¿Cuál es el costo neto? ¿Pérdida máxima? ¿Ganancia máxima?
2. Para hacer el collar de costo cero con los precios actuales, ¿qué bases necesitarías elegir? (Probá distintas combinaciones en el simulador hasta que el costo neto sea ≈ $0.)
3. ¿En qué se parece el collar a un bull spread? Describí el payoff de ambos y encontrá la diferencia conceptual clave.
