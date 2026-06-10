---
titulo: "¿Qué es una opción?"
modulo: "Módulo 00 — Fundamentos"
orden: 1
descripcion: "El contrato, las partes, y por qué existe este instrumento."
fuentes:
  - "BYMA — Opciones: https://www.byma.com.ar/productos/opciones/"
  - "John C. Hull, 'Options, Futures, and Other Derivatives', cap. 1"
  - "IAMC — Instituto Argentino de Mercado de Capitales, cuadernos de derivados"
---

## La idea en una frase

Una **opción** es un contrato que te da el **derecho — pero no la obligación —** de comprar o vender un activo a un precio fijado de antemano, hasta una fecha determinada.

Quien compra la opción paga por ese derecho un precio llamado **prima**. Quien la vende (en Argentina se dice que la **lanza**) cobra la prima y asume la **obligación** de cumplir si el comprador ejerce.

## Un ejemplo cotidiano: la seña

Imaginate que querés comprar un departamento que vale $100.000 USD, pero recién vas a tener la plata en 3 meses. Le pagás al dueño $2.000 por el derecho a comprarlo a $100.000 en cualquier momento de los próximos 90 días.

- Si en 3 meses el departamento vale $120.000, ejercés tu derecho: lo comprás a $100.000 y ganaste $18.000 (la diferencia menos la seña).
- Si vale $80.000, **no estás obligado** a comprar: dejás vencer el derecho y solo perdiste los $2.000.

Eso es exactamente una opción de compra (un **call**). La seña es la **prima**, los $100.000 son el **precio de ejercicio** (en Argentina: la **base**), y los 90 días definen el **vencimiento**.

## Los cuatro elementos de toda opción

| Elemento | En Argentina se dice | Qué es |
|---|---|---|
| Subyacente | el papel | El activo sobre el que existe el contrato (ej. acciones de GGAL) |
| Precio de ejercicio | la **base** | El precio pactado para comprar/vender |
| Vencimiento | el vencimiento | Fecha límite del derecho (3er viernes del mes que corresponda) |
| Prima | la prima | Lo que paga el comprador por el derecho |

## Las dos posiciones

- **Comprador (titular)**: paga la prima, tiene el derecho. Su pérdida máxima es la prima. Decide si ejerce.
- **Vendedor (lanzador)**: cobra la prima, tiene la obligación. Su ganancia máxima es la prima. No decide nada: si el comprador ejerce, debe cumplir.

> ⚠️ Esta asimetría es **el** concepto central de las opciones. Todo lo demás (estrategias, griegas, valuación) se construye sobre ella.

## ¿Para qué existen?

1. **Cobertura (seguro)**: un inversor con acciones de GGAL puede comprar un put para limitar su pérdida si el papel cae. Paga la prima como quien paga un seguro.
2. **Renta adicional**: quien tiene acciones puede lanzar calls contra ellas y cobrar primas (el famoso *lanzamiento cubierto*, la estrategia más usada del mercado argentino).
3. **Especulación apalancada**: con poca plata (la prima) se obtiene exposición a un movimiento grande del papel. Mucho potencial, mucho riesgo.

## Ejercicios

1. En el ejemplo del departamento: ¿cuál sería el equivalente a "lanzar" la opción? ¿Qué riesgo asume el dueño?
2. Si pagaste $2.000 de seña y el departamento termina valiendo exactamente $101.000, ¿te conviene ejercer? ¿Ganaste plata en total? (Pista: son dos preguntas distintas.)
3. Buscá en la web de BYMA la sección de opciones y mirá una pizarra real. No te preocupes por entender los códigos todavía — eso llega en la lección 4.
