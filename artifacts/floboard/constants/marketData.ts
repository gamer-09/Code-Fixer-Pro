export const INDICES = [
  { sym: '^GSPC', name: 'S&P 500', region: 'USA' },
  { sym: '^DJI', name: 'Dow Jones', region: 'USA' },
  { sym: '^IXIC', name: 'Nasdaq', region: 'USA' },
  { sym: '^RUT', name: 'Russell 2K', region: 'USA' },
  { sym: '^FTSE', name: 'FTSE 100', region: 'UK' },
  { sym: '^GDAXI', name: 'DAX', region: 'DE' },
  { sym: '^FCHI', name: 'CAC 40', region: 'FR' },
  { sym: '^N225', name: 'Nikkei 225', region: 'JP' },
  { sym: '^HSI', name: 'Hang Seng', region: 'HK' },
  { sym: '^AXJO', name: 'ASX 200', region: 'AU' },
];

export const STOCKS = [
  { sym: 'AAPL', name: 'Apple Inc.' },
  { sym: 'MSFT', name: 'Microsoft' },
  { sym: 'NVDA', name: 'Nvidia' },
  { sym: 'GOOGL', name: 'Alphabet' },
  { sym: 'AMZN', name: 'Amazon' },
  { sym: 'META', name: 'Meta' },
  { sym: 'TSLA', name: 'Tesla' },
  { sym: 'NFLX', name: 'Netflix' },
  { sym: 'JPM', name: 'JPMorgan' },
  { sym: 'TSM', name: 'TSMC' },
];

export const CRYPTOS = [
  { sym: 'BTC-USD', label: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { sym: 'ETH-USD', label: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { sym: 'BNB-USD', label: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { sym: 'SOL-USD', label: 'SOL', name: 'Solana', color: '#9945FF' },
  { sym: 'XRP-USD', label: 'XRP', name: 'Ripple', color: '#346AA9' },
  { sym: 'DOGE-USD', label: 'DOGE', name: 'Dogecoin', color: '#CBA051' },
];

export const COMMODITIES = [
  { sym: 'GC=F', label: 'Gold', unit: 'USD/oz' },
  { sym: 'SI=F', label: 'Silver', unit: 'USD/oz' },
  { sym: 'CL=F', label: 'Crude Oil', unit: 'USD/bbl' },
  { sym: 'NG=F', label: 'Nat Gas', unit: 'USD/MMBtu' },
  { sym: 'ZW=F', label: 'Wheat', unit: 'USD/bu' },
  { sym: 'HG=F', label: 'Copper', unit: 'USD/lb' },
];

export const FOREX = [
  { sym: 'EURUSD=X', label: 'EUR/USD' },
  { sym: 'GBPUSD=X', label: 'GBP/USD' },
  { sym: 'USDJPY=X', label: 'USD/JPY' },
  { sym: 'USDCAD=X', label: 'USD/CAD' },
  { sym: 'AUDUSD=X', label: 'AUD/USD' },
  { sym: 'USDNGN=X', label: 'USD/NGN' },
  { sym: 'USDCHF=X', label: 'USD/CHF' },
  { sym: 'USDCNY=X', label: 'USD/CNY' },
];

export const NEWS = [
  {
    src: 'Reuters',
    title: 'Federal Reserve signals patience on rate cuts as core inflation remains sticky',
    tag: 'bear' as const,
    age: '1h',
    impact: 'Bond yields rise; growth stocks under pressure',
  },
  {
    src: 'Bloomberg',
    title: 'Nvidia posts record datacenter revenue driven by AI chip demand surge',
    tag: 'bull' as const,
    age: '2h',
    impact: 'Semiconductor sector outperforms; NVDA hits new highs',
  },
  {
    src: 'FT',
    title: 'China PMI data beats forecasts, lifting Hong Kong and Asian indices',
    tag: 'bull' as const,
    age: '3h',
    impact: 'Hang Seng leads Asian session; commodity demand expectations rise',
  },
  {
    src: 'WSJ',
    title: 'US jobs report exceeds forecasts; unemployment holds at 4.1%',
    tag: 'bull' as const,
    age: '4h',
    impact: 'Dollar strengthens; equities mixed on rate expectations',
  },
  {
    src: 'Reuters',
    title: "OPEC+ extends production cuts through Q3, supporting oil above $80",
    tag: 'neutral' as const,
    age: '5h',
    impact: 'Energy stocks steady; inflation hawks flagging fuel costs',
  },
  {
    src: 'Bloomberg',
    title: 'Bitcoin ETF inflows hit monthly record as institutional demand expands',
    tag: 'bull' as const,
    age: '6h',
    impact: 'Crypto total market cap above $3T',
  },
  {
    src: 'FT',
    title: 'European Central Bank holds rates; signals two cuts possible in H2 2026',
    tag: 'neutral' as const,
    age: '7h',
    impact: 'EUR/USD flat; European equities drift higher',
  },
  {
    src: 'CNBC',
    title: 'Gold surges past $2,600 on safe-haven demand and dollar weakness',
    tag: 'bull' as const,
    age: '8h',
    impact: 'Precious metals outperform; miners rally',
  },
  {
    src: 'Reuters',
    title: "Naira stabilizes as Nigeria's FX reserves climb to 12-month high",
    tag: 'bull' as const,
    age: '9h',
    impact: 'USD/NGN retreats; positive for import costs',
  },
  {
    src: 'Bloomberg',
    title: 'AI spending by S&P 500 companies up 67% year-on-year in Q1 2026',
    tag: 'bull' as const,
    age: '11h',
    impact: 'Cloud and infrastructure stocks see renewed investor interest',
  },
];

export const ALL_SYMBOLS = [
  ...INDICES.map((i) => i.sym),
  ...STOCKS.map((s) => s.sym),
  ...CRYPTOS.map((c) => c.sym),
  ...COMMODITIES.map((c) => c.sym),
  ...FOREX.map((f) => f.sym),
];
