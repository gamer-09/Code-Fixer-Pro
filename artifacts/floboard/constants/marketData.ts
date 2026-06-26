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
  { sym: 'AAPL', name: 'Apple' },
  { sym: 'MSFT', name: 'Microsoft' },
  { sym: 'NVDA', name: 'Nvidia' },
  { sym: 'GOOGL', name: 'Alphabet' },
  { sym: 'AMZN', name: 'Amazon' },
  { sym: 'META', name: 'Meta' },
  { sym: 'TSLA', name: 'Tesla' },
  { sym: 'NFLX', name: 'Netflix' },
  { sym: 'JPM', name: 'JPMorgan' },
  { sym: 'GS', name: 'Goldman Sachs' },
  { sym: 'BAC', name: 'Bank of America' },
  { sym: 'TSM', name: 'TSMC' },
  { sym: 'ORCL', name: 'Oracle' },
  { sym: 'AMD', name: 'AMD' },
  { sym: 'INTC', name: 'Intel' },
  { sym: 'AVGO', name: 'Broadcom' },
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
  // Majors
  { sym: 'EURUSD=X', label: 'EUR/USD' },
  { sym: 'GBPUSD=X', label: 'GBP/USD' },
  { sym: 'USDJPY=X', label: 'USD/JPY' },
  { sym: 'USDCHF=X', label: 'USD/CHF' },
  { sym: 'AUDUSD=X', label: 'AUD/USD' },
  { sym: 'NZDUSD=X', label: 'NZD/USD' },
  { sym: 'USDCAD=X', label: 'USD/CAD' },
  { sym: 'USDSGD=X', label: 'USD/SGD' },
  { sym: 'USDHKD=X', label: 'USD/HKD' },
  // EUR Crosses
  { sym: 'EURGBP=X', label: 'EUR/GBP' },
  { sym: 'EURJPY=X', label: 'EUR/JPY' },
  { sym: 'EURCHF=X', label: 'EUR/CHF' },
  { sym: 'EURAUD=X', label: 'EUR/AUD' },
  { sym: 'EURCAD=X', label: 'EUR/CAD' },
  { sym: 'EURNZD=X', label: 'EUR/NZD' },
  { sym: 'EURSGD=X', label: 'EUR/SGD' },
  { sym: 'EURHKD=X', label: 'EUR/HKD' },
  // GBP Crosses
  { sym: 'GBPJPY=X', label: 'GBP/JPY' },
  { sym: 'GBPCHF=X', label: 'GBP/CHF' },
  { sym: 'GBPAUD=X', label: 'GBP/AUD' },
  { sym: 'GBPCAD=X', label: 'GBP/CAD' },
  { sym: 'GBPNZD=X', label: 'GBP/NZD' },
  { sym: 'GBPSGD=X', label: 'GBP/SGD' },
  // AUD Crosses
  { sym: 'AUDJPY=X', label: 'AUD/JPY' },
  { sym: 'AUDCHF=X', label: 'AUD/CHF' },
  { sym: 'AUDCAD=X', label: 'AUD/CAD' },
  { sym: 'AUDNZD=X', label: 'AUD/NZD' },
  { sym: 'AUDSGD=X', label: 'AUD/SGD' },
  // NZD Crosses
  { sym: 'NZDJPY=X', label: 'NZD/JPY' },
  { sym: 'NZDCHF=X', label: 'NZD/CHF' },
  { sym: 'NZDCAD=X', label: 'NZD/CAD' },
  { sym: 'NZDSGD=X', label: 'NZD/SGD' },
  // CAD Crosses
  { sym: 'CADJPY=X', label: 'CAD/JPY' },
  { sym: 'CADCHF=X', label: 'CAD/CHF' },
  // CHF / JPY Crosses
  { sym: 'CHFJPY=X', label: 'CHF/JPY' },
  { sym: 'SGDJPY=X', label: 'SGD/JPY' },
  // USD vs Asia-Pacific EM
  { sym: 'USDCNY=X', label: 'USD/CNY' },
  { sym: 'USDCNH=X', label: 'USD/CNH' },
  { sym: 'USDINR=X', label: 'USD/INR' },
  { sym: 'USDKRW=X', label: 'USD/KRW' },
  { sym: 'USDTWD=X', label: 'USD/TWD' },
  { sym: 'USDTHB=X', label: 'USD/THB' },
  { sym: 'USDMYR=X', label: 'USD/MYR' },
  { sym: 'USDIDR=X', label: 'USD/IDR' },
  { sym: 'USDPHP=X', label: 'USD/PHP' },
  { sym: 'USDVND=X', label: 'USD/VND' },
  { sym: 'USDPKR=X', label: 'USD/PKR' },
  { sym: 'USDBDT=X', label: 'USD/BDT' },
  // USD vs Europe EM
  { sym: 'USDTRY=X', label: 'USD/TRY' },
  { sym: 'USDPLN=X', label: 'USD/PLN' },
  { sym: 'USDHUF=X', label: 'USD/HUF' },
  { sym: 'USDCZK=X', label: 'USD/CZK' },
  { sym: 'USDSEK=X', label: 'USD/SEK' },
  { sym: 'USDNOK=X', label: 'USD/NOK' },
  { sym: 'USDDKK=X', label: 'USD/DKK' },
  { sym: 'USDRUB=X', label: 'USD/RUB' },
  { sym: 'USDILS=X', label: 'USD/ILS' },
  // USD vs LatAm
  { sym: 'USDBRL=X', label: 'USD/BRL' },
  { sym: 'USDMXN=X', label: 'USD/MXN' },
  { sym: 'USDCLP=X', label: 'USD/CLP' },
  { sym: 'USDCOP=X', label: 'USD/COP' },
  { sym: 'USDPEN=X', label: 'USD/PEN' },
  { sym: 'USDARS=X', label: 'USD/ARS' },
  // USD vs Africa
  { sym: 'USDZAR=X', label: 'USD/ZAR' },
  { sym: 'USDNGN=X', label: 'USD/NGN' },
  { sym: 'USDKES=X', label: 'USD/KES' },
  { sym: 'USDEGP=X', label: 'USD/EGP' },
  { sym: 'USDGHS=X', label: 'USD/GHS' },
  { sym: 'USDTZS=X', label: 'USD/TZS' },
  { sym: 'USDMAD=X', label: 'USD/MAD' },
  // USD vs Middle East
  { sym: 'USDAED=X', label: 'USD/AED' },
  { sym: 'USDSAR=X', label: 'USD/SAR' },
  { sym: 'USDQAR=X', label: 'USD/QAR' },
  { sym: 'USDKWD=X', label: 'USD/KWD' },
  { sym: 'USDBHD=X', label: 'USD/BHD' },
  { sym: 'USDOMR=X', label: 'USD/OMR' },
  { sym: 'USDJOD=X', label: 'USD/JOD' },
  // EUR vs EM
  { sym: 'EURTRY=X', label: 'EUR/TRY' },
  { sym: 'EURPLN=X', label: 'EUR/PLN' },
  { sym: 'EURHUF=X', label: 'EUR/HUF' },
  { sym: 'EURCZK=X', label: 'EUR/CZK' },
  { sym: 'EURSEK=X', label: 'EUR/SEK' },
  { sym: 'EURNOK=X', label: 'EUR/NOK' },
  { sym: 'EURDKK=X', label: 'EUR/DKK' },
  { sym: 'EURZAR=X', label: 'EUR/ZAR' },
  // GBP vs EM
  { sym: 'GBPTRY=X', label: 'GBP/TRY' },
  { sym: 'GBPZAR=X', label: 'GBP/ZAR' },
  { sym: 'GBPPLN=X', label: 'GBP/PLN' },
];

