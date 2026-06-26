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

type Category = 'Stock' | 'ETF' | 'Crypto' | 'Index' | 'Sector' | 'Commodity' | 'Forex' | 'Bond';

interface CatalogItem { sym: string; name: string; cat: Category; }

const CATALOG: CatalogItem[] = [
  // ── Stocks ──
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
  { sym: 'TSM', name: 'TSMC', cat: 'Stock' },
  { sym: 'ORCL', name: 'Oracle Corp.', cat: 'Stock' },
  { sym: 'AMD', name: 'Advanced Micro Devices', cat: 'Stock' },
  { sym: 'INTC', name: 'Intel Corp.', cat: 'Stock' },
  { sym: 'AVGO', name: 'Broadcom Inc.', cat: 'Stock' },
  { sym: 'MU', name: 'Micron Technology', cat: 'Stock' },
  { sym: 'CRM', name: 'Salesforce Inc.', cat: 'Stock' },
  { sym: 'ARM', name: 'Arm Holdings', cat: 'Stock' },
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
  { sym: 'BRK-B', name: 'Berkshire Hathaway B', cat: 'Stock' },
  { sym: 'MS', name: 'Morgan Stanley', cat: 'Stock' },
  { sym: 'C', name: 'Citigroup Inc.', cat: 'Stock' },
  { sym: 'WFC', name: 'Wells Fargo & Co.', cat: 'Stock' },
  { sym: 'AXP', name: 'American Express', cat: 'Stock' },
  { sym: 'BLK', name: 'BlackRock Inc.', cat: 'Stock' },
  { sym: 'SCHW', name: 'Charles Schwab', cat: 'Stock' },
  { sym: 'SLB', name: 'Schlumberger (SLB)', cat: 'Stock' },
  { sym: 'COP', name: 'ConocoPhillips', cat: 'Stock' },
  { sym: 'OXY', name: 'Occidental Petroleum', cat: 'Stock' },
  { sym: 'BP', name: 'BP PLC', cat: 'Stock' },
  { sym: 'SHEL', name: 'Shell PLC', cat: 'Stock' },
  { sym: 'LLY', name: 'Eli Lilly & Co.', cat: 'Stock' },
  { sym: 'ABBV', name: 'AbbVie Inc.', cat: 'Stock' },
  { sym: 'MRK', name: 'Merck & Co.', cat: 'Stock' },
  { sym: 'PFE', name: 'Pfizer Inc.', cat: 'Stock' },
  { sym: 'AMGN', name: 'Amgen Inc.', cat: 'Stock' },
  { sym: 'ISRG', name: 'Intuitive Surgical', cat: 'Stock' },
  { sym: 'MRNA', name: 'Moderna Inc.', cat: 'Stock' },
  { sym: 'BNTX', name: 'BioNTech SE', cat: 'Stock' },
  { sym: 'COST', name: 'Costco Wholesale', cat: 'Stock' },
  { sym: 'MCD', name: "McDonald's Corp.", cat: 'Stock' },
  { sym: 'SBUX', name: 'Starbucks Corp.', cat: 'Stock' },
  { sym: 'TGT', name: 'Target Corp.', cat: 'Stock' },
  { sym: 'NKE', name: 'Nike Inc.', cat: 'Stock' },
  { sym: 'LOW', name: "Lowe's Companies", cat: 'Stock' },
  { sym: 'BA', name: 'Boeing Co.', cat: 'Stock' },
  { sym: 'CAT', name: 'Caterpillar Inc.', cat: 'Stock' },
  { sym: 'RTX', name: 'RTX Corp. (Raytheon)', cat: 'Stock' },
  { sym: 'LMT', name: 'Lockheed Martin', cat: 'Stock' },
  { sym: 'NOC', name: 'Northrop Grumman', cat: 'Stock' },
  { sym: 'GE', name: 'GE Aerospace', cat: 'Stock' },
  { sym: 'GOLD', name: 'Barrick Gold Corp.', cat: 'Stock' },
  { sym: 'NEM', name: 'Newmont Corp.', cat: 'Stock' },
  { sym: 'AEM', name: 'Agnico Eagle Mines', cat: 'Stock' },
  { sym: 'KGC', name: 'Kinross Gold Corp.', cat: 'Stock' },
  { sym: 'WPM', name: 'Wheaton Precious Metals', cat: 'Stock' },
  { sym: 'FNV', name: 'Franco-Nevada Corp.', cat: 'Stock' },
  { sym: 'AG', name: 'First Majestic Silver', cat: 'Stock' },
  { sym: 'PAAS', name: 'Pan American Silver', cat: 'Stock' },
  { sym: 'ADBE', name: 'Adobe Inc.', cat: 'Stock' },
  { sym: 'QCOM', name: 'Qualcomm Inc.', cat: 'Stock' },
  { sym: 'AMAT', name: 'Applied Materials', cat: 'Stock' },
  { sym: 'LRCX', name: 'Lam Research', cat: 'Stock' },
  { sym: 'KLAC', name: 'KLA Corp.', cat: 'Stock' },
  { sym: 'ASML', name: 'ASML Holding', cat: 'Stock' },
  { sym: 'TXN', name: 'Texas Instruments', cat: 'Stock' },
  { sym: 'MRVL', name: 'Marvell Technology', cat: 'Stock' },
  { sym: 'ON', name: 'ON Semiconductor', cat: 'Stock' },
  { sym: 'STM', name: 'STMicroelectronics', cat: 'Stock' },
  { sym: 'DELL', name: 'Dell Technologies', cat: 'Stock' },
  { sym: 'HPQ', name: 'HP Inc.', cat: 'Stock' },
  { sym: 'IBM', name: 'IBM Corp.', cat: 'Stock' },
  { sym: 'NOW', name: 'ServiceNow Inc.', cat: 'Stock' },
  { sym: 'SNOW', name: 'Snowflake Inc.', cat: 'Stock' },
  { sym: 'NET', name: 'Cloudflare Inc.', cat: 'Stock' },
  { sym: 'DDOG', name: 'Datadog Inc.', cat: 'Stock' },
  { sym: 'MDB', name: 'MongoDB Inc.', cat: 'Stock' },
  { sym: 'ZS', name: 'Zscaler Inc.', cat: 'Stock' },
  { sym: 'OKTA', name: 'Okta Inc.', cat: 'Stock' },
  { sym: 'TWLO', name: 'Twilio Inc.', cat: 'Stock' },
  { sym: 'RBLX', name: 'Roblox Corp.', cat: 'Stock' },
  { sym: 'LYFT', name: 'Lyft Inc.', cat: 'Stock' },
  { sym: 'DASH', name: 'DoorDash Inc.', cat: 'Stock' },
  { sym: 'PINS', name: 'Pinterest Inc.', cat: 'Stock' },
  { sym: 'MTCH', name: 'Match Group', cat: 'Stock' },
  { sym: 'ROKU', name: 'Roku Inc.', cat: 'Stock' },
  { sym: 'TTD', name: 'The Trade Desk', cat: 'Stock' },
  { sym: 'AFRM', name: 'Affirm Holdings', cat: 'Stock' },
  { sym: 'SQ', name: 'Block Inc. (Square)', cat: 'Stock' },
  // ── ETFs ──
  { sym: 'SPY', name: 'S&P 500 ETF (SPDR)', cat: 'ETF' },
  { sym: 'QQQ', name: 'Nasdaq 100 ETF (Invesco)', cat: 'ETF' },
  { sym: 'IWM', name: 'Russell 2000 ETF (iShares)', cat: 'ETF' },
  { sym: 'DIA', name: 'Dow Jones ETF (SPDR)', cat: 'ETF' },
  { sym: 'VTI', name: 'Total Stock Market ETF (Vanguard)', cat: 'ETF' },
  { sym: 'VOO', name: 'S&P 500 ETF (Vanguard)', cat: 'ETF' },
  { sym: 'GLD', name: 'Gold ETF (SPDR)', cat: 'ETF' },
  { sym: 'IAU', name: 'Gold ETF (iShares)', cat: 'ETF' },
  { sym: 'SGOL', name: 'Gold ETF (Aberdeen Physical)', cat: 'ETF' },
  { sym: 'GDX', name: 'Gold Miners ETF (VanEck)', cat: 'ETF' },
  { sym: 'GDXJ', name: 'Junior Gold Miners ETF (VanEck)', cat: 'ETF' },
  { sym: 'SLV', name: 'Silver ETF (iShares)', cat: 'ETF' },
  { sym: 'SIVR', name: 'Silver ETF (Aberdeen Physical)', cat: 'ETF' },
  { sym: 'PPLT', name: 'Platinum ETF (Aberdeen Physical)', cat: 'ETF' },
  { sym: 'IBIT', name: 'Bitcoin ETF (iShares)', cat: 'ETF' },
  { sym: 'FBTC', name: 'Bitcoin ETF (Fidelity)', cat: 'ETF' },
  { sym: 'GBTC', name: 'Bitcoin Trust (Grayscale)', cat: 'ETF' },
  { sym: 'ETHA', name: 'Ethereum ETF (iShares)', cat: 'ETF' },
  { sym: 'TLT', name: '20+ Year Treasury Bond ETF', cat: 'ETF' },
  { sym: 'IEF', name: '7-10 Year Treasury ETF (iShares)', cat: 'ETF' },
  { sym: 'SHY', name: '1-3 Year Treasury ETF (iShares)', cat: 'ETF' },
  { sym: 'HYG', name: 'High Yield Corp Bond ETF', cat: 'ETF' },
  { sym: 'LQD', name: 'Investment Grade Corp Bond ETF', cat: 'ETF' },
  { sym: 'TIP', name: 'TIPS Bond ETF (iShares)', cat: 'ETF' },
  { sym: 'USO', name: 'Crude Oil ETF (US Oil Fund)', cat: 'ETF' },
  { sym: 'UNG', name: 'Natural Gas ETF (US Gas Fund)', cat: 'ETF' },
  { sym: 'PDBC', name: 'Commodities Diversified ETF (Invesco)', cat: 'ETF' },
  { sym: 'EEM', name: 'Emerging Markets ETF (iShares)', cat: 'ETF' },
  { sym: 'EFA', name: 'Developed Markets ETF (iShares)', cat: 'ETF' },
  { sym: 'FXI', name: 'China Large-Cap ETF (iShares)', cat: 'ETF' },
  { sym: 'VWO', name: 'Emerging Markets ETF (Vanguard)', cat: 'ETF' },
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
  // ── Crypto ──
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
  { sym: 'PEPE24478-USD', name: 'Pepe', cat: 'Crypto' },
  { sym: 'WIF-USD', name: 'dogwifhat', cat: 'Crypto' },
  { sym: 'BONK-USD', name: 'Bonk', cat: 'Crypto' },
  { sym: 'FLOKI-USD', name: 'Floki Inu', cat: 'Crypto' },
  { sym: 'UNI7083-USD', name: 'Uniswap', cat: 'Crypto' },
  { sym: 'AAVE-USD', name: 'Aave', cat: 'Crypto' },
  { sym: 'MKR-USD', name: 'MakerDAO', cat: 'Crypto' },
  { sym: 'CRV-USD', name: 'Curve DAO', cat: 'Crypto' },
  { sym: 'SNX-USD', name: 'Synthetix', cat: 'Crypto' },
  { sym: 'LDO-USD', name: 'Lido DAO', cat: 'Crypto' },
  { sym: 'GRT-USD', name: 'The Graph', cat: 'Crypto' },
  { sym: 'SAND-USD', name: 'The Sandbox', cat: 'Crypto' },
  { sym: 'MANA-USD', name: 'Decentraland', cat: 'Crypto' },
  { sym: 'AXS-USD', name: 'Axie Infinity', cat: 'Crypto' },
  { sym: 'EGLD-USD', name: 'MultiversX (EGLD)', cat: 'Crypto' },
  { sym: 'FTM-USD', name: 'Fantom', cat: 'Crypto' },
  { sym: 'ROSE-USD', name: 'Oasis Network', cat: 'Crypto' },
  { sym: 'ONE-USD', name: 'Harmony ONE', cat: 'Crypto' },
  { sym: 'ZIL-USD', name: 'Zilliqa', cat: 'Crypto' },
  { sym: 'CHZ-USD', name: 'Chiliz', cat: 'Crypto' },
  { sym: 'ENJ-USD', name: 'Enjin Coin', cat: 'Crypto' },
  { sym: 'BAT-USD', name: 'Basic Attention Token', cat: 'Crypto' },
  // ── Indices ──
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
  { sym: '^AEX', name: 'AEX (Netherlands)', cat: 'Index' },
  { sym: '^SSMI', name: 'SMI (Switzerland)', cat: 'Index' },
  { sym: '^OMXS30', name: 'OMX Stockholm 30', cat: 'Index' },
  { sym: '^STOXX50E', name: 'Euro Stoxx 50', cat: 'Index' },
  { sym: '^N100', name: 'Euronext 100', cat: 'Index' },
  { sym: '^STI', name: 'Straits Times Index (Singapore)', cat: 'Index' },
  { sym: '^JKSE', name: 'Jakarta Composite (Indonesia)', cat: 'Index' },
  { sym: '^KLSE', name: 'KLCI (Malaysia)', cat: 'Index' },
  { sym: '^SET.BK', name: 'SET Index (Thailand)', cat: 'Index' },
  { sym: '^PSI', name: 'PSE Composite (Philippines)', cat: 'Index' },
  { sym: '^VN30', name: 'VN30 (Vietnam)', cat: 'Index' },
  { sym: '^MERV', name: 'MERVAL (Argentina)', cat: 'Index' },
  { sym: '^IPSA', name: 'IPSA (Chile)', cat: 'Index' },
  // ── Sectors ──
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
  // ── Commodities ──
  { sym: 'GC=F', name: 'Gold Futures', cat: 'Commodity' },
  { sym: 'SI=F', name: 'Silver Futures', cat: 'Commodity' },
  { sym: 'HG=F', name: 'Copper Futures', cat: 'Commodity' },
  { sym: 'PL=F', name: 'Platinum Futures', cat: 'Commodity' },
  { sym: 'PA=F', name: 'Palladium Futures', cat: 'Commodity' },
  { sym: 'CL=F', name: 'WTI Crude Oil Futures', cat: 'Commodity' },
  { sym: 'BZ=F', name: 'Brent Crude Oil Futures', cat: 'Commodity' },
  { sym: 'NG=F', name: 'Natural Gas Futures', cat: 'Commodity' },
  { sym: 'RB=F', name: 'Gasoline (RBOB) Futures', cat: 'Commodity' },
  { sym: 'HO=F', name: 'Heating Oil Futures', cat: 'Commodity' },
  { sym: 'ZW=F', name: 'Wheat Futures', cat: 'Commodity' },
  { sym: 'ZC=F', name: 'Corn Futures', cat: 'Commodity' },
  { sym: 'ZS=F', name: 'Soybean Futures', cat: 'Commodity' },
  { sym: 'ZO=F', name: 'Oats Futures', cat: 'Commodity' },
  { sym: 'KC=F', name: 'Coffee Futures', cat: 'Commodity' },
  { sym: 'CT=F', name: 'Cotton Futures', cat: 'Commodity' },
  { sym: 'SB=F', name: 'Sugar No. 11 Futures', cat: 'Commodity' },
  { sym: 'CC=F', name: 'Cocoa Futures', cat: 'Commodity' },
  { sym: 'OJ=F', name: 'Orange Juice Futures', cat: 'Commodity' },
  { sym: 'LBS=F', name: 'Lumber Futures', cat: 'Commodity' },
  { sym: 'LE=F', name: 'Live Cattle Futures', cat: 'Commodity' },
  { sym: 'GF=F', name: 'Feeder Cattle Futures', cat: 'Commodity' },
  { sym: 'HE=F', name: 'Lean Hog Futures', cat: 'Commodity' },
  { sym: 'ALI=F', name: 'Aluminium Futures', cat: 'Commodity' },
  { sym: 'ZR=F', name: 'Rough Rice Futures', cat: 'Commodity' },
  { sym: 'ZL=F', name: 'Soybean Oil Futures', cat: 'Commodity' },
  { sym: 'ZM=F', name: 'Soybean Meal Futures', cat: 'Commodity' },
  // ── Forex — Majors ──
  { sym: 'EURUSD=X', name: 'Euro / US Dollar', cat: 'Forex' },
  { sym: 'GBPUSD=X', name: 'British Pound / USD', cat: 'Forex' },
  { sym: 'USDJPY=X', name: 'USD / Japanese Yen', cat: 'Forex' },
  { sym: 'USDCHF=X', name: 'USD / Swiss Franc', cat: 'Forex' },
  { sym: 'AUDUSD=X', name: 'Australian Dollar / USD', cat: 'Forex' },
  { sym: 'NZDUSD=X', name: 'New Zealand Dollar / USD', cat: 'Forex' },
  { sym: 'USDCAD=X', name: 'USD / Canadian Dollar', cat: 'Forex' },
  { sym: 'USDSGD=X', name: 'USD / Singapore Dollar', cat: 'Forex' },
  { sym: 'USDHKD=X', name: 'USD / Hong Kong Dollar', cat: 'Forex' },
  // ── Forex — EUR Crosses ──
  { sym: 'EURGBP=X', name: 'Euro / British Pound', cat: 'Forex' },
  { sym: 'EURJPY=X', name: 'Euro / Japanese Yen', cat: 'Forex' },
  { sym: 'EURCHF=X', name: 'Euro / Swiss Franc', cat: 'Forex' },
  { sym: 'EURAUD=X', name: 'Euro / Australian Dollar', cat: 'Forex' },
  { sym: 'EURCAD=X', name: 'Euro / Canadian Dollar', cat: 'Forex' },
  { sym: 'EURNZD=X', name: 'Euro / New Zealand Dollar', cat: 'Forex' },
  { sym: 'EURSGD=X', name: 'Euro / Singapore Dollar', cat: 'Forex' },
  { sym: 'EURHKD=X', name: 'Euro / Hong Kong Dollar', cat: 'Forex' },
  { sym: 'EURTRY=X', name: 'Euro / Turkish Lira', cat: 'Forex' },
  { sym: 'EURPLN=X', name: 'Euro / Polish Zloty', cat: 'Forex' },
  { sym: 'EURHUF=X', name: 'Euro / Hungarian Forint', cat: 'Forex' },
  { sym: 'EURCZK=X', name: 'Euro / Czech Koruna', cat: 'Forex' },
  { sym: 'EURSEK=X', name: 'Euro / Swedish Krona', cat: 'Forex' },
  { sym: 'EURNOK=X', name: 'Euro / Norwegian Krone', cat: 'Forex' },
  { sym: 'EURDKK=X', name: 'Euro / Danish Krone', cat: 'Forex' },
  { sym: 'EURZAR=X', name: 'Euro / South African Rand', cat: 'Forex' },
  // ── Forex — GBP Crosses ──
  { sym: 'GBPJPY=X', name: 'British Pound / Japanese Yen', cat: 'Forex' },
  { sym: 'GBPCHF=X', name: 'British Pound / Swiss Franc', cat: 'Forex' },
  { sym: 'GBPAUD=X', name: 'British Pound / Australian Dollar', cat: 'Forex' },
  { sym: 'GBPCAD=X', name: 'British Pound / Canadian Dollar', cat: 'Forex' },
  { sym: 'GBPNZD=X', name: 'British Pound / New Zealand Dollar', cat: 'Forex' },
  { sym: 'GBPSGD=X', name: 'British Pound / Singapore Dollar', cat: 'Forex' },
  { sym: 'GBPTRY=X', name: 'British Pound / Turkish Lira', cat: 'Forex' },
  { sym: 'GBPZAR=X', name: 'British Pound / South African Rand', cat: 'Forex' },
  { sym: 'GBPPLN=X', name: 'British Pound / Polish Zloty', cat: 'Forex' },
  // ── Forex — AUD Crosses ──
  { sym: 'AUDJPY=X', name: 'Australian Dollar / Japanese Yen', cat: 'Forex' },
  { sym: 'AUDCHF=X', name: 'Australian Dollar / Swiss Franc', cat: 'Forex' },
  { sym: 'AUDCAD=X', name: 'Australian Dollar / Canadian Dollar', cat: 'Forex' },
  { sym: 'AUDNZD=X', name: 'Australian Dollar / New Zealand Dollar', cat: 'Forex' },
  { sym: 'AUDSGD=X', name: 'Australian Dollar / Singapore Dollar', cat: 'Forex' },
  // ── Forex — NZD Crosses ──
  { sym: 'NZDJPY=X', name: 'New Zealand Dollar / Japanese Yen', cat: 'Forex' },
  { sym: 'NZDCHF=X', name: 'New Zealand Dollar / Swiss Franc', cat: 'Forex' },
  { sym: 'NZDCAD=X', name: 'New Zealand Dollar / Canadian Dollar', cat: 'Forex' },
  { sym: 'NZDSGD=X', name: 'New Zealand Dollar / Singapore Dollar', cat: 'Forex' },
  // ── Forex — CAD / CHF / SGD Crosses ──
  { sym: 'CADJPY=X', name: 'Canadian Dollar / Japanese Yen', cat: 'Forex' },
  { sym: 'CADCHF=X', name: 'Canadian Dollar / Swiss Franc', cat: 'Forex' },
  { sym: 'CHFJPY=X', name: 'Swiss Franc / Japanese Yen', cat: 'Forex' },
  { sym: 'SGDJPY=X', name: 'Singapore Dollar / Japanese Yen', cat: 'Forex' },
  // ── Forex — USD vs Asia-Pacific EM ──
  { sym: 'USDCNY=X', name: 'USD / Chinese Yuan (CNY)', cat: 'Forex' },
  { sym: 'USDCNH=X', name: 'USD / Chinese Yuan Offshore (CNH)', cat: 'Forex' },
  { sym: 'USDINR=X', name: 'USD / Indian Rupee', cat: 'Forex' },
  { sym: 'USDKRW=X', name: 'USD / South Korean Won', cat: 'Forex' },
  { sym: 'USDTWD=X', name: 'USD / Taiwan Dollar', cat: 'Forex' },
  { sym: 'USDTHB=X', name: 'USD / Thai Baht', cat: 'Forex' },
  { sym: 'USDMYR=X', name: 'USD / Malaysian Ringgit', cat: 'Forex' },
  { sym: 'USDIDR=X', name: 'USD / Indonesian Rupiah', cat: 'Forex' },
  { sym: 'USDPHP=X', name: 'USD / Philippine Peso', cat: 'Forex' },
  { sym: 'USDVND=X', name: 'USD / Vietnamese Dong', cat: 'Forex' },
  { sym: 'USDPKR=X', name: 'USD / Pakistani Rupee', cat: 'Forex' },
  { sym: 'USDBDT=X', name: 'USD / Bangladeshi Taka', cat: 'Forex' },
  // ── Forex — USD vs Europe EM ──
  { sym: 'USDTRY=X', name: 'USD / Turkish Lira', cat: 'Forex' },
  { sym: 'USDPLN=X', name: 'USD / Polish Zloty', cat: 'Forex' },
  { sym: 'USDHUF=X', name: 'USD / Hungarian Forint', cat: 'Forex' },
  { sym: 'USDCZK=X', name: 'USD / Czech Koruna', cat: 'Forex' },
  { sym: 'USDSEK=X', name: 'USD / Swedish Krona', cat: 'Forex' },
  { sym: 'USDNOK=X', name: 'USD / Norwegian Krone', cat: 'Forex' },
  { sym: 'USDDKK=X', name: 'USD / Danish Krone', cat: 'Forex' },
  { sym: 'USDRUB=X', name: 'USD / Russian Ruble', cat: 'Forex' },
  { sym: 'USDILS=X', name: 'USD / Israeli Shekel', cat: 'Forex' },
  // ── Forex — USD vs Latin America ──
  { sym: 'USDBRL=X', name: 'USD / Brazilian Real', cat: 'Forex' },
  { sym: 'USDMXN=X', name: 'USD / Mexican Peso', cat: 'Forex' },
  { sym: 'USDCLP=X', name: 'USD / Chilean Peso', cat: 'Forex' },
  { sym: 'USDCOP=X', name: 'USD / Colombian Peso', cat: 'Forex' },
  { sym: 'USDPEN=X', name: 'USD / Peruvian Sol', cat: 'Forex' },
  { sym: 'USDARS=X', name: 'USD / Argentine Peso', cat: 'Forex' },
  // ── Forex — USD vs Africa ──
  { sym: 'USDZAR=X', name: 'USD / South African Rand', cat: 'Forex' },
  { sym: 'USDNGN=X', name: 'USD / Nigerian Naira', cat: 'Forex' },
  { sym: 'USDKES=X', name: 'USD / Kenyan Shilling', cat: 'Forex' },
  { sym: 'USDEGP=X', name: 'USD / Egyptian Pound', cat: 'Forex' },
  { sym: 'USDGHS=X', name: 'USD / Ghanaian Cedi', cat: 'Forex' },
  { sym: 'USDTZS=X', name: 'USD / Tanzanian Shilling', cat: 'Forex' },
  { sym: 'USDMAD=X', name: 'USD / Moroccan Dirham', cat: 'Forex' },
  // ── Forex — USD vs Middle East ──
  { sym: 'USDAED=X', name: 'USD / UAE Dirham', cat: 'Forex' },
  { sym: 'USDSAR=X', name: 'USD / Saudi Riyal', cat: 'Forex' },
  { sym: 'USDQAR=X', name: 'USD / Qatari Riyal', cat: 'Forex' },
  { sym: 'USDKWD=X', name: 'USD / Kuwaiti Dinar', cat: 'Forex' },
  { sym: 'USDBHD=X', name: 'USD / Bahraini Dinar', cat: 'Forex' },
  { sym: 'USDOMR=X', name: 'USD / Omani Rial', cat: 'Forex' },
  { sym: 'USDJOD=X', name: 'USD / Jordanian Dinar', cat: 'Forex' },
  // ── Forex — Precious Metals (Spot) ──
  { sym: 'XAUUSD=X', name: 'Gold Spot / USD (XAU/USD)', cat: 'Forex' },
  { sym: 'XAGUSD=X', name: 'Silver Spot / USD (XAG/USD)', cat: 'Forex' },
  { sym: 'XPTUSD=X', name: 'Platinum Spot / USD (XPT/USD)', cat: 'Forex' },
  { sym: 'XPDUSD=X', name: 'Palladium Spot / USD (XPD/USD)', cat: 'Forex' },
  // ── Forex — CHF Crosses ──
  { sym: 'CHFSGD=X', name: 'Swiss Franc / Singapore Dollar', cat: 'Forex' },
  { sym: 'CHFHKD=X', name: 'Swiss Franc / Hong Kong Dollar', cat: 'Forex' },
  { sym: 'CHFTRY=X', name: 'Swiss Franc / Turkish Lira', cat: 'Forex' },
  { sym: 'CHFPLN=X', name: 'Swiss Franc / Polish Zloty', cat: 'Forex' },
  { sym: 'CHFNOK=X', name: 'Swiss Franc / Norwegian Krone', cat: 'Forex' },
  { sym: 'CHFSEK=X', name: 'Swiss Franc / Swedish Krona', cat: 'Forex' },
  { sym: 'CHFCZK=X', name: 'Swiss Franc / Czech Koruna', cat: 'Forex' },
  { sym: 'CHFHUF=X', name: 'Swiss Franc / Hungarian Forint', cat: 'Forex' },
  { sym: 'CHFZAR=X', name: 'Swiss Franc / South African Rand', cat: 'Forex' },
  // ── Forex — More GBP Crosses ──
  { sym: 'GBPHKD=X', name: 'British Pound / Hong Kong Dollar', cat: 'Forex' },
  { sym: 'GBPINR=X', name: 'British Pound / Indian Rupee', cat: 'Forex' },
  { sym: 'GBPSEK=X', name: 'British Pound / Swedish Krona', cat: 'Forex' },
  { sym: 'GBPNOK=X', name: 'British Pound / Norwegian Krone', cat: 'Forex' },
  { sym: 'GBPDKK=X', name: 'British Pound / Danish Krone', cat: 'Forex' },
  { sym: 'GBPCZK=X', name: 'British Pound / Czech Koruna', cat: 'Forex' },
  { sym: 'GBPHUF=X', name: 'British Pound / Hungarian Forint', cat: 'Forex' },
  // ── Forex — More EUR Crosses ──
  { sym: 'EURRON=X', name: 'Euro / Romanian Leu', cat: 'Forex' },
  { sym: 'EURBGN=X', name: 'Euro / Bulgarian Lev', cat: 'Forex' },
  { sym: 'EURINR=X', name: 'Euro / Indian Rupee', cat: 'Forex' },
  { sym: 'EURKRW=X', name: 'Euro / South Korean Won', cat: 'Forex' },
  { sym: 'EURTHB=X', name: 'Euro / Thai Baht', cat: 'Forex' },
  { sym: 'EURMXN=X', name: 'Euro / Mexican Peso', cat: 'Forex' },
  { sym: 'EURBRL=X', name: 'Euro / Brazilian Real', cat: 'Forex' },
  { sym: 'EURILS=X', name: 'Euro / Israeli Shekel', cat: 'Forex' },
  { sym: 'EURRUB=X', name: 'Euro / Russian Ruble', cat: 'Forex' },
  // ── Forex — USD vs More Europe EM ──
  { sym: 'USDRON=X', name: 'USD / Romanian Leu', cat: 'Forex' },
  { sym: 'USDBGN=X', name: 'USD / Bulgarian Lev', cat: 'Forex' },
  { sym: 'USDRSD=X', name: 'USD / Serbian Dinar', cat: 'Forex' },
  { sym: 'USDUAH=X', name: 'USD / Ukrainian Hryvnia', cat: 'Forex' },
  { sym: 'USDBYN=X', name: 'USD / Belarusian Ruble', cat: 'Forex' },
  { sym: 'USDGEL=X', name: 'USD / Georgian Lari', cat: 'Forex' },
  { sym: 'USDAZN=X', name: 'USD / Azerbaijani Manat', cat: 'Forex' },
  { sym: 'USDAMD=X', name: 'USD / Armenian Dram', cat: 'Forex' },
  { sym: 'USDALL=X', name: 'USD / Albanian Lek', cat: 'Forex' },
  { sym: 'USDKZT=X', name: 'USD / Kazakhstani Tenge', cat: 'Forex' },
  { sym: 'USDUZS=X', name: 'USD / Uzbekistani Som', cat: 'Forex' },
  { sym: 'USDKGS=X', name: 'USD / Kyrgyzstani Som', cat: 'Forex' },
  { sym: 'USDTJS=X', name: 'USD / Tajikistani Somoni', cat: 'Forex' },
  { sym: 'USDMKD=X', name: 'USD / North Macedonian Denar', cat: 'Forex' },
  { sym: 'USDBAM=X', name: 'USD / Bosnian Mark', cat: 'Forex' },
  // ── Forex — USD vs More Asia-Pacific EM ──
  { sym: 'USDLKR=X', name: 'USD / Sri Lankan Rupee', cat: 'Forex' },
  { sym: 'USDNPR=X', name: 'USD / Nepalese Rupee', cat: 'Forex' },
  { sym: 'USDMNT=X', name: 'USD / Mongolian Tugrik', cat: 'Forex' },
  { sym: 'USDKHR=X', name: 'USD / Cambodian Riel', cat: 'Forex' },
  { sym: 'USDLAK=X', name: 'USD / Laotian Kip', cat: 'Forex' },
  { sym: 'USDBND=X', name: 'USD / Brunei Dollar', cat: 'Forex' },
  { sym: 'USDMMK=X', name: 'USD / Myanmar Kyat', cat: 'Forex' },
  // ── Forex — USD vs More Latin America ──
  { sym: 'USDUYU=X', name: 'USD / Uruguayan Peso', cat: 'Forex' },
  { sym: 'USDBOB=X', name: 'USD / Bolivian Boliviano', cat: 'Forex' },
  { sym: 'USDPYG=X', name: 'USD / Paraguayan Guaraní', cat: 'Forex' },
  { sym: 'USDDOP=X', name: 'USD / Dominican Peso', cat: 'Forex' },
  { sym: 'USDGTQ=X', name: 'USD / Guatemalan Quetzal', cat: 'Forex' },
  { sym: 'USDHNL=X', name: 'USD / Honduran Lempira', cat: 'Forex' },
  { sym: 'USDCRC=X', name: 'USD / Costa Rican Colón', cat: 'Forex' },
  { sym: 'USDJMD=X', name: 'USD / Jamaican Dollar', cat: 'Forex' },
  { sym: 'USDTTD=X', name: 'USD / Trinidad & Tobago Dollar', cat: 'Forex' },
  { sym: 'USDBBD=X', name: 'USD / Barbadian Dollar', cat: 'Forex' },
  { sym: 'USDNIO=X', name: 'USD / Nicaraguan Córdoba', cat: 'Forex' },
  { sym: 'USDSVC=X', name: 'USD / El Salvador Colón', cat: 'Forex' },
  // ── Forex — USD vs More Africa ──
  { sym: 'USDETB=X', name: 'USD / Ethiopian Birr', cat: 'Forex' },
  { sym: 'USDZMW=X', name: 'USD / Zambian Kwacha', cat: 'Forex' },
  { sym: 'USDMZN=X', name: 'USD / Mozambican Metical', cat: 'Forex' },
  { sym: 'USDTND=X', name: 'USD / Tunisian Dinar', cat: 'Forex' },
  { sym: 'USDDZD=X', name: 'USD / Algerian Dinar', cat: 'Forex' },
  { sym: 'USDMUR=X', name: 'USD / Mauritian Rupee', cat: 'Forex' },
  { sym: 'USDAOA=X', name: 'USD / Angolan Kwanza', cat: 'Forex' },
  { sym: 'USDUGX=X', name: 'USD / Ugandan Shilling', cat: 'Forex' },
  { sym: 'USDRWF=X', name: 'USD / Rwandan Franc', cat: 'Forex' },
  { sym: 'USDLYD=X', name: 'USD / Libyan Dinar', cat: 'Forex' },
  { sym: 'USDMWK=X', name: 'USD / Malawian Kwacha', cat: 'Forex' },
  { sym: 'USDBWP=X', name: 'USD / Botswana Pula', cat: 'Forex' },
  { sym: 'USDSCR=X', name: 'USD / Seychellois Rupee', cat: 'Forex' },
  { sym: 'USDNAD=X', name: 'USD / Namibian Dollar', cat: 'Forex' },
  { sym: 'USDSZL=X', name: 'USD / Swazi Lilangeni', cat: 'Forex' },
  // ── Forex — USD vs More Middle East ──
  { sym: 'USDLBP=X', name: 'USD / Lebanese Pound', cat: 'Forex' },
  { sym: 'USDIQD=X', name: 'USD / Iraqi Dinar', cat: 'Forex' },
  { sym: 'USDYER=X', name: 'USD / Yemeni Rial', cat: 'Forex' },
  { sym: 'USDAFN=X', name: 'USD / Afghan Afghani', cat: 'Forex' },
  { sym: 'USDPKR=X', name: 'USD / Pakistani Rupee', cat: 'Forex' },
  // ── Bonds & Macro ──
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
    for (const q of json.results ?? []) { if (q?.symbol) map[q.symbol] = q; }
    return map;
  } catch { return {}; }
}

