---
titulo: "La cadena de opciones: cómo leer la pizarra completa"
modulo: "Módulo 01 — Mercado Argentino"
orden: 3
descripcion: "Qué es una cadena de opciones, qué dice cada columna, y cómo encontrar dónde está la liquidez real."
fuentes:
  - "BYMA — Pizarra de opciones: https://www.byma.com.ar"
  - "Bolsar — Opciones GGAL: https://bolsar.info"
  - "Hull, 'Options, Futures, and Other Derivatives', cap. 1"
---

## Qué es una cadena de opciones

Una **cadena de opciones** (*option chain*) es la tabla que muestra todas las opciones disponibles para un subyacente: todas las bases, todos los vencimientos, calls y puts juntos. Es la "pizarra" que mirás antes de operar.

En BYMA la cadena de GGAL puede tener decenas de filas, pero ya sabés que la liquidez real está concentrada en un puñado de contratos.

---

## Las columnas de la cadena

Tomemos la cadena de calls de junio de GGAL del snapshot del proyecto (GGAL = $5.000):

| Ticker | Base | Último | Bid | Ask | Volumen | OI |
|---|---|---|---|---|---|---|
| GFGC4400JU | 4.400 | $640 | $620 | $660 | 120 | 850 |
| GFGC4700JU | 4.700 | $395 | $380 | $405 | 540 | 2.300 |
| GFGC5000JU | 5.000 | $205 | $195 | $215 | **980** | **4.100** |
| GFGC5300JU | 5.300 | $92 | $85 | $99 | 760 | 3.500 |
| GFGC5600JU | 5.600 | $36 | $30 | $42 | 410 | 1.900 |

**Definiciones columna por columna:**

- **Bid**: lo que el mercado paga si querés vender (lanzar) ahora mismo.
- **Ask**: lo que el mercado pide si querés comprar ahora mismo.
- **Último**: el precio de la última operación cerrada. Puede ser de hace minutos o de ayer.
- **Volumen**: cuántos contratos (lotes) se operaron hoy.
- **OI (Open Interest)**: cuántos contratos están abiertos en total, sin cerrar. Mide el interés acumulado.

### Bid, ask y spread

El **spread bid-ask** es la diferencia entre lo que comprás y lo que vendés. Es un costo implícito que no aparece en comisiones pero lo pagás igual.

Ejemplos de la tabla:
- Call $5.000: spread = 215 − 195 = **$20** por acción → $2.000 por lote → **9.8% del mid**
- Call $5.600: spread = 42 − 30 = **$12** por acción → $1.200 por lote → **33% del mid**

Ese 33% del call $5.600 significa que en cuanto comprás ya estás 33% abajo del mid. Las opciones muy OTM son baratas en valor absoluto pero carísimas en spread relativo.

---

## Cómo leer el OI y el volumen

**Open Interest** es el número de contratos vivos. Si hoy se venden 100 contratos y mañana se cierran 40, el OI pasa de 0 a 60. Crece cuando se abren posiciones nuevas.

**Volumen** es solo de hoy. Un OI de 4.100 con volumen de 980 en el call $5.000 dice: hay mucha gente con posiciones abiertas Y hoy hubo actividad importante. Esa es la base más líquida.

Regla práctica para BYMA: si el OI es menor a 500, pensá dos veces antes de entrar. El mercado es delgado y salir puede ser difícil.

---

## Identificando la liquidez real

De la cadena arriba se ve claramente:

```
Liquidez (volumen de hoy):
  5000 ATM ███████████████████████ 980
  5300 OTM ███████████████ 760
  4700 ITM ██████████ 540
  5600 OTM ████████ 410
  4400 ITM ██ 120
```

El call $5.000 (ATM) domina. El $5.300 (OTM cercano) también opera bien. El $4.400 (bien ITM) es el menos líquido de los cinco.

**¿Por qué ATM tiene más volumen?** Porque es donde los lanzadores cubiertos operan (quieren una base que les deje algo de margen antes de ser asignados) y donde los especuladores también van (máximo valor tiempo = máximo "apalancamiento" por peso de prima pagada).

---

## Vencimientos: dos horizontes en paralelo

La cadena completa tiene contratos de **junio** y de **agosto** (los dos vencimientos abiertos). Notá la diferencia:

| Call $5.000 | Prima | Valor tiempo (aprox.) |
|---|---|---|
| Junio (vence 19/06, 14 días) | $205 | $205 |
| Agosto (vence 21/08, 77 días) | $425 | $425 |

Agosto vale el doble porque tiene más tiempo para que el papel se mueva. Para un lanzador que quiere cobrar prima rápido, junio da menos plata pero en menos días — la **tasa de renta anualizada** puede ser mayor con vencimientos cortos.

---

## Puts: el mercado paralelo (y casi desierto)

La cadena tiene dos puts de junio:

| Put | Último | Volumen |
|---|---|---|
| GFGV5000JU (base $5.000) | $160 | 130 |
| GFGV4700JU (base $4.700) | $62 | 95 |

Comparado con los calls, el volumen es casi nada. Esto no es un dato menor: si comprás un put para cubrirte y querés salir antes del vencimiento, podés tener dificultades para encontrar contrapartida a un precio razonable. Los puts en Argentina se compran y se olvidan hasta el vencimiento.

---

## Ejercicios

1. Usando la cadena del snapshot: si querés lanzar 1 lote del call $5.300, ¿a qué precio realista ejecutarías? ¿Cuántos pesos cobrás?
2. Calculá el spread bid-ask en pesos por lote para cada call de junio. ¿Para cuál es más "caro" entrar en términos relativos?
3. Un amigo te dice: *"vi que el call $4.400 tiene OI de 850 contratos, hay gente ahí."* ¿Por qué igual sería más riesgoso operar ese call que el $5.000, aunque los 850 contratos existan?
4. El call $5.000 de agosto vale $425, el de junio vale $205. Si lanzás el de agosto en vez del de junio, ¿cobrás más plata? ¿Necesariamente es mejor negocio?
