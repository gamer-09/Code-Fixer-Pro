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
  { sym: '^BSESN', name: 'Sensex', region: 'IN' },
  { sym: '^NSEI', name: 'Nifty 50', region: 'IN' },
  { sym: '^KS11', name: 'KOSPI', region: 'KR' },
  { sym: '^TWII', name: 'Taiwan', region: 'TW' },
  { sym: '^MXX', name: 'IPC Mexico', region: 'MX' },
  { sym: '^IBEX', name: 'IBEX 35', region: 'ES' },
];

export const STOCKS = [
  // US Mega Cap
  { sym: 'AAPL', name: 'Apple' },
  { sym: 'MSFT', name: 'Microsoft' },
  { sym: 'NVDA', name: 'Nvidia' },
  { sym: 'GOOGL', name: 'Alphabet' },
  { sym: 'AMZN', name: 'Amazon' },
  { sym: 'META', name: 'Meta' },
  { sym: 'TSLA', name: 'Tesla' },
  { sym: 'NFLX', name: 'Netflix' },
  // Finance
  { sym: 'JPM', name: 'JPMorgan' },
  { sym: 'GS', name: 'Goldman Sachs' },
  { sym: 'BAC', name: 'Bank of America' },
  // Tech
  { sym: 'TSM', name: 'TSMC' },
  { sym: 'ORCL', name: 'Oracle' },
  { sym: 'AMD', name: 'AMD' },
  { sym: 'INTC', name: 'Intel' },
  { sym: 'AVGO', name: 'Broadcom' },
  // Consumer / other
  { sym: 'WMT', name: 'Walmart' },
  { sym: 'V', name: 'Visa' },
  { sym: 'UNH', name: 'UnitedHealth' },
  { sym: 'XOM', name: 'Exxon Mobil' },
];

export const CRYPTOS = [
  { sym: 'BTC-USD', label: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { sym: 'ETH-USD', label: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { sym: 'BNB-USD', label: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { sym: 'SOL-USD', label: 'SOL', name: 'Solana', color: '#9945FF' },
  { sym: 'XRP-USD', label: 'XRP', name: 'Ripple', color: '#346AA9' },
  { sym: 'DOGE-USD', label: 'DOGE', name: 'Dogecoin', color: '#CBA051' },
  { sym: 'ADA-USD', label: 'ADA', name: 'Cardano', color: '#0033AD' },
  { sym: 'AVAX-USD', label: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { sym: 'DOT-USD', label: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { sym: 'MATIC-USD', label: 'POL', name: 'Polygon', color: '#8247E5' },
  { sym: 'LINK-USD', label: 'LINK', name: 'Chainlink', color: '#2A5ADA' },
  { sym: 'UNI7083-USD', label: 'UNI', name: 'Uniswap', color: '#FF007A' },
];

export const COMMODITIES = [
  { sym: 'GC=F', label: 'Gold', unit: 'USD/oz' },
  { sym: 'SI=F', label: 'Silver', unit: 'USD/oz' },
  { sym: 'CL=F', label: 'Crude Oil', unit: 'USD/bbl' },
  { sym: 'BZ=F', label: 'Brent Crude', unit: 'USD/bbl' },
  { sym: 'NG=F', label: 'Nat Gas', unit: 'USD/MMBtu' },
  { sym: 'ZW=F', label: 'Wheat', unit: 'USD/bu' },
  { sym: 'ZC=F', label: 'Corn', unit: 'USD/bu' },
  { sym: 'HG=F', label: 'Copper', unit: 'USD/lb' },
  { sym: 'PL=F', label: 'Platinum', unit: 'USD/oz' },
  { sym: 'PA=F', label: 'Palladium', unit: 'USD/oz' },
];

export const FOREX = [
  { sym: 'EURUSD=X', label: 'EUR/USD' },
  { sym: 'GBPUSD=X', label: 'GBP/USD' },
  { sym: 'USDJPY=X', label: 'USD/JPY' },
  { sym: 'USDCAD=X', label: 'USD/CAD' },
  { sym: 'AUDUSD=X', label: 'AUD/USD' },
  { sym: 'USDCHF=X', label: 'USD/CHF' },
  { sym: 'USDCNY=X', label: 'USD/CNY' },
  { sym: 'USDNGN=X', label: 'USD/NGN' },
  { sym: 'USDINR=X', label: 'USD/INR' },
  { sym: 'USDKRW=X', label: 'USD/KRW' },
  { sym: 'USDBRL=X', label: 'USD/BRL' },
  { sym: 'USDMXN=X', label: 'USD/MXN' },
  { sym: 'USDSGD=X', label: 'USD/SGD' },
  { sym: 'USDHKD=X', label: 'USD/HKD' },
  { sym: 'NZDUSD=X', label: 'NZD/USD' },
  { sym: 'USDZAR=X', label: 'USD/ZAR' },
];

export const ALL_SYMBOLS = [
  ...INDICES.map((i) => i.sym),
  ...STOCKS.map((s) => s.sym),
  ...CRYPTOS.map((c) => c.sym),
  ...COMMODITIES.map((c) => c.sym),
  ...FOREX.map((f) => f.sym),
];
