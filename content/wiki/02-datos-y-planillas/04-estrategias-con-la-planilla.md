---
titulo: "Operar con la Planilla EPGB: estrategias y decisiones"
modulo: "Módulo 02 — Datos y Planillas"
orden: 4
descripcion: "Cómo usar la Planilla EPGB para elegir bases, comparar rendimientos y evaluar estrategias: lanzamiento cubierto, bull spread y collar. Casos reales con GGAL."
fuentes:
  - "Tutorial YouTube: 'OPCIONES DESDE CERO — Capítulo 1' (julio 2024)"
  - "Tutorial YouTube: 'OPCIONES DESDE CERO — Capítulo 5: Guía básica PLANILLA EPGB' (noviembre 2024)"
  - "Germán Marín — bolsaargentinayestrategias.blogspot.com"
  - "Quicktrade — Calculadora Lanzamiento Cubierto: quicktrade.com.ar"
---

# Operar con la Planilla EPGB: estrategias y decisiones

La planilla no toma decisiones por vos — te da los números para que vos puedas tomarlas con información. Esta lección muestra cómo interpretar esos números para las tres estrategias más populares en Argentina.

---

## Estrategia 1 — Lanzamiento cubierto (la estrella del mercado argentino)

**Qué es:** tenés acciones de GGAL y lanzás (vendés) un call sobre ellas para cobrar la prima.

**Cuándo conviene:** esperás que el papel se mueva poco o suba levemente durante el vencimiento.

### La decisión clave: ¿qué base lanzar?

La planilla te permite comparar bases de un vistazo. Ejemplo real (GGAL a $4.550, vencimiento junio 30 días):

| Base (strike) | Prima | Rendimiento OTM | Cobertura | Anualizado | ITM/OTM |
|---|---|---|---|---|---|
| 4200 | $390 | 9,4% | 8,6% | 114% | ITM (peligro) |
| 4500 | $230 | 5,3% | 5,1% | 64% | ATM |
| 4700 | $150 | 3,4% | 3,3% | 41% | OTM |
| 4900 | $90 | 2,0% | 2,0% | 24% | OTM lejano |

### Cómo leer esta tabla

**Rendimiento OTM** = lo que ganás si el papel se queda quieto o baja poco:
- Prima / (Precio compra − Prima)
- Es tu ganancia "segura" si no ejercen

**Cobertura** = cuánto puede caer GGAL antes de que empieces a perder:
- Prima / Precio compra
- 5% de cobertura → aguantás una caída de 5%

**Anualizado** = estandariza para comparar vencimientos de distinta duración:
- Un 3,4% en 30 días equivale a ~41% anual (si repetís la operación todos los meses)

### La base ATM da el balance óptimo

Bases muy ITM (4200): rendimiento enorme pero si el papel sube te ejercen y perdés la ganancia por encima del strike.

Bases muy OTM (4900): poco rendimiento, poca cobertura, igual de comprometido.

**El rango ATM / levemente OTM** (4500-4700 para GGAL a 4550) suele dar el mejor balance entre rendimiento y cobertura en el mercado argentino.

### Cargar y evaluar en la planilla

1. En "Mi cartera", cargá la posición: Lotes -5, Base 4700, Prima 150
2. Presionás ACTUALIZAR
3. La planilla te muestra en tiempo real cómo evoluciona la prima y el P&L
4. Si la prima cae (GGAL sube poco), tu resultado en % mejora
5. Si la prima sube (GGAL cae), tu cobertura se está consumiendo

---

## Estrategia 2 — Bull Spread (diferencial alcista)

**Qué es:** comprás un call y simultáneamente lanzás otro call con strike más alto. El resultado es una posición alcista con costo neto reducido.

**Cuándo conviene:** esperás que el papel suba moderadamente, no querés pagar la prima completa de un call largo.

### Ejemplo con GGAL a $4.550

| Pata | Operación | Prima |
|---|---|---|
| Comprar call 4700 | +1 lote | −$150 |
| Lanzar call 4900 | −1 lote | +$90 |
| **Prima neta pagada** | | **−$60** |

**Ganancia máxima:** (4900 − 4700) − 60 = $140 por acción = $14.000 por par de lotes
**Pérdida máxima:** $60 por acción (la prima neta) = $6.000 — si el papel no supera 4700
**Breakeven:** 4700 + 60 = $4.760

### En la planilla

Cargás las dos patas como posiciones separadas:
- Pata 1: Lotes +1, Base 4700, Prima entrada 150 (comprado)
- Pata 2: Lotes -1, Base 4900, Prima entrada 90 (lanzado)

La planilla calcula el P&L combinado y el gráfico de payoff muestra exactamente:
- Zona de pérdida: GGAL < 4760
- Zona de ganancia: GGAL entre 4760 y 4900
- Ganancia máxima: GGAL > 4900

### Comparar con lanzamiento cubierto

