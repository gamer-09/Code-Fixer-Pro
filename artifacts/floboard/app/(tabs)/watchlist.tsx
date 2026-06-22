import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg, fmtMcap } from '@/context/MarketContext';
import { useSettings } from '@/context/SettingsContext';

const STORAGE_KEY = '@floboard:watchlist';
const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : 'http://localhost:80';

// ── Comprehensive symbol catalog ───────────────────────────────────────────

type Category = 'Stock' | 'ETF' | 'Crypto' | 'Index' | 'Sector' | 'Commodity' | 'Forex' | 'Bond';

interface CatalogItem {
  sym: string;
  name: string;
  cat: Category;
}

const CATALOG: CatalogItem[] = [
  // ── US Large Cap Stocks
  { sym: 'AAPL', name: 'Apple Inc.', cat: 'Stock' },
  { sym: 'MSFT', name: 'Microsoft Corp.', cat: 'Stock' },
  { sym: 'NVDA', name: 'Nvidia Corp.', cat: 'Stock' },
  { sym: 'GOOGL', name: 'Alphabet (Google)', cat: 'Stock' },
  { sym: 'AMZN', name: 'Amazon.com Inc.', cat: 'Stock' },
  { sym: 'META', name: 'Meta Platforms', cat: 'Stock' },
  { sym: 'TSLA', name: 'Tesla Inc.', cat: 'Stock' },
  { sym: 'NFLX', name: 'Netflix Inc.', cat: 'Stock' },
  { sym: 'JPM', name: 'JPMorgan Chase', cat: 'Stock' },
  { sym: 'GS', name: 'Goldman Sachs', cat: 'Stock' },
  { sym: 'BAC', name: 'Bank of America', cat: 'Stock' },
  { sym: 'V', name: 'Visa Inc.', cat: 'Stock' },
  { sym: 'MA', name: 'Mastercard Inc.', cat: 'Stock' },
  { sym: 'WMT', name: 'Walmart Inc.', cat: 'Stock' },
  { sym: 'UNH', name: 'UnitedHealth Group', cat: 'Stock' },
  { sym: 'XOM', name: 'Exxon Mobil Corp.', cat: 'Stock' },
  { sym: 'CVX', name: 'Chevron Corp.', cat: 'Stock' },
  { sym: 'JNJ', name: 'Johnson & Johnson', cat: 'Stock' },
  { sym: 'PG', name: 'Procter & Gamble', cat: 'Stock' },
  { sym: 'HD', name: 'Home Depot Inc.', cat: 'Stock' },
  // ── Tech
  { sym: 'TSM', name: 'TSMC', cat: 'Stock' },
  { sym: 'ORCL', name: 'Oracle Corp.', cat: 'Stock' },
  { sym: 'AMD', name: 'Advanced Micro Devices', cat: 'Stock' },
  { sym: 'INTC', name: 'Intel Corp.', cat: 'Stock' },
  { sym: 'AVGO', name: 'Broadcom Inc.', cat: 'Stock' },
  { sym: 'MU', name: 'Micron Technology', cat: 'Stock' },
  { sym: 'CRM', name: 'Salesforce Inc.', cat: 'Stock' },
  { sym: 'ARM', name: 'Arm Holdings', cat: 'Stock' },
  // ── Growth / Disruptive
  { sym: 'COIN', name: 'Coinbase Global', cat: 'Stock' },
  { sym: 'SHOP', name: 'Shopify Inc.', cat: 'Stock' },
  { sym: 'UBER', name: 'Uber Technologies', cat: 'Stock' },
  { sym: 'PLTR', name: 'Palantir Technologies', cat: 'Stock' },
  { sym: 'ABNB', name: 'Airbnb Inc.', cat: 'Stock' },
  { sym: 'SNAP', name: 'Snap Inc.', cat: 'Stock' },
  { sym: 'SPOT', name: 'Spotify Technology', cat: 'Stock' },
  { sym: 'HOOD', name: 'Robinhood Markets', cat: 'Stock' },
  { sym: 'PYPL', name: 'PayPal Holdings', cat: 'Stock' },
  { sym: 'BABA', name: 'Alibaba Group', cat: 'Stock' },
  { sym: 'NIO', name: 'NIO Inc.', cat: 'Stock' },
  { sym: 'RIVN', name: 'Rivian Automotive', cat: 'Stock' },
  { sym: 'LCID', name: 'Lucid Group', cat: 'Stock' },
  { sym: 'GME', name: 'GameStop Corp.', cat: 'Stock' },
  { sym: 'AMC', name: 'AMC Entertainment', cat: 'Stock' },
  { sym: 'DIS', name: 'The Walt Disney Co.', cat: 'Stock' },
  { sym: 'SMCI', name: 'Super Micro Computer', cat: 'Stock' },
  { sym: 'MSTR', name: 'MicroStrategy Inc.', cat: 'Stock' },
  // ── More Stocks — Finance & Insurance
  { sym: 'BRK-B', name: 'Berkshire Hathaway B', cat: 'Stock' },
  { sym: 'MS', name: 'Morgan Stanley', cat: 'Stock' },
  { sym: 'C', name: 'Citigroup Inc.', cat: 'Stock' },
  { sym: 'WFC', name: 'Wells Fargo & Co.', cat: 'Stock' },
  { sym: 'AXP', name: 'American Express', cat: 'Stock' },
  { sym: 'BLK', name: 'BlackRock Inc.', cat: 'Stock' },
  { sym: 'SCHW', name: 'Charles Schwab', cat: 'Stock' },
  // ── More Stocks — Energy
  { sym: 'SLB', name: 'Schlumberger (SLB)', cat: 'Stock' },
  { sym: 'COP', name: 'ConocoPhillips', cat: 'Stock' },
  { sym: 'OXY', name: 'Occidental Petroleum', cat: 'Stock' },
  { sym: 'BP', name: 'BP PLC', cat: 'Stock' },
  { sym: 'SHEL', name: 'Shell PLC', cat: 'Stock' },
  // ── More Stocks — Healthcare & Pharma
  { sym: 'LLY', name: 'Eli Lilly & Co.', cat: 'Stock' },
  { sym: 'ABBV', name: 'AbbVie Inc.', cat: 'Stock' },
  { sym: 'MRK', name: 'Merck & Co.', cat: 'Stock' },
  { sym: 'PFE', name: 'Pfizer Inc.', cat: 'Stock' },
  { sym: 'AMGN', name: 'Amgen Inc.', cat: 'Stock' },
  { sym: 'ISRG', name: 'Intuitive Surgical', cat: 'Stock' },
  { sym: 'MRNA', name: 'Moderna Inc.', cat: 'Stock' },
  { sym: 'BNTX', name: 'BioNTech SE', cat: 'Stock' },
  // ── More Stocks — Consumer & Retail
  { sym: 'COST', name: 'Costco Wholesale', cat: 'Stock' },
  { sym: 'MCD', name: "McDonald's Corp.", cat: 'Stock' },
  { sym: 'SBUX', name: 'Starbucks Corp.', cat: 'Stock' },
  { sym: 'TGT', name: 'Target Corp.', cat: 'Stock' },
  { sym: 'NKE', name: 'Nike Inc.', cat: 'Stock' },
  { sym: 'LOW', name: "Lowe's Companies", cat: 'Stock' },
  // ── More Stocks — Industrials & Defense
  { sym: 'BA', name: 'Boeing Co.', cat: 'Stock' },
  { sym: 'CAT', name: 'Caterpillar Inc.', cat: 'Stock' },
  { sym: 'RTX', name: 'RTX Corp. (Raytheon)', cat: 'Stock' },
  { sym: 'LMT', name: 'Lockheed Martin', cat: 'Stock' },
  { sym: 'NOC', name: 'Northrop Grumman', cat: 'Stock' },
  { sym: 'GE', name: 'GE Aerospace', cat: 'Stock' },
  // ── Gold & Precious Metal Miners
  { sym: 'GOLD', name: 'Barrick Gold Corp.', cat: 'Stock' },
  { sym: 'NEM', name: 'Newmont Corp. (Gold)', cat: 'Stock' },
  { sym: 'AEM', name: 'Agnico Eagle Mines', cat: 'Stock' },
  { sym: 'KGC', name: 'Kinross Gold Corp.', cat: 'Stock' },
  { sym: 'WPM', name: 'Wheaton Precious Metals', cat: 'Stock' },
  { sym: 'FNV', name: 'Franco-Nevada Corp.', cat: 'Stock' },
  { sym: 'AG', name: 'First Majestic Silver', cat: 'Stock' },
  { sym: 'PAAS', name: 'Pan American Silver', cat: 'Stock' },
  // ── ETFs — Core
  { sym: 'SPY', name: 'S&P 500 ETF (SPDR)', cat: 'ETF' },
  { sym: 'QQQ', name: 'Nasdaq 100 ETF (Invesco)', cat: 'ETF' },
  { sym: 'IWM', name: 'Russell 2000 ETF (iShares)', cat: 'ETF' },
  { sym: 'DIA', name: 'Dow Jones ETF (SPDR)', cat: 'ETF' },
  { sym: 'VTI', name: 'Total Stock Market ETF (Vanguard)', cat: 'ETF' },
  { sym: 'VOO', name: 'S&P 500 ETF (Vanguard)', cat: 'ETF' },
  // ── ETFs — Gold & Precious Metals
  { sym: 'GLD', name: 'Gold ETF (SPDR)', cat: 'ETF' },
  { sym: 'IAU', name: 'Gold ETF (iShares)', cat: 'ETF' },
  { sym: 'SGOL', name: 'Gold ETF (Aberdeen Physical)', cat: 'ETF' },
  { sym: 'GDX', name: 'Gold Miners ETF (VanEck)', cat: 'ETF' },
  { sym: 'GDXJ', name: 'Junior Gold Miners ETF (VanEck)', cat: 'ETF' },
  { sym: 'SLV', name: 'Silver ETF (iShares)', cat: 'ETF' },
  { sym: 'SIVR', name: 'Silver ETF (Aberdeen Physical)', cat: 'ETF' },
  { sym: 'PPLT', name: 'Platinum ETF (Aberdeen Physical)', cat: 'ETF' },
  // ── ETFs — Crypto
  { sym: 'IBIT', name: 'Bitcoin ETF (iShares)', cat: 'ETF' },
  { sym: 'FBTC', name: 'Bitcoin ETF (Fidelity)', cat: 'ETF' },
  { sym: 'GBTC', name: 'Bitcoin Trust (Grayscale)', cat: 'ETF' },
  { sym: 'ETHA', name: 'Ethereum ETF (iShares)', cat: 'ETF' },
  // ── ETFs — Fixed Income & Macro
  { sym: 'TLT', name: '20+ Year Treasury Bond ETF', cat: 'ETF' },
  { sym: 'IEF', name: '7-10 Year Treasury ETF (iShares)', cat: 'ETF' },
  { sym: 'SHY', name: '1-3 Year Treasury ETF (iShares)', cat: 'ETF' },
  { sym: 'HYG', name: 'High Yield Corp Bond ETF', cat: 'ETF' },
  { sym: 'LQD', name: 'Investment Grade Corp Bond ETF', cat: 'ETF' },
  { sym: 'TIP', name: 'TIPS Bond ETF (iShares)', cat: 'ETF' },
  // ── ETFs — Commodities
  { sym: 'USO', name: 'Crude Oil ETF (US Oil Fund)', cat: 'ETF' },
  { sym: 'UNG', name: 'Natural Gas ETF (US Gas Fund)', cat: 'ETF' },
  { sym: 'PDBC', name: 'Commodities Diversified ETF (Invesco)', cat: 'ETF' },
  // ── ETFs — International & Emerging
  { sym: 'EEM', name: 'Emerging Markets ETF (iShares)', cat: 'ETF' },
  { sym: 'EFA', name: 'Developed Markets ETF (iShares)', cat: 'ETF' },
  { sym: 'FXI', name: 'China Large-Cap ETF (iShares)', cat: 'ETF' },
  { sym: 'VWO', name: 'Emerging Markets ETF (Vanguard)', cat: 'ETF' },
  // ── ETFs — Thematic & Leveraged
  { sym: 'ARKK', name: 'ARK Innovation ETF', cat: 'ETF' },
  { sym: 'VNQ', name: 'Real Estate ETF (Vanguard)', cat: 'ETF' },
  { sym: 'XBI', name: 'Biotech ETF (SPDR)', cat: 'ETF' },
  { sym: 'SMH', name: 'Semiconductor ETF (VanEck)', cat: 'ETF' },
  { sym: 'SOXX', name: 'Semiconductor ETF (iShares)', cat: 'ETF' },
  { sym: 'TQQQ', name: 'ProShares UltraPro QQQ (3x)', cat: 'ETF' },
  { sym: 'SQQQ', name: 'ProShares UltraPro Short QQQ', cat: 'ETF' },
  { sym: 'SOXS', name: 'Direxion Semiconductor Bear 3x', cat: 'ETF' },
  { sym: 'SPXS', name: 'Direxion S&P 500 Bear 3x', cat: 'ETF' },
  { sym: 'SPXL', name: 'Direxion S&P 500 Bull 3x', cat: 'ETF' },
  // ── Crypto — Top Market Cap
  { sym: 'BTC-USD', name: 'Bitcoin', cat: 'Crypto' },
  { sym: 'ETH-USD', name: 'Ethereum', cat: 'Crypto' },
  { sym: 'BNB-USD', name: 'BNB (Binance)', cat: 'Crypto' },
  { sym: 'SOL-USD', name: 'Solana', cat: 'Crypto' },
  { sym: 'XRP-USD', name: 'XRP (Ripple)', cat: 'Crypto' },
  { sym: 'DOGE-USD', name: 'Dogecoin', cat: 'Crypto' },
  { sym: 'ADA-USD', name: 'Cardano', cat: 'Crypto' },
  { sym: 'AVAX-USD', name: 'Avalanche', cat: 'Crypto' },
  { sym: 'DOT-USD', name: 'Polkadot', cat: 'Crypto' },
  { sym: 'MATIC-USD', name: 'Polygon (POL)', cat: 'Crypto' },
  { sym: 'LINK-USD', name: 'Chainlink', cat: 'Crypto' },
  { sym: 'LTC-USD', name: 'Litecoin', cat: 'Crypto' },
  { sym: 'BCH-USD', name: 'Bitcoin Cash', cat: 'Crypto' },
  { sym: 'SHIB-USD', name: 'Shiba Inu', cat: 'Crypto' },
  { sym: 'TRX-USD', name: 'TRON', cat: 'Crypto' },
  { sym: 'ATOM-USD', name: 'Cosmos', cat: 'Crypto' },
  // ── Crypto — Layer 2 & DeFi
  { sym: 'SUI20947-USD', name: 'Sui', cat: 'Crypto' },
  { sym: 'APT21794-USD', name: 'Aptos', cat: 'Crypto' },
  { sym: 'OP-USD', name: 'Optimism', cat: 'Crypto' },
  { sym: 'ARB11841-USD', name: 'Arbitrum', cat: 'Crypto' },
  { sym: 'INJ-USD', name: 'Injective', cat: 'Crypto' },
  { sym: 'NEAR-USD', name: 'NEAR Protocol', cat: 'Crypto' },
  { sym: 'FIL-USD', name: 'Filecoin', cat: 'Crypto' },
  { sym: 'ICP-USD', name: 'Internet Computer', cat: 'Crypto' },
  { sym: 'HBAR-USD', name: 'Hedera', cat: 'Crypto' },
  { sym: 'VET-USD', name: 'VeChain', cat: 'Crypto' },
  { sym: 'ALGO-USD', name: 'Algorand', cat: 'Crypto' },
  { sym: 'XLM-USD', name: 'Stellar Lumens', cat: 'Crypto' },
  { sym: 'XMR-USD', name: 'Monero', cat: 'Crypto' },
  { sym: 'ETC-USD', name: 'Ethereum Classic', cat: 'Crypto' },
  // ── Crypto — Meme & Trending
  { sym: 'PEPE24478-USD', name: 'Pepe', cat: 'Crypto' },
  { sym: 'WIF-USD', name: 'dogwifhat', cat: 'Crypto' },
  { sym: 'BONK-USD', name: 'Bonk', cat: 'Crypto' },
  { sym: 'FLOKI-USD', name: 'Floki Inu', cat: 'Crypto' },
  // ── Global Indices
  { sym: '^GSPC', name: 'S&P 500', cat: 'Index' },
  { sym: '^DJI', name: 'Dow Jones Industrial', cat: 'Index' },
  { sym: '^IXIC', name: 'Nasdaq Composite', cat: 'Index' },
  { sym: '^RUT', name: 'Russell 2000', cat: 'Index' },
  { sym: '^FTSE', name: 'FTSE 100 (UK)', cat: 'Index' },
  { sym: '^GDAXI', name: 'DAX (Germany)', cat: 'Index' },
  { sym: '^FCHI', name: 'CAC 40 (France)', cat: 'Index' },
  { sym: '^N225', name: 'Nikkei 225 (Japan)', cat: 'Index' },
  { sym: '^HSI', name: 'Hang Seng (Hong Kong)', cat: 'Index' },
  { sym: '^AXJO', name: 'ASX 200 (Australia)', cat: 'Index' },
  { sym: '^BSESN', name: 'BSE Sensex (India)', cat: 'Index' },
  { sym: '^NSEI', name: 'Nifty 50 (India)', cat: 'Index' },
  { sym: '^KS11', name: 'KOSPI (South Korea)', cat: 'Index' },
  { sym: '^TWII', name: 'Taiwan Weighted Index', cat: 'Index' },
  { sym: '^IBEX', name: 'IBEX 35 (Spain)', cat: 'Index' },
  { sym: '^MXX', name: 'IPC Mexico', cat: 'Index' },
  { sym: '^BVSP', name: 'Bovespa (Brazil)', cat: 'Index' },
  // ── S&P Sectors
  { sym: 'XLK', name: 'Technology SPDR', cat: 'Sector' },
  { sym: 'XLF', name: 'Financials SPDR', cat: 'Sector' },
  { sym: 'XLE', name: 'Energy SPDR', cat: 'Sector' },
  { sym: 'XLV', name: 'Health Care SPDR', cat: 'Sector' },
  { sym: 'XLI', name: 'Industrials SPDR', cat: 'Sector' },
  { sym: 'XLP', name: 'Consumer Staples SPDR', cat: 'Sector' },
  { sym: 'XLRE', name: 'Real Estate SPDR', cat: 'Sector' },
  { sym: 'XLY', name: 'Consumer Discretionary SPDR', cat: 'Sector' },
  { sym: 'XLU', name: 'Utilities SPDR', cat: 'Sector' },
  { sym: 'XLB', name: 'Materials SPDR', cat: 'Sector' },
  { sym: 'XLC', name: 'Communication Services SPDR', cat: 'Sector' },
  // ── Commodities — Metals
  { sym: 'GC=F', name: 'Gold Futures', cat: 'Commodity' },
  { sym: 'SI=F', name: 'Silver Futures', cat: 'Commodity' },
  { sym: 'HG=F', name: 'Copper Futures', cat: 'Commodity' },
  { sym: 'PL=F', name: 'Platinum Futures', cat: 'Commodity' },
  { sym: 'PA=F', name: 'Palladium Futures', cat: 'Commodity' },
  // ── Commodities — Energy
  { sym: 'CL=F', name: 'WTI Crude Oil Futures', cat: 'Commodity' },
  { sym: 'BZ=F', name: 'Brent Crude Oil Futures', cat: 'Commodity' },
  { sym: 'NG=F', name: 'Natural Gas Futures', cat: 'Commodity' },
  { sym: 'RB=F', name: 'Gasoline (RBOB) Futures', cat: 'Commodity' },
  { sym: 'HO=F', name: 'Heating Oil Futures', cat: 'Commodity' },
  // ── Commodities — Agriculture
  { sym: 'ZW=F', name: 'Wheat Futures', cat: 'Commodity' },
  { sym: 'ZC=F', name: 'Corn Futures', cat: 'Commodity' },
  { sym: 'ZS=F', name: 'Soybean Futures', cat: 'Commodity' },
  { sym: 'ZO=F', name: 'Oats Futures', cat: 'Commodity' },
  { sym: 'KC=F', name: 'Coffee Futures', cat: 'Commodity' },
  { sym: 'CT=F', name: 'Cotton Futures', cat: 'Commodity' },
  { sym: 'SB=F', name: 'Sugar Futures (No. 11)', cat: 'Commodity' },
  { sym: 'CC=F', name: 'Cocoa Futures', cat: 'Commodity' },
  { sym: 'OJ=F', name: 'Orange Juice Futures', cat: 'Commodity' },
  { sym: 'LBS=F', name: 'Lumber Futures', cat: 'Commodity' },
  // ── Commodities — Livestock
  { sym: 'LE=F', name: 'Live Cattle Futures', cat: 'Commodity' },
  { sym: 'GF=F', name: 'Feeder Cattle Futures', cat: 'Commodity' },
  { sym: 'HE=F', name: 'Lean Hog Futures', cat: 'Commodity' },
  // ── Forex
  { sym: 'EURUSD=X', name: 'Euro / US Dollar', cat: 'Forex' },
  { sym: 'GBPUSD=X', name: 'British Pound / USD', cat: 'Forex' },
  { sym: 'USDJPY=X', name: 'US Dollar / Japanese Yen', cat: 'Forex' },
  { sym: 'USDCAD=X', name: 'US Dollar / Canadian Dollar', cat: 'Forex' },
  { sym: 'AUDUSD=X', name: 'Australian Dollar / USD', cat: 'Forex' },
  { sym: 'USDCHF=X', name: 'US Dollar / Swiss Franc', cat: 'Forex' },
  { sym: 'USDCNY=X', name: 'US Dollar / Chinese Yuan', cat: 'Forex' },
  { sym: 'USDINR=X', name: 'US Dollar / Indian Rupee', cat: 'Forex' },
  { sym: 'USDNGN=X', name: 'US Dollar / Nigerian Naira', cat: 'Forex' },
  { sym: 'USDBRL=X', name: 'US Dollar / Brazilian Real', cat: 'Forex' },
  { sym: 'NZDUSD=X', name: 'New Zealand Dollar / USD', cat: 'Forex' },
  { sym: 'USDZAR=X', name: 'US Dollar / South African Rand', cat: 'Forex' },
  { sym: 'USDMXN=X', name: 'US Dollar / Mexican Peso', cat: 'Forex' },
  { sym: 'USDSGD=X', name: 'US Dollar / Singapore Dollar', cat: 'Forex' },
  { sym: 'USDHKD=X', name: 'US Dollar / Hong Kong Dollar', cat: 'Forex' },
  { sym: 'USDKRW=X', name: 'US Dollar / South Korean Won', cat: 'Forex' },
  { sym: 'USDTRY=X', name: 'US Dollar / Turkish Lira', cat: 'Forex' },
  { sym: 'USDSEK=X', name: 'US Dollar / Swedish Krona', cat: 'Forex' },
  { sym: 'USDNOK=X', name: 'US Dollar / Norwegian Krone', cat: 'Forex' },
  // ── Bonds & Macro
  { sym: '^TNX', name: '10-Year Treasury Yield', cat: 'Bond' },
  { sym: '^FVX', name: '5-Year Treasury Yield', cat: 'Bond' },
  { sym: '^TYX', name: '30-Year Treasury Yield', cat: 'Bond' },
  { sym: '^IRX', name: '3-Month Treasury Yield', cat: 'Bond' },
  { sym: '^VIX', name: 'CBOE Volatility Index', cat: 'Bond' },
  { sym: 'DX-Y.NYB', name: 'US Dollar Index (DXY)', cat: 'Bond' },
];

