# ORBITX — Crypto Exchange App

A React Native (Expo) implementation of the **ORBITX Crypto Exchange App** design handoff
(`ORBITX Crypto Exchange App-handoff.zip`, primary file `ORBITX App v3.dc.html`).

Dark/light "liquid glass" UI built on the design's tokens, Geist typography and motion spec:
staggered content (60 ms steps), spring tab pill (550 ms), native form sheets, press scale .97,
900 ms count-ups — with a simulated real-time price feed.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Expo SDK 57 · React Native 0.86 (New Architecture) · React 19.2 + React Compiler |
| Routing | Expo Router (typed routes), native stack + native form sheets |
| State | Zustand 5 (persisted with AsyncStorage) |
| Motion | Reanimated 4 CSS transitions / keyframes |
| Graphics | react-native-svg (charts, rings), react-native-qrcode-svg (real QR codes) |
| Native | expo-blur, expo-haptics, expo-clipboard, expo-image, expo-linear-gradient |
| Fonts | Geist + Geist Mono via `@expo-google-fonts` |

## Getting started

```bash
npm install
npx expo run:ios        # builds the native app and opens it in the iOS Simulator
npx expo run:android    # Android emulator
```

After the first native build, `npx expo start` is enough for JS-only changes.

Checks:

```bash
npx tsc --noEmit
npx expo lint
```

## Demo accounts

| Flow | How |
| --- | --- |
| Trader | Sign in with any email (e.g. `christina.john@gmail.com`) + any 8+ char password, then any 6-digit code |
| Admin console | Sign in with an email starting with `admin@` (e.g. `admin@orbitx.io`) |
| Wrong 2FA / OTP | Enter `000000` to see the shake + attempts-left error |
| Guest | "Explore as guest" on Welcome — prices and markets only; account actions open a sign-up sheet |

Long-press the version line at the bottom of **Profile & security** for developer options
(force list states: loading / empty / error, pause live prices, replay the splash).

## Screens

- **Launch** — animated splash, 3-slide onboarding (swipe), welcome with live ticker
- **Auth** — sign in / register (email or phone with country picker, password strength), OTP keypad
- **Profile setup** — legal name & country, authenticator 2FA (QR + setup key), verification intro
- **KYC** — document picker, ID scan, selfie ring, review timeline, verified
- **Trader app** — Home, Markets, Spot (Pro: candles + order book + ticket; Lite: market ticket),
  Futures (leverage, liquidation estimates, positions), Assets, Coin detail, Convert, P2P + order chat,
  Deposit, Withdraw, Transfer, Earn, Orders, Notifications & price alerts, Search, Profile & security
- **Admin console** — dashboard KPIs, KYC review queue, withdrawal approvals (dual sign > 10k),
  market status control, audit log

## Project layout

```
src/
  app/            Expo Router routes (screens, layouts, sheets/*)
    (app)/        trader app stack; (tabs)/ are the tab roots under the glass tab bar
    admin/        staff console tabs
    sheets/       native form sheets (trade menu, confirms, pickers…)
  components/     UI kit (ui/), layout, navigation chrome, charts
  features/       domain logic per area (spot, lite, convert, p2p, portfolio, auth…)
  store/          Zustand stores (prefs, session, wallet, market feed, drafts, admin, toast)
  data/           market + fixture data
  theme/          design tokens, color helpers, fonts
  lib/            formatting, charts, seeded RNG, navigation helpers
```

Market data, balances and orders are simulated locally (`src/store/market.ts` ticks every
1.2 s); swap `useMarket.step` for a WebSocket feed and the wallet actions for API calls to go live.
