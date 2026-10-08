export const COUNTRIES = [
  ['NG', 'Nigeria', 'NGN'],
  ['KE', 'Kenya', 'KES'],
  ['GH', 'Ghana', 'GHS'],
  ['ZA', 'South Africa', 'ZAR'],
  ['PK', 'Pakistan', 'PKR'],
  ['VN', 'Vietnam', 'VND'],
  ['TR', 'Türkiye', 'TRY'],
  ['PH', 'Philippines', 'PHP'],
  ['EG', 'Egypt', 'EGP'],
] as const;

export const LANGUAGES = ['English', 'Français', 'Português', 'Kiswahili', 'Hausa', 'Yorùbá', 'اردو', 'Tiếng Việt', 'Türkçe'];

export type Device = { id: number; n: string; loc: string; t: string; cur?: boolean };
export const DEVICES: Device[] = [
  { id: 1, n: 'iPhone 15 · iOS 18.1', loc: 'Lagos, NG', t: 'This device', cur: true },
  { id: 2, n: 'Chrome on macOS', loc: 'Lagos, NG', t: '2 hours ago' },
  { id: 3, n: 'Samsung Galaxy A54', loc: 'Abuja, NG', t: 'Sep 28' },
];

export const ID_DOCS = [
  { k: 'national', t: 'National ID card', d: 'NIN card or Ghana Card · not the NIN slip' },
  { k: 'passport', t: 'International passport', d: 'Photo page only' },
  { k: 'license', t: "Driver's licence", d: 'Front and back' },
] as const;
export type IdDocKind = (typeof ID_DOCS)[number]['k'];

export type Merchant = {
  id: number;
  n: string;
  o: number;
  r: number;
  p: number;
  min: number;
  max: number;
  av: number;
  pays: string[];
  t: string;
};
export const MERCHANTS: Merchant[] = [
  { id: 1, n: 'Oluwaseun_Trades', o: 2841, r: 99.2, p: 1561.2, min: 15000, max: 2500000, av: 18420.55, pays: ['Bank transfer', 'OPay'], t: '15 min' },
  { id: 2, n: 'KudaKing', o: 1290, r: 98.6, p: 1562.05, min: 5000, max: 800000, av: 6230.1, pays: ['Kuda', 'PalmPay'], t: '15 min' },
  { id: 3, n: 'NaijaDesk', o: 5120, r: 99.7, p: 1563.4, min: 50000, max: 5000000, av: 42100.0, pays: ['Bank transfer'], t: '30 min' },
  { id: 4, n: 'AdaezeP2P', o: 640, r: 97.9, p: 1564.8, min: 2000, max: 300000, av: 1880.75, pays: ['OPay', 'PalmPay', 'Kuda'], t: '15 min' },
];
export const P2P_PAY_METHODS = ['All', 'Bank transfer', 'OPay', 'PalmPay', 'Kuda'];

export type Network = { id: string; name: string; conf: string; addr: string; memo: string | null; fee: string };
export const NETWORKS: Network[] = [
  { id: 'TRC-20', name: 'TRON', conf: '1 confirmation · ~1 min', addr: 'TQ7xK2mNfR8sYp3Lw4vB6cZ1hJ9e5dG9fA2', memo: null, fee: '1 USDT' },
  { id: 'BEP-20', name: 'BNB Smart Chain', conf: '15 confirmations · ~1 min', addr: '0x8C3f1A2b9E7d64F5c0B1a9D2e3F4a5B6c7D8e9F0', memo: null, fee: '0.29 USDT' },
  { id: 'ERC-20', name: 'Ethereum', conf: '12 confirmations · ~3 min', addr: '0x8C3f1A2b9E7d64F5c0B1a9D2e3F4a5B6c7D8e9F0', memo: null, fee: '4.5 USDT' },
  { id: 'TON', name: 'The Open Network', conf: '1 confirmation · ~1 min', addr: 'EQB4xR7m2LpQ9vK3nT8sW1yZ6cF5hJ0aD2gU4eI7oP3sX', memo: '481927364', fee: '0.5 USDT' },
  { id: 'SOL', name: 'Solana', conf: '1 confirmation · <1 min', addr: '7GkPq3Z8wR2mN5vB9xT4yL6cH1jF0dS8aE3uW5oKmQ2r', memo: null, fee: '1 USDT' },
];

