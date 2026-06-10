import { describe, expect, it } from "vitest";
import {
  breakevens,
  maxGainLoss,
  payoffAtExpiry,
  type Position,
} from "../position";
import { getStrategy } from "../strategies";

describe("payoffAtExpiry", () => {
  const longCall: Position = {
    underlying: "GGAL",
    legs: [{ kind: "option", type: "call", strike: 4700, premium: 250, lots: 1 }],
  };

  it("call comprado: pierde la prima abajo de la base", () => {
    expect(payoffAtExpiry(longCall, 4000)).toBe(-250 * 100);
  });

  it("call comprado: breakeven en base + prima", () => {
    expect(payoffAtExpiry(longCall, 4950)).toBe(0);
    const be = breakevens(longCall, { min: 3000, max: 7000 });
    expect(be).toHaveLength(1);
    expect(be[0]).toBeCloseTo(4950, 0);
  });

  it("call comprado: ganancia ilimitada, pérdida limitada", () => {
    const { maxGain, maxLoss } = maxGainLoss(longCall, { min: 3000, max: 7000 });
    expect(maxGain).toBeNull(); // ilimitada
    expect(maxLoss).toBe(-250 * 100);
  });
});

describe("lanzamiento cubierto", () => {
  const legs = getStrategy("lanzamiento-cubierto")!.build({ spot: 5000 });
  const pos: Position = { underlying: "GGAL", legs };
  // stock @5000 x100, call lanzado base 5300 (round(5250)), prima 150

  it("arriba de la base la ganancia queda acotada", () => {
    // (5300-5000)*100 + 150*100 = 45000 a cualquier precio >= base
    expect(payoffAtExpiry(pos, 6000)).toBeCloseTo(45000, 6);
    expect(payoffAtExpiry(pos, 9000)).toBeCloseTo(45000, 6);
  });

  it("abajo, la prima amortigua la pérdida de las acciones", () => {
    // (4500-5000)*100 + 150*100 = -35000
    expect(payoffAtExpiry(pos, 4500)).toBeCloseTo(-35000, 6);
  });

  it("breakeven = costo de las acciones - prima", () => {
    const be = breakevens(pos, { min: 3000, max: 7000 });
    expect(be).toHaveLength(1);
    expect(be[0]).toBeCloseTo(4850, 0);
  });
});

describe("bull call spread", () => {
  const legs = getStrategy("bull-call-spread")!.build({ spot: 5000 });
  const pos: Position = { underlying: "GGAL", legs };
  // long call 5000 @250, short call 5500 @100 → costo neto 150

  it("ganancia y pérdida acotadas", () => {
    const { maxGain, maxLoss } = maxGainLoss(pos, { min: 3000, max: 8000 });
    expect(maxLoss).toBeCloseTo(-150 * 100, 6);
    expect(maxGain).toBeCloseTo((500 - 150) * 100, 6);
  });
});
