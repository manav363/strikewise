# strikewise

Small, zero-dependency helpers for NSE F&O contract symbols.

- Read `NIFTY26OCT24500CE` into `{ underlying, year, month, type, strike }`
- Build a symbol back from its parts
- Find the nearest strike for a price

Symbol formats follow the Zerodha Kite Connect `tradingsymbol` convention for **monthly** contracts.

## Install

```bash
npm install strikewise
```

## Usage

```js
const { parseSymbol, buildSymbol, nearestStrike } = require("strikewise");

parseSymbol("NIFTY26OCT24500CE");
// { underlying: "NIFTY", year: 2026, month: 10, type: "CE", strike: 24500 }

parseSymbol("M&M26OCTFUT");
// { underlying: "M&M", year: 2026, month: 10, type: "FUT" }

buildSymbol({ underlying: "NIFTY", year: 2026, month: 10, type: "PE", strike: 24400 });
// "NIFTY26OCT24400PE"

nearestStrike(24437, 50);
// 24450
```

`import { parseSymbol } from "strikewise"` works too.

## Functions

**`parseSymbol(symbol)`**: reads a monthly option (`CE`/`PE`) or future (`FUT`) symbol. Upper or lower case both work. Throws an `Error` if the symbol is not valid.

**`buildSymbol(contract)`**: builds a symbol from `{ underlying, year, month, type, strike }`. `year` is the full year (2026), `month` is 1-12, `type` is `"CE"`, `"PE"` or `"FUT"`. Options need a `strike`. Throws an `Error` on bad input.

**`nearestStrike(price, step)`**: rounds `price` to the closest multiple of `step`, for example 50 for NIFTY or 100 for BANKNIFTY.

## Limitations

- Only **monthly** symbols are supported, not weekly-expiry symbols (such as `BANKNIFTY23N0144500CE`).
- It only reads and writes the text. It does not check that a contract exists on NSE.

## Run the tests

```bash
npm test
```

## License

MIT
