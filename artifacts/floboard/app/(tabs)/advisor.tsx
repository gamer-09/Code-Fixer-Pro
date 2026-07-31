import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconFlash, IconSend } from '@/components/Icons';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg, useMarket } from '@/context/MarketContext';
import { useSettings } from '@/context/SettingsContext';
import { getApiBase } from '@/utils/apiBase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BASE_URL = getApiBase();

const QUICK_QUESTIONS = [
  'Review my portfolio risk & diversification',
  'Analyze my watchlist outlook & correlations',
  'What are the top market movers today?',
  'Is now a good time to buy Bitcoin?',
  'Explain impact of rising interest rates',
  'Best sectors to invest in right now?',
  'How is the US economy performing?',
  'Should I be worried about inflation?',
];

const CONTEXT_SYMS = [
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: 'BTC-USD', label: 'BTC' },
  { sym: 'GC=F', label: 'Gold' },
  { sym: '^TNX', label: '10Y' },
  { sym: '^VIX', label: 'VIX' },
];

const INITIAL_MSG: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    "Hi! I'm FloAI, powered by Google Gemini. I have access to live market data — ask me about any stock, crypto, index, or financial topic and I'll give you real analysis.\n\nTry asking: \"Is now a good time to buy Bitcoin?\", \"How is Nvidia performing?\", or \"Explain the impact of rising interest rates.\"",
  timestamp: new Date(),
};

const RISK_GUIDANCE = {
  conservative: [
    '- [CONSERVATIVE MODE ACTIVE]: You MUST analyze ANY user request or asset through a Conservative, capital-preservation lens.',
    '- Focus heavily on downside risk, capital preservation, dividend yield, Treasury yields (^IRX, ^TNX), low volatility, and principal protection.',
    '- Caution against speculative plays, high-beta stocks, or unhedged cryptocurrency drawdowns.',
  ],
  moderate: [
    '- [MODERATE MODE ACTIVE]: You MUST analyze ANY user request or asset through a Balanced 60/40 Moderate risk lens.',
    '- Weigh growth potential and upside catalysts equally against downside macroeconomic and volatility risks.',
    '- Suggest diversification strategies and systematic rebalancing.',
  ],
  aggressive: [
    '- [AGGRESSIVE MODE ACTIVE]: You MUST analyze ANY user request or asset through an Aggressive, growth-maximizing investment lens.',
    '- Highlight breakout momentum, high-upside catalysts, AI infrastructure leadership, and digital asset growth.',
    '- Treat short-term drawdowns as high-reward entry points; emphasize upside target capture.',
  ],
};

function buildSystemPrompt(
  data: Record<string, { regularMarketPrice: number; regularMarketChangePercent: number }>,
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  holdingsText?: string,
  watchlistText?: string,
) {
  const lines = [
    `You are FloAI, an expert financial advisor. Today is ${new Date().toDateString()}.`,
    '',
    'You have access to live market data. Here is a snapshot:',
    '',
  ];
  const entries = Object.entries(data).slice(0, 25);
  for (const [sym, d] of entries) {
    lines.push(`${sym}: $${fmt(d.regularMarketPrice)} (${fmtChg(d.regularMarketChangePercent)})`);
  }
  if (holdingsText) {
    lines.push('', 'User Simulated Portfolio Holdings (Tracking Only / No Bank Info):', holdingsText);
  }
  if (watchlistText) {
    lines.push('', 'User Tracked Watchlist Symbols:', watchlistText);
  }
  lines.push(
    '',
    'Guidelines:',
    '- Provide educational, balanced financial context',
    '- Reference the live data and the user portfolio/watchlist when relevant',
    '- Always note that this is informational, not personal financial advice; do not ask for any deposits or personal banking information',
    '- Be concise but thorough; use bullet points where helpful',
    '- Stay factual; highlight uncertainty when present',
    ...RISK_GUIDANCE[riskProfile],
  );
  return lines.join('\n');
}

