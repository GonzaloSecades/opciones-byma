---
titulo: "Configurar la Planilla EPGB paso a paso"
modulo: "Módulo 02 — Datos y Planillas"
orden: 3
descripcion: "Guía completa para descargar, configurar y usar la Planilla EPGB con Bolsuite: desde cero hasta ver tu primera posición en tiempo real."
fuentes:
  - "Instructivo Planilla EPGB V3.3.1 — Scribd (scribd.com/document/450462514)"
  - "Para Arrancar (Planilla, Bolsuite + Notas) — Scribd"
  - "Tutorial YouTube: 'Planilla EPGB Parte 1' y 'Parte 2' — Canal Guillermo Cuttela"
  - "Tutorial YouTube: 'OPCIONES DESDE CERO — Capítulo 5' (noviembre 2024)"
---

# Configurar la Planilla EPGB paso a paso

Esta guía cubre la variante **EPGB + Bolsuite** — la más usada porque no requiere código y da datos en tiempo real. Si querés empezar sin conexión de datos, usá EPGB Lite y saltá las secciones de Bolsuite.

---

## Paso 1 — Conseguir la planilla

1. Unirte al grupo de Facebook de Guillermo Cuttela:
   `facebook.com/groups/1090911330974908`

2. Buscar el post más reciente de **@sabrofrehley** con la planilla del vencimiento actual. Hay un post fijado o en los archivos del grupo.

3. Descargar el archivo `.xlsb` (formato binario de Excel — no lo intentés abrir con LibreOffice, usa Excel 2016 o superior).

> **¿Por qué cambia cada vencimiento?** La cadena de opciones se renueva cada dos meses. La planilla viene pre-cargada con los tickers del ciclo activo. Si usás la versión vieja con el ciclo nuevo, los precios no van a aparecer.

---

## Paso 2 — Instalar Bolsuite (para datos en vivo)

1. Descargar Bolsuite desde el mismo grupo de Facebook (hay un post fijado con el instalador)
2. Instalarlo en Windows — no requiere cuenta de broker
3. Abrirlo y verificar que conecta a BYMADATA (aparece un ícono verde de conexión)

**Verificación rápida:** en Bolsuite deberías ver cotizaciones de GGAL y los calls GFG actualizándose durante la rueda (10:00–17:00 hora Argentina).

---

## Paso 3 — Hoja "Tickers": configurar qué monitorear

La hoja **Tickers** es el punto de entrada de la planilla. Define qué instrumentos va a traer Bolsuite.

### Columnas principales

| Columna | Contenido |
|---|---|
| A | Ticker tal como aparece en BYMADATA (ej: `GGAL`, `GFGC4700JU`) |
| B | Nombre visible en la planilla (ej: `GGAL`, `Call 4700 JU`) |
| R | Ticker alternativo para bases que cambiaron de nombre |

### Grupos de instrumentos

La planilla viene pre-dividida en grupos:
- **Bluechips**: GGAL, PAMP, YPFD, ALUA, COME...
- **Opciones calls**: todas las GFG del vencimiento activo
- **Opciones puts**: si querés monitorear puts
- **Bonos / CEDEARs**: opcional

### Agregar una base nueva

Si querés seguir un call que no está pre-cargado:
1. Ingresá el ticker en la **columna A** de la hoja Tickers (ej: `GFGC5000JU`)
2. Ingresá el nombre visible en la **columna B**
3. Presionar el botón **"Cargar fórmulas"** — esto extiende las fórmulas de la hoja principal para esa fila

---

## Paso 4 — Hoja principal: cargar tus posiciones

La hoja principal muestra dos secciones:

### Sección "Mercado" (automática)

Se llena sola con Bolsuite. Para cada ticker de la hoja Tickers muestra:
- Precio actual (bid/ask/último)
- Variación del día
- Volumen

No la editás vos — se actualiza cada vez que presionás **ACTUALIZAR**.

