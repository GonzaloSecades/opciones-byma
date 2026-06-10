---
titulo: "Fuentes de datos reales del mercado argentino"
modulo: "Módulo 02 — Datos y Planillas"
orden: 2
descripcion: "Dónde conseguir cotizaciones reales de acciones y opciones en Argentina: desde opciones sin código (Bolsuite, IOL, Rava) hasta APIs gratuitas y librerías Python para automatizar."
fuentes:
  - "BYMA Open Data — open.bymadata.com.ar"
  - "data912.com — API gratuita de opciones argentinas"
  - "pyhomebroker (Diego Degese) — github.com/ddegese/pyhomebroker"
  - "PyOBD (Franco Lamas) — github.com/franco-lamas/PyOBD"
  - "Markets4Sheets — workspace.google.com/marketplace"
---

# Fuentes de datos reales del mercado argentino

Para usar la Planilla EPGB (u operar en general) necesitás dos tipos de datos:

1. **Precios en tiempo real**: subyacente + primas de opciones durante la rueda
2. **Históricos**: para backtesting, calcular volatilidad histórica, ver evolución de primas

Este mapa cubre todo el ecosistema disponible en 2025-2026, de menor a mayor complejidad técnica.

---

## Nivel 1 — Sin código, sin instalación

### IOL (InvertirOnline)

La forma más directa si ya tenés cuenta en IOL.

**Cómo acceder:**
1. Loguearse en `iol.invertironline.com`
2. Ir a Mercado → Cotizaciones Argentina → Opciones
3. Filtrá por papel (ej: GGAL) y tipo (calls o puts)

**Qué muestra:** último precio, bid, ask, volumen del día, variación

**Limitaciones:** no exporta directo a Excel; para automatizar necesitás la API (ver Nivel 3)

### Rava Bursátil

**URL:** rava.com → Cotizaciones → Opciones

Sin cuenta, datos con leve delay. Sirve para revisar precios manualmente y cargar en la versión Lite.

### Puente — Valuación de opciones

**URL:** puentenet.com/herramientas/valuacion-opciones

**No es fuente de precios** — es una calculadora. Ingresás manualmente los datos y calcula prima teórica, volatilidad implícita y griegas. Útil para verificar si una prima "está cara o barata".

### Panel de opciones de BYMA

**URL:** open.bymadata.com.ar

El portal oficial de BYMA con datos en tiempo real gratuitos. Incluye acciones, opciones, bonos, CEDEARs. Sirve para ver la cadena completa y verificar bases disponibles.

---

## Nivel 2 — Bolsuite (la integración más popular)

**Bolsuite** es una aplicación de escritorio gratuita que se descarga desde el grupo de Facebook. Conecta directamente con **BYMADATA** (el servicio oficial de BYMA) y expone las cotizaciones en una hoja Excel. La Planilla EPGB + Bolsuite las lee automáticamente.

### Flujo de datos con Bolsuite

```
BYMA (mercado) 
    → BYMADATA (servicio oficial de BYMA)
        → Bolsuite (app de escritorio)
            → Hoja "Bolsuite" en Excel
                → Planilla EPGB (lee esa hoja)
```

### Cómo configurarlo

1. **Descargar Bolsuite** desde el grupo de Facebook de Cuttela (se actualiza periódicamente)
2. **Instalarlo** — no requiere cuenta de broker, usa BYMADATA directamente
3. **Abrir Bolsuite** → ingresar los tickers que querés monitorear
4. **Abrir la Planilla EPGB + Bolsuite** → las columnas de precio se alimentan solas
5. Presionar **ACTUALIZAR** — la planilla trae los precios en tiempo real

**Frecuencia de actualización:** configurable, típicamente cada 1-2 segundos durante la rueda.

### Limitaciones conocidas

- Opciones con **bases muy fuera del dinero** (ilíquidas) pueden aparecer sin precio — es normal en el mercado local
- No funciona fuera del horario de rueda (10:00–17:00 hora Argentina)
- Requiere Windows (es una app .exe)

---

## Nivel 3 — APIs y Python

Para quienes quieren automatizar o integrar datos en código.

### data912.com — La API más accesible

La opción más simple para obtener datos de opciones en formato JSON, sin cuenta ni autenticación.

```
GET https://data912.com/live/arg_options
```

Devuelve un array con todos los contratos de opciones activos:

```json
[
  {
    "symbol": "GFGC4700JU",
    "px_bid": 195.0,
    "px_ask": 210.0,
    "px_last": 205.0,
    "volume": 1240,
    "change_pct": 2.5
  },
  ...
]
```