/** [coin, name, apr, term, lockDays] */
export type EarnProduct = [string, string, string, string, number];
export const EARN_PRODUCTS: Record<'flex' | 'locked', EarnProduct[]> = {
  flex: [
    ['USDT', 'USDT Flexible', '5.10%', 'Redeem anytime', 0],
    ['BTC', 'BTC Flexible', '0.85%', 'Redeem anytime', 0],
    ['ETH', 'ETH Flexible', '2.40%', 'Redeem anytime', 0],
    ['BNB', 'BNB Flexible', '1.60%', 'Redeem anytime', 0],
  ],
  locked: [
    ['SOL', 'SOL Locked', '7.40%', '60 days', 60],
    ['USDT', 'USDT Locked', '8.20%', '90 days', 90],
    ['DOGE', 'DOGE Locked', '3.10%', '30 days', 30],
    ['TON', 'TON Locked', '6.80%', '120 days', 120],
  ],
};

export type NotificationType = 'Trades' | 'Price alerts' | 'Security' | 'News';
export const NOTIFICATIONS: { ty: NotificationType; t: string; b: string; time: string }[] = [
  { ty: 'Trades', t: 'Limit sell partially filled', b: 'ETH/USDT · 0.0500 of 0.1500 at 3,420.00', time: '2m' },
  { ty: 'Price alerts', t: 'SOL crossed 150.00', b: 'SOL/USDT is up 5.86% in 24h. Last price 152.37.', time: '18m' },
  { ty: 'Security', t: 'New sign-in from iPhone 15', b: 'Lagos, NG · 09:12. Not you? Lock your account now.', time: '1h' },
  { ty: 'Trades', t: 'Deposit confirmed', b: '1,000.00 USDT via TRC-20 credited to Spot.', time: '3h' },
  { ty: 'News', t: 'New listing: LayerZero (ZRO)', b: 'ZRO/USDT spot trading is now open.', time: '1d' },
  { ty: 'Security', t: 'Anti-phishing code reminder', b: 'Genuine ORBITX emails always show your code.', time: '2d' },
];

/** Searchable app features → route */
export const FEATURES: [string, string][] = [
  ['Deposit', '/deposit'],
  ['Withdraw', '/withdraw'],
  ['Transfer', '/transfer'],
  ['Convert', '/convert'],
  ['P2P', '/p2p'],
  ['Earn', '/earn'],
  ['Futures', '/futures'],
  ['Orders', '/orders'],
  ['Security', '/profile'],
  ['Notifications', '/notifications'],
];

/** [iso, country, dial code, placeholder] */
export const DIAL_CODES = [
  ['NG', 'Nigeria', '+234', '801 234 5678'],
  ['KE', 'Kenya', '+254', '712 345 678'],
  ['GH', 'Ghana', '+233', '24 123 4567'],
  ['ZA', 'South Africa', '+27', '71 234 5678'],
  ['PK', 'Pakistan', '+92', '301 2345678'],
  ['IN', 'India', '+91', '98765 43210'],
  ['VN', 'Vietnam', '+84', '91 234 56 78'],
  ['TR', 'Türkiye', '+90', '501 234 56 78'],
  ['PH', 'Philippines', '+63', '917 123 4567'],
  ['EG', 'Egypt', '+20', '100 123 4567'],
  ['ID', 'Indonesia', '+62', '812 3456 7890'],
  ['BR', 'Brazil', '+55', '11 91234 5678'],
  ['AE', 'United Arab Emirates', '+971', '50 123 4567'],
  ['SA', 'Saudi Arabia', '+966', '50 123 4567'],
  ['GB', 'United Kingdom', '+44', '7400 123456'],
  ['US', 'United States', '+1', '201 555 0123'],
] as const;