### Sección "Mi cartera" (manual)

Acá cargás tus operaciones. Por cada posición:

| Campo | Ejemplo | Descripción |
|---|---|---|
| Ticker | `GFGC4700JU` | El ticker del contrato |
| Tipo | Call / Put | Tipo de opción |
| Lotes | -5 | Negativo = lanzado; positivo = comprado |
| Base (strike) | 4700 | Precio de ejercicio |
| Prima entrada | 205 | Lo que cobraste/pagaste al operar |
| Subyacente entrada | 4550 | Precio de GGAL cuando operaste |
| Vencimiento | 20/06/2025 | Tercer viernes del mes |

> **Convención**: `lotes = -5` significa que **lanzaste** (vendiste) 5 contratos. Cada lote = 100 acciones. Una prima de $205 por acción = $20.500 cobrados por lote.

---

## Paso 5 — El botón ACTUALIZAR

Una vez cargada tu posición, presionás **ACTUALIZAR** y la planilla:

1. Le pide a Bolsuite los precios actuales de todos los tickers de la hoja Tickers
2. Calcula los indicadores para cada posición

### Qué aparece después de actualizar

Para cada lanzamiento cubierto:

```
Ticker:         GFGC4700JU
Lotes:          -5 (lanzado)
Prima entrada:  $205
Prima actual:   $195    ← tomado de Bolsuite en tiempo real
Resultado:      +$10 por acción  (+$5.000 total)

Rendimiento OTM:   4,50%
Cobertura:         4,50%
Anualizado:        54,8%
Días al vto:       30

Prima teórica B&S: $188
Volatilidad impl.: 72%
Delta:             0,32
```

---

## Paso 6 — El gráfico de payoff

La planilla genera automáticamente un **gráfico de payoff** para la cartera completa — el resultado a vencimiento para distintos precios del subyacente.

Eje X: precio de GGAL al vencimiento
Eje Y: resultado en pesos de toda la cartera

Este gráfico permite ver de un vistazo:
- El **máximo ganado** (si el papel sube mucho o se queda igual)
- El **breakeven** (precio a partir del cual empezás a perder)
- La **pérdida máxima** (si el papel cae a cero — no pasa, pero ayuda a entender el riesgo)

---

## Preguntas frecuentes

**¿Por qué algunas primas aparecen en 0?**
Las bases muy fuera del dinero (OTM lejanas) no tienen operaciones reales. En el mercado argentino la liquidez está concentrada en calls ATM y levemente OTM de GGAL del vencimiento más próximo. Esas bases existen "en papel" pero nadie opera a esos precios.

**¿La planilla funciona fuera del horario de rueda?**
Bolsuite solo trae datos en tiempo real durante la rueda (10:00–17:00 hora Argentina). Fuera de ese horario podés cargar precios manualmente o usar datos del cierre anterior.

**¿Puedo usar la misma planilla para múltiples subyacentes?**
Sí, la hoja Tickers soporta varios subyacentes. Pero la liquidez de opciones fuera de GGAL es muy baja — PAMP y YPFD tienen algo, el resto casi nada.

**¿Cada cuánto descargo una versión nueva?**
Una vez por vencimiento, cuando cambia el ciclo bimestral. Sabrofrehley lo anuncia en el grupo.

---

## Flujo resumido

```
1. Unirse al grupo de Facebook
         ↓
2. Descargar EPGB del vencimiento activo (.xlsb)
         ↓
3. Instalar Bolsuite → conectar a BYMADATA
         ↓
4. Hoja Tickers: verificar que estén los tickers que te interesan
         ↓
5. Hoja principal → Sección "Mi cartera": cargar tus posiciones
         ↓
6. Presionar ACTUALIZAR
         ↓
7. Ver P&L, rendimiento, cobertura, griegas y gráfico de payoff
```

En la próxima lección: cómo usar la planilla para comparar y elegir la mejor estrategia para cada vencimiento.
