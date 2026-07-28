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
  // Mega-caps
  { sym: 'BTC-USD', label: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { sym: 'ETH-USD', label: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { sym: 'BNB-USD', label: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { sym: 'SOL-USD', label: 'SOL', name: 'Solana', color: '#9945FF' },
  { sym: 'XRP-USD', label: 'XRP', name: 'Ripple', color: '#346AA9' },
  { sym: 'TON11419-USD', label: 'TON', name: 'Toncoin', color: '#0098EA' },
  // Large-caps
  { sym: 'DOGE-USD', label: 'DOGE', name: 'Dogecoin', color: '#CBA051' },
  { sym: 'ADA-USD', label: 'ADA', name: 'Cardano', color: '#0033AD' },
  { sym: 'AVAX-USD', label: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { sym: 'SHIB-USD', label: 'SHIB', name: 'Shiba Inu', color: '#E52B31' },
  { sym: 'DOT-USD', label: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { sym: 'LINK-USD', label: 'LINK', name: 'Chainlink', color: '#2A5ADA' },
  { sym: 'MATIC-USD', label: 'POL', name: 'Polygon', color: '#8247E5' },
  { sym: 'LTC-USD', label: 'LTC', name: 'Litecoin', color: '#838FA6' },
  { sym: 'BCH-USD', label: 'BCH', name: 'Bitcoin Cash', color: '#8DC351' },
  { sym: 'ATOM-USD', label: 'ATOM', name: 'Cosmos', color: '#2E3148' },
  { sym: 'NEAR-USD', label: 'NEAR', name: 'NEAR Protocol', color: '#00C08B' },
  { sym: 'ICP-USD', label: 'ICP', name: 'Internet Computer', color: '#FF0100' },
  { sym: 'ETC-USD', label: 'ETC', name: 'Ethereum Classic', color: '#669073' },
  { sym: 'HBAR-USD', label: 'HBAR', name: 'Hedera', color: '#00A79B' },
  { sym: 'VET-USD', label: 'VET', name: 'VeChain', color: '#15BDFF' },
  { sym: 'TRX-USD', label: 'TRX', name: 'TRON', color: '#EF0027' },
  { sym: 'XLM-USD', label: 'XLM', name: 'Stellar', color: '#7D00FF' },
  { sym: 'XMR-USD', label: 'XMR', name: 'Monero', color: '#FF6600' },
  // Layer 2 / Scaling
  { sym: 'APT21794-USD', label: 'APT', name: 'Aptos', color: '#00B5D8' },
  { sym: 'ARB11841-USD', label: 'ARB', name: 'Arbitrum', color: '#28A0F0' },
  { sym: 'OP-USD', label: 'OP', name: 'Optimism', color: '#FF0420' },
  { sym: 'SUI20947-USD', label: 'SUI', name: 'Sui', color: '#4DA2FF' },
  { sym: 'IMX-USD', label: 'IMX', name: 'Immutable X', color: '#00BFAD' },
  { sym: 'STX-USD', label: 'STX', name: 'Stacks', color: '#FF5500' },
  { sym: 'SEI-USD', label: 'SEI', name: 'Sei Network', color: '#4DB2F7' },
  // DeFi
  { sym: 'UNI7083-USD', label: 'UNI', name: 'Uniswap', color: '#FF007A' },
  { sym: 'AAVE-USD', label: 'AAVE', name: 'Aave', color: '#B6509E' },
  { sym: 'MKR-USD', label: 'MKR', name: 'Maker', color: '#1AAB9B' },
  { sym: 'LDO-USD', label: 'LDO', name: 'Lido DAO', color: '#00A3FF' },
  { sym: 'INJ-USD', label: 'INJ', name: 'Injective', color: '#00ADD8' },
  { sym: 'GRT-USD', label: 'GRT', name: 'The Graph', color: '#6747ED' },
  { sym: 'CRV-USD', label: 'CRV', name: 'Curve DAO', color: '#FF0000' },
  { sym: 'SNX-USD', label: 'SNX', name: 'Synthetix', color: '#00D1FF' },
  { sym: 'CAKE-USD', label: 'CAKE', name: 'PancakeSwap', color: '#1FC7D4' },
  { sym: 'DYDX-USD', label: 'DYDX', name: 'dYdX', color: '#6966FF' },
  { sym: 'PENDLE-USD', label: 'PENDLE', name: 'Pendle', color: '#2CD3B3' },
  // Infrastructure / L1
  { sym: 'FIL-USD', label: 'FIL', name: 'Filecoin', color: '#0090FF' },
  { sym: 'ALGO-USD', label: 'ALGO', name: 'Algorand', color: '#00B4D0' },
  { sym: 'QNT-USD', label: 'QNT', name: 'Quant', color: '#2D70B3' },
  { sym: 'EGLD-USD', label: 'EGLD', name: 'MultiversX', color: '#3B8EDA' },
  { sym: 'FTM-USD', label: 'FTM', name: 'Fantom', color: '#13B5EC' },
  { sym: 'XTZ-USD', label: 'XTZ', name: 'Tezos', color: '#A6E000' },
  { sym: 'EOS-USD', label: 'EOS', name: 'EOS', color: '#0065C0' },
  { sym: 'ZEC-USD', label: 'ZEC', name: 'Zcash', color: '#F4B728' },
  { sym: 'MINA-USD', label: 'MINA', name: 'Mina Protocol', color: '#E9BE59' },
  { sym: 'KAVA-USD', label: 'KAVA', name: 'Kava', color: '#FF433E' },
  { sym: 'KAS-USD', label: 'KAS', name: 'Kaspa', color: '#4ADBB1' },
  { sym: 'CFX-USD', label: 'CFX', name: 'Conflux', color: '#15AAD2' },
  { sym: 'ROSE-USD', label: 'ROSE', name: 'Oasis Network', color: '#0092F6' },
  { sym: 'ONE-USD', label: 'ONE', name: 'Harmony', color: '#00AEE9' },
  // AI Tokens
  { sym: 'RNDR-USD', label: 'RNDR', name: 'Render Network', color: '#FF3D00' },
  { sym: 'FET-USD', label: 'FET', name: 'Fetch.ai', color: '#2B5CE6' },
  { sym: 'TIA-USD', label: 'TIA', name: 'Celestia', color: '#7B2BF9' },
  { sym: 'OCEAN-USD', label: 'OCEAN', name: 'Ocean Protocol', color: '#7B1173' },
  // Web3 / Gaming / Metaverse
  { sym: 'SAND-USD', label: 'SAND', name: 'The Sandbox', color: '#04ADEF' },
  { sym: 'MANA-USD', label: 'MANA', name: 'Decentraland', color: '#FC2A65' },
  { sym: 'AXS-USD', label: 'AXS', name: 'Axie Infinity', color: '#0055D4' },
  { sym: 'CHZ-USD', label: 'CHZ', name: 'Chiliz', color: '#CD0124' },
  { sym: 'ENJ-USD', label: 'ENJ', name: 'Enjin Coin', color: '#624DBF' },
  { sym: 'BAT-USD', label: 'BAT', name: 'Basic Attention', color: '#FF4724' },
  { sym: 'ZIL-USD', label: 'ZIL', name: 'Zilliqa', color: '#49C1BF' },
  // Meme coins
  { sym: 'PEPE24478-USD', label: 'PEPE', name: 'Pepe', color: '#2AA42A' },
  { sym: 'WIF-USD', label: 'WIF', name: 'dogwifhat', color: '#CD853F' },
  { sym: 'BONK-USD', label: 'BONK', name: 'Bonk', color: '#FC8B06' },
  { sym: 'FLOKI-USD', label: 'FLOKI', name: 'Floki', color: '#F0A500' },
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
  // Additional crypto (all coins in CRYPTOS that aren't in the base array above)
  'TON11419-USD', 'SHIB-USD', 'LTC-USD', 'BCH-USD', 'ATOM-USD', 'NEAR-USD',
  'ICP-USD', 'ETC-USD', 'HBAR-USD', 'VET-USD', 'TRX-USD', 'XLM-USD', 'XMR-USD',
  'APT21794-USD', 'ARB11841-USD', 'OP-USD', 'SUI20947-USD', 'IMX-USD', 'STX-USD', 'SEI-USD',
  'UNI7083-USD', 'AAVE-USD', 'MKR-USD', 'LDO-USD', 'INJ-USD', 'GRT-USD', 'CRV-USD',
  'SNX-USD', 'CAKE-USD', 'DYDX-USD', 'PENDLE-USD',
  'FIL-USD', 'ALGO-USD', 'QNT-USD', 'EGLD-USD', 'FTM-USD', 'XTZ-USD', 'EOS-USD',
  'ZEC-USD', 'MINA-USD', 'KAVA-USD', 'KAS-USD', 'CFX-USD', 'ROSE-USD', 'ONE-USD',
  'RNDR-USD', 'FET-USD', 'TIA-USD', 'OCEAN-USD',
  'SAND-USD', 'MANA-USD', 'AXS-USD', 'CHZ-USD', 'ENJ-USD', 'BAT-USD', 'ZIL-USD',
  'PEPE24478-USD', 'WIF-USD', 'BONK-USD', 'FLOKI-USD',
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
