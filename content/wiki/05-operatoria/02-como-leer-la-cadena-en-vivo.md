---
titulo: "Cómo leer la cadena en vivo: la página /cadena del proyecto"
modulo: "Módulo 05 — Operatoria"
orden: 2
descripcion: "Guía práctica para interpretar cada columna de la cadena de opciones del proyecto: IV, bid, ask, vol y la lógica del snapshot."
fuentes:
  - "Documentación del proyecto (CLAUDE.md)"
  - "BYMA — Opciones: https://www.byma.com.ar/productos/opciones/"
---

## Qué es la cadena de opciones

La cadena de opciones muestra, para cada strike disponible, las cotizaciones de calls y puts con el mismo subyacente y vencimiento. Es la "pizarra" central del mercado de opciones.

En `/cadena` del proyecto, la tabla tiene este formato:

```
CALLS                              BASE    PUTS
IV    Último  Ask   Bid   Vol  │ Strike │ Vol   Bid   Ask   Último  IV
```

---

## Columna por columna

### Strike (Base)

El precio de ejercicio. Marcado con `▲` cuando es el ATM (más cercano al spot actual). Los calls ITM tienen fondo azul; los puts ITM tienen fondo rosa.

Los strikes se ordenan de menor a mayor. El ATM está en el centro visual de la tabla.

### Bid y Ask

- **Bid**: el precio al que alguien compra (precio que cobrarías si vendieras).
- **Ask**: el precio al que alguien vende (precio que pagarías si compraras).

Si el bid es `—`, nadie tiene orden de compra activa. En BYMA, bids vacíos son comunes en strikes muy OTM o en vencimientos lejanos.

El spread `ask − bid` es tu costo de entrada y salida. Un spread del 20% de la prima es alto; 5-10% es aceptable.

### Último

El precio de la última transacción ejecutada. Puede ser de hoy o de días atrás. Si hay bid y ask pero no hay "último", las órdenes se acaban de publicar pero aún no cruzaron.

**Importante**: en el snapshot nocturno o de fin de día, el "último" ya no es relevante — mirar bid/ask es más informativo.

### Vol (Volumen)

Cantidad de contratos negociados en la sesión. `1` = 1 lote = 100 acciones. Un volumen de 0 significa que nadie operó esa opción hoy.

Buscar volumen ≥ 3-5 lotes como mínimo para tener confianza en que el precio es real. Opciones sin volumen pueden tener precios "de pizarra" que no reflejan dónde está el mercado.

### IV (Volatilidad Implícita)

Calculada a partir del **último precio** con Black-Scholes inverso. Si el último es viejo, la IV también lo es.

La IV es el precio "normalizado" de la opción — te permite comparar opciones de distintos strikes y vencimientos en la misma unidad. Una IV de 75% es cara o barata según la VH del papel.

---

## La barra de vencimientos

En el header de `/cadena` hay botones para cada OPEX disponible (ej: JU, AG). Cambiá entre ellos para ver la cadena del próximo vencimiento vs. el siguiente.

**Regla general**: el vencimiento próximo tiene más volumen y spreads más ajustados. El siguiente vencimiento tiene menos liquidez pero más tiempo — útil para estrategias que necesitan tiempo para desarrollarse.

---

## El botón ↻ y el timestamp del snapshot

Junto al timestamp `Snapshot: XX/XX hh:mm hs (ARG)` hay un pequeño botón `↻`. Ese botón:
1. Llama a `POST /api/snapshot` que ejecuta el script de IOL
2. Renueva los datos de bid/ask para las opciones cerca del dinero
3. Actualiza la cadena sin recargar la página

Si el timestamp tiene más de 30 minutos durante el horario de mercado (10-17 ARG), el snapshot puede estar desactualizado. Hacé click en ↻ para refrescar.

---

## Señales de alerta en la cadena

| Lo que ves | Qué puede significar |
|---|---|
| Todos los bids = `—` | Mercado cerrado o sin liquidez en ese vencimiento |
| IV muy alta en un strike OTM | Posible evento esperado (o precio viejo) |
| Ask >> Último en muchos strikes | El mercado subió desde el último trade |
| Volumen 0 en toda la cadena | Snapshot de horario fuera de mercado |
| IV crece mucho con el strike (skew pronunciado) | El mercado está cubriendo riesgo de cola |

---

## Lectura de ejemplo: un lanzamiento cubierto

Querés lanzar el call OTM más líquido para el próximo vencimiento.

1. Buscás en la columna **Vol** de los calls → encontrás que el call $5.300 tiene vol = 8 y el $5.500 tiene vol = 2.
2. Revisás el **Bid** del call $5.300: $145. Ese es el precio que podés cobrar.
3. Verificás la **IV**: 74%. ¿Es alta respecto a la VH? Si la VH es 60%, el lanzamiento es favorable.
4. Calculás la prima total: $145 × 100 = **$14.500** por lote lanzado.
5. Ingresás el call en el simulador (`/simulador`) y verificás el breakeven a la baja: spot − prima = $5.000 − $145 = $4.855.

---

## Ejercicios

1. Abrí `/cadena`. Para el vencimiento más próximo: ¿cuál es el call ATM? ¿Cuál es su bid, ask, último y IV?
2. Encontrá el strike con mayor volumen de calls hoy. ¿Está ITM, ATM u OTM? ¿Qué dice eso sobre hacia dónde está apostando el mercado?
3. Si el snapshot tiene más de 2 horas de antigüedad y el papel se movió $200 desde entonces, ¿los bids y asks mostrados en la cadena son confiables? ¿Por qué?
