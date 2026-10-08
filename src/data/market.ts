import { sparkPoints } from '@/lib/chart';

export type Coin = {
  /** Full name */
  n: string;
  /** Reference price (USDT) */
  p: number;
  /** 24h change % */
  c: number;
  /** 24h volume (USDT) */
  v: number;
  /** Price decimals */
  dp: number;
  /** Brand color for the coin glyph */
  col: string;
  /** Perpetual funding rate %, when a perp exists */
  fr?: number;
  /** "Listed 2d ago" for new listings */
  listed?: string;
};

export const COINS: Record<string, Coin> = {
  USDT: { n: 'TetherUS', p: 1, c: 0.01, v: 0, dp: 4, col: '#3DD6A0' },
  BTC: { n: 'Bitcoin', p: 67412.3, c: 2.14, v: 1.84e9, dp: 2, col: '#F7A13A', fr: 0.01 },
  ETH: { n: 'Ethereum', p: 3284.55, c: 1.32, v: 986.4e6, dp: 2, col: '#9AA8F5', fr: 0.0085 },
  BNB: { n: 'BNB', p: 584.2, c: -0.48, v: 212.7e6, dp: 2, col: '#E3B341', fr: 0.0061 },
  SOL: { n: 'Solana', p: 152.37, c: 5.86, v: 704.1e6, dp: 2, col: '#B79CFF', fr: 0.0213 },
  XRP: { n: 'XRP', p: 0.5231, c: -1.92, v: 318.9e6, dp: 4, col: '#98A3B3', fr: -0.0042 },
  DOGE: { n: 'Dogecoin', p: 0.1247, c: 8.41, v: 452.3e6, dp: 5, col: '#D9B866', fr: 0.035 },
  TON: { n: 'Toncoin', p: 6.821, c: 3.07, v: 96.2e6, dp: 3, col: '#5AB0FF', fr: 0.012 },
  ADA: { n: 'Cardano', p: 0.4512, c: -2.31, v: 88.4e6, dp: 4, col: '#7C9BFF' },
  AVAX: { n: 'Avalanche', p: 34.18, c: -3.74, v: 121.5e6, dp: 2, col: '#FF7A7A', fr: 0.005 },
  LINK: { n: 'Chainlink', p: 14.62, c: 0.91, v: 64.8e6, dp: 2, col: '#6F8FFF', fr: 0.0075 },
  SUI: { n: 'Sui', p: 1.0842, c: 6.22, v: 143.6e6, dp: 4, col: '#7FCBFF', fr: 0.0189 },
  PEPE: { n: 'Pepe', p: 0.00001172, c: 12.38, v: 388.1e6, dp: 8, col: '#7CC97F', fr: 0.0412 },
  TRX: { n: 'TRON', p: 0.1214, c: 0.27, v: 72.3e6, dp: 4, col: '#FF7070' },
  ZRO: { n: 'LayerZero', p: 3.912, c: 18.62, v: 58.2e6, dp: 3, col: '#8E9BAE', listed: 'Listed 2d ago' },
  ENA: { n: 'Ethena', p: 0.6124, c: -4.18, v: 102.4e6, dp: 4, col: '#8F9AAD', listed: 'Listed 5d ago' },
  JUP: { n: 'Jupiter', p: 0.8833, c: 9.07, v: 44.7e6, dp: 4, col: '#9EE6B8', listed: 'Listed 6d ago' },
};

export const PAIRS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'TON', 'ADA', 'AVAX', 'LINK', 'SUI', 'PEPE', 'TRX', 'ZRO', 'ENA', 'JUP'];
export const NEW_LISTINGS = ['ZRO', 'ENA', 'JUP'];

export const SPARKS: Record<string, string> = Object.fromEntries(PAIRS.map((k) => [k, sparkPoints(k, COINS[k].c)]));

export const RANK: Record<string, number> = { BTC: 1, ETH: 2, BNB: 4, SOL: 5, XRP: 7, DOGE: 9, TON: 10, ADA: 11, AVAX: 12, LINK: 14, SUI: 18, PEPE: 22, TRX: 13, ZRO: 88, ENA: 61, JUP: 72 };
export const MARKET_CAP: Record<string, string> = { BTC: '$1.33T', ETH: '$395.2B', BNB: '$85.3B', SOL: '$71.4B', XRP: '$29.6B', DOGE: '$18.2B', TON: '$17.3B' };
export const SUPPLY: Record<string, string> = { BTC: '19.76M BTC', ETH: '120.3M ETH', BNB: '146.0M BNB', SOL: '468.6M SOL', XRP: '56.6B XRP', DOGE: '146.2B DOGE', TON: '2.54B TON' };
export const ATH: Record<string, string> = { BTC: '73,750.07', ETH: '4,878.26', BNB: '720.67', SOL: '259.96', XRP: '3.40', DOGE: '0.7316', TON: '8.29' };
export const ABOUT: Record<string, string> = {
  BTC: 'Bitcoin is a decentralized digital currency secured by proof-of-work. Supply is capped at 21 million coins, and new BTC is issued to miners roughly every 10 minutes.',
  ETH: 'Ethereum is a programmable blockchain for smart contracts and decentralized apps. ETH pays for transaction fees and secures the network through staking.',
  SOL: 'Solana is a high-throughput blockchain designed for fast, low-cost transactions. SOL is used for fees and staking.',
  BNB: 'BNB is the native token of BNB Chain, used for gas fees and ecosystem utility.',
  XRP: 'XRP is the native asset of the XRP Ledger, built for fast cross-border settlement.',
  DOGE: 'Dogecoin began as a meme and became a widely used payments coin with an uncapped supply.',
};

export const ANNOUNCEMENTS = [
  { d: 'Oct 07', t: 'TON network upgrade: TON deposits and withdrawals paused 10:00–12:00 UTC.' },
  { d: 'Oct 06', t: 'New listing: LayerZero (ZRO). ZRO/USDT spot trading is now open.' },
  { d: 'Oct 03', t: 'USDT withdrawal fee on TRC-20 changes to 1 USDT from Oct 10.' },
];

/** Starting spot balances for a new demo account. */
export const SPOT_START: Record<string, number> = { USDT: 2104.62, BTC: 0.0498, ETH: 0.315, SOL: 2.85, BNB: 0.42, XRP: 46.2, DOGE: 108, TRX: 3.2, ADA: 1.1 };

/** Seeded futures position used by the Assets › Futures summary card. */
export const SEED_POSITION = { size: 0.03, entry: 64610.5, lev: 10 };
