---
titulo: "La Planilla EPGB — qué es y de dónde viene"
modulo: "Módulo 02 — Datos y Planillas"
orden: 1
descripcion: "Conocé la herramienta más usada por operadores minoristas argentinos: quién la hizo, qué versiones existen y por qué es el punto de entrada natural al mercado de opciones local."
fuentes:
  - "Guillermo Cuttela (@gcutte) — grupo de Facebook: facebook.com/groups/1090911330974908"
  - "Sabrina Frehley (@sabrofrehley) — mantenedora de versiones actualizadas"
  - "Instructivo Planilla EPGB V3.3.1 — Scribd"
  - "Canal YouTube Guillermo Cuttela"
---

# La Planilla EPGB — qué es y de dónde viene

## El problema que resuelve

Operar opciones en Argentina implica manejar simultáneamente:

- El precio actual del subyacente (ej: GGAL cotizando en tiempo real)
- Las primas de múltiples calls y puts a distintas bases
- El rendimiento y la cobertura de cada lanzamiento cubierto
- El resultado total de la cartera si el papel sube, baja o queda igual

Hacer esto a mano en una hoja en blanco es lento y propenso a errores. La **Planilla EPGB** automatiza exactamente eso.

## Quién es Guillermo Cuttela

**Guillermo Luis Cuttela** es un Ingeniero en Sistemas radicado en Santo Tomé, Santa Fe. Es Agente Productor N° 1309 ante la CNV. No es broker ni docente formal: es un operador independiente que desarrolló sus propias herramientas y las distribuyó gratuitamente a la comunidad desde ~2017.

> "EPGB" son sus iniciales — la planilla nunca tuvo nombre oficial más allá de eso.

**Sabrina Frehley** (@sabrofrehley), Contadora Pública, toma el rol de **mantenedora**: antes de cada vencimiento bimestral actualiza la planilla con las nuevas bases de la cadena y publica las versiones en el grupo.

Dónde encontrarlos:
- Grupo Facebook (descarga oficial): [facebook.com/groups/1090911330974908](https://www.facebook.com/groups/1090911330974908/)
- Twitter/X Cuttela: [@gcutte](https://x.com/gcutte)
- Twitter/X Sabrofrehley: [@sabrofrehley](https://x.com/sabrofrehley)
- YouTube: Canal "Guillermo Cuttela"

## Las versiones de la planilla

La planilla existe en varias variantes según cómo se alimenta de datos. Todas resuelven lo mismo — difieren en la **fuente de precios en tiempo real**:

| Versión | Fuente de datos | Complejidad | Para quién |
|---|---|---|---|
| **EPGB Lite** | Sin conexión automática — manual | ★☆☆☆ | Principiantes, aprender la lógica |
| **EPGB + Bolsuite** | Bolsuite (app gratis) → BYMADATA | ★★☆☆ | La más popular, cero código |
| **EPGB + Python (HomeBroker)** | `pyhomebroker` → cuenta de broker | ★★★☆ | Usuarios con Python instalado |
| **EPGB + Python (Primary)** | `pyRofex` → API de Primary/ROFEX | ★★★★ | Comitentes con acceso a Primary |
| **EPGB + eTrader** | Plataforma eTrader | ★★☆☆ | Clientes de brokers con eTrader |
| **EPGB Google Sheets** | Markets4Sheets add-on | ★★☆☆ | Sin Excel, todo en la nube |

> **Recomendación para empezar:** EPGB Lite para entender la planilla, después EPGB + Bolsuite para datos reales sin código.

### Por qué existe una versión por vencimiento

La cadena de opciones de BYMA cambia cada dos meses: aparecen nuevas bases, algunas dejan de existir. La planilla viene pre-configurada con los tickers del vencimiento activo — hay que descargar la versión nueva para cada ciclo (FE, AB, JU, AG, OC, DI).

Sabrofrehley publica la actualización en el grupo de Facebook antes de cada vencimiento.

## Qué hace la planilla (resumen)

```
Precio del subyacente (en vivo) + tus operaciones cargadas
        ↓
Planilla EPGB
        ↓
• Rendimiento $ y % de cada pata
• Rendimiento anualizado
• Cobertura del lanzamiento cubierto
• Prima teórica (Black-Scholes)
• Griegas (Delta, Gamma, Theta, Vega)
• Gráfico de payoff a vencimiento
• P&L total de la cartera
```

Nada de esto se calcula manualmente — la planilla lo hace sola cada vez que presionás **ACTUALIZAR**.

## La lógica del lanzamiento cubierto en la planilla

La estrategia más popular del mercado argentino tiene sus métricas propias:

| Métrica | Fórmula | Qué te dice |
|---|---|---|
| **Rendimiento ITM** | Strike + Prima − Precio compra | Ganancia si el papel sube y ejercen |
| **Rendimiento OTM** | Prima / (Precio compra − Prima) | Ganancia si el papel queda igual o baja poco |
| **Cobertura (%)** | Prima / Precio compra | Cuánto puede caer el papel antes de que pierdas |
| **Anualizado** | Rendimiento% × 365 / Días | Para comparar vencimientos de distinta duración |

La planilla calcula todo esto para cada posición cargada y lo muestra de un vistazo.

## Recursos para profundizar

- **Tutorial oficial parte 1**: "Planilla EPGB Parte 1" — YouTube (canal Cuttela)
- **Tutorial oficial parte 2**: "Planilla EPGB Parte 2" — YouTube
- **Guía para principiantes absolutos**: "Cómo descargar y usar la Planilla EPGB (como si fueras un tipo de 65 años)" — YouTube
- **Serie actualizada (2024)**: "OPCIONES DESDE CERO — Capítulo 5: Guía básica PLANILLA EPGB" — YouTube
- **Instructivo PDF**: "Instructivo Planilla EPGB V3.3.1" — Scribd

En la próxima lección vemos cómo conseguir los datos de mercado reales para alimentarla.
