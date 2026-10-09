<p align="center">
  <img src="docs/banner.png" alt="ORBITX — a liquid-glass crypto exchange built with Expo and React Native" width="100%" />
</p>

<p align="center">
  <img alt="Expo SDK 57" src="https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white" />
  <img alt="React Native 0.86" src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black" />
  <img alt="React 19.2" src="https://img.shields.io/badge/React-19.2%20%2B%20Compiler-087EA4?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Reanimated 4" src="https://img.shields.io/badge/Reanimated-4-6E56CF" />
  <img alt="Platforms" src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey" />
</p>

<p align="center">
  A complete, production-structured React Native implementation of the <b>ORBITX Crypto Exchange</b> design —
  30+ screens, 12 native bottom sheets, a trader app, a staff admin console, dark &amp; light themes, and a motion
  system ported from the design's spec.
</p>

<p align="center">
  <a href="https://www.youtube.com/@reactjsBD"><img alt="YouTube @reactjsBD" src="https://img.shields.io/badge/YouTube-%40reactjsBD-FF0000?style=for-the-badge&logo=youtube&logoColor=white" /></a>
  <a href="https://medium.com/@reactbd"><img alt="Medium @reactbd" src="https://img.shields.io/badge/Medium-%40reactbd-000000?style=for-the-badge&logo=medium&logoColor=white" /></a>
  <a href="https://github.com/noorjsdivs"><img alt="GitHub noorjsdivs" src="https://img.shields.io/badge/GitHub-noorjsdivs-181717?style=for-the-badge&logo=github&logoColor=white" /></a>
  <a href="https://noormohammad.reactbd.com/"><img alt="Website noormohammad.reactbd.com" src="https://img.shields.io/badge/Website-noormohammad.reactbd.com-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white" /></a>
</p>