export const SECTORS = [
  { sym: 'XLK', label: 'Technology' },
  { sym: 'XLF', label: 'Financials' },
  { sym: 'XLE', label: 'Energy' },
  { sym: 'XLV', label: 'Health Care' },
  { sym: 'XLI', label: 'Industrials' },
  { sym: 'XLP', label: 'Cons. Staples' },
  { sym: 'XLRE', label: 'Real Estate' },
  { sym: 'XLY', label: 'Cons. Discret.' },
  { sym: 'XLU', label: 'Utilities' },
  { sym: 'XLB', label: 'Materials' },
  { sym: 'XLC', label: 'Comm. Svcs' },
];

export const BONDS = [
  { sym: '^IRX', label: '3-Mo', months: 3 },
  { sym: '^FVX', label: '5-Yr', months: 60 },
  { sym: '^TNX', label: '10-Yr', months: 120 },
  { sym: '^TYX', label: '30-Yr', months: 360 },
];

export const MACRO = [
  { sym: '^VIX', label: 'VIX' },
  { sym: 'DX-Y.NYB', label: 'DXY' },
];

// Extra symbols available in watchlist but not in other tabs (additional forex crosses, indices, crypto)
export const EXTRA_SYMBOLS = [
  // Precious metals spot forex
  'XAUUSD=X', 'XAGUSD=X', 'XPTUSD=X', 'XPDUSD=X',
  // EUR crosses
  'EURGBP=X', 'EURJPY=X', 'EURCHF=X', 'EURAUD=X', 'EURCAD=X', 'EURNZD=X', 'EURSGD=X', 'EURHKD=X',
  'EURTRY=X', 'EURPLN=X', 'EURHUF=X', 'EURCZK=X', 'EURSEK=X', 'EURNOK=X', 'EURDKK=X', 'EURZAR=X',
  'EURRON=X', 'EURBGN=X', 'EURINR=X', 'EURKRW=X', 'EURTHB=X', 'EURMXN=X', 'EURBRL=X', 'EURILS=X', 'EURRUB=X',
  // GBP crosses
  'GBPJPY=X', 'GBPCHF=X', 'GBPAUD=X', 'GBPCAD=X', 'GBPNZD=X', 'GBPSGD=X', 'GBPTRY=X', 'GBPZAR=X', 'GBPPLN=X',
  'GBPHKD=X', 'GBPINR=X', 'GBPSEK=X', 'GBPNOK=X', 'GBPDKK=X', 'GBPCZK=X', 'GBPHUF=X',
  // AUD crosses
  'AUDJPY=X', 'AUDCHF=X', 'AUDCAD=X', 'AUDNZD=X', 'AUDSGD=X',
  // NZD crosses
  'NZDJPY=X', 'NZDCHF=X', 'NZDCAD=X', 'NZDSGD=X',
  // CAD/CHF/SGD crosses
  'CADJPY=X', 'CADCHF=X', 'CHFJPY=X', 'SGDJPY=X',
  // CHF crosses
  'CHFSGD=X', 'CHFHKD=X', 'CHFTRY=X', 'CHFPLN=X', 'CHFNOK=X', 'CHFSEK=X', 'CHFCZK=X', 'CHFHUF=X', 'CHFZAR=X',
  // USD vs Asia-Pacific EM
  'USDCNH=X', 'USDTWD=X', 'USDTHB=X', 'USDMYR=X', 'USDIDR=X', 'USDPHP=X', 'USDVND=X', 'USDPKR=X', 'USDBDT=X',
  'USDLKR=X', 'USDNPR=X', 'USDMNT=X', 'USDKHR=X', 'USDLAK=X', 'USDBND=X', 'USDMMK=X',
  // USD vs Europe EM
  'USDPLN=X', 'USDHUF=X', 'USDCZK=X', 'USDSEK=X', 'USDNOK=X', 'USDDKK=X', 'USDRUB=X', 'USDILS=X',
  'USDRON=X', 'USDBGN=X', 'USDRSD=X', 'USDUAH=X', 'USDBYN=X', 'USDGEL=X', 'USDAZN=X', 'USDAMD=X',
  'USDALL=X', 'USDKZT=X', 'USDUZS=X', 'USDKGS=X', 'USDTJS=X', 'USDMKD=X', 'USDBAM=X',
  // USD vs LatAm
  'USDCLP=X', 'USDCOP=X', 'USDPEN=X', 'USDARS=X',
  'USDUYU=X', 'USDBOB=X', 'USDPYG=X', 'USDDOP=X', 'USDGTQ=X', 'USDHNL=X', 'USDCRC=X',
  'USDJMD=X', 'USDTTD=X', 'USDBBD=X', 'USDNIO=X', 'USDSVC=X',
  // USD vs Africa
  'USDKES=X', 'USDEGP=X', 'USDGHS=X', 'USDTZS=X', 'USDMAD=X',
  'USDETB=X', 'USDZMW=X', 'USDMZN=X', 'USDTND=X', 'USDDZD=X', 'USDMUR=X', 'USDAOA=X',
  'USDUGX=X', 'USDRWF=X', 'USDLYD=X', 'USDMWK=X', 'USDBWP=X', 'USDSCR=X', 'USDNAD=X', 'USDSZL=X',
  // USD vs Middle East
  'USDAED=X', 'USDSAR=X', 'USDQAR=X', 'USDKWD=X', 'USDBHD=X', 'USDOMR=X', 'USDJOD=X',
  'USDLBP=X', 'USDIQD=X', 'USDYER=X', 'USDAFN=X',
  // Additional indices
  '^AEX', '^SSMI', '^OMXS30', '^STOXX50E', '^N100', '^STI', '^JKSE', '^KLSE', '^SET.BK', '^PSI', '^VN30', '^MERV', '^IPSA', '^BVSP',
  // Additional crypto
  'UNI7083-USD', 'AAVE-USD', 'MKR-USD', 'CRV-USD', 'SNX-USD', 'LDO-USD', 'GRT-USD',
  'SAND-USD', 'MANA-USD', 'AXS-USD', 'EGLD-USD', 'FTM-USD', 'ROSE-USD', 'ONE-USD',
  'ZIL-USD', 'CHZ-USD', 'ENJ-USD', 'BAT-USD',
  // Additional stocks
  'ADBE', 'QCOM', 'AMAT', 'LRCX', 'KLAC', 'ASML', 'TXN', 'MRVL', 'ON', 'STM',
  'DELL', 'HPQ', 'IBM', 'NOW', 'SNOW', 'NET', 'DDOG', 'MDB', 'ZS', 'OKTA',
  'TWLO', 'RBLX', 'LYFT', 'DASH', 'PINS', 'MTCH', 'ROKU', 'TTD', 'AFRM', 'SQ',
  // Additional commodities
  'ALI=F', 'ZR=F', 'ZL=F', 'ZM=F',
];

export const ALL_SYMBOLS = [
  ...INDICES.map((i) => i.sym),
  ...STOCKS.map((s) => s.sym),
  ...CRYPTOS.map((c) => c.sym),
  ...COMMODITIES.map((c) => c.sym),
  ...FOREX.map((f) => f.sym),
  ...SECTORS.map((s) => s.sym),
  ...BONDS.map((b) => b.sym),
  ...MACRO.map((m) => m.sym),
  ...EXTRA_SYMBOLS,
];
