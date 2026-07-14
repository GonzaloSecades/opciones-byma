---
titulo: "Las griegas: delta, theta, vega y gamma"
modulo: "Módulo 03 — Valuación"
orden: 3
descripcion: "Cómo se mueve la prima cuando cambia el spot, el tiempo o la volatilidad. Las cuatro griegas que todo trader usa."
fuentes:
  - "Hull, cap. 19 — The Greek letters"
  - "Natenberg, cap. 7-8"
  - "IAMC — Cuadernos de derivados"
---

## Las griegas son derivadas del precio

Si BS toma 5 inputs y produce 1 prima, las griegas miden cuánto cambia esa prima cuando cambia *uno* de los inputs, manteniendo todo lo demás fijo.

| Griega | Input que varía | Fórmula informal |
|---|---|---|
| **Delta (Δ)** | Spot (S) | Δ ≈ ∂prima / ∂spot |
| **Theta (Θ)** | Tiempo (T) | Θ ≈ ∂prima / ∂tiempo |
| **Vega (ν)** | Volatilidad (σ) | ν ≈ ∂prima / ∂σ |
| **Gamma (Γ)** | Velocidad del delta | Γ ≈ ∂²prima / ∂spot² |

---

## Delta: cuánto se mueve la prima con el spot

**Para un call**: Delta ∈ [0, 1]. Con GGAL en $5.000:

- Call base $4.400 (bien ITM): delta ≈ 0,90 → si GGAL sube $100, el call sube $90.
- Call base $5.000 (ATM): delta ≈ 0,52 → sube $52.
- Call base $5.600 (OTM): delta ≈ 0,22 → sube $22.

**Para un put**: Delta ∈ [−1, 0]. El put ATM tiene delta ≈ −0,48.

### Delta como probabilidad (aproximación práctica)

Una interpretación informal pero útil: el delta del call ATM ≈ 0,52 significa que el mercado le asigna ~52% de probabilidades de que la opción termine ITM. No es exactamente así matemáticamente, pero sirve para pensar.

### El lanzador cubierto y el delta

Tenés 100 acciones de GGAL (delta = +100, un punto de delta por acción). Lanzás 1 lote del call ATM (delta del lote = −52 ≈ −0,52 × 100). Delta total de tu posición: 100 − 52 = +48. Se movés un poco con el papel pero no tanto.

---

## Theta: el derretimiento del valor tiempo

Theta es el enemigo del comprador de opciones y el amigo del lanzador.

**En términos concretos**: si el call base $5.000 con 40 días tiene theta = −$8, eso significa que si pasa un día sin que nada cambie, la prima baja $8.

### Theta no es lineal: acelera cerca del vencimiento

```
Valor tiempo que queda
    |
    |  \
    |   \
    |    \
    |     \__
    |        \_______
    |──────────────────────── días al vencimiento
    40        20       10   1
```

Con 40 días, la prima se derrite lento. Con 10 días, el derretimiento es feroz. A 1 día del vencimiento, la prima casi es solo intrínseco.

**Implicancias prácticas en BYMA**:
- Los lanzadores de calls prefieren vender 2-4 semanas antes del vencimiento para capturar el mayor derretimiento.
- Los compradores de opciones que apuestan a un movimiento rápido pierden contra el tiempo si el papel no se mueve.

---

## Vega: el riesgo de volatilidad

Vega mide cuánto cambia la prima si la VI sube 1 punto porcentual.

**Ejemplo**: call base $5.000, 40 días, VI = 72%. Vega = $18. Si la VI sube de 72% a 73%, la prima sube $18. Si la VI cae de 72% a 71%, la prima baja $18.

### Compradores vs. lanzadores ante la VI

- **Comprador de calls**: tiene vega positivo. Quiere que la VI suba (el mercado se ponga nervioso).
- **Lanzador cubierto**: tiene vega negativo. Quiere que la VI baje (o que quede igual, para que theta juegue a su favor).

En Argentina, las noticias macro (cepo, devaluación, resultado electoral) mueven la VI bruscamente. Un lanzador puede ver cómo la prima que cobró ya no cubre el mark-to-market porque la VI subió.

---

## Gamma: la aceleración del delta

Gamma mide cuánto cambia el delta cuando se mueve el spot. Es la "curva" de la posición.

- ATM: gamma máxima (el delta cambia rápido con el spot).
- Deep ITM o deep OTM: gamma baja (el delta ya casi no cambia).

**Para el lanzador cubierto**: gamma negativa. Si el papel se mueve mucho en cualquier dirección, la posición se deteriora más rápido de lo esperado. Es el riesgo del "gap" o salto repentino.

---

## Resumen: quién gana con cada movimiento

| Si sube... | Comprador de call | Lanzador cubierto |
|---|---|---|
| El spot | Gana (delta +) | Gana hasta la base, luego cap |
| La VI | Gana (vega +) | Pierde (vega −) |
| El tiempo que pasa | Pierde (theta −) | Gana (theta +) |
| El papel se mueve mucho (gamma) | Gana (gamma +) | Pierde (gamma −) |

El lanzamiento cubierto es esencialmente **vender volatilidad y tiempo** — te beneficiás de la quietud y del paso del tiempo, y te perjudica la movida brusca.

---

## Ejercicios

1. Con el simulador (`/simulador`), creá una posición: long 1 lote call base $5.300 con GGAL en $5.000, 40 días, VI 72%, tasa 35%. Luego mové el spot $200 hacia arriba y $200 hacia abajo. ¿Cuánto cambia la prima en cada caso? ¿Es simétrico? ¿Por qué?
2. ¿Por qué la opción ATM tiene el mayor vega y la opción deep OTM tiene vega casi nulo?
3. Explicá con tus palabras por qué el theta negativo del comprador de opciones es el "precio" que se paga por tener la posibilidad de ganar.
