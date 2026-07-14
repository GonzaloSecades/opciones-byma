---
titulo: "Cuándo no operar: liquidez, spreads y disciplina"
modulo: "Módulo 05 — Operatoria"
orden: 3
descripcion: "Las condiciones que hacen que una operación que parece buena en papel sea una trampa en la práctica. El filtro de liquidez como primera defensa."
fuentes:
  - "Natenberg, cap. 14 — Risk management"
  - "Cohen, Apéndice — Common mistakes"
---

## El mercado argentino: liquidez concentrada

Ya lo dijimos antes, pero merece su propia lección: en BYMA la liquidez no es uniforme. Se concentra en:

- **Subyacente**: GGAL domina. YPF, PAMP, ALUA, COME tienen algo. El resto es papel mojado.
- **Tipo**: calls. Los puts casi no operan.
- **Strike**: ±10-15% del spot actual.
- **Vencimiento**: el más próximo y, a veces, el siguiente.

Fuera de esa zona, operar es como querer vender tu auto en un desierto: el comprador que encontrás pone el precio que quiere.

---

## El spread bid-ask: el peaje oculto

Cada vez que entrás a una posición pagás la mitad del spread, y cuando salís la otra mitad. Para el lanzamiento cubierto (un solo leg), eso es manejable. Para estrategias de dos legs (spreads, straddles, collares), pagás el spread en ambas patas.

**Ejemplo práctico**:

Querés armar un bull call spread:
- Call $5.000: bid $265 / ask $310
- Call $5.500: bid $90 / ask $135

Si hacés las dos operaciones al peor precio (comprás al ask y vendés al bid):
- Pagás $310 por el call $5.000
- Cobrás $90 por el call $5.500
- Costo real: **$220**

Si usaras el precio "justo" (mitad del spread):
- Comprás a $287.5, cobrás a $112.5
- Costo justo: **$175**

La diferencia es $45/acción = $4.500 por lote solo en slippage. Para una estrategia con ganancia máxima de $32.500, ya perdiste el 14% antes de que el papel se mueva.

**El filtro**: si el spread bid-ask de cualquier pata supera el 15-20% de la prima, la operación tiene un costo de fricción demasiado alto.

---

## Las cinco señales de "no entrar"

### 1. Bid = 0 o bid ausente

Si querés lanzar (vender) un call y el bid es `—`, no hay compradores. Podés poner precio límite y esperar, pero el mercado te está diciendo que nadie quiere comprar a ningún precio razonable.

### 2. Volumen diario = 0

Sin operaciones en el día, el único precio disponible es el último viejo. El "ask" puede ser la aspiración de quien puso la orden hace una semana sin que nadie lo aceptara.

### 3. Spread mayor al 20% de la prima

Un call con bid $80 / ask $130 tiene spread $50 sobre prima media $105 = 48%. Inaceptable para cualquier estrategia.

### 4. Último precio con más de 3 días de antigüedad

En la cadena del proyecto el snapshot muestra el último. Si el papel se movió $300 desde entonces y el "último" sigue igual, ese precio es irrelevante.

### 5. Momento de alta volatilidad repentina

Si acaba de salir un dato de inflación o una declaración del BCRA y el papel saltó $400, los market makers amplían spreads o retiran órdenes mientras recalculan. Esperá 15-30 minutos antes de operar.

---

## La trampa del "paper profit"

El simulador calcula el P&L teórico usando el precio "medio" del spread. En la práctica real:

- Entrás pagando el ask
- Salís cobrando el bid
- Si querés salir antes del vencimiento en un contrato ilíquido, podés quedarte atrapado

Una posición que "gana $15.000" en el simulador puede generar $8.000 en la práctica si los spreads son amplios.

**Regla de oro**: el simulador es para aprender la mecánica. Para evaluar una operación real, verificá siempre los spreads reales en la cadena.

---

## Cuándo sí conviene operar fuera de la zona líquida

Excepcionalmente puede tener sentido:
- Si el DTE es muy corto (3-5 días) y la opción tiene intrínseco claro → poco tiempo para que el spread importe
- Si la posición es grande y podés negociar precio directamente con un market maker vía el broker
- Si es para un ejercicio educativo y el tamaño es mínimo (1 lote)

---

## El checklist antes de ejecutar

Antes de confirmar cualquier operación de opciones en BYMA:

- [ ] ¿El subyacente es GGAL o un papel con liquidez probada?
- [ ] ¿El bid/ask del contrato tiene spread < 15% de la prima?
- [ ] ¿Hay volumen (≥3 lotes) en el día o en días recientes?
- [ ] ¿El timestamp del snapshot tiene < 1 hora?
- [ ] ¿Armé la posición en el simulador y conozco los breakevens?
- [ ] ¿El tamaño de la posición no supera el 10% de mi cartera disponible?
- [ ] ¿Tengo las garantías necesarias si voy a lanzar?

Si alguna respuesta es NO → no operás.

---

## Ejercicios

1. Abrí `/cadena` y calculá el spread bid-ask como porcentaje de la prima para los 3 calls con mayor volumen. ¿Alguno supera el 15%?
2. Encontrá en la cadena un strike OTM sin bid y describí qué significa eso para alguien que quiere lanzar ese call.
3. Calculá el "costo real de slippage" de un straddle con los precios actuales en `/cadena`: cuánto perdés solo por entrar al ask y salir al bid en ambas patas.
