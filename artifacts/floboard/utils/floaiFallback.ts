/**
 * FloAI offline fallback response generator.
 *
 * Extracted from the advisor screen so the risk-mode response-shaping logic
 * can be unit-tested without calling the real Gemini API. This is the exact
 * response the app shows whenever the backend proxy AND the direct Gemini
 * call both fail (offline, rate-limited, no key, etc.).
 *
 * The generator is deterministic given (query, risk) aside from the
 * human-readable date stamp, so tests assert on the risk-mode markers,
 * topic routing, and structural content.
 */

export function generateFallbackAiResponse(query: string, risk: string): string {
  const r = (risk || 'moderate').toLowerCase();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const q = query.trim().toLowerCase();

  // ── 0. Conversational Chat & General Inquiries ──
  if (
    /^(hi|hello|hey|yo|howdy|who are you|what can you do|help|thanks|thank you|good morning|good afternoon|how are you|what'?s up|who made you|can we chat|let'?s chat|what is floboard|awesome|cool|ok|okay|hi there|hey there)[.!?]*$/i.test(q) ||
    (!/gold|gc=f|silver|si=f|xau|xag|metal|platinum|palladium|btc|bitcoin|eth|ethereum|sol|solana|crypto|doge|xrp|bnb|aapl|nvda|msft|tsla|pltr|amzn|googl|meta|stock|share|equity|s&p|sp500|qqq|earnings|eurusd|usdjpy|gbpusd|forex|fx|currency|dollar|dxy|\/usd|=x|^tnx|^irx|yield|treasury|bond|fed|rate|inflation|portfolio|watchlist|audit|invest|buy|sell|trade|hold/i.test(q))
  ) {
    if (/how are you|what'?s up/i.test(q)) {
      return (
        `I'm doing great and monitoring live global markets! I'm currently operating in **${r.toUpperCase()}** risk profile mode.\n\n` +
        `We can chat about financial concepts, or whenever you're ready, ask me to analyze any stock, crypto, forex pair, or your portfolio.`
      );
    }
    if (/who are you|who made you|what is floboard/i.test(q)) {
      return (
        `I am **FloAI**, the AI financial advisor and market analyst built directly into FloBoard.\n\n` +
        `I'm powered by Google Gemini and have real-time access to market prices, news sentiment, and your simulated portfolio. I adjust all my financial analyses to match your selected risk mode (**${r.toUpperCase()}**).`
      );
    }
    if (/thanks|thank you|awesome|cool|ok|okay/i.test(q)) {
      return (
        `You're very welcome! Let me know whenever you have another question or want to inspect a symbol or portfolio strategy in **${r.toUpperCase()}** mode.`
      );
    }
    return (
      `Hello! I'm **FloAI**, your conversational AI financial advisor and market analyst.\n\n` +
      `We can have a normal conversation about any topic, or whenever you want market advice, I will analyze it through your **${r.toUpperCase()}** risk profile mode.\n\n` +
      `Feel free to chat, or try asking:\n` +
      `- **"What is the outlook for Gold (GC=F)?"**\n` +
      `- **"Should I buy Bitcoin (BTC-USD) right now?"**\n` +
      `- **"How is Apple (AAPL) performing?"**\n` +
      `- **"Review my portfolio risk & diversification"**`
    );
  }

  // ── 1. Gold / Precious Metals ──
  if (/gold|gc=f|silver|si=f|xau|xag|metal|platinum|palladium/i.test(q)) {
    if (r === 'aggressive') {
      return `### **FloAI [AGGRESSIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Growth-Maximizing & Breakout Momentum Strategy**\n` +
        `- Analyzing your request on **Gold / Precious Metals** with an **Aggressive** lens: we evaluate precious metals not merely as a defensive hedge, but as a high-upside momentum play during monetary expansion and geopolitical repricing.\n` +
        `- Breakout confirmation above key technical resistance targets accelerated capital appreciation, favoring bullish continuation in spot (\`XAU/USD\`) and futures (\`GC=F\`).\n\n` +
        `**2. Actionable Aggressive Tactics**\n` +
        `- **Breakout Entry:** Add momentum exposure on high-volume breakouts above immediate resistance zones.\n` +
        `- **Leveraged Beta:** Growth portfolios can utilize commodity futures (\`GC=F\`) or gold miners (\`GDX\`, \`NEM\`) for higher beta relative to spot gold.\n` +
        `- **Volatility Management:** Use trailing stop-losses to lock in profits while riding sustained commodity supercycle rallies.\n\n` +
        `**3. Aggressive Risk Guidance regarding "${query}"**\n` +
        `- Monitor US Dollar (\`DXY\`) resistance breakouts and real Treasury yield shifts, which can trigger sharp intraday rotations.`;
    } else if (r === 'conservative') {
      return `### **FloAI [CONSERVATIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Capital Preservation & Wealth Defense Stance**\n` +
        `- Under your **Conservative** risk profile, **Gold / Precious Metals (\`GC=F\` / \`XAU/USD\`)** is evaluated strictly as a safe-haven store of value and wealth defense against equity drawdowns and purchasing power erosion.\n` +
        `- Our priority is zero principal loss and stability, avoiding speculative futures leverage.\n\n` +
        `**2. Actionable Conservative Tactics**\n` +
        `- **Strategic Allocation:** Limit total precious metals exposure to a disciplined **5–10%** of your net portfolio to maintain high liquidity and balance.\n` +
        `- **Physical / Spot Preference:** Favor unhedged spot gold (\`XAU/USD\`) or physical-backed ETFs (\`GLD\`, \`IAU\`) over volatile junior mining equities or leveraged futures.\n` +
        `- **Income & Safety Balance:** Use gold holdings as a steady non-correlated anchor alongside high-yielding Treasury bills (\`^IRX\` at ~3.76%).\n\n` +
        `**3. Conservative Guidance regarding "${query}"**\n` +
        `- Precious metals do not yield a coupon; ensure your overall allocation remains anchored by interest-bearing sovereign debt and defensive blue-chips.`;
    } else {
      return `### **FloAI [MODERATE MODE] Analysis (${dateStr})**\n\n` +
        `**1. 60/40 Balanced Macro Hedge & Diversification**\n` +
        `- With your **Moderate** profile, **Gold / Precious Metals (\`GC=F\` / \`XAU/USD\`)** serves as a dual-purpose asset: providing upside capital appreciation during commodity rallies while acting as a non-correlated stabilizer against equity sell-offs.\n\n` +
        `**2. Actionable Moderate Tactics**\n` +
        `- **Target Weighting:** Maintain a disciplined **5–8%** portfolio allocation to Gold as part of a diversified multi-asset portfolio.\n` +
        `- **Rebalancing Rule:** Rebalance systematically when gold rallies strongly, taking partial profits to reinvest into undervalued core equities or bonds.\n` +
        `- **Asset Pairing:** Combine spot gold with broad-market S&P 500 index exposure (\`SPY\` / \`^GSPC\`) to smooth overall portfolio Sharpe ratio.\n\n` +
        `**3. Balanced Guidance regarding "${query}"**\n` +
        `- Evaluate both upside momentum and downside support levels before adding to positions.`;
    }
  }

  // ── 2. Bitcoin / Crypto ──
  if (/btc|bitcoin|eth|ethereum|sol|solana|crypto|doge|xrp|bnb/i.test(q)) {
    if (r === 'aggressive') {
      return `### **FloAI [AGGRESSIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Maximum Growth & Layer-1 Breakout Stance**\n` +
        `- Based on your **Aggressive** stance, our analysis of **Bitcoin / Crypto Assets** centers on capturing asymmetrical upside, volume breakout patterns, and ecosystem expansion.\n` +
        `- Volatility is treated as an opportunity: short-term drawdowns in market leaders create high-reward entry points.\n\n` +
        `**2. Actionable Aggressive Tactics**\n` +
        `- **Core Layer-1 Overweight:** Allocate 15–20% to core crypto assets (\`BTC-USD\`, \`SOL-USD\`, \`ETH-USD\`) to capture structural digital asset adoption.\n` +
        `- **Momentum Breakout:** Target confirmed resistance breakouts accompanied by strong institutional ETF volume (\`IBIT\`, \`FBTC\`).\n` +
        `- **Trailing Stop Discipline:** Use active trailing stops to lock in gains during rapid altcoin rotations while maximizing upside capture.\n\n` +
        `**3. Aggressive Guidance regarding "${query}"**\n` +
        `- Keep capital deployed in high-liquidity leaders; avoid unhedged leverage on low-volume tokens.`;
    } else if (r === 'conservative') {
      return `### **FloAI [CONSERVATIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Downside Drawdown Control & Capital Protection**\n` +
        `- Under your **Conservative** mandate, **Bitcoin / Crypto Assets** are evaluated with extreme caution due to elevated volatility and historical drawdowns.\n` +
        `- Primary focus is capital preservation and guarding principal against sudden market corrections.\n\n` +
        `**2. Actionable Conservative Tactics**\n` +
        `- **Strict Allocation Limit:** Keep total cryptocurrency exposure between **0% and 3%** of your total portfolio, restricted exclusively to spot Bitcoin (\`BTC-USD\`).\n` +
        `- **Capital Safety Overweight:** Prioritize risk-free short Treasuries (\`^IRX\`) and intermediate sovereign yields (\`^TNX\`) over speculative crypto returns.\n` +
        `- **Stop-Loss Protection:** Maintain strict stop-loss orders below major technical support levels to eliminate tail risk.\n\n` +
        `**3. Conservative Guidance regarding "${query}"**\n` +
        `- Never deploy capital required for short-term liquidity into volatile digital assets.`;
    } else {
      return `### **FloAI [MODERATE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Balanced 5–10% Strategic Diversification**\n` +
        `- With your **Moderate** profile, **Bitcoin / Crypto Assets** are integrated as a controlled 5–10% growth sleeve within a balanced 60/40 equity-to-bond portfolio.\n` +
        `- We weigh long-term digital asset adoption upside equally against macroeconomic volatility.\n\n` +
        `**2. Actionable Moderate Tactics**\n` +
        `- **Dollar-Cost Averaging:** Use disciplined DCA on 10%+ market pullbacks to build a spot position in \`BTC-USD\` and \`ETH-USD\`.\n` +
        `- **Quarterly Rebalancing:** Rebalance systematically when crypto outperforms to lock in gains and prevent single-asset concentration.\n` +
        `- **Quality Focus:** Focus on established Layer-1 protocols with strong developer activity and liquidity.\n\n` +
        `**3. Balanced Guidance regarding "${query}"**\n` +
        `- Maintain a balanced portfolio mix where equities and fixed income remain your primary wealth anchors.`;
    }
  }

  // ── 3. Stocks / Equities ──
  if (/aapl|nvda|msft|tsla|pltr|amzn|googl|meta|stock|share|equity|s&p|sp500|qqq|earnings/i.test(q)) {
    if (r === 'aggressive') {
      return `### **FloAI [AGGRESSIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. AI Infrastructure & Growth Momentum Focus**\n` +
        `- Viewing your equity inquiry through an **Aggressive** lens, we prioritize earnings breakout momentum, AI infrastructure leadership, and high-beta revenue growth.\n` +
        `- Target companies exhibiting accelerating revenue growth, operating leverage, and upward analyst estimate revisions.\n\n` +
        `**2. Actionable Aggressive Tactics**\n` +
        `- **Tech Leadership Overweight:** Overweight semiconductor leaders (\`NVDA\`, \`AVGO\`, \`AMD\`) and enterprise cloud software (\`PLTR\`, \`CRM\`).\n` +
        `- **Breakout Buying:** Enter positions on confirmed volume breakouts above 20-day moving averages.\n` +
        `- **Upside Target Capture:** Let winning positions run with trailing stops while trimming laggards quickly.\n\n` +
        `**3. Aggressive Guidance regarding "${query}"**\n` +
        `- Accept higher beta and interim volatility as the cost of capturing market-leading equity returns.`;
    } else if (r === 'conservative') {
      return `### **FloAI [CONSERVATIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Dividend Safety & Balance Sheet Protection**\n` +
        `- Based on your **Conservative** stance, equity analysis focuses on blue-chip balance sheet safety, dividend yield compounding, and low-beta resilience.\n` +
        `- We prioritize companies with proven cash flow, pricing power, and recession-proof business models.\n\n` +
        `**2. Actionable Conservative Tactics**\n` +
        `- **Defensive Quality:** Prioritize dividend Aristocrats and defensive sectors (\`XLP\`, \`XLU\`, \`JNJ\`, \`PG\`, \`COST\`) with beta < 0.85.\n` +
        `- **Valuation Discipline:** Insist on a margin of safety; avoid high P/E multiples or unprofitable growth equities.\n` +
        `- **Fixed Income Cushion:** Maintain 50–60% in sovereign debt (\`^TNX\`, \`^IRX\`) to anchor overall portfolio stability.\n\n` +
        `**3. Conservative Guidance regarding "${query}"**\n` +
        `- Focus on steady cash distributions and downside capital preservation over short-term capital gains.`;
    } else {
      return `### **FloAI [MODERATE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Quality Index Growth & Core Compounding**\n` +
        `- Under your **Moderate** 60/40 profile, we balance capital appreciation with defensive risk mitigation across broad market equities.\n\n` +
        `**2. Actionable Moderate Tactics**\n` +
        `- **Core Index Allocation:** Allocate 50–60% to broad index ETFs (\`^GSPC\` / \`SPY\`, \`QQQ\`) to capture global market expansion.\n` +
        `- **Quality Mega-Caps:** Supplement with mega-cap cash-flow leaders (\`AAPL\`, \`MSFT\`) that offer both growth and dividend stability.\n` +
        `- **Systematic Rebalancing:** Rebalance quarterly between equities and fixed income to lock in gains after rallies.\n\n` +
        `**3. Balanced Guidance regarding "${query}"**\n` +
        `- Maintain a balanced valuation discipline without over-concentrating in single sectors.`;
    }
  }

  // ── 4. Forex / Currencies ──
  if (/eurusd|usdjpy|gbpusd|forex|fx|currency|dollar|dxy|\/usd|=x/i.test(q)) {
    if (r === 'aggressive') {
      return `### **FloAI [AGGRESSIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Interest Rate Differentials & Momentum Swings**\n` +
        `- Under an **Aggressive** FX stance, we analyze currency pairs for breakout momentum, central bank policy divergence, and carry-trade yield capture.\n\n` +
        `**2. Actionable Aggressive Tactics**\n` +
        `- **Momentum Breakouts:** Trade major pairs (\`EUR/USD\`, \`USD/JPY\`) around central bank policy announcements and inflation data releases.\n` +
        `- **Trend Continuation:** Ride established carry-trade trends while maintaining strict stop-losses on leveraged positions.\n\n` +
        `**3. Aggressive Guidance regarding "${query}"**\n` +
        `- Watch US Dollar Index (\`DXY\`) support/resistance levels for market-wide FX directionality.`;
    } else if (r === 'conservative') {
      return `### **FloAI [CONSERVATIVE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Currency Risk Mitigation & USD Cash Preservation**\n` +
        `- Based on your **Conservative** profile, foreign exchange is evaluated strictly from a risk-hedging and wealth-preservation standpoint.\n\n` +
        `**2. Actionable Conservative Tactics**\n` +
        `- **Zero Speculative Leverage:** Avoid leveraged forex trading or emerging market exotic pairs (\`USD/TRY\`, \`USD/ZAR\`).\n` +
        `- **USD Cash Anchor:** Keep liquid reserves anchored in US Dollar Treasury bills (\`^IRX\`) to eliminate FX volatility.\n\n` +
        `**3. Conservative Guidance regarding "${query}"**\n` +
        `- Use FX markets solely to hedge international equity exposure when applicable.`;
    } else {
      return `### **FloAI [MODERATE MODE] Analysis (${dateStr})**\n\n` +
        `**1. Central Bank Parity & Trade-Weighted Balance**\n` +
        `- With a **Moderate** profile, we evaluate currency movements for macroeconomic context and purchasing power stability.\n\n` +
        `**2. Actionable Moderate Tactics**\n` +
        `- **Major Pair Diversification:** Track G10 major pairs (\`EUR/USD\`, \`GBP/USD\`, \`USD/JPY\`) alongside the US Dollar Index (\`DXY\`).\n` +
        `- **Balanced International Exposure:** Pair domestic equities with developed international ETFs (\`EFA\`) for currency-diversified growth.\n\n` +
        `**3. Balanced Guidance regarding "${query}"**\n` +
        `- Monitor central bank interest rate trajectories for medium-term FX direction.`;
    }
  }

  // ── 5. Bonds / Macro / General Default ──
  if (r === 'conservative') {
    return `### **FloAI [CONSERVATIVE MODE] Analysis (${dateStr})**\n\n` +
      `**1. Downside Protection & Capital Preservation Focus**\n` +
      `- Based on your **Conservative** stance, our primary objective is guarding principal against market volatility while generating steady dividend/yield income.\n` +
      `- In the current environment, short-term Treasury yields (\`^IRX\` at ~3.76%) and intermediate Treasuries (\`^TNX\` at ~4.60%) offer attractive risk-free returns compared to volatile equities.\n\n` +
      `**2. Portfolio & Asset Allocation Strategy**\n` +
      `- **Defensive Equities:** Prioritize blue-chip dividend payers and defensive sectors (\`XLP\`, \`XLU\`) with strong balance sheets.\n` +
      `- **Fixed Income Overweight:** Maintain a 50–60% allocation in sovereign debt and investment-grade bonds.\n` +
      `- **Precious Metals Hedge:** Maintain a 5% allocation in Gold (\`GC=F\` / \`XAU/USD\`) as an inflation and geopolitical hedge.\n\n` +
      `**3. Actionable Risk Guidance regarding "${query}"**\n` +
      `- Avoid speculative high-beta tech plays or unhedged cryptocurrency drawdowns.\n` +
      `- Use dollar-cost averaging only into high-quality defensive positions with proven cash flow.`;
  } else if (r === 'aggressive') {
    return `### **FloAI [AGGRESSIVE MODE] Analysis (${dateStr})**\n\n` +
      `**1. Maximum Growth & Momentum Stance**\n` +
      `- Based on your **Aggressive** risk profile, our strategy centers on high-beta upside catalysts, AI infrastructure leadership, and digital asset momentum.\n` +
      `- Volatility is treated as an opportunity: short-term drawdowns in market leaders create high-reward entry points.\n\n` +
      `**2. Portfolio & Asset Allocation Strategy**\n` +
      `- **AI & Tech Leadership:** Overweight semiconductor leaders (\`NVDA\`, \`AVGO\`, \`AMD\`) and high-growth software (\`PLTR\`, \`CRM\`).\n` +
      `- **Digital Assets:** Allocate 15–20% to core Layer-1 crypto assets (\`BTC-USD\`, \`SOL-USD\`, \`ETH-USD\`) to capture asymmetrical upside.\n` +
      `- **Momentum Equities:** Target breakout patterns across major market movers and leveraged ETFs where trend alignment is confirmed.\n\n` +
      `**3. Actionable Strategy regarding "${query}"**\n` +
      `- Monitor key resistance breakout levels and volume surges.\n` +
      `- Maintain disciplined trailing stop-losses to protect capital during rapid market rotations while maximizing growth capture.`;
  } else {
    return `### **FloAI [MODERATE MODE] Analysis (${dateStr})**\n\n` +
      `**1. 60/40 Balanced Growth & Stability Focus**\n` +
      `- Based on your **Moderate** risk profile, we balance capital appreciation with defensive risk mitigation across global markets.\n` +
      `- We weigh upside earnings catalysts in equities equally against macroeconomic interest rate and inflation headwinds.\n\n` +
      `**2. Portfolio & Asset Allocation Strategy**\n` +
      `- **Core Index Equities:** Allocate 50–60% to broad-market index ETFs (\`^GSPC\` / \`SPY\`, \`QQQ\`) to capture global market expansion.\n` +
      `- **Quality Growth & Income:** Supplement with mega-cap quality leaders (\`AAPL\`, \`MSFT\`) and selective corporate/sovereign debt.\n` +
      `- **Macro Hedge:** Keep a 5–10% allocation in Gold (\`XAU/USD\`) and diversified commodities to buffer against unexpected inflation spikes.\n\n` +
      `**3. Balanced Guidance regarding "${query}"**\n` +
      `- Evaluate both growth potential and downside support levels before adding to positions.\n` +
      `- Rebalance quarterly to maintain your target risk distribution without over-concentrating in single assets.`;
  }
}
