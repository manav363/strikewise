# strikewise

Tiny, zero-dependency helpers for NSE F&O contract symbols.

- Parse `NIFTY26OCT24500CE` into `{ underlying, year, month, type, strike }`
- Build a symbol back from its parts
- Find the nearest strike for a price

Symbol formats follow the Zerodha Kite Connect `tradingsymbol` convention for **monthly** contracts.

## Install

```bash
npm install strikewise
```

Requires Node.js 18 or newer. This is an ES module package, so use `import`.

## Usage

```js
import { parseSymbol, buildSymbol, nearestStrike } from "strikewise";

parseSymbol("NIFTY26OCT24500CE");
// { underlying: "NIFTY", year: 2026, month: 10, type: "CE", strike: 24500 }

parseSymbol("M&M26OCTFUT");
// { underlying: "M&M", year: 2026, month: 10, type: "FUT" }

buildSymbol({ underlying: "NIFTY", year: 2026, month: 10, type: "PE", strike: 24400 });
// "NIFTY26OCT24400PE"

nearestStrike(24437, 50);
// 24450
```

## API

### `parseSymbol(symbol)`

Parses a monthly option (`CE`/`PE`) or futures (`FUT`) symbol. Input is case-insensitive and trimmed. Returns a `Contract` object. Throws an `Error` if the symbol is not a valid monthly F&O symbol.

### `buildSymbol(contract)`

Builds a symbol from `{ underlying, year, month, type, strike? }`. `year` is the full year (2026), `month` is 1-12, `type` is `"CE"`, `"PE"` or `"FUT"`. Options require a `strike`. Throws on an invalid month or a missing strike.

### `nearestStrike(price, step)`

Rounds `price` to the closest multiple of `step` (for example 50 for NIFTY, 100 for BANKNIFTY). Throws if `step` is not positive.

## Limitations

- Only **monthly** symbols are supported. Weekly-expiry symbols (such as `BANKNIFTY23N0144500CE`) are planned for a later version.
- It only reads and writes the text format. It does not check that a contract actually exists on NSE, and it does not know expiry dates or lot sizes.

## Development

```bash
npm test
```

## License

MIT