function generateFallbackAiResponse(query: string, risk: string): string {
  const r = (risk || 'moderate').toLowerCase();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const q = query.trim().toLowerCase();

  // ── 0. Conversational Greeting / Help Query ──
  if (/^(hi|hello|hey|yo|howdy|who are you|what can you do|help|thanks|thank you|good morning|good afternoon)[.!?]*$/i.test(q)) {
    return (
      `Hello! I'm **FloAI**, your AI financial advisor and market analyst.\n\n` +
      `I'm currently operating in **${r.toUpperCase()}** risk profile mode.\n\n` +
      `You can ask me to analyze any asset or market topic, for example:\n` +
      `- **"What is the outlook for Gold (GC=F)?"**\n` +
      `- **"Analyze Bitcoin (BTC-USD) breakout levels"**\n` +
      `- **"How is Apple (AAPL) performing?"**\n` +
      `- **"Review my portfolio risk & diversification"**\n\n` +
      `What would you like to explore today?`
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

// ── Market Context Ribbon ─────────────────────────────────────────────────

function MarketContextRibbon() {
  const colors = useColors();
  const { data } = useMarket();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.ribbonScroll}
    >
      {CONTEXT_SYMS.map(({ sym, label }) => {
        const d = data[sym];
        const chg = d?.regularMarketChangePercent ?? 0;
        const dir = chgDir(chg);
        const col = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
        const arrow = dir === 'up' ? '▲' : dir === 'dn' ? '▼' : '–';
        const priceStr = d == null ? '—'
          : sym === '^GSPC' ? fmt(d.regularMarketPrice, 0)
          : sym === 'BTC-USD' ? `$${fmt(d.regularMarketPrice, 0)}`
          : sym === '^TNX' ? `${fmt(d.regularMarketPrice, 2)}%`
          : sym === '^VIX' ? fmt(d.regularMarketPrice, 1)
          : `$${fmt(d.regularMarketPrice)}`;
        return (
          <View key={sym} style={[styles.ribbonChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <Text style={[styles.ribbonLabel, { color: colors.t4 }]}>{label}</Text>
            <Text style={[styles.ribbonVal, { color: colors.t1 }]}>{priceStr}</Text>
            {d && <Text style={[styles.ribbonChg, { color: col }]}>{arrow} {Math.abs(chg).toFixed(1)}%</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── No Key Banner ─────────────────────────────────────────────────────────

function NoKeyBanner() {
  const colors = useColors();
  const router = useRouter();
  return (
    <View style={[styles.noKeyBanner, { backgroundColor: colors.amberDim, borderColor: 'rgba(255,182,39,0.25)' }]}>
      <Text style={[styles.noKeyTitle, { color: colors.amber }]}>Gemini API Key Required</Text>
      <Text style={[styles.noKeyBody, { color: colors.t3 }]}>
        FloAI needs a Gemini API key to work. It's free to get — go to Settings to add yours.
      </Text>
      <View style={styles.noKeyBtns}>
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={[styles.noKeyBtn, { backgroundColor: colors.amber + '22', borderColor: 'rgba(255,182,39,0.4)' }]}
        >
          <Text style={[styles.noKeyBtnText, { color: colors.amber }]}>Open Settings</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}
          style={[styles.noKeyBtn, { backgroundColor: colors.surface, borderColor: colors.rim }]}
        >
          <Text style={[styles.noKeyBtnText, { color: colors.t2 }]}>Get Free Key →</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Chat Components ───────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const colors = useColors();
  const isUser = msg.role === 'user';

  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.25)' }]}>
          <IconFlash size={12} color={colors.gain} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.blue, borderColor: 'transparent' }]
            : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.rim }],
        ]}
      >
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.t1 }]}>{msg.content}</Text>
        <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.45)' : colors.t4 }]}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const colors = useColors();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 4), 420);
    return () => clearInterval(id);
  }, []);
  const dots = ['●○○', '●●○', '●●●', '○●●'];
  return (
    <View style={[styles.bubbleWrap, styles.bubbleLeft]}>
      <View style={[styles.aiAvatar, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.25)' }]}>
        <IconFlash size={12} color={colors.gain} />
      </View>
      <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.rim, paddingVertical: 14, paddingHorizontal: 16 }]}>
        <Text style={[styles.bubbleText, { color: colors.gain, letterSpacing: 4 }]}>{dots[tick]}</Text>
      </View>
    </View>
  );
}

