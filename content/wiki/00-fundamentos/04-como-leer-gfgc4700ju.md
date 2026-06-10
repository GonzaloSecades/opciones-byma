---
titulo: "Cómo leer GFGC4700JU: la pizarra argentina"
modulo: "Módulo 00 — Fundamentos"
orden: 4
descripcion: "Nomenclatura de las bases en BYMA, lotes, vencimientos y dónde está la liquidez."
fuentes:
  - "BYMA — Especificaciones de contratos de opciones: https://www.byma.com.ar/productos/opciones/"
  - "Bolsar (BYMA) — pizarra de opciones: https://bolsar.info"
  - "IAMC — informes diarios de mercado"
---

## Anatomía de un ticker

Las opciones argentinas se identifican con un código compacto. Tomemos **GFGC4700JU**:

```
GFG        C        4700       JU
└─ GGAL    └─ Call  └─ Base    └─ Junio (vencimiento)
```

1. **Prefijo del subyacente** (3 letras): identifica al papel, pero ojo — **no es el ticker de la acción**. `GFG` → GGAL, `YPF` → YPFD, `PAM` → PAMP, `ALU` → ALUA, `COM` → COME.
2. **C o V**: `C` = call. `V` = put (de "venta"). *No confundir la V con "compra vendida" ni nada raro: V = put, siempre.*
3. **La base**: el precio de ejercicio. A veces trae decimales (en papeles de precio bajo como COME verás bases tipo `3.6`).
4. **Código de vencimiento** (2 letras): el mes. El ciclo es **bimestral par**: `FE` febrero, `AB` abril, `JU` junio, `AG` agosto, `OC` octubre, `DI` diciembre.

Entonces: **GFGV5000AG** = put de GGAL, base $5.000, vencimiento agosto. Ya sabés leer cualquier pizarra.

## Las reglas de juego en BYMA

| Regla | Valor |
|---|---|
| Lote (tamaño del contrato) | **100 acciones** — la prima cotiza *por acción*: comprar 1 lote a prima $205 cuesta $20.500 |
| Vencimiento | **3er viernes** del mes que corresponda |
| Ciclo de vencimientos | bimestral: feb, abr, jun, ago, oct, dic (los dos más cercanos suelen estar abiertos) |
| Tipo de ejercicio | americano: se puede ejercer cualquier día hasta el vencimiento |
| Horario | el de la rueda de acciones (11:00–17:00, puede variar) |
| Garantías | el lanzador debe integrar garantías; el comprador solo paga la prima |

## Dónde está (y dónde no está) la liquidez

Dato crucial que ningún libro extranjero te va a contar: en el mercado argentino la liquidez de opciones está **muy concentrada**.

- **GGAL concentra la enorme mayoría del volumen** de opciones sobre acciones. Después, lejos, aparecen COME, YPFD, PAMP, ALUA y poco más.
- Dentro de GGAL, el volumen vive en los **calls** cercanos al dinero del **vencimiento más próximo**. Los puts operan mucho menos.
- Bases lejanas y vencimientos largos pueden pasar días sin operarse: cuidado con los precios "última operación" viejos y los spreads bid-ask enormes.

**Consecuencia práctica**: las estrategias que aprendas tienen que ser ejecutables. Un iron condor precioso en la teoría puede ser imposible de armar a precios razonables en BYMA. Por eso el lanzamiento cubierto sobre GGAL es *la* estrategia local.

## Ejercicios

1. Decodificá sin mirar arriba: `GFGV4700JU`, `COMC3.6AG`, `YPFC35000OC`, `PAMC1200DI`.
2. Comprás 3 lotes de GFGC5300JU a prima $92. ¿Cuánta plata sale de tu cuenta (sin comisiones)? ¿Cuántas acciones de GGAL controlás?
3. Hoy es 5 de junio de 2026. ¿Qué fecha exacta es el vencimiento "JU"? ¿Y el siguiente vencimiento disponible?
4. Entrá a una pizarra real (Bolsar o tu broker) y encontrá: el call de GGAL más operado del día, su base y su vencimiento. ¿Era ATM?
