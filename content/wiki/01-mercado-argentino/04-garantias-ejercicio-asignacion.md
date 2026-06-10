---
titulo: "Garantías, ejercicio y asignación"
modulo: "Módulo 01 — Mercado Argentino"
orden: 4
descripcion: "Qué pasa cuando se ejerce una opción: el ciclo de vida completo de un contrato, garantías del lanzador, y ejercicio anticipado."
fuentes:
  - "BYMA — Reglamento de operaciones con opciones: https://www.byma.com.ar"
  - "IAMC — Cuadernos de derivados: mecánica del mercado"
  - "Hull, 'Options, Futures, and Other Derivatives', cap. 9-10"
---

## El ciclo de vida de un contrato

Una opción puede terminar de tres maneras:

1. **Vence sin ejercerse**: el comprador no ejerce (OTM o ATM sin valor). La prima cobrada por el lanzador es ganancia final. El comprador pierde la prima pagada.
2. **Se ejerce al vencimiento**: si está ITM, el comprador ejerce automáticamente (en BYMA se puede configurar ejercicio automático). El lanzador entrega o recibe el papel.
3. **Se cierra antes del vencimiento**: el titular vende su opción en el mercado; el lanzador recompra la suya. La posición se cancela sin llegar al vencimiento.

---

## Garantías: la diferencia entre comprador y lanzador

Esta asimetría es fundamental:

| | Comprador | Lanzador |
|---|---|---|
| Desembolso inicial | Prima (pago total) | Garantía (margen) |
| Riesgo | Limitado a la prima | Potencialmente alto |
| Obligación | Ninguna | Entregar/recibir acciones |

El **comprador paga la prima entera al abrir la posición**. Eso es todo lo que puede perder. No necesita garantías adicionales porque ya no puede incurrir en más pérdidas.

El **lanzador cobra la prima pero asume una obligación futura**. Para asegurarse de que puede cumplir si le asignan, el broker le exige **integrar garantías**: una parte del valor del contrato queda bloqueada en su cuenta.

### ¿Cuánto es la garantía?

El cálculo exacto lo hace el broker siguiendo normas de BYMA/CONAEX, pero la regla general: la garantía ronda el **20-30% del valor total de las acciones** subyacentes, ajustado por qué tan ITM/OTM está la opción.

Ejemplo: lanzás el call $5.300 sobre GGAL ($5.000 × 100 acciones = $500.000 valor del paquete). La garantía podría ser ~$80.000-$100.000 bloqueados.

Si el papel sube mucho y el contrato se torna muy ITM, el broker puede pedir más garantías (*margin call*). Si no las integrás, cierra la posición.

**Para el lanzamiento cubierto esto no aplica**: si ya tenés las 100 acciones, ellas mismas son la garantía. El broker bloquea las acciones, no efectivo adicional. Por eso el lanzamiento cubierto es accesible para cualquier inversor con acciones.

---

## Ejercicio anticipado: el derecho americano

Las opciones en BYMA son **americanas**: el titular puede ejercerlas en cualquier momento antes del vencimiento, no solo al final.

En la práctica, **casi nunca conviene ejercer anticipadamente un call**. ¿Por qué?

Porque al ejercer un call antes del vencimiento estás "destruyendo" el valor tiempo que te queda. Si tenés un call ITM y querés las acciones ahora, es mejor **vender el call en el mercado** (cobrar prima = intrínseco + valor tiempo) y después comprar las acciones. Ejercer anticipadamente te da solo el intrínseco.

**La excepción**: calls sobre acciones que pagan dividendos. Si el dividendo es mayor al valor tiempo restante, puede convenir ejercer antes de la fecha ex-dividendo para cobrar el dividendo. En BYMA esto ocurre raramente con las opciones más operadas.

Para **puts** la lógica es similar pero hay un caso más frecuente: un put muy ITM puede tener poco valor tiempo y conviene ejercerlo para cobrar el intrínseco (recibir efectivo hoy en vez de esperar).

---

## Asignación: qué pasa cuando te ejercen

Si sos el lanzador y el titular ejerce, BYMA te asigna aleatoriamente entre todos los lanzadores con posiciones abiertas en ese contrato. La asignación puede ocurrirte en cualquier momento (opciones americanas).

**Para el lanzamiento cubierto**: te asignan → entregás tus 100 acciones de GGAL → recibís $5.300 × 100 = $530.000. Ya cobrada la prima antes, tu resultado total está calculado (es el escenario C de la lección anterior).

**Para el lanzamiento desnudo** (sin acciones): te asignan → tenés que comprar 100 acciones al precio de mercado y entregárselas al titular a la base. Si GGAL está a $6.000 y la base es $5.300, comprás a $6.000 y entregás a $5.300: pérdida de $70.000 por el diferencial, más o menos la prima cobrada. Ahí está el riesgo ilimitado.

---

## Cerrar una posición antes del vencimiento

No estás obligado a esperar al vencimiento.

- **Si compraste un call** y el papel subió: el call vale más. Podés venderlo y realizar la ganancia ahora sin necesidad de ejercer y tomar las acciones.
- **Si lanzaste un call** y el papel subió más de lo esperado: podés **recomprar el call** (a un precio mayor, con pérdida) para liberar la posición y las garantías. Esto se llama "cubrir la posición" o "cerrar el lanzamiento".
- **Rodar la posición**: cerrar el call de junio y abrir simultáneamente el de agosto. El lanzador activo hace esto para mantener la posición generando renta mes a mes.

---

## Ejercicios

1. Lanzaste desnudo 1 lote del call $5.300 de GGAL y cobraste $92. GGAL cierra el vencimiento a $5.800. ¿Cuánto perdés en total? ¿Qué pasaría diferente si hubieras tenido las 100 acciones?
2. Tenés un call base $4.700 que compraaste a $395 y GGAL subió a $5.500. El call ahora vale $820. Comparás dos opciones: a) vender el call ahora, b) ejercer y vender las acciones en el mercado. ¿Cuál da más plata y por qué?
3. Te lanzaron (te asignaron) en el call $5.000 cuando GGAL estaba a $5.250. Tenías las acciones compradas a $4.500. Calculá tu P&L total incluyendo la prima cobrada de $205.
4. ¿Por qué el lanzamiento cubierto no requiere garantías en efectivo, pero el lanzamiento desnudo sí?