function CatBadge({ cat }: { cat: Category }) {
  const c = CAT_COLORS[cat];
  return (
    <View style={[styles.catBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.catText, { color: c.text }]}>{cat.toUpperCase()}</Text>
    </View>
  );
}

function CatalogRow({ item, inWatchlist, onAdd, onRemove }: {
  item: CatalogItem; inWatchlist: boolean; onAdd: () => void; onRemove: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={inWatchlist ? onRemove : onAdd}
      style={({ pressed }) => [
        styles.catalogRow,
        { backgroundColor: pressed ? colors.surface : 'transparent', borderBottomColor: colors.rim },
      ]}
    >
      <CatBadge cat={item.cat} />
      <View style={styles.catalogInfo}>
        <Text style={[styles.catalogSym, { color: colors.t1 }]}>{item.sym}</Text>
        <Text style={[styles.catalogName, { color: colors.t4 }]} numberOfLines={1}>{item.name}</Text>
      </View>
      <View style={[
        styles.catalogAction,
        {
          backgroundColor: inWatchlist ? colors.gainDim : colors.surface,
          borderColor: inWatchlist ? 'rgba(0,229,160,0.3)' : colors.rim,
        },
      ]}>
        <Text style={[styles.catalogActionText, { color: inWatchlist ? colors.gain : colors.t3 }]}>
          {inWatchlist ? '✓' : '+'}
        </Text>
      </View>
    </Pressable>
  );
}