const CAT_COLORS: Record<Category, { bg: string; text: string }> = {
  Stock: { bg: '#4DA6FF22', text: '#4DA6FF' },
  ETF: { bg: '#9B8FFF22', text: '#9B8FFF' },
  Crypto: { bg: '#F7931A22', text: '#F7931A' },
  Index: { bg: '#00E5A022', text: '#00E5A0' },
  Sector: { bg: '#627EEA22', text: '#627EEA' },
  Commodity: { bg: '#FFB40022', text: '#FFB400' },
  Forex: { bg: '#FF4D6A22', text: '#FF4D6A' },
  Bond: { bg: '#88888822', text: '#AAAAAA' },
};

// ── Quote types ────────────────────────────────────────────────────────────

interface QuoteRow {
  symbol: string;
  shortName?: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  regularMarketPreviousClose: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap: number;
  preMarketPrice?: number;
  preMarketChangePercent?: number;
  postMarketPrice?: number;
  postMarketChangePercent?: number;
  bid?: number;
  ask?: number;
}

async function fetchQuotes(symbols: string[]): Promise<Record<string, QuoteRow>> {
  if (symbols.length === 0) return {};
  try {
    const res = await fetch(`${BASE}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`);
    if (!res.ok) return {};
    const json = await res.json() as { results: QuoteRow[] };
    const map: Record<string, QuoteRow> = {};
    for (const q of json.results ?? []) {
      if (q?.symbol) map[q.symbol] = q;
    }
    return map;
  } catch {
    return {};
  }
}

