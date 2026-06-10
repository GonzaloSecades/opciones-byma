import { describe, expect, it } from "vitest";
import {
  expirationFromMonthCode,
  parseTicker,
  thirdFriday,
} from "../tickerParser";

describe("parseTicker", () => {
  it("call de GGAL", () => {
    expect(parseTicker("GFGC4700JU")).toEqual({
      ticker: "GFGC4700JU",
      underlying: "GGAL",
      optionType: "call",
      strike: 4700,
      monthCode: "JU",
    });
  });

  it("put de GGAL (V de venta)", () => {
    expect(parseTicker("GFGV4700JU")?.optionType).toBe("put");
  });

  it("strike con decimales (COME)", () => {
    const parsed = parseTicker("COMC3.6AG");
    expect(parsed?.underlying).toBe("COME");
    expect(parsed?.strike).toBeCloseTo(3.6);
  });

  it("otros subyacentes del mapa de prefijos", () => {
    expect(parseTicker("YPFC35000OC")?.underlying).toBe("YPFD");
    expect(parseTicker("PAMC1200DI")?.underlying).toBe("PAMP");
    expect(parseTicker("ALUC900FE")?.underlying).toBe("ALUA");
  });

  it("rechaza basura y prefijos desconocidos", () => {
    expect(parseTicker("GGAL")).toBeNull();
    expect(parseTicker("ZZZC100JU")).toBeNull();
    expect(parseTicker("GFGX4700JU")).toBeNull();
  });

  it("normaliza minúsculas y espacios", () => {
    expect(parseTicker(" gfgc4700ju ")?.ticker).toBe("GFGC4700JU");
  });
});

describe("thirdFriday", () => {
  it("junio 2026 → viernes 19", () => {
    expect(thirdFriday(2026, 6)).toBe("2026-06-19");
  });
  it("agosto 2026 → viernes 21", () => {
    expect(thirdFriday(2026, 8)).toBe("2026-08-21");
  });
});

describe("expirationFromMonthCode", () => {
  it("próximo vencimiento del mismo año", () => {
    expect(expirationFromMonthCode("JU", "2026-06-01")).toBe("2026-06-19");
  });
  it("si ya pasó, salta al año siguiente", () => {
    expect(expirationFromMonthCode("FE", "2026-06-01")).toBe("2027-02-19");
  });
  it("código desconocido → null", () => {
    expect(expirationFromMonthCode("XX", "2026-06-01")).toBeNull();
  });
});