function WatchRow({ sym, q, onRemove }: { sym: string; q: QuoteRow | undefined; onRemove: () => void; }) {
  const colors = useColors();
  const { settings } = useSettings();
  const chg = q?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t3;
  const accentColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.rim;
  const entry = CATALOG.find((c) => c.sym === sym);

  const handleAsk = () => {
    const query = `Give me a full analysis of ${sym}${entry ? ` (${entry.name})` : ''} — price, recent performance, outlook, and key risks.`;
    router.navigate({ pathname: '/(tabs)/advisor', params: { q: query } });
  };

  const isForex = entry?.cat === 'Forex';
  const isBond = entry?.cat === 'Bond';
  const isCrypto = entry?.cat === 'Crypto';
  const decimals = isForex ? 4 : isBond ? 3 : settings.priceDecimals;
  const prefix = isForex || isBond || isCrypto ? '' : '$';

  const extPrice = q?.preMarketPrice ?? q?.postMarketPrice;
  const extChgPct = q?.preMarketChangePercent ?? q?.postMarketChangePercent;
  const extLabel = q?.preMarketPrice ? 'PRE' : q?.postMarketPrice ? 'POST' : null;
  const showExt = settings.showExtendedHours;

  return (
    <View style={[styles.watchRow, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={[styles.watchRowAccent, { backgroundColor: accentColor }]} />
      <View style={styles.watchLeft}>
        <View style={styles.watchSymRow}>
          <Text style={[styles.watchSym, { color: colors.t1 }]}>{sym}</Text>
          {entry && <CatBadge cat={entry.cat} />}
        </View>
        {entry && <Text style={[styles.watchName, { color: colors.t4 }]} numberOfLines={1}>{entry.name}</Text>}
        {q && (
          <View style={styles.ohlcRow}>
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
          <View style={styles.ohlcRow}>
            <Text style={[styles.ohlcText, { color: colors.t4 }]}>Prev {prefix}{fmt(q.regularMarketPreviousClose, decimals)}</Text>
            {!isForex && !isBond && <Text style={[styles.ohlcText, { color: colors.t4 }]}>{fmtMcap(q.marketCap, settings.compactNumbers)}</Text>}
          </View>
        )}
        {q && q.fiftyTwoWeekHigh != null && q.fiftyTwoWeekLow != null && (
          <Text style={[styles.ohlcText, { color: colors.t4, marginTop: 1 }]}>
            52W {prefix}{fmt(q.fiftyTwoWeekLow, decimals)}–{prefix}{fmt(q.fiftyTwoWeekHigh, decimals)}
          </Text>
        )}
      </View>

      <View style={styles.watchMid}>
        <Text style={[styles.watchPrice, { color: colors.t1 }]}>
          {q ? `${prefix}${fmt(q.regularMarketPrice, decimals)}` : '—'}
        </Text>
        <Text style={[styles.watchChg, { color: chgColor }]}>{q ? fmtChg(chg) : '—'}</Text>
        {showExt && extPrice != null && extLabel && (
          <View style={styles.extRow}>
            <View style={[styles.extLabel, { backgroundColor: colors.amberDim }]}>
              <Text style={[styles.extLabelText, { color: colors.amber }]}>{extLabel}</Text>
            </View>
            <Text style={[styles.extPrice, { color: extChgPct != null && extChgPct >= 0 ? colors.gain : colors.loss }]}>
              {prefix}{fmt(extPrice, decimals)}
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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSymbols(JSON.parse(raw) as string[]);
    });
  }, []);

  const saveSymbols = (syms: string[]) => {
    setSymbols(syms);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syms));
  };

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

  const addSymbol = async (sym: string) => {
    if (symbols.includes(sym)) return;
    setAdding(sym);
    const q = await fetchQuotes([sym]);
    if (q[sym]) {
      const next = [sym, ...symbols];
      saveSymbols(next);
      setQuotes((prev) => ({ ...prev, [sym]: q[sym] }));
    } else {
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

  const filtered = useMemo(() => {
    if (!query.trim()) return CATALOG;
    const q = query.toLowerCase();
    return CATALOG.filter((c) => c.sym.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q));
  }, [query]);

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

  const up = sortedSymbols.filter((s) => (quotes[s]?.regularMarketChangePercent ?? 0) > 0).length;
  const dn = sortedSymbols.filter((s) => (quotes[s]?.regularMarketChangePercent ?? 0) < 0).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.t1 }]}>Watchlist</Text>
          {symbols.length > 0 && !isSearching && (
            <Text style={[styles.subTitle, { color: colors.t4 }]}>{symbols.length} tracked · {up}↑ {dn}↓</Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {fetching && <ActivityIndicator size="small" color={colors.blue} />}
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: query ? colors.blue + '88' : colors.rim }]}>
          <Text style={[styles.searchIcon, { color: colors.t4 }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.t1 }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search stocks, crypto, indices, forex…"
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

      {/* Results header if searching */}
      {isSearching && (
        <View style={[styles.resultsHeader, { backgroundColor: colors.surface, borderBottomColor: colors.rim }]}>
          <Text style={[styles.resultsCount, { color: colors.t4 }]}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} — tap to add or remove
          </Text>
        </View>
      )}

      {isSearching ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.sym}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
          renderItem={({ item }) => (
            <CatalogRow
              item={item}
              inWatchlist={symbols.includes(item.sym)}
              onAdd={() => { if (adding !== item.sym) addSymbol(item.sym); }}
              onRemove={() => removeSymbol(item.sym)}
            />
          )}
        />
      ) : (
        <FlatList
          data={sortedSymbols}
          keyExtractor={(sym) => sym}
          contentContainerStyle={{ padding: 12, paddingBottom: tabBarHeight + 8, gap: 6 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.rim }]}>
                <Text style={{ fontSize: 28 }}>👁</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.t2 }]}>Your watchlist is empty</Text>
              <Text style={[styles.emptyBody, { color: colors.t4 }]}>
                Search above for any stock, ETF, crypto, index, commodity, or forex pair to start tracking it with live prices.
              </Text>
              <Text style={[styles.emptyHint, { color: colors.t4 }]}>Try: "Apple", "BTC", "Gold", "Tech", "S&P"</Text>
            </View>
          }
          renderItem={({ item: sym }) => (
            <WatchRow sym={sym} q={quotes[sym]} onRemove={() => removeSymbol(sym)} />
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
  subTitle: { fontSize: 10, marginTop: 1 },
  searchBar: {
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1,
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, gap: 6,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', paddingVertical: 10 },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 12 },
  resultsHeader: { paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  resultsCount: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  // Catalog rows
  catalogRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  catalogInfo: { flex: 1 },
  catalogSym: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  catalogName: { fontSize: 10, marginTop: 2 },
  catalogAction: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  catalogActionText: { fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  catBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  catText: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  // Watch rows
  watchRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, overflow: 'hidden',
  },
  watchRowAccent: { width: 3, alignSelf: 'stretch' },
  watchLeft: { flex: 1.8, padding: 11, gap: 2 },
  watchSymRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  watchSym: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  watchName: { fontSize: 9 },
  ohlcRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  ohlcText: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  watchMid: { flex: 1.4, alignItems: 'flex-end', paddingRight: 8 },
  watchPrice: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  watchChg: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  extRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  extLabel: { borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  extLabelText: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  extPrice: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  watchActions: { flexDirection: 'column', gap: 5, paddingRight: 10, paddingVertical: 10 },
  aiBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center' },
  aiBtnText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  removeBtn: { borderRadius: 6, borderWidth: 1, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  emptyBody: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  emptyHint: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
});
