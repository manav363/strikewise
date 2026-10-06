import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSymbol, buildSymbol, nearestStrike } from "../src/index.js";

// Symbol formats checked against Zerodha Kite Connect docs/forum examples:
// BANKNIFTY23OCT40000CE, NIFTY21MAY15300CE, NIFTY22JUNFUT

test("parseSymbol: monthly call option", () => {
  assert.deepEqual(parseSymbol("NIFTY26OCT24500CE"), {
    underlying: "NIFTY",
    year: 2026,
    month: 10,
    type: "CE",
    strike: 24500,
  });
});

test("parseSymbol: monthly put option on an index", () => {
  assert.deepEqual(parseSymbol("BANKNIFTY23OCT40000PE"), {
    underlying: "BANKNIFTY",
    year: 2023,
    month: 10,
    type: "PE",
    strike: 40000,
  });
});

test("parseSymbol: futures have no strike", () => {
  assert.deepEqual(parseSymbol("NIFTY22JUNFUT"), {
    underlying: "NIFTY",
    year: 2022,
    month: 6,
    type: "FUT",
  });
});

test("parseSymbol: stock names with & and -", () => {
  assert.equal(parseSymbol("M&M26OCTFUT").underlying, "M&M");
  assert.equal(parseSymbol("BAJAJ-AUTO26OCT9000CE").underlying, "BAJAJ-AUTO");
});

test("parseSymbol: decimal strikes and lowercase input", () => {
  assert.equal(parseSymbol("idea26oct12.5ce").strike, 12.5);
});

test("parseSymbol: throws on invalid input", () => {
  assert.throws(() => parseSymbol("hello"), /Invalid monthly F&O symbol/);
  assert.throws(() => parseSymbol("NIFTY26XYZ24500CE"), /Invalid/);
  assert.throws(() => parseSymbol(""), /Invalid/);
});

test("buildSymbol: option and future", () => {
  assert.equal(
    buildSymbol({ underlying: "NIFTY", year: 2026, month: 10, type: "PE", strike: 24400 }),
    "NIFTY26OCT24400PE"
  );
  assert.equal(
    buildSymbol({ underlying: "nifty", year: 2022, month: 6, type: "FUT" }),
    "NIFTY22JUNFUT"
  );
});

test("buildSymbol: validates input", () => {
  assert.throws(() => buildSymbol({ underlying: "NIFTY", year: 2026, month: 13, type: "FUT" }), /Month/);
  assert.throws(() => buildSymbol({ underlying: "NIFTY", year: 2026, month: 10, type: "CE" }), /strike/);
});

test("parseSymbol and buildSymbol round-trip", () => {
  for (const s of ["NIFTY26OCT24500CE", "BANKNIFTY23OCT40000PE", "M&M26OCTFUT", "NIFTY22JUNFUT"]) {
    assert.equal(buildSymbol(parseSymbol(s)), s);
  }
});

test("nearestStrike: rounds to the closest step", () => {
  assert.equal(nearestStrike(24437, 50), 24450);
  assert.equal(nearestStrike(24424, 50), 24400);
  assert.equal(nearestStrike(51833, 100), 51800);
  assert.equal(nearestStrike(24450, 50), 24450);
});

test("nearestStrike: rejects a bad step", () => {
  assert.throws(() => nearestStrike(24437, 0), /positive/);
  assert.throws(() => nearestStrike(24437, -50), /positive/);
});