> [!TIP]
> **Designed with Claude Design, coded with Claude Code.** The whole app was built from the design handoff in this repo. You'll find the prompts in [How this app was built](#how-this-app-was-built).
>
> 📺 For build videos, subscribe on **[YouTube @reactjsBD](https://www.youtube.com/@reactjsBD)**. ✍️ For write-ups on AI, careers and money, follow **[Medium @reactbd](https://medium.com/@reactbd)**. ⭐ If this repo helps you, give it a star.

---

## Contents

- [Quick start](#quick-start)
- [How this app was built](#how-this-app-was-built)
- [Motion preview](#motion-preview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Demo accounts & test data](#demo-accounts--test-data)
- [Deep links](#deep-links)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Motion system](#motion-system)
- [Customizing](#customizing)
- [Building for production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Quick start

You don't need API keys, a `.env` file or a backend. Everything runs on simulated data.

```bash
git clone https://github.com/noorjsdivs/Orbitx-App.git
cd Orbitx-App
npm install
npm run ios        # macOS + Xcode 27 or newer
npm run android    # Android Studio + an emulator or device
```

For the requirements and every step, see [Getting started](#getting-started). If you get stuck, check [Troubleshooting](#troubleshooting).

## How this app was built

ORBITX went from idea to running app with two AI tools.

1. **Design: Claude Design.** It produced the full clickable prototype: every screen, both themes and the motion spec. The handoff it exported is committed here as [`ORBITX Crypto Exchange App-handoff.zip`](ORBITX%20Crypto%20Exchange%20App-handoff.zip).
2. **Code: [Claude Code](https://claude.com/claude-code).** It read the handoff and built the app with Expo Router and TypeScript. It followed the project rules in [`AGENTS.md`](AGENTS.md), then ran the type checker, lint and Expo Doctor, and fixed what they found.

These are the prompts shown in the build video. Use them to recreate the app or adapt them to your own idea.

<details>
<summary><b>Design prompt (Claude Design)</b></summary>

```text
Design ORBITX, a crypto exchange and wallet app for iPhone. Dark first. It should feel
familiar to people who already trade on the big exchanges, but have its own look. Cover the
whole journey: sign up, verification, home, markets, coin details, spot and futures trading,
convert, P2P, deposit and withdraw, earn, orders, notifications, profile, and search. Make it
a live, clickable prototype.
```
</details>

<details>
<summary><b>Build prompt (Claude Code)</b></summary>

```text
Build ORBITX from the Claude Design handoff zip. Read its README first, then version three,
in full. Follow AGENTS.md. Use Expo Router and TypeScript, and build every screen, both
themes, native bottom sheets, and the design's motion, pixel for pixel. Before you say you're
done, run the type checker, lint, and Expo Doctor, and fix everything they find.
```
</details>

**Try it yourself:** create a new Expo app (`npx create-expo-app@latest`), copy in `AGENTS.md` and the handoff zip, open Claude Code in that folder and paste the build prompt.

## Motion preview

<table>
  <tr>
    <td align="center" width="50%"><img src="docs/motion-launch.gif" width="280" alt="Animated splash then Home with balance count-up" /></td>
    <td align="center" width="50%"><img src="docs/motion-tour.gif" width="280" alt="Tab transitions, sliding filters, Trade sheet, Buy/Sell slide, leverage warning, balance roll" /></td>
  </tr>
  <tr>
    <td align="center"><b>Launch</b><br/><sub>Ring draws · orbit dot spins · wordmark rises letter by letter · Home balance counts up</sub></td>
    <td align="center"><b>App tour</b><br/><sub>Tab fade-rise · gliding underline · native sheet · Buy/Sell pill · 50x warning · balance roll</sub></td>
  </tr>
</table>

> Recorded on the iOS 27 simulator (iPhone 18 Pro). Prices tick live every 1.2 s and flash green/red on change.

## Screenshots

### Onboarding & authentication

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/onboarding.png" width="190" alt="Onboarding" /><br/><sub>Onboarding</sub></td>
    <td align="center"><img src="docs/screenshots/welcome.png" width="190" alt="Welcome" /><br/><sub>Welcome · live ticker</sub></td>
    <td align="center"><img src="docs/screenshots/sign-in.png" width="190" alt="Sign in" /><br/><sub>Sign in</sub></td>
    <td align="center"><img src="docs/screenshots/setup-2fa.png" width="190" alt="2FA setup" /><br/><sub>Authenticator 2FA</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/kyc-scan.png" width="190" alt="KYC scan" /><br/><sub>KYC · ID scan</sub></td>
    <td align="center"><img src="docs/screenshots/kyc-verified.png" width="190" alt="KYC verified" /><br/><sub>KYC · Verified</sub></td>
    <td align="center"><img src="docs/screenshots/home.png" width="190" alt="Home" /><br/><sub>Home</sub></td>
    <td align="center"><img src="docs/screenshots/markets.png" width="190" alt="Markets" /><br/><sub>Markets</sub></td>
  </tr>
</table>

### Trading

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/spot-pro.png" width="190" alt="Spot Pro" /><br/><sub>Spot · Pro</sub></td>
    <td align="center"><img src="docs/screenshots/spot-lite.png" width="190" alt="Spot Lite" /><br/><sub>Spot · Lite</sub></td>
    <td align="center"><img src="docs/screenshots/trade-sheet.png" width="190" alt="Trade sheet" /><br/><sub>Trade sheet</sub></td>
    <td align="center"><img src="docs/screenshots/futures.png" width="190" alt="Futures" /><br/><sub>Futures</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/coin.png" width="190" alt="Coin detail" /><br/><sub>Coin detail</sub></td>
    <td align="center"><img src="docs/screenshots/convert.png" width="190" alt="Convert" /><br/><sub>Convert</sub></td>
    <td align="center"><img src="docs/screenshots/p2p.png" width="190" alt="P2P" /><br/><sub>P2P merchants</sub></td>
    <td align="center"><img src="docs/screenshots/p2p-order.png" width="190" alt="P2P order" /><br/><sub>P2P order + chat</sub></td>
  </tr>
</table>

### Wallet & account

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/assets.png" width="190" alt="Assets" /><br/><sub>Assets</sub></td>
    <td align="center"><img src="docs/screenshots/deposit.png" width="190" alt="Deposit" /><br/><sub>Deposit · real QR</sub></td>
    <td align="center"><img src="docs/screenshots/earn.png" width="190" alt="Earn" /><br/><sub>Earn</sub></td>
    <td align="center"><img src="docs/screenshots/notifications.png" width="190" alt="Notifications" /><br/><sub>Notifications</sub></td>
  </tr>
</table>

### Light theme

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/light-home.png" width="190" alt="Home light" /><br/><sub>Home</sub></td>
    <td align="center"><img src="docs/screenshots/light-spot.png" width="190" alt="Spot light" /><br/><sub>Spot · Pro</sub></td>
    <td align="center"><img src="docs/screenshots/light-coin.png" width="190" alt="Coin light" /><br/><sub>Coin detail</sub></td>
    <td align="center"><img src="docs/screenshots/light-profile.png" width="190" alt="Profile light" /><br/><sub>Profile & security</sub></td>
  </tr>
</table>

### Admin console

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/admin-dashboard.png" width="190" alt="Admin dashboard" /><br/><sub>Dashboard</sub></td>
    <td align="center"><img src="docs/screenshots/admin-kyc.png" width="190" alt="KYC review" /><br/><sub>KYC review queue</sub></td>
    <td align="center"><img src="docs/screenshots/admin-markets.png" width="190" alt="Markets control" /><br/><sub>Markets control</sub></td>
    <td align="center"><img src="docs/screenshots/profile.png" width="190" alt="Profile" /><br/><sub>Profile & security</sub></td>
  </tr>
</table>

## Features

**Launch & onboarding**
- Animated brand splash (tap to skip) → 3 swipeable onboarding slides, each animating its own UI fragment
- Welcome screen with a live price ticker, Apple / Google sign-in (simulated), and guest mode

**Authentication & setup**
- Email or phone sign-in/registration with a searchable country-code picker and flag images
- Live password-strength meter, rule checklist, referral code, terms consent
- Custom OTP keypad with auto-submit, resend countdown, shake + attempts-left on a wrong code
- Profile setup (legal name, country, display currency) → authenticator 2FA with a real, scannable `otpauth://` QR → verification intro
- KYC: document picker, animated ID scan, selfie progress ring, review timeline, verified celebration

**Trader app**
- **Home** — count-up balance, quick actions, Favorites/Hot/Gainers/Losers/New watchlist, top movers with sparklines, Earn promo, announcements, pull-to-refresh
- **Markets** — search, six filters, sortable columns, rows that re-order smoothly
- **Spot Pro** — candlestick chart (5 timeframes) with volume and live price tag, limit / market / stop-limit ticket, % presets, live order book with depth bars (tap a level to fill the price), open orders & holdings, confirm sheet
- **Spot Lite** — market-only ticket with presets and a 10-second locked quote
- **Futures** — cross/isolated, 1–100x leverage slider with high-risk warning, liquidation estimates, funding countdown, open/close positions with live PnL/ROE
- **Coin detail** — area chart with 1D/1W/1M/1Y, market stats, about, price alert, favorite
- **Convert** — from/to pickers, animated swap, 8-second quote lock
- **P2P** — merchant list with payment filters; order flow with 15-min timer, bank details, escrow states and chat
- **Wallet** — Assets (overview/spot/funding/futures/earn), Deposit (network chips, real QR, TON memo warning), Withdraw (validation, fees, 2FA sheet), Transfer, Earn subscriptions, Orders history
- **Account** — notifications & price alerts, search (recent, trending, features), Profile & security (security meter, 2FA, whitelist, devices, language, theme, trading mode)
- **Guest mode** — browse prices and markets; account actions open a sign-up sheet

**Admin console** (sign in with an `admin@` email)
- KPI dashboard with range switcher and hourly volume bars, system status, risk alerts
- KYC review queue with risk scores, document checks, two-step reject with reason
- Withdrawal approvals (dual-signer above 10k USDT), market status control (Trading / Cancel-only / Halted)
- Immutable audit log of every action you take

**Platform polish**
- Dark & light themes from the design tokens; native sheets, keyboard and status bar follow the in-app theme
- Native iOS form sheets (liquid glass on iOS 26+), haptics, clipboard, share sheet, password autofill
- State persists across launches (session, preferences, balances, orders)
- Respects the system **Reduce Motion** setting

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) · React Native 0.86 (New Architecture) · React 19.2 with the React Compiler |
| Language | TypeScript (strict) |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) — typed routes, native stack, native form sheets, custom tab bars |
| State | [Zustand 5](https://zustand.docs.pmnd.rs/) persisted with AsyncStorage |
| Animation | [Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) — CSS transitions/keyframes, layout animations, shared values |
| Graphics | react-native-svg (charts, rings, icons), react-native-qrcode-svg |
| Native modules | expo-blur, expo-haptics, expo-clipboard, expo-image, expo-linear-gradient, expo-splash-screen, @react-native-community/slider |
| Typography | Geist & Geist Mono via `@expo-google-fonts` |
| Tooling | ESLint (`eslint-config-expo`), Prettier, `expo-doctor` |

## Getting started

### 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | **20.19+** (LTS 22/24 recommended) | `node -v` |
| npm | 10+ | ships with Node |
| **iOS** — Xcode | **27 or newer** | macOS only. Open Xcode once to install the iOS simulator runtime. Xcode 26.0.x can't compile Expo SDK 57 ([details](#ios-build-fails-weak-must-be-a-mutable-variable)) |
| **iOS** — CocoaPods | 1.15+ | `brew install cocoapods` (or `sudo gem install cocoapods`) |
| **Android** — Android Studio | latest | with an Android SDK, platform tools and an emulator ([setup guide](https://docs.expo.dev/workflow/android-studio-emulator/)) |
| Watchman (optional) | latest | `brew install watchman` — faster file watching on macOS |

> Tested on macOS with Xcode 27 and the iOS 27 simulator (iPhone 18 Pro). Android is supported by the stack but hasn't been tested on a device yet.

### 2. Clone and install

```bash
git clone https://github.com/noorjsdivs/Orbitx-App.git
cd Orbitx-App
npm install
```

### 3. Run on iOS

```bash
npm run ios
```

This runs `expo run:ios`: it generates the native `ios/` project (Continuous Native Generation), installs CocoaPods, builds with Xcode, installs on the simulator and starts Metro. The first build takes a few minutes; later builds are incremental.

To pick a specific simulator or a connected iPhone:

```bash
npx expo run:ios --device
```

### 4. Run on Android

```bash
npm run android
```

Start an emulator from Android Studio first (or connect a device with USB debugging on).

### 5. Day-to-day development

After the first native build you only need Metro for JavaScript changes:

```bash
npm start
```

Press `i` / `a` in the terminal to open the app on iOS / Android. Rebuild natively (`npm run ios`) only after adding a package with native code or changing `app.json` / `plugins/`.

> **Expo Go:** the supported path is the development build above. The app only uses modules bundled with Expo Go, so `npx expo start` + Expo Go may work, but it isn't tested.

### Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Start Metro (dev server) |
| `npm run ios` / `npm run android` | Native build + install + run |
| `npm run web` | Start for web (not a target of this design; layout is mobile-first) |
| `npm run prebuild` | Regenerate `ios/` and `android/` from `app.json` + plugins |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Expo + React Compiler rules) |
| `npm run format` / `format:check` | Prettier write / verify |
| `npm run check` | typecheck + lint + format check (run before pushing) |
| `npm run doctor` | `expo-doctor` dependency and config health check |

## Demo accounts & test data

There is no backend — everything runs on simulated data, so any credentials work.

| To try | Do this |
| --- | --- |
| **Trader** | Sign in with any email (e.g. `christina.john@gmail.com`) and any 8+ character password, then any 6-digit code |
| **Admin console** | Sign in with an email starting with `admin@` (e.g. `admin@orbitx.io`) |
| **Wrong code** | Enter `000000` on the OTP screen to see the shake and attempts-left error |
| **Register** | Password needs 8+ characters, an uppercase letter and a number; accept the terms |
| **Guest** | "Explore as guest" on Welcome |
| **Developer options** | Long-press the version line at the bottom of **Profile & security** to force list states (loading / empty / error), pause live prices, or replay the splash |

Starting balances, orders, positions and fixtures live in [`src/data`](src/data) and [`src/store/wallet.ts`](src/store/wallet.ts). Session, preferences and wallet state persist between launches; delete the app from the simulator to start fresh.

## Deep links

The app registers the `orbitx://` scheme. Every route is linkable — handy for QA and screenshots:

```bash
xcrun simctl openurl booted orbitx://markets          # iOS simulator
adb shell am start -a android.intent.action.VIEW -d "orbitx://markets"   # Android
```

| Area | Links |
| --- | --- |
| Tabs | `orbitx://home` · `markets` · `trade` · `futures` · `assets` |
| Trading | `orbitx://coin/BTC` · `convert` · `p2p` · `p2p/order` |
| Wallet | `orbitx://deposit` · `withdraw` · `transfer` · `earn` · `orders` |
| Account | `orbitx://notifications` · `search` · `profile` |
| Flows | `orbitx://onboarding` · `welcome` · `sign-in` · `register` · `setup/profile` · `kyc/document` |
| Admin | `orbitx://admin` · `admin/kyc` · `admin/payouts` · `admin/markets` · `admin/audit` |

## Project structure

```
Orbitx-App/
├── app.json                  Expo config (name, bundle IDs, splash, plugins)
├── plugins/
│   └── with-scene-lifecycle.js   iOS 27 UIScene life-cycle config plugin (see Troubleshooting)
├── assets/images/            App icon, adaptive icons, splash
├── docs/                     README banner, screenshots, motion GIFs
└── src/
    ├── app/                  Expo Router routes — every file is a screen
    │   ├── _layout.tsx       Root: fonts, theme, live price ticker, sheet registry, toasts
    │   ├── index.tsx         Animated splash → routes by session
    │   ├── onboarding.tsx · welcome.tsx · sign-in.tsx · register.tsx · otp.tsx
    │   ├── setup/            Profile → 2FA → verification intro
    │   ├── kyc/              Document → scan → selfie → pending → verified
    │   ├── (app)/            Trader app stack + floating glass tab bar
    │   │   ├── (tabs)/       home · markets · trade (Spot) · futures · assets
    │   │   └── coin/[sym] · convert · p2p/ · deposit · withdraw · transfer · earn · orders · notifications · search · profile
    │   ├── admin/            Staff console tabs
    │   └── sheets/           Native form sheets (trade menu, confirms, pickers, admin reviews)
    ├── components/
    │   ├── ui/               Design-system primitives: Txt, Button, Press, controls, Field, Card, Icon…
    │   ├── layout/           Screen, Header, Appear (stagger), SheetBody
    │   ├── motion/           Motion presets, tweened numbers, price flashes, pull-to-refresh
    │   ├── navigation/       Glass tab bars, toast host
    │   └── charts.tsx · market.tsx
    ├── features/             Domain logic per area (spot, lite, convert, withdraw, p2p, portfolio, auth…)
    ├── store/                Zustand stores (prefs, session, wallet, market feed, drafts, admin, toast)
    ├── data/                 Market data and fixtures
    ├── hooks/ · lib/         Theme, haptics, timers, formatting, charts, navigation helpers
    └── theme/                Design tokens (dark/light), color helpers, fonts
```

## Architecture

**Routing.** Expo Router with one root native stack. The trader app is a nested stack whose first screen is a tab navigator; its tab bar is hidden and replaced by an overlay [`GlassTabBar`](src/components/navigation/glass-tab-bar.tsx) so the floating bar stays visible over pushed screens, like the design. Switching tabs calls `router.navigate`, which unwinds pushed screens first. Bottom sheets are real native **form sheets** registered in [`src/app/_layout.tsx`](src/app/_layout.tsx) — they size to content, follow the keyboard, and get liquid glass on iOS 26+.

**State.** Small focused Zustand stores in [`src/store`](src/store):

| Store | Holds | Persisted |
| --- | --- | --- |
| `prefs` | theme, Lite/Pro mode, hidden balances, favorites, language | ✅ |
| `session` | auth status, identity, 2FA/whitelist/KYC flags, devices | ✅ |
| `wallet` | balances, orders, fills, positions, earn, alerts, recent searches | ✅ |
| `market` | live prices, tick counter, boot/retry state | — |
| `drafts` | in-progress forms shared between a screen and its confirm sheet | — |
| `admin` | KYC queue, payouts, market statuses, audit log | — |

Business rules (ticket validation, liquidation estimates, quote locks, P2P escrow) are plain functions in [`src/features`](src/features), shared by screens and sheets.

**Theming.** [`src/theme/tokens.ts`](src/theme/tokens.ts) ports the design's CSS variables 1:1 for dark and light. `useColors()` returns the active palette; `tint()` / `blend()` reproduce CSS `color-mix()`. The root layout calls `Appearance.setColorScheme()` so native UI (sheets, keyboard, alerts) matches the in-app theme rather than the system.

**Data.** The price feed in [`src/store/market.ts`](src/store/market.ts) random-walks ~65% of pairs every 1.2 s. Charts and order books are seeded per symbol so they're stable between renders.

## Motion system

Timings and curves come straight from the design's motion spec ([`src/theme/tokens.ts`](src/theme/tokens.ts) → `motion`):

| Motion | Spec | Where |
| --- | --- | --- |
| Content stagger | fade 420 ms + rise 16 px over 560 ms, 60 ms steps, `cubic-bezier(.2,.8,.2,1)` | every screen via [`Appear`](src/components/layout/appear.tsx) |
| Screen push | native iOS push / swipe-back | all pushed routes |
| Tab switch | fade + 10 px rise, 320 ms | trader & admin tabs ([`presets.ts`](src/components/motion/presets.ts)) |
| Tab indicator pill | 550 ms spring `cubic-bezier(.34,1.36,.64,1)` + icon bounce | glass tab bars |
| Segmented / pill / underline | sliding indicator, spring 380–450 ms; Buy↔Sell cross-fades green→red | [`controls.tsx`](src/components/ui/controls.tsx) |
| Sheets | native form sheet, resizes with content and keyboard | `src/app/sheets` |
| Press | scale .97–.98, 150 ms | [`Press`](src/components/ui/press.tsx) |
| Numbers | count-up 900 ms on entry, then roll to new values | Home balance, Assets cards, Earn total ([`useTween`](src/components/motion/animated-number.tsx)) |
| Price ticks | green/red background flash, 90 ms in / 650 ms out | market rows, Spot, Futures, Coin ([`FlashPrice`](src/components/motion/flash-price.tsx)) |
| Lists | rows fade in staggered; added rows slide in, removed rows slide out, the rest glide | markets, orders, positions, alerts, earn, chat, admin queues |
| Toggles & checks | 400 ms pop knob, check-mark scale-in | toggles, checkboxes, radios |
| Flows | splash ring/orbit/wordmark, scan line, selfie ring, KYC check draw, P2P release pop | launch, KYC, P2P |

All motion respects the OS **Reduce Motion** setting: staggers render immediately, tweens jump to their final value, flashes are skipped, and Reanimated layout animations disable themselves.

## Customizing

- **Brand colors / theme** — edit `palettes` in [`src/theme/tokens.ts`](src/theme/tokens.ts). Every component reads from it.
- **Fonts** — swap the families in [`src/theme/fonts.ts`](src/theme/fonts.ts).
- **App name, bundle IDs, icon, splash** — [`app.json`](app.json) and [`assets/images`](assets/images), then `npm run prebuild`.
- **Coins and fixtures** — [`src/data/market.ts`](src/data/market.ts) and [`src/data/fixtures.ts`](src/data/fixtures.ts).
- **Connect a real backend** —
  - Prices: replace `step()` in [`src/store/market.ts`](src/store/market.ts) with a WebSocket subscription that writes into `prices`.
  - Trading & wallet: replace the store mutations in [`src/features/spot.ts`](src/features/spot.ts), [`lite.ts`](src/features/lite.ts), [`p2p.ts`](src/features/p2p.ts) and the confirm sheets with API calls.
  - Auth: replace the simulated flows in [`src/features/auth.ts`](src/features/auth.ts) and [`auth-form.tsx`](src/features/auth-form.tsx).
  - Admin: back [`src/store/admin.ts`](src/store/admin.ts) with your staff APIs.

## Building for production

Builds use [EAS](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli        # or prefix commands with npx eas-cli@latest
eas login
eas build:configure           # creates eas.json
eas build --platform ios      # or --platform android / all
eas submit --platform ios
```

Before shipping, update the bundle identifier / package (`io.orbitx.app`), version and build numbers in [`app.json`](app.json), and swap the simulated data layer for real services.

## Troubleshooting

<details>
<summary><b>iOS app crashes at launch: "UIScene life cycle is required for apps built with this SDK"</b></summary>

Apps built with the iOS 27 SDK must adopt UIKit's scene-based life cycle. Expo SDK 57's native template doesn't yet, so this repo ships a config plugin, [`plugins/with-scene-lifecycle.js`](plugins/with-scene-lifecycle.js), that applies the SDK 58 template's fix during prebuild. If you see this error, regenerate native files:

```bash
npm run prebuild && npm run ios
```

Remove the plugin from `app.json` once you upgrade to an SDK whose template includes `SceneDelegate`.
</details>

<a id="ios-build-fails-weak-must-be-a-mutable-variable"></a>
<details>
<summary><b>iOS build fails: <code>'weak' must be a mutable variable</code></b></summary>

Your Xcode is too old for Expo SDK 57. Xcode 26.0.x ships Swift 6.2, which can't compile `expo-modules-jsi`. Update Xcode to 27 or newer from the Mac App Store, open it once to install the iOS simulator runtime, then do a clean build:

```bash
xcode-select -p                 # should point at the new Xcode
rm -rf ios && npm run ios
```
</details>

<details>
<summary><b>CocoaPods: "requires your terminal to be using UTF-8 encoding"</b></summary>

```bash
export LANG=en_US.UTF-8
```

Add it to `~/.zshrc` to make it permanent.
</details>

<details>
<summary><b>Metro shows stale code or a red screen after pulling</b></summary>

```bash
npx expo start --clear
```

If native packages changed, rebuild with `npm run ios` / `npm run android`.
</details>

<details>
<summary><b>"Open in ORBITX?" prompt when opening deep links, or "Allow Paste" when tapping Paste</b></summary>

Both are iOS system prompts and expected behaviour. Tap **Open** / **Allow Paste**.
</details>

<details>
<summary><b>Haptics or "hapticpatternlibrary" warnings in the simulator log</b></summary>

The simulator has no haptic engine. The warnings are harmless; haptics work on a real device.
</details>

<details>
<summary><b>Reset the app to a fresh install</b></summary>

Delete the app from the simulator (long-press → Remove App) or run `xcrun simctl uninstall booted io.orbitx.app`, then launch it again.
</details>

## Contributing

1. Create a branch from `main`.
2. Keep new code in the existing structure: routes in `src/app`, reusable UI in `src/components`, domain logic in `src/features`, state in `src/store`.
3. Use the design tokens and primitives (`Txt`, `Button`, `Press`, `Card`, `Appear`, motion presets) instead of hard-coded colors and ad-hoc animations.
4. Run `npm run check` before pushing — typecheck, lint and formatting must pass.
5. Open a pull request that describes what changed and why. Add screenshots for UI changes.

Found a bug or have an idea? [Open an issue](https://github.com/noorjsdivs/Orbitx-App/issues).

## Author

Hi, I'm **Noor Mohammad**, a software engineer and the founder of ReactBD. I teach React, Next.js and React Native on YouTube and write about AI, careers and money on Medium.

| | |
| --- | --- |
| 📺 YouTube | [@reactjsBD](https://www.youtube.com/@reactjsBD) |
| ✍️ Medium | [@reactbd](https://medium.com/@reactbd) |
| 💻 GitHub | [noorjsdivs](https://github.com/noorjsdivs) |
| 🌐 Website | [noormohammad.reactbd.com](https://noormohammad.reactbd.com/) |

If this project helped you, star the repo, subscribe on YouTube and follow on Medium. It really helps.

## License

[MIT](LICENSE). You're free to use, modify and ship it. ORBITX is a demo with simulated data, not a real exchange. Before you handle real funds, wire up your own backend, security and compliance.

---

<p align="center"><sub>Design: ORBITX Crypto Exchange App (Claude Design handoff) · Built with Claude Code, Expo &amp; React Native · by <a href="https://www.youtube.com/@reactjsBD">@reactjsBD</a></sub></p>