**Licencia:** "Do whatever you want with the data" — totalmente libre.

**Ideal para:** cargar la Planilla EPGB Lite con datos actualizados via script, o alimentar cualquier app propia.

```python
import requests

data = requests.get("https://data912.com/live/arg_options").json()

# Filtrar calls de GGAL del vencimiento próximo
ggal_calls = [o for o in data if o["symbol"].startswith("GFG") and "C" in o["symbol"]]
for opt in ggal_calls:
    print(f"{opt['symbol']:20} bid: {opt['px_bid']:8.2f}  ask: {opt['px_ask']:8.2f}")
```

### InvertirOnline API (IOL)

IOL tiene una API REST documentada para cuentas activas.

**Autenticación:** OAuth 2.0 con usuario y contraseña de tu cuenta IOL.

**Endpoints relevantes:**
```
GET /api/v2/opciones/cotizaciones?simbolo=GGAL
GET /api/v2/titulos/{simbolo}/cotizacion
```

**Documentación:** `api.invertironline.com`

> **Nota:** La API de IOL requiere tener cuenta activa en InvertirOnline.

### pyhomebroker — HomeBroker vía WebSocket

Librería Python de Diego Degese que se conecta al HomeBroker de tu broker vía WebSocket.

```bash
pip install pyhomebroker
```

```python
from pyhomebroker import HomeBroker

hb = HomeBroker(
    broker=0,  # código de tu broker
    dni="12345678",
    user="usuario",
    password="contraseña",
    account="12345"
)

hb.online.connect()
hb.online.subscribe_options("GGAL")
# Recibe precios en tiempo real vía callback
```

> **Atención:** El repositorio fue **archivado en enero 2026** — funciona pero no recibe mantenimiento activo. Si el broker cambia su plataforma puede dejar de funcionar.

### PyOBD — Sin login, vía BYMA Open Data

Librería de Franco Lamas que no requiere cuenta de broker:

```bash
pip install PyOBD
```

```python
from PyOBD import get_options

opciones = get_options("GGAL")
print(opciones)  # DataFrame con toda la cadena
```

Usa BYMA Open Data internamente — más estable que pyhomebroker a largo plazo.

### pyRofex / Primary API

Para operadores con número de comitente en Primary (ROFEX):

```python
import pyRofex

pyRofex.initialize(
    user="usuario",
    password="contraseña",
    account="comitente",
    environment=pyRofex.Environment.LIVE
)
```

La más completa pero requiere acceso institucional.

---

## Nivel 4 — Google Sheets con Markets4Sheets

Si preferís trabajar en Google Sheets en lugar de Excel:

**Markets4Sheets** es un add-on del Google Workspace Marketplace que agrega funciones de opciones directamente en celdas:

```
=OPTION_VALUE("GGAL"; "GFGC4700JU"; "call")   → prima teórica
=IV("GGAL"; "GFGC4700JU"; 205)                → volatilidad implícita
=GREEKS("GGAL"; "GFGC4700JU"; "delta")        → griegas
```

- Actualización automática cada ~30 segundos
- Usa tasa repo a 7 días y volatilidad histórica calculada internamente
- La versión EPGB Google Sheets (para vencimientos JU y AG) está basada en esto

---

## Calculadoras online para verificar números

Antes de operar, conviene verificar si una prima está razonablemente valuada:

| Herramienta | URL | Qué hace |
|---|---|---|
| **Puente** | puentenet.com/herramientas/valuacion-opciones | Prima teórica + VI + griegas |
| **SinElefantesBlancos** | sinelefantesblancos.com.ar/inversiones/valuacion-opciones | Black-Scholes + 6 griegas |
| **Quicktrade** | quicktrade.com.ar/calculadoraopciones | Calculadora + lanzamiento cubierto |
| **MatbaRofex** | matbarofex.com.ar/calculadora-opciones | Educativa, estilo institucional |

---

## Resumen: ¿qué usar según tu caso?

| Situación | Solución recomendada |
|---|---|
| Recién empezando, solo quiero aprender | Planilla Lite + precios manuales de Rava/IOL |
| Quiero datos en vivo sin instalar Python | Planilla EPGB + Bolsuite |
| Tengo Python y quiero automatizar | data912 API + PyOBD |
| Trabajo en Google Sheets | Planilla EPGB Google Sheets + Markets4Sheets |
| Tengo cuenta en IOL y quiero la API | IOL API REST (requiere autenticación) |
| Tengo comitente en Primary | pyRofex |

En la próxima lección: cómo configurar la Planilla EPGB paso a paso y cargar tu primera posición.
