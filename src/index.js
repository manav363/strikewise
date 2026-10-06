/**
 * @typedef {"CE" | "PE"} OptionType
 *
 * @typedef {Object} Contract
 * @property {string} underlying  e.g. "NIFTY", "M&M"
 * @property {number} year        full year, e.g. 2026
 * @property {number} month       1-12
 * @property {OptionType | "FUT"} type
 * @property {number} [strike]    only for options
 */

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

// underlying + YY + MON + (FUT | strike + CE/PE)
const PATTERN =
  /^([A-Z0-9&-]+?)(\d{2})(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(FUT)|(\d+(?:\.\d+)?)(CE|PE))$/;

/**
 * Parse a monthly NSE F&O symbol like "NIFTY26OCT24500CE".
 * @param {string} symbol
 * @returns {Contract}
 */
export function parseSymbol(symbol) {
  const match = PATTERN.exec(String(symbol).trim().toUpperCase());
  if (!match) {
    throw new Error(`Invalid monthly F&O symbol: "${symbol}"`);
  }
  const [, underlying, yy, mon, fut, strike, optType] = match;
  const base = {
    underlying,
    year: 2000 + Number(yy),
    month: MONTHS.indexOf(mon) + 1,
  };
  if (fut) {
    return { ...base, type: "FUT" };
  }
  return { ...base, type: optType, strike: Number(strike) };
}

/**
 * Build a monthly NSE F&O symbol from its parts.
 * @param {Contract} contract
 * @returns {string}
 */
export function buildSymbol(contract) {
  const { underlying, year, month, type, strike } = contract;
  if (month < 1 || month > 12) {
    throw new Error(`Month must be 1-12, got ${month}`);
  }
  const head = `${underlying.toUpperCase()}${String(year % 100).padStart(2, "0")}${MONTHS[month - 1]}`;
  if (type === "FUT") {
    return `${head}FUT`;
  }
  if (strike === undefined) {
    throw new Error("Options need a strike");
  }
  return `${head}${strike}${type}`;
}

/**
 * Round a price to the closest strike.
 * @param {number} price
 * @param {number} step  strike gap, e.g. 50 for NIFTY, 100 for BANKNIFTY
 * @returns {number}
 */
export function nearestStrike(price, step) {
  if (step <= 0) {
    throw new Error("Strike step must be positive");
  }
  return Math.round(price / step) * step;
}