// ── Risk Profile Badge ────────────────────────────────────────────────────

function RiskBadge({ risk, onPress }: { risk: string; onPress?: () => void }) {
  const colors = useColors();
  const map: Record<string, { bg: string; col: string; label: string }> = {
    conservative: { bg: colors.blueDim, col: colors.blue, label: 'CONSERVATIVE' },
    moderate: { bg: colors.amberDim, col: colors.amber, label: 'MODERATE' },
    aggressive: { bg: colors.lossDim, col: colors.loss, label: 'AGGRESSIVE' },
  };
  const s = map[risk] ?? map.moderate;
  return (
    <Pressable onPress={onPress} style={[styles.riskBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.riskText, { color: s.col }]}>{s.label}</Text>
    </Pressable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

export default function AdvisorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams<{ q?: string }>();
  const { data } = useMarket();
  const { settings, updateSetting, triggerClearChat } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MSG]);
  const messagesRef = useRef<ChatMessage[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<FlatList>(null);
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const lastHandledParamRef = useRef<string | null>(null);
  const prevClearKeyRef = useRef(0);

  const cycleRiskProfile = () => {
    const order: ('conservative' | 'moderate' | 'aggressive')[] = ['conservative', 'moderate', 'aggressive'];
    const currentIdx = order.indexOf(settings.riskProfile);
    const nextRisk = order[(currentIdx + 1) % order.length];
    updateSetting('riskProfile', nextRisk);
    const notificationMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `⚡ FloAI mode switched to **${nextRisk.toUpperCase()}**. All prompts and analyses will now be rewritten and analyzed for ${
        nextRisk === 'aggressive'
          ? 'maximum growth and breakout upside'
          : nextRisk === 'conservative'
          ? 'capital preservation and yield income'
          : 'balanced 60/40 diversification and risk-adjusted growth'
      }.`,
      timestamp: new Date(),
    };
    setMessages((cur) => [...cur, notificationMsg]);
  };

  // Optimistically true so the UI is never blocked before the check resolves.
  // Falls back gracefully — if neither the server nor the user has a key,
  // the chat error message from the API explains what to do.
  const [serverHasKey, setServerHasKey] = useState(true);
  useEffect(() => {
    fetch(`${BASE_URL}/api/chat/status`)
      .then((r) => r.json() as Promise<{ hasServerKey?: boolean }>)
      .then((j) => setServerHasKey(!!j.hasServerKey))
      .catch(() => setServerHasKey(false));
  }, []);

  const hasKey = settings.geminiApiKey.length > 0 || serverHasKey;

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (settings.clearChatKey !== prevClearKeyRef.current) {
      prevClearKeyRef.current = settings.clearChatKey;
      const fresh: ChatMessage = { ...INITIAL_MSG, timestamp: new Date() };
      setMessages([fresh]);
      messagesRef.current = [fresh];
      setInput('');
      setStreaming(false);
    }
  }, [settings.clearChatKey]);

  useEffect(() => {
    if (params.q && params.q !== lastHandledParamRef.current) {
      lastHandledParamRef.current = params.q;
      setTimeout(() => sendMessage(params.q!), 400);
    }
  }, [params.q]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const modeTag = `[${settings.riskProfile.toUpperCase()} MODE] `;
      const twisted = trimmed.startsWith('[') ? trimmed : `${modeTag}${trimmed}`;
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: twisted, timestamp: new Date() };
      const aiId = (Date.now() + 1).toString();
      const aiMsg: ChatMessage = { id: aiId, role: 'assistant', content: '', timestamp: new Date() };

      const prev = messagesRef.current;
      const nextMessages = [...prev, userMsg, aiMsg];
      setMessages(nextMessages);
      messagesRef.current = nextMessages;
      setStreaming(true);
      setInput('');

      const historyForApi = prev.map((m) => ({ role: m.role, content: m.content }));
      historyForApi.push({ role: 'user', content: twisted });

      let holdingsText = '';
      let watchlistText = '';
      try {
        const rawHoldings = await AsyncStorage.getItem('@floboard:holdings');
        if (rawHoldings) {
          const hList = JSON.parse(rawHoldings) as { sym: string; qty: number; cost: number }[];
          holdingsText = hList.map((h) => `${h.sym}: ${h.qty} shares @ $${h.cost}`).join(', ');
        }
        const rawWatchlist = await AsyncStorage.getItem('@floboard:watchlist');
        if (rawWatchlist) {
          const wList = JSON.parse(rawWatchlist) as string[];
          watchlistText = wList.join(', ');
        }
      } catch { /* ignore */ }

      const systemPrompt = buildSystemPrompt(data, settings.riskProfile, holdingsText, watchlistText);

      let streamedContent = '';
      const isNative = Platform.OS !== 'web';

      try {
        if (isNative) {
          try {
            const response = await fetch(`${BASE_URL}/api/chat?stream=false`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: historyForApi,
                systemPrompt,
                geminiApiKey: settings.geminiApiKey,
              }),
            });
            if (response.ok) {
              const json = (await response.json()) as { content?: string; error?: string };
              if (!json.error && json.content) {
                streamedContent = json.content;
                setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: streamedContent } : m)));
              }
            }
          } catch {
            /* fall through to direct Gemini API call */
          }

          // If backend proxy failed or was unreachable, call Google Gemini directly from the mobile app if user provided a key
          if (!streamedContent && settings.geminiApiKey.trim().length > 0) {
            try {
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(settings.geminiApiKey.trim())}`;
              const geminiContents = historyForApi.map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              }));
              const geminiRes = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: systemPrompt }] },
                  contents: geminiContents,
                  generationConfig: { maxOutputTokens: 1024 },
                }),
              });
              if (geminiRes.ok) {
                const geminiJson = (await geminiRes.json()) as {
                  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
                };
                const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text && text.trim().length > 0) {
                  streamedContent = text;
                  setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: streamedContent } : m)));
                }
              } else {
                const errJson = (await geminiRes.json()) as { error?: { message?: string } };
                if (errJson?.error?.message) {
                  setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: `Error from Google Gemini API: ${errJson.error!.message}` } : m)));
                  streamedContent = `Error: ${errJson.error.message}`;
                }
              }
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : String(err);
              setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: `Failed to reach Google Gemini API directly: ${errMsg}` } : m)));
              streamedContent = `Error: ${errMsg}`;
            }
          }
        } else {
          const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: historyForApi,
              systemPrompt,
              geminiApiKey: settings.geminiApiKey,
            }),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const raw = line.slice(6).trim();
                if (raw === '[DONE]') break;
                try {
                  const parsed = JSON.parse(raw) as { content?: string; error?: string };
                  if (parsed.content) {
                    streamedContent += parsed.content;
                    setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: streamedContent } : m)));
                  }
                  if (parsed.error) {
                    setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: `Error: ${parsed.error}` } : m)));
                  }
                } catch {}
              }
            }
          }
        }
        if (!streamedContent) {
          streamedContent = generateFallbackAiResponse(trimmed, settings.riskProfile);
          setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: streamedContent } : m)));
        }
      } catch {
        const fbContent = generateFallbackAiResponse(trimmed, settings.riskProfile);
        setMessages((cur) => cur.map((m) => (m.id === aiId ? { ...m, content: fbContent } : m)));
      } finally {
        setStreaming(false);
      }
    },
    [data, streaming, settings.geminiApiKey, settings.riskProfile]
  );

  const handleSend = () => sendMessage(input);

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.pageTitle, { color: colors.t1 }]}>FloAI</Text>
            <View style={[styles.onlineChip, {
              backgroundColor: hasKey ? colors.gainDim : colors.amberDim,
              borderColor: hasKey ? 'rgba(0,229,160,0.2)' : 'rgba(255,182,39,0.2)',
            }]}>
              <View style={[styles.onlineDot, { backgroundColor: hasKey ? colors.gain : colors.amber }]} />
              <Text style={[styles.onlineText, { color: hasKey ? colors.gain : colors.amber }]}>
                {hasKey ? 'ONLINE' : 'NO KEY'}
              </Text>
            </View>
          </View>
          <Text style={[styles.subTitle, { color: colors.t4 }]}>Powered by Gemini</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <RiskBadge risk={settings.riskProfile} onPress={cycleRiskProfile} />
          <Pressable
            onPress={triggerClearChat}
            style={[styles.clearBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
          >
            <Text style={[styles.clearBtnText, { color: colors.t3 }]}>Clear</Text>
          </Pressable>
        </View>
      </View>

      {/* Market context ribbon */}
      <View style={[styles.ribbonBar, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <MarketContextRibbon />
      </View>

      {!hasKey && (
        <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
          <NoKeyBanner />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble msg={item} />}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', padding: 14, paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={streaming ? <TypingIndicator /> : null}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        </View>

        {/* Quick questions */}
        {messages.length === 1 && !streaming && (
          <View style={[styles.quickWrap, { borderTopColor: colors.rim }]}>
            <Text style={[styles.quickHint, { color: colors.t4 }]}>Try asking:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickScroll}
            >
              {QUICK_QUESTIONS.map((q, i) => (
                <Pressable
                  key={i}
                  onPress={() => sendMessage(q)}
                  disabled={!hasKey}
                  style={({ pressed }) => [
                    styles.quickChip,
                    { backgroundColor: colors.card, borderColor: pressed ? colors.blue : colors.rim, opacity: !hasKey ? 0.4 : 1 },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.quickText, { color: colors.t2 }]}>{q}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.base,
              borderTopColor: colors.rim,
              paddingBottom: Platform.OS === 'web' ? 8 : insets.bottom + 8,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, {
              backgroundColor: colors.card,
              borderColor: input ? colors.blue + '66' : colors.rim,
              color: colors.t1,
              opacity: !hasKey ? 0.5 : 1,
            }]}
            value={input}
            onChangeText={setInput}
            placeholder={hasKey ? 'Ask about markets, stocks, crypto...' : 'Add a Gemini API key in Settings to chat...'}
            placeholderTextColor={colors.t4}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={hasKey}
          />
          <Pressable
            onPress={handleSend}
            disabled={streaming || !input.trim() || !hasKey}
            style={[
              styles.sendBtn,
              {
                backgroundColor: streaming || !input.trim() || !hasKey ? colors.card : colors.gain,
                borderColor: streaming || !input.trim() || !hasKey ? colors.rim : 'transparent',
              },
            ]}
          >
            {streaming ? (
              <ActivityIndicator size="small" color={colors.t3} />
            ) : (
              <IconSend size={16} color={streaming || !input.trim() || !hasKey ? colors.t4 : '#000'} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  subTitle: { fontSize: 10, marginTop: 1 },
  onlineChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20,
    borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2,
  },
  onlineDot: { width: 5, height: 5, borderRadius: 3 },
  onlineText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  riskBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  riskText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  clearBtn: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  clearBtnText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  ribbonBar: { borderBottomWidth: 1 },
  ribbonScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  ribbonChip: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', minWidth: 66,
  },
  ribbonLabel: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  ribbonVal: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  ribbonChg: { fontSize: 9, fontFamily: 'Inter_500Medium', marginTop: 1 },

  // No key banner
  noKeyBanner: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 4 },
  noKeyTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  noKeyBody: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  noKeyBtns: { flexDirection: 'row', gap: 8 },
  noKeyBtn: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  noKeyBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Chat
  bubbleWrap: { marginBottom: 10 },
  bubbleLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bubbleRight: { flexDirection: 'row', justifyContent: 'flex-end' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  bubble: { maxWidth: '80%', borderRadius: 14, borderWidth: 1, padding: 12 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderTopLeftRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 21, fontFamily: 'Inter_400Regular' },
  timeText: { fontSize: 9, marginTop: 5, textAlign: 'right' },

  // Quick questions
  quickWrap: { borderTopWidth: 1, paddingTop: 8 },
  quickHint: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, paddingHorizontal: 14, marginBottom: 6, textTransform: 'uppercase' },
  quickScroll: { paddingHorizontal: 14, paddingBottom: 6, gap: 6 },
  quickChip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  quickText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingTop: 8, paddingHorizontal: 14, borderTopWidth: 1,
  },
  textInput: {
    flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 13, fontFamily: 'Inter_400Regular',
    maxHeight: 100, lineHeight: 20,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
