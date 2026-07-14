# IOL REST API — Referencia para scripts de snapshot

Base URL: `https://api.invertironline.com`

## Autenticación (OAuth2 Resource Owner Password)

### Login inicial
```
POST /token
Content-Type: application/x-www-form-urlencoded

username=USUARIO&password=CONTRASEÑA&grant_type=password
```

Respuesta:
```json
{
  "access_token": "aaaa....",
  "token_type": "bearer",
  "expires_in": 1799,
  "refresh_token": "bbbb...."
}
```

`expires_in` está en segundos (~30 minutos). Guardar ambos tokens.

### Refresh del token
```
POST /token
Content-Type: application/x-www-form-urlencoded

refresh_token=REFRESH_TOKEN&grant_type=refresh_token
```

Devuelve un nuevo par `access_token` + `refresh_token`. Rotar siempre ambos.

### Header en cada request autenticado
```
Authorization: Bearer ACCESS_TOKEN
```

---

## Endpoints relevantes (verificados con la API real)

### Cotización del subyacente (spot)
```
GET /api/v2/titulos/{simbolo}/cotizacion?mercado=bCBA
Authorization: Bearer TOKEN
```
- `{simbolo}`: ticker BYMA del subyacente, ej. `GGAL`
- Devuelve `ultimoPrecio`, OHLC, volumen, `puntas` (book de 5 niveles)
- **`?mercado=bCBA` es obligatorio** — sin él devuelve error 400/vacío

### Cadena de opciones (contratos)
```
GET /api/v2/titulos/{simbolo}/opciones?mercado=bCBA
Authorization: Bearer TOKEN
```
- `{simbolo}`: ticker del subyacente, ej. `GGAL`
- Devuelve todos los vencimientos y tipos (calls + puts)
- **LIMITACIÓN CRÍTICA**: el campo `.cotizacion` dentro de cada opción tiene
  `puntas: null` y `fechaHora: "0001-01-01"` — NO usar para quotes.
  Solo sirve para obtener la lista de tickers disponibles.

### Cotización individual de una opción ← FUENTE DE DATOS REAL
```
GET /api/v2/titulos/{ticker_opcion}/cotizacion?mercado=bCBA
Authorization: Bearer TOKEN
```
- `{ticker_opcion}`: ticker BYMA de la opción, ej. `GFGC7400AG`
- **`?mercado=bCBA` es obligatorio** — sin él devuelve vacío
- Devuelve cotización real con:
  - `ultimoPrecio`: último precio negociado (con timestamp intradiario real)
  - `puntas`: book de 5 niveles con `precioCompra`/`precioVenta`
  - `volumenNominal`: lotes operados en la sesión actual
  - `montoOperado`: pesos nominales operados
  - `cantidadOperaciones`: cantidad de operaciones
  - `apertura`, `maximo`, `minimo`, `cierreAnterior`: OHLC
  - `variacion`: cambio porcentual diario
  - `interesesAbiertos`: siempre 0 (IOL no reporta OI para opciones)
- Se debe llamar **individualmente por cada ticker** (no hay endpoint batch)
- Con 30 requests paralelos: ~600ms por lote → 108 opciones ≈ 2 segundos total

### Estrategia del snapshot (dos pasos)
1. `/opciones` → obtener lista de tickers disponibles + metadatos de contrato
2. `/cotizacion` individual para cada ticker → obtener quotes reales con bid/ask/vol

### Operaciones de la cuenta
```
GET /api/v2/operaciones
GET /api/v2/operaciones/estado
Authorization: Bearer TOKEN
```

---

## Flujo de token para scripts de larga duración

```
1. Al iniciar: POST /token con user+pass → guardar access_token + refresh_token + expires_at
2. Antes de cada request:
   - Si now >= expires_at - 60s → hacer refresh
3. Si refresh falla (token revocado): volver al login con user+pass
4. En GitHub Actions: no hay estado entre runs → login completo cada ejecución
```

---

## Notas de integración

- Los tickers de subyacente en IOL usan el símbolo BYMA directo: `GGAL`, `YPFD`, `PAMP`, etc.
  (distinto del prefijo de opciones `GFG`, `YPF`, `PAM`)
- El mercado de referencia es `bCBA` (Bolsa de Comercio de Buenos Aires).
- Las opciones en Argentina son americanas, ciclo bimestral (FE, AB, JU, AG, OC, DI),
  vencimiento el 3er viernes del mes.
- Lote estándar: 100 acciones; la prima cotiza por acción.
- Para rate en Black-Scholes usar la tasa de política monetaria del BCRA
  (o la que se configure en `IOL_RATE`).

---

## Variables de entorno necesarias

Ver `.env.example` en la raíz del monorepo.