// ── Components ─────────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: Category }) {
  const c = CAT_COLORS[cat];
  return (
    <View style={[styles.catBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.catText, { color: c.text }]}>{cat.toUpperCase()}</Text>
    </View>
  );
}

function CatalogRow({
  item,
  inWatchlist,
  onAdd,
  onRemove,
}: {
  item: CatalogItem;
  inWatchlist: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={inWatchlist ? onRemove : onAdd}
      style={({ pressed }) => [
        styles.catalogRow,
        { backgroundColor: pressed ? colors.surface : colors.card, borderBottomColor: colors.rim },
      ]}
    >
      <CatBadge cat={item.cat} />
      <View style={styles.catalogInfo}>
        <Text style={[styles.catalogSym, { color: colors.t1 }]}>{item.sym}</Text>
        <Text style={[styles.catalogName, { color: colors.t4 }]} numberOfLines={1}>{item.name}</Text>
      </View>
      <View
        style={[
          styles.catalogAction,
          {
            backgroundColor: inWatchlist ? colors.gainDim : colors.surface,
            borderColor: inWatchlist ? 'rgba(0,229,160,0.3)' : colors.rim,
          },
        ]}
      >
        <Text style={[styles.catalogActionText, { color: inWatchlist ? colors.gain : colors.t3 }]}>
          {inWatchlist ? '✓' : '+'}
        </Text>
      </View>
    </Pressable>
  );
}

