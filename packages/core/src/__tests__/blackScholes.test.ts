import { describe, expect, it } from "vitest";
import { blackScholes, impliedVol, normCdf } from "../blackScholes";

describe("normCdf", () => {
  it("valores conocidos", () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 6);
    expect(normCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normCdf(-1.96)).toBeCloseTo(0.025, 3);
  });
});

describe("blackScholes — valores dorados (Hull)", () => {
  // Hull, ejemplo clásico: S=42, K=40, r=10%, sigma=20%, t=0.5
  const base = { spot: 42, strike: 40, rate: 0.1, vol: 0.2, timeToExpiry: 0.5 };

  it("call europeo", () => {
    const { price, delta } = blackScholes({ type: "call", ...base });
    expect(price).toBeCloseTo(4.76, 2);
    expect(delta).toBeGreaterThan(0.5);
    expect(delta).toBeLessThan(1);
  });

  it("put europeo (paridad put-call)", () => {
    const call = blackScholes({ type: "call", ...base }).price;
    const put = blackScholes({ type: "put", ...base }).price;
    expect(put).toBeCloseTo(0.81, 2);
    // C - P = S - K*e^(-rt)
    const parity = base.spot - base.strike * Math.exp(-base.rate * base.timeToExpiry);
    expect(call - put).toBeCloseTo(parity, 6);
  });

  it("ATM delta ~0.5 para call de corto plazo y tasa baja", () => {
    const { delta } = blackScholes({
      type: "call",
      spot: 100,
      strike: 100,
      rate: 0,
      vol: 0.3,
      timeToExpiry: 0.05,
    });
    expect(delta).toBeCloseTo(0.51, 1);
  });

  it("vencida devuelve intrínseco", () => {
    expect(
      blackScholes({ type: "call", spot: 110, strike: 100, rate: 0.1, vol: 0.3, timeToExpiry: 0 })
        .price,
    ).toBe(10);
    expect(
      blackScholes({ type: "put", spot: 110, strike: 100, rate: 0.1, vol: 0.3, timeToExpiry: 0 })
        .price,
    ).toBe(0);
  });
});

describe("impliedVol", () => {
  it("recupera la vol usada para pricear", () => {
    const input = {
      type: "call" as const,
      spot: 5000,
      strike: 4700,
      rate: 0.3,
      timeToExpiry: 60 / 365,
    };
    const price = blackScholes({ ...input, vol: 0.55 }).price;
    const iv = impliedVol(input, price);
    expect(iv).not.toBeNull();
    expect(iv!).toBeCloseTo(0.55, 3);
  });

  it("null si la prima viola no-arbitraje", () => {
    expect(
      impliedVol(
        { type: "call", spot: 100, strike: 90, rate: 0, timeToExpiry: 0.1 },
        5, // menor al intrínseco (10)
      ),
    ).toBeNull();
  });
});