export const flagUrl = (iso: string) => `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;

export const AVATAR_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&h=240&q=80';

// ─── Admin console fixtures ────────────────────────────────────────────────

export type Risk = 'Low' | 'Medium' | 'High';
export type KycApp = { id: string; name: string; cc: string; doc: string; ago: string; risk: Risk; score: number; flag?: string };
export const KYC_QUEUE: KycApp[] = [
  { id: 'K-30418', name: 'Chinedu Eze', cc: 'NG', doc: 'National ID', ago: '4m', risk: 'Low', score: 12 },
  { id: 'K-30417', name: 'Wanjiru Kamau', cc: 'KE', doc: 'Passport', ago: '9m', risk: 'Low', score: 18 },
  { id: 'K-30415', name: 'Hamza Qureshi', cc: 'PK', doc: 'CNIC', ago: '14m', risk: 'Medium', score: 46 },
  { id: 'K-30411', name: 'Nguyễn Minh Anh', cc: 'VN', doc: 'Citizen ID', ago: '22m', risk: 'Low', score: 9 },
  {
    id: 'K-30409',
    name: 'Emre Yılmaz',
    cc: 'TR',
    doc: "Driver's licence",
    ago: '31m',
    risk: 'High',
    score: 78,
    flag: 'Partial name match on a sanctions watchlist. Escalate to compliance if unsure.',
  },
  { id: 'K-30402', name: 'Kofi Mensah', cc: 'GH', doc: 'Ghana Card', ago: '48m', risk: 'Low', score: 15 },
];

export type Payout = { id: string; uid: string; amt: number; coin: string; net: string; addr: string; flags: string[]; risk: Risk; ago: string };
export const PAYOUT_QUEUE: Payout[] = [
  { id: 'W-88213', uid: '48219377', amt: 4800, coin: 'USDT', net: 'TRC-20', addr: 'TQ7xK2…9fA2', flags: ['New address', '3× 30-day avg'], risk: 'Medium', ago: '2m' },
  { id: 'W-88209', uid: '31940025', amt: 0.42, coin: 'BTC', net: 'Bitcoin', addr: 'bc1qxy…0wlh', flags: ['Whitelisted'], risk: 'Low', ago: '6m' },
  { id: 'W-88201', uid: '77310482', amt: 18500, coin: 'USDT', net: 'ERC-20', addr: '0x9aE1…44Bc', flags: ['Large amount', 'Account age 3d'], risk: 'High', ago: '11m' },
  { id: 'W-88197', uid: '52018834', amt: 12.5, coin: 'SOL', net: 'Solana', addr: '7GkP…mQ2r', flags: ['Whitelisted'], risk: 'Low', ago: '15m' },
];

export type MarketStatus = 'trading' | 'cancel' | 'halted';
export const MARKET_STATUS: Record<string, MarketStatus> = {
  BTC: 'trading',
  ETH: 'trading',
  BNB: 'trading',
  SOL: 'trading',
  XRP: 'trading',
  DOGE: 'trading',
  TON: 'cancel',
  PEPE: 'trading',
  ZRO: 'trading',
  JUP: 'trading',
};

export type AuditEntry = { t: string; who: string; act: string; me?: boolean };
export const AUDIT_LOG: AuditEntry[] = [
  { t: '09:41:07', who: 'ops.tunde', act: 'Raised BTC withdrawal limit for VIP 3 tier to 50 BTC/day' },
  { t: '09:12:44', who: 'risk.ama', act: 'Held W-88177 · 9,200 USDT · sanctions re-check' },
  { t: '08:55:00', who: 'system', act: 'TON set to Cancel-only for network upgrade' },
  { t: '08:30:19', who: 'kyc.sara', act: 'Approved 48 KYC applications (batch)' },
  { t: '07:02:51', who: 'treasury.li', act: 'Hot wallet top-up · 120 BTC from cold storage' },
];

export const TFA_SECRET = 'JBSWY3DPEHPK3PXPK4QF';
