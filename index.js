// strikewise
// Small helpers for NSE F&O (futures and options) contract symbols.
//
// A monthly symbol is made of 5 parts joined together:
//
//   NIFTY   26    OCT    24500    CE
//   name    year  month  strike   type
//
//   name   = the index or stock (NIFTY, BANKNIFTY, M&M ...)
//   year   = last 2 digits of the year (26 = 2026)
//   month  = first 3 letters of the month
//   strike = strike price (only for options)
//   type   = CE (call option), PE (put option) or FUT (future)

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Returns true if the character is one of 0-9.
function isDigit(char) {
  return char >= "0" && char <= "9";
}

// "NIFTY26OCT24500CE"  ->  { underlying: "NIFTY", year: 2026, month: 10, type: "CE", strike: 24500 }
//
// We read the symbol from the END, one part at a time,
// cutting each part off once we have read it.
function parseSymbol(symbol) {
  if (typeof symbol !== "string") {
    throw new Error("Symbol must be a string");
  }

  let text = symbol.trim().toUpperCase();
  let type;
  let strike;

  // Step 1: the type is at the end (FUT, CE or PE)
  if (text.endsWith("FUT")) {
    type = "FUT";
    text = text.slice(0, -3);
  } else if (text.endsWith("CE") || text.endsWith("PE")) {
    type = text.slice(-2);
    text = text.slice(0, -2);

    // Step 2 (options only): the strike is the digits just before the type.
    // Keep taking characters from the end while they are digits or a dot.
    let strikeText = "";
    let lastChar = text[text.length - 1];
    while (isDigit(lastChar) || lastChar === ".") {
      strikeText = lastChar + strikeText;
      text = text.slice(0, -1);
      lastChar = text[text.length - 1];
    }

    strike = Number(strikeText);
    if (strikeText === "" || isNaN(strike) || strike <= 0) {
      throw new Error("Invalid strike in symbol: " + symbol);
    }
  } else {
    throw new Error("Symbol must end with CE, PE or FUT: " + symbol);
  }

  // Step 3: the month is the 3 letters before that
  const monthText = text.slice(-3);
  const monthIndex = MONTHS.indexOf(monthText); // -1 if not found
  if (monthIndex === -1) {
    throw new Error("Invalid month in symbol: " + symbol);
  }
  text = text.slice(0, -3);

  // Step 4: the year is the 2 digits before that
  const yearText = text.slice(-2);
  if (yearText.length !== 2 || !isDigit(yearText[0]) || !isDigit(yearText[1])) {
    throw new Error("Invalid year in symbol: " + symbol);
  }
  text = text.slice(0, -2);

  // Step 5: whatever is left is the name of the index or stock
  if (text === "" || text.includes(" ")) {
    throw new Error("Invalid name in symbol: " + symbol);
  }

  const contract = {
    underlying: text,
    year: 2000 + Number(yearText),
    month: monthIndex + 1, // index 0 is JAN, so add 1
    type: type,
  };
  if (type !== "FUT") {
    contract.strike = strike;
  }
  return contract;
}

// { underlying: "NIFTY", year: 2026, month: 10, type: "PE", strike: 24400 }  ->  "NIFTY26OCT24400PE"
function buildSymbol(contract) {
  if (typeof contract !== "object" || contract === null) {
    throw new Error("Contract must be an object");
  }

  const underlying = contract.underlying;
  const year = contract.year;
  const month = contract.month;
  const type = contract.type;
  const strike = contract.strike;

  if (typeof underlying !== "string" || underlying.trim() === "") {
    throw new Error("Underlying is required");
  }
  if (!Number.isInteger(year)) {
    throw new Error("Year must be a whole number like 2026");
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be 1-12, got " + month);
  }
  if (type !== "CE" && type !== "PE" && type !== "FUT") {
    throw new Error("Type must be CE, PE or FUT");
  }

  // 2026 -> "26", and 2005 -> "05"
  let yearText = String(year % 100);
  if (yearText.length === 1) {
    yearText = "0" + yearText;
  }

  const start = underlying.trim().toUpperCase() + yearText + MONTHS[month - 1];

  if (type === "FUT") {
    return start + "FUT";
  }

  if (typeof strike !== "number" || isNaN(strike) || strike <= 0) {
    throw new Error("Options need a positive strike");
  }
  return start + strike + type;
}

// Rounds a price to the closest strike.
// step = gap between strikes, for example 50 for NIFTY, 100 for BANKNIFTY.
// nearestStrike(24437, 50) -> 24450
function nearestStrike(price, step) {
  if (typeof price !== "number" || isNaN(price)) {
    throw new Error("Price must be a number");
  }
  if (typeof step !== "number" || isNaN(step) || step <= 0) {
    throw new Error("Step must be a positive number");
  }
  return Math.round(price / step) * step;
}

// Whatever we put in module.exports is what people get
// when they write: require("strikewise")
module.exports = {
  parseSymbol,
  buildSymbol,
  nearestStrike,
};
