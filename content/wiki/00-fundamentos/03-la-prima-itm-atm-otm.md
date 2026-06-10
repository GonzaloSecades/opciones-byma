---
titulo: "La prima: valor intrínseco, valor tiempo e ITM/ATM/OTM"
modulo: "Módulo 00 — Fundamentos"
orden: 3
descripcion: "De qué se compone el precio de una opción y el vocabulario del dinero."
fuentes:
  - "Hull, 'Options, Futures, and Other Derivatives', cap. 10"
  - "Sheldon Natenberg, 'Option Volatility and Pricing', cap. 2-3"
---

## La prima tiene dos componentes

Antes del vencimiento, la prima de una opción siempre se puede descomponer así:

```
prima  =  valor intrínseco  +  valor tiempo (extrínseco)
```

- **Valor intrínseco**: lo que valdría la opción si venciera *ahora mismo*. Para un call: `max(spot − base, 0)`.
- **Valor tiempo**: todo lo demás. Es lo que el mercado paga por la *posibilidad* de que el papel se mueva a favor antes del vencimiento.

**Ejemplo** (GGAL cotiza a $5.000): el call base $4.700 vale $395.
- Intrínseco: 5.000 − 4.700 = **$300**
- Valor tiempo: 395 − 300 = **$95**

El valor tiempo **siempre se derrite** a medida que pasa el tiempo y vale cero a vencimiento. Ese derretimiento (lo vamos a llamar *theta* en el módulo de griegas) es el costado que sufren los compradores y cobran los lanzadores.

## ITM, ATM, OTM: dónde está el dinero

Jerga universal que vas a ver en toda pizarra y todo libro:

| Sigla | En castellano | Call | Put |
|---|---|---|---|
| **ITM** (in the money) | dentro del dinero | base < spot | base > spot |
| **ATM** (at the money) | en el dinero | base ≈ spot | base ≈ spot |
| **OTM** (out of the money) | fuera del dinero | base > spot | base < spot |

Con GGAL a $5.000:

- Call base 4.400 → bien ITM: casi todo intrínseco, prima cara, se mueve casi 1 a 1 con el papel.
- Call base 5.000 → ATM: cero intrínseco, **máximo valor tiempo**. Es donde más se negocia.
- Call base 5.600 → OTM: prima barata, todo valor tiempo. Es una lotería con buenas cuotas: la mayoría vence sin valor.

## Qué hace que la prima sea más cara o más barata

Cinco factores mueven la prima (los formalizamos con Black-Scholes en el módulo 02):

1. **Precio del subyacente** vs. la base (cuán ITM/OTM está).
2. **Tiempo al vencimiento**: más tiempo = más prima (más chances de moverse).
3. **Volatilidad**: papeles que se mueven mucho tienen primas caras. En Argentina la volatilidad es estructuralmente alta — las primas locales lo reflejan.
4. **Tasa de interés**: relevante en Argentina con tasas altas; encarece los calls y abarata los puts.
5. **Dividendos** esperados antes del vencimiento.

## Ejercicios

1. GGAL cotiza a $5.000. El put base $5.000 vale $160. ¿Cuánto es intrínseco y cuánto valor tiempo? ¿Y el put base $4.700 que vale $62?
2. ¿Por qué una opción ATM tiene más valor tiempo que una muy ITM y que una muy OTM? Pensalo en términos de "incertidumbre sobre si terminará con valor".
3. Mirá el snapshot de ejemplo del proyecto (`data/samples/ggal-2026-06-05.json`): clasificá cada base de los calls de junio como ITM/ATM/OTM y verificá que el valor tiempo es máximo en la base 5.000.