El bull spread requiere **menos capital** (solo la prima neta vs. el valor de las acciones) pero:
- No te sirve si ya tenés las acciones (ahí el lanzamiento cubierto es más eficiente)
- Tiene ganancia acotada al techo del spread
- La liquidez en Argentina para el call comprado de base 4700 puede ser baja

---

## Estrategia 3 — Protective Put (seguro sobre acciones)

**Qué es:** tenés acciones y comprás un put como seguro contra caídas fuertes.

**Cuándo conviene:** tenés una tenencia de largo plazo que no querés vender pero te preocupa un escenario bajista.

### Ejemplo

- GGAL a $4.550, comprás put 4300 a $120
- Costo: $120 por acción → $12.000 por lote
- Protección: si GGAL cae a $3.800, tu put 4300 vale ~$500 → cubrís la caída de $750 excepto el costo del put

**Nota sobre liquidez:** los puts tienen muy poca liquidez en el mercado argentino. El bid/ask spread es enorme y es difícil entrar y salir a buenos precios. La estrategia es conceptualmente válida pero operativamente difícil en BYMA.

---

## Estrategia 4 — Collar (conservador)

**Qué es:** comprar acciones + lanzar call OTM + comprar put OTM. Combina lanzamiento cubierto con seguro contra caída.

```
Comprar GGAL a $4.550
Lanzar call 4700 → cobrar $150
Comprar put 4200 → pagar $80
Prima neta cobrada: $70
```

**Resultado:**
- Ganancia máxima limitada al strike del call (4700)
- Pérdida máxima limitada al strike del put (4200)
- Zona de máxima eficiencia: mercado lateral

**En la planilla:** cargás las tres patas (acción + call lanzado + put comprado) y el gráfico de payoff muestra el corredor perfectamente.

---

## Cómo usar la planilla para tomar decisiones antes de operar

### 1. Comparar bases con la tabla de rendimientos

La planilla viene con una sección de comparación de bases que calcula automáticamente el rendimiento OTM, la cobertura y el anualizado para todos los strikes disponibles. Usala así:

1. Actualizá precios
2. Mirá la columna "Anualizado" para el rango ATM/OTM
3. Elegí la base que mejor balancea rendimiento con cobertura para tu outlook

### 2. Simular escenarios con el slider de precio

En las versiones avanzadas de la planilla hay un campo de precio simulado del subyacente:

1. Cambiá el precio de GGAL al valor que querés testear (ej: −10%)
2. Presionás ACTUALIZAR
3. La planilla te muestra cuál sería el P&L en ese escenario
4. Podés probar subida fuerte, baja moderada, caída fuerte

### 3. Verificar la prima teórica vs. la de mercado

La hoja Black-Scholes calcula qué debería valer la prima según el modelo. Si la prima de mercado es **mayor que la teórica** → la volatilidad implícita está elevada → favorable para lanzar. Si es **menor** → barata → más conveniente comprar.

Esta comparación es especialmente útil después de noticias o eventos que mueven la volatilidad.

---

## Checklist antes de operar

Antes de mandar la orden al broker, verificá en la planilla:

- [ ] ¿El rendimiento anualizado justifica inmovilizar el capital?
- [ ] ¿La cobertura es suficiente para aguantar volatilidad normal del papel?
- [ ] ¿El volumen operado en esa base es razonable? (verificar en BYMA/IOL)
- [ ] ¿El bid/ask spread es acotado? (en bases ilíquidas el spread come el rendimiento)
- [ ] ¿Cuántos días faltan para el vencimiento? (Theta decae más rápido en el último mes)
- [ ] ¿Tenés las garantías requeridas si lanzás un call descubierto?

---

## Flujo completo de una operación con la planilla

```
Semana antes del vencimiento anterior:
    1. Descargar versión actualizada de EPGB para el próximo ciclo
    2. Configurar tickers en hoja Tickers

Lunes de la semana de decisión:
    3. Abrir Bolsuite + planilla durante la rueda
    4. ACTUALIZAR → ver tabla de bases y rendimientos
    5. Elegir base según rendimiento/cobertura/outlook

Durante la rueda:
    6. Comparar bid/ask en el panel de opciones (IOL o Bolsuite)
    7. Si el spread es razonable → ingresar la orden en el broker
    8. Registrar en la planilla: lotes, prima entrada, fecha

Durante el vencimiento:
    9. Monitorear P&L en tiempo real con ACTUALIZAR
   10. Si la prima cae mucho antes de tiempo → evaluar recompra (rolling)
   11. Si el papel supera el strike → evaluar rolling a base más alta o dejar ejercer
```

---

## Recursos complementarios

- **Calculadora rápida de lanzamiento cubierto**: quicktrade.com.ar/calculadoralanzamientocubierto
- **Calculadora Black-Scholes para verificar primas**: sinelefantesblancos.com.ar/inversiones/valuacion-opciones
- **Video tutorial completo de estrategias**: "OPCIONES DESDE CERO — Capítulo 1" (julio 2024, YouTube)
- **Blog de Germán Marín** (estrategias explicadas con gráficos): bolsaargentinayestrategias.blogspot.com
