// Run with: npm test
// Each check prints PASS or FAIL. If anything fails, we exit with code 1
// so npm knows the tests failed.

const { parseSymbol, buildSymbol, nearestStrike } = require("./index.js");

let passed = 0;
let failed = 0;

// Compare what we got with what we expected.
// JSON.stringify lets us compare objects as text.
function check(name, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed++;
    console.log("PASS  " + name);
  } else {
    failed++;
    console.log("FAIL  " + name);
    console.log("      expected: " + JSON.stringify(expected));
    console.log("      got:      " + JSON.stringify(actual));
  }
}

// Check that a function throws an error.
function checkThrows(name, fn) {
  try {
    fn();
    failed++;
    console.log("FAIL  " + name + " (no error was thrown)");
  } catch (err) {
    passed++;
    console.log("PASS  " + name);
  }
}

// ---- parseSymbol ----
// Formats checked against Zerodha Kite Connect examples:
// BANKNIFTY23OCT40000CE, NIFTY21MAY15300CE, NIFTY22JUNFUT

check("parse a call option", parseSymbol("NIFTY26OCT24500CE"), {
  underlying: "NIFTY", year: 2026, month: 10, type: "CE", strike: 24500,
});
check("parse a put option", parseSymbol("BANKNIFTY23OCT40000PE"), {
  underlying: "BANKNIFTY", year: 2023, month: 10, type: "PE", strike: 40000,
});
check("parse a future (no strike)", parseSymbol("NIFTY22JUNFUT"), {
  underlying: "NIFTY", year: 2022, month: 6, type: "FUT",
});
check("name with &", parseSymbol("M&M26OCTFUT").underlying, "M&M");
check("name with -", parseSymbol("BAJAJ-AUTO26OCT9000CE").underlying, "BAJAJ-AUTO");
check("decimal strike", parseSymbol("IDEA26OCT12.5CE").strike, 12.5);
check("lowercase and spaces are ok", parseSymbol("  nifty26oct24500ce ").strike, 24500);

checkThrows("not a symbol", () => parseSymbol("hello"));
checkThrows("bad month", () => parseSymbol("NIFTY26XYZ24500CE"));
checkThrows("missing strike", () => parseSymbol("NIFTY26OCTCE"));
checkThrows("missing year", () => parseSymbol("NIFTYOCT24500CE"));
checkThrows("missing name", () => parseSymbol("26OCT24500CE"));
checkThrows("empty text", () => parseSymbol(""));
checkThrows("not a string", () => parseSymbol(123));

// ---- buildSymbol ----

check(
  "build a put option",
  buildSymbol({ underlying: "NIFTY", year: 2026, month: 10, type: "PE", strike: 24400 }),
  "NIFTY26OCT24400PE"
);
check(
  "build a future",
  buildSymbol({ underlying: "nifty", year: 2022, month: 6, type: "FUT" }),
  "NIFTY22JUNFUT"
);
check(
  "year 2005 becomes 05",
  buildSymbol({ underlying: "NIFTY", year: 2005, month: 1, type: "FUT" }),
  "NIFTY05JANFUT"
);

checkThrows("month 13", () => buildSymbol({ underlying: "NIFTY", year: 2026, month: 13, type: "FUT" }));
checkThrows("bad type", () => buildSymbol({ underlying: "NIFTY", year: 2026, month: 10, type: "XX" }));
checkThrows("option without strike", () => buildSymbol({ underlying: "NIFTY", year: 2026, month: 10, type: "CE" }));
checkThrows("no name", () => buildSymbol({ year: 2026, month: 10, type: "FUT" }));
checkThrows("not an object", () => buildSymbol(null));

// ---- parse and build should undo each other ----

const symbols = ["NIFTY26OCT24500CE", "BANKNIFTY23OCT40000PE", "M&M26OCTFUT", "NIFTY22JUNFUT"];
for (const symbol of symbols) {
  check("round trip " + symbol, buildSymbol(parseSymbol(symbol)), symbol);
}

// ---- nearestStrike ----

check("round up", nearestStrike(24437, 50), 24450);
check("round down", nearestStrike(24424, 50), 24400);
check("step of 100", nearestStrike(51833, 100), 51800);
check("already a strike", nearestStrike(24450, 50), 24450);

checkThrows("step 0", () => nearestStrike(24437, 0));
checkThrows("negative step", () => nearestStrike(24437, -50));
checkThrows("price is text", () => nearestStrike("24437", 50));

// ---- result ----

console.log("");
console.log(passed + " passed, " + failed + " failed");
if (failed > 0) {
  process.exit(1);
}
