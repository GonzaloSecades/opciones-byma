---
titulo: "El put protector: seguro de cartera"
modulo: "Módulo 04 — Estrategias"
orden: 1
descripcion: "Comprar puts sobre acciones propias para limitar pérdidas. La lógica del seguro y cuándo vale la pena en Argentina."
fuentes:
  - "Hull, cap. 9 — Strategies with options"
  - "McMillan, 'Options as a Strategic Investment', cap. 3"
---

## La idea central

Tenés 100 acciones de GGAL a $5.000. Le tenés miedo a una caída pero no querés vender porque creés que a largo plazo sube. La solución es un **put protector** (*protective put*): comprás 1 lote del put base $4.700 y pagás una prima.

El put es literalmente un seguro:
- Si GGAL cae a $3.000, el put te da derecho a vender a $4.700 → limitaste la pérdida.
- Si GGAL sube a $6.000, el put vence sin valor (pagaste la prima como costo del seguro), pero te quedás con toda la suba.

---

## Los números

Escenario: GGAL $5.000, comprás put base $4.700 a $140 (prima × lote = $14.000).

**Resultado al vencimiento según precio final:**

| GGAL al vto. | Valor put | Resultado posición |
|---|---|---|
| $6.000 | $0 | Acciones suben $100.000 − $14.000 prima = **+$86.000** |
| $5.000 | $0 | Sin cambio en acciones − $14.000 = **−$14.000** |
| $4.700 | $0 | Acciones bajan $30.000 − $14.000 = **−$44.000** |
| $4.000 | $700×100=$70.000 | Acciones bajan $100.000 + put $70.000 − $14.000 = **−$44.000** |
| $2.000 | $2.700×100=$270.000 | Acciones bajan $300.000 + put $270.000 − $14.000 = **−$44.000** |

La pérdida máxima está **fija en $44.000** sin importar cuánto caiga GGAL. Ese es el poder del put protector.

---

## El diagrama de P&L

```
Ganancia
    |              /
    |             /  ← put protector (igual que solo acciones para arriba)
    |            /
    |           /
−$14.000 ─────/──────────────────── spot al vencimiento
    |─────────/          4.700  5.000
−$44.000 ────/___________↑
    |             pérdida máxima aquí abajo
```

Arriba de la base: idéntico a tener solo las acciones (menos la prima pagada por el put). Abajo de la base: pérdida limitada.

---

## El costo real del seguro en Argentina

Acá está el problema práctico: en BYMA los puts casi no operan. Si encontrás un put base $4.700 con spread bid-ask de $50/$200, el precio "medio" es $125 pero en la práctica pagás $200 o más para entrar.

Además, las primas son altas por la alta volatilidad. Un put OTM del 6% puede costar el 3-5% de las acciones que protegés. Si lanzás el lanzamiento cubierto para financiarlo, tenés el **collar** (que vemos en la lección 4).

**Regla práctica para Argentina**: el put protector es teóricamente elegante pero operativamente difícil por liquidez. Se usa más como concepto para entender la cobertura que como operación cotidiana.

---

## El sintético: call + efectivo

Hay una relación matemática exacta entre tener acciones + put y tener un call + efectivo equivalente al PV(base). Esto viene de la **paridad put-call**:

```
acciones + put  ≡  call + K·e^(−rT)  (en términos de payoff)
```

Si el put no tiene liquidez, podrías replicar la cobertura comprando calls en lugar de puts. En la práctica en BYMA esto tampoco es trivial, pero el concepto importa.

---

## Cuándo sí tiene sentido

1. **Fecha de evento conocida** (resultado de balances, elecciones): comprás cobertura por días, no meses. El costo de tiempo es menor.
2. **Posición muy grande**: si tenés 5.000 acciones de GGAL y una caída del 30% es inaceptable para tu cartera, el costo del put se justifica como seguro real.
3. **Put sintético con opciones baratas**: si la VI está excepcionalmente baja, el momento para comprar cobertura es ese.

---

## Ejercicios

1. GGAL en $5.000. Comprás 2 lotes del put base $4.500 a $95. ¿Cuál es tu pérdida máxima total? ¿Y si GGAL termina en $3.000?
2. ¿Por qué pagar $140 por el put base $4.700 en lugar de pagar $60 por el put base $4.200? ¿Qué diferencia en protección obtenés y cuánto más cuesta?
3. Explicá con la paridad put-call cómo podrías replicar el put protector usando solo calls y efectivo.
