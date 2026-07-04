---
name: yahoo-finance2 v3 instantiation quirk
description: Default export from yahoo-finance2 v3 is the class, not a singleton instance
---

## Rule

When importing `yahoo-finance2`, the default export is the `YahooFinance` **class** (returned by `createYahooFinance`), not a pre-instantiated object. Calling static methods like `YahooFinance.quote(...)` throws: "Call `const yahooFinance = new YahooFinance()` first."

**Correct usage:**
```ts
import YahooFinanceClass from "yahoo-finance2";
const yf = new (YahooFinanceClass as unknown as new () => { quote: (...) => Promise<...> })();
yf.quote("AAPL", { fields: [...] });
```

**Why:** `createYahooFinance()` deliberately attaches method stubs on the class (not prototype) that throw the error, to guide users to instantiate. The default export is the class itself.

**How to apply:** Any time `yahoo-finance2` is imported in an ESM/esbuild context, always instantiate with `new` before calling methods.
