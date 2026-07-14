---
titulo: "Tasas altas y opciones: el factor argentino"
modulo: "Módulo 03 — Valuación"
orden: 5
descripcion: "Por qué la tasa de interés importa más en Argentina que en mercados desarrollados, y cómo cambia la valuación."
fuentes:
  - "Hull, cap. 10 — Properties of Stock Options (sección 10.1)"
  - "Damodaran — Options in Emerging Markets"
---

## El rol de la tasa en Black-Scholes

En la fórmula de BS, la tasa `r` aparece en el factor de descuento `K·e^(−rT)`. Esto representa el costo de financiamiento: si comprás el call hoy en lugar de comprar el papel, el capital que no pusiste en las acciones puede rendir `r` en otro instrumento.

Una tasa alta hace que el call sea **relativamente más barato** que comprar el papel. Dicho de otro modo: los calls se aprecian con la tasa porque el sustituto natural (comprar el papel) se vuelve más caro en términos de costo de oportunidad.

---

## El impacto concreto: comparación

Mismo call base $5.300, GGAL $5.000, VI 72%, 40 días:

| Tasa anual | Prima del call |
|---|---|
| 5% (mercado normal) | ~$162 |
| 35% (Argentina 2024) | ~$185 |
| 60% (Argentina alta tasa) | ~$210 |
| 80% (escenario extremo) | ~$230 |

La diferencia de $68 entre tasa 5% y 80% no es trivial. Al lanzador le significa cobrar más; al comprador le significa pagar más.

**Podés verificar esto en `/simulador`**: creá el leg y mové el slider de tasa de 5% a 60% — vas a ver la prima subir solo por ese factor.

---

## El put se comporta al revés

Mientras que los calls suben con la tasa, los puts **bajan**. La razón es la paridad put-call:

```
put = call − spot + K·e^(−rT)
```

Si `r` sube, `e^(−rT)` baja (menor descuento → mayor valor presente de K → pero el efecto neto es que el put vale menos).

En términos prácticos: en Argentina los puts son estructuralmente más baratos que en mercados de baja tasa, lo cual es una de las razones por las que la gente no los usa tanto para cobertura.

---

## El ejercicio temprano de puts americanos

Este es el punto más importante de la tasa alta para opciones americanas:

Imaginá que tenés un put base $6.000 con GGAL en $2.000 (deep ITM). Si ejercés ahora, cobrás $6.000 − $2.000 = $4.000 de intrínseco. Podés poner esos $4.000 en LECAPs al 40% anual.

Si en cambio esperás 60 días más al vencimiento, el intrínseco no puede ser mayor a $6.000 (ya es el máximo), pero perdés los 60 días de renta. Ese ingreso potencial del capital hace que el ejercicio temprano sea racional.

**Regla práctica**: cuando un put americano está profundamente ITM en un mercado de tasas altas, evaluar el ejercicio temprano antes de asumir que "conviene esperar".

---

## ¿Qué tasa usar en el modelo?

En el simulador y la cadena usamos la tasa como porcentaje anual. La dificultad en Argentina es cuál tasa:

| Opción | Razonamiento | Problemas |
|---|---|---|
| Badlar / plazo fijo | Costo alternativo del inversor minorista | No captura la devaluación |
| Tasa de caución bursátil | Financiamiento real en el mercado de capitales | Fluctúa mucho |
| TNA de LECAPs | Instrumento libre de riesgo más comparable | Discontinuidades |

En el proyecto usamos una tasa fija configurable. Para análisis serios, revisala cada vez que la política monetaria cambie materialmente — en Argentina eso puede pasar de un mes al otro.

---

## Ejercicios

1. Usá el simulador con un put base $5.000, GGAL $5.000, 40 días, VI 72%. Calculá la prima con tasa 5% y con tasa 45%. ¿La diferencia va en la dirección esperada (put más barato con tasa alta)?
2. Explicá con tus palabras por qué la tasa alta "subsidia" implícitamente a los compradores de calls argentinos respecto a compradores en mercados de baja tasa.
3. ¿Por qué en un contexto de devaluación repentina y tasa de emergencia al 120%, los puts de GGAL podrían valer mucho menos de lo esperado por el modelo BS estándar?