function WatchRow({
  sym,
  q,
  onRemove,
}: {
  sym: string;
  q: QuoteRow | undefined;
  onRemove: () => void;
}) {
  const colors = useColors();
  const chg = q?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t3;
  const entry = CATALOG.find((c) => c.sym === sym);

  const handleAsk = () => {
    const query = `Give me a full analysis of ${sym}${entry ? ` (${entry.name})` : ''} — price, recent performance, outlook, and key risks.`;
    router.navigate({ pathname: '/(tabs)/advisor', params: { q: query } });
  };

  const isForex = entry?.cat === 'Forex';
  const isCrypto = entry?.cat === 'Crypto';
  const isBond = entry?.cat === 'Bond';
  const decimals = isForex ? 4 : isBond ? 3 : 2;
  const prefix = isForex || isBond || isCrypto ? '' : '$';

  // Extended hours: show pre/post market price if available
  const extPrice = q?.preMarketPrice ?? q?.postMarketPrice;
  const extChgPct = q?.preMarketChangePercent ?? q?.postMarketChangePercent;
  const extLabel = q?.preMarketPrice ? 'PRE' : q?.postMarketPrice ? 'POST' : null;

  return (
    <View style={[styles.watchRow, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={styles.watchLeft}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.watchSym, { color: colors.t1 }]}>{sym}</Text>
          {entry && <CatBadge cat={entry.cat} />}
        </View>
        {entry && <Text style={[styles.watchName, { color: colors.t4 }]} numberOfLines={1}>{entry.name}</Text>}
        {q && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
            {q.regularMarketOpen != null && (
              <Text style={[styles.ohlcText, { color: colors.t4 }]}>O {prefix}{fmt(q.regularMarketOpen, decimals)}</Text>
            )}
            {q.regularMarketDayHigh != null && (
              <Text style={[styles.ohlcText, { color: colors.gain }]}>H {prefix}{fmt(q.regularMarketDayHigh, decimals)}</Text>
            )}
            {q.regularMarketDayLow != null && (
              <Text style={[styles.ohlcText, { color: colors.loss }]}>L {prefix}{fmt(q.regularMarketDayLow, decimals)}</Text>
            )}
          </View>
        )}
        {q && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 1 }}>
            <Text style={[styles.ohlcText, { color: colors.t4 }]}>Prev {prefix}{fmt(q.regularMarketPreviousClose, decimals)}</Text>
            {q.fiftyTwoWeekHigh != null && q.fiftyTwoWeekLow != null && (
              <Text style={[styles.ohlcText, { color: colors.t4 }]}>52W {prefix}{fmt(q.fiftyTwoWeekLow, decimals)}–{prefix}{fmt(q.fiftyTwoWeekHigh, decimals)}</Text>
            )}
          </View>
        )}
        {!isForex && !isBond && <Text style={[styles.watchMcap, { color: colors.t4 }]}>{q ? fmtMcap(q.marketCap) : '—'}</Text>}
      </View>
      <View style={styles.watchMid}>
        <Text style={[styles.watchPrice, { color: colors.t1 }]}>
          {q ? `${prefix}${fmt(q.regularMarketPrice, decimals)}` : '—'}
        </Text>
        <Text style={[styles.watchChg, { color: chgColor }]}>{q ? fmtChg(chg) : '—'}</Text>
        {extPrice != null && extLabel && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
            <View style={[styles.extLabel, { backgroundColor: colors.amberDim }]}>
              <Text style={[styles.extLabelText, { color: colors.amber }]}>{extLabel}</Text>
            </View>
            <Text style={[styles.extPrice, { color: extChgPct != null && extChgPct >= 0 ? colors.gain : colors.loss }]}>
              {prefix}{fmt(extPrice, decimals)}{extChgPct != null ? ` (${extChgPct >= 0 ? '+' : ''}${fmt(extChgPct)}%)` : ''}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.watchActions}>
        <Pressable
          onPress={handleAsk}
          style={[styles.aiBtn, { backgroundColor: colors.blueDim, borderColor: 'rgba(77,166,255,0.2)' }]}
        >
          <Text style={[styles.aiBtnText, { color: colors.blue }]}>AI</Text>
        </Pressable>
        <Pressable
          onPress={onRemove}
          style={[styles.removeBtn, { backgroundColor: colors.lossDim, borderColor: 'rgba(255,77,106,0.2)' }]}
        >
          <Text style={[styles.removeBtnText, { color: colors.loss }]}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function WatchlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const tabBarHeight = useBottomTabBarHeight();
  const { settings } = useSettings();

  const [symbols, setSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteRow>>({});
  const [query, setQuery] = useState('');
  const [fetching, setFetching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved symbols
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSymbols(JSON.parse(raw) as string[]);
    });
  }, []);

  const saveSymbols = (syms: string[]) => {
    setSymbols(syms);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syms));
  };

  // Auto-refresh quotes
  const refresh = useCallback(async (syms: string[]) => {
    if (syms.length === 0) { setQuotes({}); return; }
    setFetching(true);
    const q = await fetchQuotes(syms);
    setQuotes(q);
    setFetching(false);
  }, []);

  useEffect(() => {
    refresh(symbols);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => refresh(symbols), 60000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [symbols, refresh]);

  // Add symbol
  const addSymbol = async (sym: string) => {
    if (symbols.includes(sym)) return;
    setAdding(sym);
    // Verify it's a valid symbol by fetching a quote
    const q = await fetchQuotes([sym]);
    if (q[sym]) {
      const next = [sym, ...symbols];
      saveSymbols(next);
      setQuotes((prev) => ({ ...prev, [sym]: q[sym] }));
    } else {
      // Symbol not found from catalog — still add but no quote
      const catalogEntry = CATALOG.find((c) => c.sym === sym);
      if (catalogEntry) saveSymbols([sym, ...symbols]);
    }
    setAdding(null);
    setQuery('');
  };

  const removeSymbol = (sym: string) => {
    saveSymbols(symbols.filter((s) => s !== sym));
    setQuotes((prev) => { const n = { ...prev }; delete n[sym]; return n; });
  };

  // Filter catalog
  const filtered = useMemo(() => {
    if (!query.trim()) return CATALOG;
    const q = query.toLowerCase();
    return CATALOG.filter(
      (c) => c.sym.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q)
    );
  }, [query]);

  // Sort watchlist
  const sortedSymbols = useMemo(() => {
    if (settings.watchlistSort === 'alpha') return [...symbols].sort();
    if (settings.watchlistSort === 'change') {
      return [...symbols].sort((a, b) => {
        const ca = Math.abs(quotes[a]?.regularMarketChangePercent ?? 0);
        const cb = Math.abs(quotes[b]?.regularMarketChangePercent ?? 0);
        return cb - ca;
      });
    }
    return symbols;
  }, [symbols, quotes, settings.watchlistSort]);

  const isSearching = query.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>Watchlist</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {fetching && <ActivityIndicator size="small" color={colors.blue} />}
          <View style={[styles.countChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <Text style={{ color: colors.t3, fontSize: 10, fontFamily: 'Inter_500Medium' }}>
              {symbols.length} tracked
            </Text>
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: query ? colors.blue : colors.rim }]}>
          <Text style={[styles.searchIcon, { color: colors.t4 }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.t1 }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, symbol or category..."
            placeholderTextColor={colors.t4}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={() => setQuery('')}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={[styles.clearBtnText, { color: colors.t4 }]}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Catalog search results OR watchlist */}
      {isSearching ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.sym}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
          ListHeaderComponent={
            <View style={[styles.resultsHeader, { backgroundColor: colors.surface, borderBottomColor: colors.rim }]}>
              <Text style={[styles.resultsCount, { color: colors.t4 }]}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} — tap to add / remove
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CatalogRow
              item={item}
              inWatchlist={symbols.includes(item.sym)}
              onAdd={() => addSymbol(item.sym)}
              onRemove={() => removeSymbol(item.sym)}
            />
          )}
        />
      ) : (
        <FlatList
          data={sortedSymbols}
          keyExtractor={(sym) => sym}
          contentContainerStyle={{ padding: 14, paddingBottom: tabBarHeight + 8 }}
          ListEmptyComponent={
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.rim }]}>
              <Text style={[styles.emptyTitle, { color: colors.t2 }]}>Your watchlist is empty</Text>
              <Text style={[styles.emptyBody, { color: colors.t4 }]}>
                Search above for any stock, ETF, crypto, index, commodity, or forex pair to start tracking it with live prices.
              </Text>
              <Text style={[styles.emptyHint, { color: colors.t4 }]}>
                Try searching: "Apple", "BTC", "Gold", "Tech", "S&P"
              </Text>
            </View>
          }
          ListHeaderComponent={
            sortedSymbols.length > 0 ? (
              <View style={styles.watchHeader}>
                <Text style={[styles.watchHeaderText, { color: colors.t4 }]}>SYMBOL</Text>
                <Text style={[styles.watchHeaderText, { color: colors.t4, flex: 0, minWidth: 80, textAlign: 'right' }]}>PRICE / CHG</Text>
              </View>
            ) : null
          }
          renderItem={({ item: sym }) => (
            <WatchRow
              sym={sym}
              q={quotes[sym]}
              onRemove={() => removeSymbol(sym)}
            />
          )}
        />
      )}
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
  countChip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  searchBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1,
  },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, gap: 6,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', paddingVertical: 9 },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 12 },
  addBtn: {
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  // Catalog rows
  resultsHeader: {
    paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1,
  },
  resultsCount: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  catalogRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1,
  },
  catalogInfo: { flex: 1 },
  catalogSym: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  catalogName: { fontSize: 10, marginTop: 2 },
  catalogAction: {
    width: 30, height: 30, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  catalogActionText: { fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  catBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  catText: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  // Watchlist rows
  watchHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 6, paddingHorizontal: 4,
  },
  watchHeaderText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', flex: 1 },
  watchRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 6,
  },
  watchLeft: { flex: 1.8, gap: 2 },
  watchSym: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  watchName: { fontSize: 9 },
  watchMcap: { fontSize: 9 },
  watchMid: { flex: 1.4, alignItems: 'flex-end' },
  watchPrice: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  watchChg: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 2 },
  ohlcText: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  extLabel: { borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  extLabelText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  extPrice: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  watchActions: { flexDirection: 'row', gap: 6, marginLeft: 8 },
  aiBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 },
  aiBtnText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  removeBtn: { borderRadius: 6, borderWidth: 1, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  // Empty state
  emptyBox: { borderRadius: 10, borderWidth: 1, padding: 24, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  emptyBody: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  emptyHint: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
});
