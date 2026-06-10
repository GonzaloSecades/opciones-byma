---
titulo: "El lanzamiento cubierto: la estrategia del mercado argentino"
modulo: "Módulo 01 — Mercado Argentino"
orden: 2
descripcion: "Covered call sobre acciones propias: cómo genera renta, qué cedes a cambio, y cuándo tiene sentido en BYMA."
fuentes:
  - "Hull, 'Options, Futures, and Other Derivatives', cap. 9"
  - "IAMC — Cuadernos de derivados: estrategias básicas"
  - "BYMA — Opciones: https://www.byma.com.ar/productos/opciones/"
---

## Por qué existe esta estrategia

En los mercados desarrollados hay docenas de estrategias con opciones. En BYMA hay básicamente una que opera con liquidez real: el **lanzamiento cubierto** (*covered call* en inglés).

La razón es simple: la liquidez está en los calls de GGAL cercanos al dinero. Lo demás existe en papel, pero cuando intentás ejecutarlo, los spreads bid-ask son tan anchos que te comen la ganancia antes de empezar.

La estrategia es: **tenés acciones + lanzás calls contra ellas**. Cobrás la prima ahora y aceptás un techo en el precio de venta.

---

## Cómo funciona paso a paso

**Punto de partida**: tenés 100 acciones de GGAL que compraste a $4.500. Hoy cotizan a $5.000.

**Paso 1**: lanzás 1 lote del call base $5.300, vencimiento junio, y cobrás $92 por acción → **$9.200 en tu cuenta hoy**.

**Paso 2**: esperás al vencimiento (3er viernes de junio).

### Los tres escenarios posibles

**Escenario A — GGAL cierra por debajo de $5.300**

La opción vence sin valor. El comprador no ejerce. Vos te quedás:
- Tus 100 acciones de GGAL (a precio de mercado)
- Los $9.200 de prima cobrada

Podés lanzar otro call para el siguiente vencimiento. Esto se llama **rodar la posición**.

**Escenario B — GGAL cierra exactamente en $5.300**

El comprador puede o no ejercer (técnicamente ATM). Resultado similar al escenario A.

**Escenario C — GGAL cierra por encima de $5.300 (ej: $5.700)**

El comprador ejerce. Vos tenés que venderle las 100 acciones a $5.300 (la base), sin importar que el mercado esté a $5.700.

Tu resultado total:
```
Ganancia por las acciones: (5.300 − 4.500) × 100 = $80.000
Prima cobrada:                                        $9.200
Total:                                               $89.200
```

Sin el call, hubieras ganado $(5.700 − 4.500) × 100 = $120.000. Perdiste $30.800 de ganancia **potencial** a cambio de cobrar $9.200 con certeza.

---

## El diagrama de P&L

```
Ganancia
    |                        ___________  ← sin opciones
    |                   ____/
    |              ____/     ↑ diferencia que cediste
    |         ____/ ←────────────────────  con lanzamiento cubierto
    |    ____/
$9.200 __/
    |─────────────────────────────── spot al vencimiento
    |          4.500    5.300  5.700
   −∞
```

La línea del lanzamiento cubierto es idéntica a tener el papel, pero **el techo está en la base del call**. A cambio, la curva arranca $9.200 más arriba (la prima cobrada).

---

## Cuándo tiene sentido

El lanzamiento cubierto es racional cuando:

1. **Creés que el papel no va a subir mucho** en el plazo del vencimiento. Si esperás un rally explosivo, lanzar el call te corta las ganancias.
2. **Querés generar renta sobre una posición que igual vas a mantener**. Las primas en Argentina son altas por la alta volatilidad — eso es una ventaja para los lanzadores.
3. **Tenés el papel y podés entregarlo**. El lanzamiento "cubierto" significa exactamente eso: el call está cubierto por las acciones. Sin el papel, el riesgo es ilimitado.

### Las cuentas del lanzador activo

Supongamos que podés lanzar el call ATM de GGAL cada dos meses (ciclo bimestral) y cobrar el equivalente al 5% del valor de las acciones cada vez. En un año son 6 vencimientos → **30% de renta anual** sobre el papel, más la variación del papel en sí. En un contexto de alta volatilidad como el argentino, ese 5% bimestral no es irreal.

El riesgo no desaparece: si GGAL colapsa de $5.000 a $2.000, la prima de $92 no te amortiguó casi nada. El lanzamiento cubierto **reduce el costo de llevar la posición**, no la convierte en un activo de bajo riesgo.

---

## La decisión más difícil: qué base elegir

| Base elegida | Prima cobrada | Probabilidad de ser asignado | Upside que cedés |
|---|---|---|---|
| Muy ITM (ej: $4.700) | Alta (incluye intrínseco) | Alta (el papel ya está ITM) | Mucho |
| ATM (ej: $5.000) | Media-alta (máximo valor tiempo) | Media | Moderado |
| OTM cercana (ej: $5.300) | Media | Baja-media | Poco |
| Muy OTM (ej: $5.600) | Baja | Baja | Casi nada |

En BYMA, el mercado habitual es lanzar la base OTM más cercana con volumen — en nuestro ejemplo, el call $5.300 a $92. Prima razonable, dejas algo de margen para que el papel suba un poco antes de quedarte corto.

---

## Ejercicios

1. Tenés 300 acciones de GGAL compradas a $4.800. Lanzás 3 lotes del call base $5.000 a $205. Calculá tu resultado total si GGAL termina en: a) $4.600, b) $5.000, c) $5.500, d) $6.000.
2. Mismo escenario. ¿Cuál es tu breakeven "hacia abajo" (el precio al que la prima cobrada ya no cubre la pérdida del papel)?
3. ¿Por qué el lanzamiento cubierto se llama "cubierto"? ¿Qué riesgo cubre exactamente y cuál no?
4. Un inversor dice: *"lancé el call y el papel voló a $6.500. Fue un pésimo negocio."* ¿Estás de acuerdo? ¿Qué le responderías?
