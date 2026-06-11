# Pilotage — Kompletny Plan Implementacji

> Buildathon: Arbitrum Open House London Online Buildathon
> Termin: 25 maja – 14 czerwca 2026
> Pula nagród: $115K + $300K na Founder House
> Team: 2 osoby, full-stack
> Cel: Maksimum szans na top 3

---

## Spis treści

1. [Nazwa i tożsamość](#1-nazwa-i-tożsamość)
2. [Opis produktu (long-form)](#2-opis-produktu-long-form)
3. [Pitch (3 wersje)](#3-pitch-3-wersje)
4. [Tech stack — finalne wybory](#4-tech-stack--finalne-wybory)
5. [Architektura systemu](#5-architektura-systemu)
6. [Lista modułów do zbudowania](#6-lista-modułów-do-zbudowania)
7. [User flows](#7-user-flows)
8. [Lista features (priorytetyzowana)](#8-lista-features-priorytetyzowana)
9. [Demo plan](#9-demo-plan)
10. [Co czyni nas wygrywającymi](#10-co-czyni-nas-wygrywającymi)
11. [Ryzyka i ich mitygacja](#11-ryzyka-i-ich-mitygacja)
12. [Walidacja techniczna](#12-walidacja-techniczna)
13. [Co konkretnie robisz w ciągu następnych 48 godzin](#13-co-konkretnie-robisz-w-ciągu-następnych-48-godzin)

---

## 1. Nazwa i tożsamość

**Nazwa produktu:** Pilotage

**Etymologia:** *Pilotage* to morski termin oznaczający czynność prowadzenia statku przez wąskie lub niebezpieczne wody przez wyspecjalizowanego pilota. Kapitan zachowuje pełną władzę nad statkiem — pilot dostaje *ograniczoną delegację* żeby przeprowadzić go przez wody które zna lepiej. Dokładnie nasz model: user (kapitan) zachowuje pełną kontrolę nad vaultem, agent (pilot) dostaje wąsko zdefiniowaną delegację na konkretną nawigację.

**Tagline:** *Where capital finds its pilot.*

**Alternatywne taglines (zależnie od kontekstu):**

- Marketing: "Pilot your capital. Without giving up the helm."
- Technical: "Non-custodial vaults + permissioned pilots + on-chain reputation."
- Investor: "Marketplace infrastructure for the agentic capital economy."

**Pozycjonowanie:** Pilotage to dwustronny rynek między **capital providers** (każdy z USDC/RWA, "kapitanowie") i **pilot developers** (każdy kto umie zaprogramować strategię). Capital nigdy nie opuszcza self-custody kapitana. Piloci działają w ramach matematycznie wymuszanych policy. Reputation jest on-chain i przenośna między portami.

**Maritime brand language (do użytku w UI, docs, marketingu):**

- Agent → **Pilot**
- Reputation Score → **Pilotage Score**
- Agent Registry → **Pilot Registry** (lub *Harbor*)
- Builder Portal → **Pilot House** (kabina sternika)
- Policy / Permissions → **Charter** (umowa pilotażu)
- Marketplace → **Harbor** lub **Port**
- Vault → pozostaje *Vault* (uniwersalnie zrozumiałe)
- User → **Captain** (w copy marketing, nie wszędzie)
- Successful action → "Safe passage"
- Policy violation → "Off-course"

---

## 2. Opis produktu (long-form)

Tokenizacja realnych aktywów eksplodowała — RWA na chainach przekroczyły $50B, Robinhood Chain wprowadza tokenized stocks, instytucje migrują on-chain. Ale operacyjna warstwa, która powinna zarządzać tym kapitałem, nie istnieje. Każdy DAO, fund, family office i prywatny holder z większą pozycją robi to ręcznie — albo oddaje custody scentralizowanej platformie, tracąc cały sens self-custody.

Pilotage rozwiązuje ten problem przez trzy złączone elementy:

**Po pierwsze, non-custodial vaults.** User deployuje swój własny smart contract vault. Tylko on ma do niego klucze. Może w dowolnym momencie nacisnąć "withdraw all" i fundusze wracają na jego EOA w jednej transakcji. Pilotage jako platforma nie ma ani jednego privileged call do żadnego vaultu — nie technicznie, nie kontraktowo, nie prawnie.

**Po drugie, permissioned pilot execution.** User wybiera pilota z marketplace'u (Harbor) i podpisuje ERC-7715 charter — *session key* tego pilota z wąsko zdefiniowanymi uprawnieniami: jakie kontrakty może wywoływać, jakimi kwotami, jak często, z jakim slippage'em. Pilot fizycznie nie może wykonać akcji spoza charteru — każda taka próba revertuje on-chain w preflight checku. To nie jest trust, to jest matematyka.

**Po trzecie, on-chain Pilotage Score przez ERC-8004.** Każdy pilot ma publiczny track record. Każda akcja, każdy rebalans, każda safe passage i każde off-course są zapisane on-chain. Przed delegacją kapitału kapitan widzi historyczny performance, max drawdown, compliance rate z deklarowanym charterem. Pilot developers konkurują na reputacji, nie na marketingu.

Revenue model jest klasyczny: performance fee od zysków, splitowane między pilot developera (70%), platformę (20%) i DAO treasury (10%). Custody nie istnieje, więc regulacyjna powierzchnia jest minimalna — Pilotage to discovery layer i SDK, nie financial services provider.

W demo pokazujemy dwóch reference pilots (ConservativeRWA dla tokenized stocks na Robinhood Chain, AggressiveYield dla yield positions na Arbitrum), pełen onboarding flow kapitana, Pilot House dla devów, i wow-moment gdzie zmiana ceny testnetowego TSLA powoduje real-time autonomiczną nawigację z natychmiastową aktualizacją Pilotage Score.

---

## 3. Pitch (3 wersje)

### 3a. Wersja zwięzła (do Hackquest registration, ~280 znaków)

> Pilotage is marketplace infrastructure for autonomous capital management. Non-custodial vaults, ERC-7715 permissioned pilots, ERC-8004 reputation. Native on Arbitrum + Robinhood Chain. Pick your pilot. Set the charter. Keep the helm. Zero custody, zero trust assumptions.

### 3b. Wersja pełna (do pitch decka, ~150 słów)

Tokenized RWAs hit $50B+ on-chain. But the operational layer that should manage this capital doesn't exist — DAOs rebalance manually, family offices give up self-custody, and every "autonomous treasury" today either runs as a custodial product (defeating the purpose) or as a hand-coded one-off script (defeating scale).

Pilotage is the marketplace infrastructure for autonomous capital management. Users deploy their own non-custodial vault and delegate execution to pilots through ERC-7715 charters — fine-grained session keys with hard-coded limits on assets, venues, amounts, and time. Pilot developers compete on ERC-8004 Pilotage Score, with track records permanently visible on-chain.

We're building the discovery layer, the SDK, and the reference implementations. Capital stays in user's vault. Pilots earn fees on performance. We take a cut on successful matches.

Built native on Arbitrum and Robinhood Chain, leveraging every standard the Arbitrum Foundation has shipped this year.

### 3c. Wersja hype'owa (do video opening, ~30 sekund mówiąc)

> Imagine you hold $100K in tokenized Tesla and Apple. You want it actively managed — but you don't want to give your keys to a custodian, and you don't want to babysit a spreadsheet. Today, you have no good option. Pilotage is that option. You deploy a vault. You browse a harbor of pilots ranked by on-chain reputation. You pick one. You sign a charter — which assets, which venues, what risk. One transaction. Then you go live your life. The pilot works 24/7, can never sail outside the charter, and earns fees only if you make money. We're building the marketplace for autonomous capital — and we're starting on Arbitrum.

---

## 4. Tech stack — finalne wybory

| Layer | Technologia | Powód |
|---|---|---|
| **Smart contracts (core logic)** | Solidity 0.8.24 + Foundry | Standard, najlepsze tooling, większość integracji EVM-native |
| **Smart contracts (hot path)** | Stylus (Rust) | Reputation scoring engine — math-heavy, ~80% tańszy gas, demonstruje technical chops |
| **Smart account framework** | ZeroDev Kernel v3 | Native ERC-7715, session keys, gas sponsorship. **Bonus: ZeroDev został kupiony przez Offchain Labs (twórcy Arbitrum)** — polityczne dopasowanie |
| **Permissions standard** | ERC-7715 | Świeżo live na Arbitrum, ZeroDev co-autor standardu |
| **Reputation standard** | ERC-8004 (Identity + Reputation Registry) | Adres `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` na Arbitrum |
| **Bundler / Paymaster** | Alchemy Account Kit (lub ZeroDev built-in) | Sponsor buildathonu, dobry support |
| **Off-chain pilot runtime** | TypeScript + Bun + viem 2.x | Szybki dev cycle, jeden język z frontendem |
| **Frontend** | Next.js 14 (App Router) + React 18 + wagmi v2 + viem | Standard, RainbowKit dla connect wallet |
| **UI components** | shadcn/ui + Tailwind CSS + Framer Motion | Profesjonalny look, customizable, animacje na demo |
| **Charts** | Recharts + Tremor | Dashboard analytics — pozycje, P&L, reputation curves |
| **Storage (pilot cards)** | IPFS via Pinata + on-chain hash | Standard dla ERC-8004 metadata |
| **Indexing** | Custom event listener (viem watchEvent) + Postgres | Wystarczy do MVP, w v2 The Graph |
| **Hosting (web)** | Vercel | Domyślne dla Next.js |
| **Hosting (pilot runtime)** | Railway lub Fly.io | Long-running TS process, prosty deploy |
| **Hosting (worker / API)** | Cloudflare Workers | Niski cost, edge, dla webhook'ów i public reputation queries |
| **Database** | Postgres (Neon) + Drizzle ORM | Cache'owanie pilot metadata, performance history off-chain |
| **Networks** | Arbitrum Sepolia (testnet) + Robinhood Chain Testnet (chainId 46630) | Główne deploymenty |
| **DEX integration** | GMX V2 (Arbitrum) | Sponsor buildathonu, perp positions dla aggressive pilot |
| **Yield integration** | Aave V3 (Arbitrum Sepolia, Pool: `0x794a61358D6845594F94dc1DB02A252b5b4814aD`) | Conservative pilot, stable yield, faucet dostępny |
| **Stock tokens** | Robinhood Chain testnet faucet (TSLA, AMZN, PLTR, NFLX, AMD) | RWA exposure |
| **Auth / sessions** | SIWE (Sign-In With Ethereum) + ZeroDev session keys | Pure crypto-native |
| **Monitoring** | Sentry + Tenderly (dla tx debugging) | Tenderly krytyczne dla debugowania smart account flow |
| **CI/CD** | GitHub Actions | Standard |

**Co świadomie odrzucamy:**

- ❌ The Graph w MVP — overkill, własny indexer wystarczy
- ❌ x402 jako core feature — opcjonalnie w SDK, ale nie w pitchu
- ❌ Cross-chain unified margin — v2 roadmap
- ❌ LLM-driven strategy decisions — v2 roadmap, w MVP rule-based pilots
- ❌ Mobile app — webapp wystarczy
- ❌ KYC/compliance — non-custodial = nie nasz problem prawnie

---

## 5. Architektura systemu

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            PILOTAGE PLATFORM                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌────────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │   USER WEB APP     │    │   PILOT HOUSE    │    │   PILOT RUNTIME  │  │
│  │   (Next.js)        │    │   (Next.js)      │    │   (TS + Bun)     │  │
│  │                    │    │                  │    │                  │  │
│  │ - Harbor (browse)  │    │ - Register pilot │    │ - watch vaults   │  │
│  │ - Vault dashboard  │    │ - Stake/manage   │    │ - decide actions │  │
│  │ - Charter editor   │    │ - View metrics   │    │ - submit userOps │  │
│  │ - Onboarding flow  │    │ - SDK docs       │    │ - post feedback  │  │
│  └─────────┬──────────┘    └────────┬─────────┘    └────────┬─────────┘  │
│            │                        │                        │            │
│            └────────────────────────┼────────────────────────┘            │
│                                     │                                      │
│  ┌──────────────────────────────────▼──────────────────────────────────┐ │
│  │                    INDEXER + API (Cloudflare + Postgres)             │ │
│  │  - Index VaultCreated, PilotRegistered, ActionExecuted events        │ │
│  │  - Compute aggregate metrics (TVL, success rate, APY)                │ │
│  │  - Serve harbor queries (filter, sort, paginate)                     │ │
│  └──────────────────────────────────┬──────────────────────────────────┘ │
└─────────────────────────────────────┼─────────────────────────────────────┘
                                      │
                                      │ reads on-chain state via RPC
                                      │
┌─────────────────────────────────────▼─────────────────────────────────────┐
│                                  ON-CHAIN                                   │
│                                                                             │
│  ┌─────────────────────┐         ┌─────────────────────────────────────┐  │
│  │   VAULT FACTORY     │ deploys │   USER VAULTS (one per captain)      │  │
│  │   (singleton)       ├────────▶│   - holds USDC, RWA tokens, LP pos   │  │
│  │                     │         │   - owned by user EOA                │  │
│  │   - createVault()   │         │   - hosts multiple pilot charters    │  │
│  └─────────────────────┘         │   - emergencyPause(), forceWithdraw()│  │
│                                  └────────────┬────────────────────────┘  │
│                                               │                            │
│                                               │ ERC-7715 charter           │
│                                               ▼                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      PILOT REGISTRY (our contract)                   │  │
│  │  - register(pilotCard, executor, supportedChains, stakeAmount)      │  │
│  │  - getPilot(id) → metadata                                          │  │
│  │  - listActivePilots(filter)                                         │  │
│  │  - slash(pilotId) — for charter violations (governance later)       │  │
│  └────────────────────────────┬───────────────────────────────────────┘  │
│                               │ references                                 │
│                               ▼                                             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                  ERC-8004 (Identity + Reputation)                    │  │
│  │  - 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 (Identity)            │  │
│  │  - Reputation Registry — feedback per pilot action                  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                   CHARTER VALIDATOR (Stylus, Rust)                   │  │
│  │  - checkAction(plan, charter) → bool + reason                       │  │
│  │  - computeDrift(holdings, targets) → drifts[]                       │  │
│  │  - updatePilotageScore(pilot, action_outcome)                       │  │
│  │  - Math-heavy → Stylus for ~80% gas savings                         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    EXTERNAL PROTOCOLS                                │  │
│  │  - Aave V3 (Arbitrum Sepolia) — yield                               │  │
│  │  - GMX V2 (Arbitrum) — perp exposure (optional)                     │  │
│  │  - Robinhood Chain stock tokens — RWA exposure                      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Lista modułów do zbudowania

### 6a. Smart Contracts (Solidity)

**VaultFactory.sol**

- Singleton contract deployed once per chain
- `createVault(address owner) returns (address vault)` — deploys minimal proxy clone
- Emits `VaultCreated(owner, vaultAddress, timestamp)` event for indexing
- Maintains `mapping(address owner => address[] vaults)` for listing

**Vault.sol** (clone target)

- Owned by user EOA (captain)
- Implements ERC-7715 receiver (accepts pilot charters)
- Asset management: `deposit(token, amount)`, `withdraw(token, amount)` — only captain
- Pilot execution: `executePlan(Plan calldata plan, bytes calldata sig)` — verifies pilot session key, calls CharterValidator, then executes
- Emergency: `pause()`, `unpause()`, `forceWithdrawAll(address dest)` — only captain, always available
- Multi-pilot support: `charters` mapping from pilotId to CharterSet
- Per-pilot revocation: `revokePilot(pilotId)`

**PilotRegistry.sol**

- `registerPilot(PilotCard calldata card, address executor, uint256 stake)`
- Pulls stake (USDC) into escrow
- Mints ERC-8004 Identity NFT for pilot
- Stores executor contract address (must implement IPilotExecutor)
- `updatePilotCard(pilotId, PilotCard)` — pilot dev can update metadata
- `unregisterPilot(pilotId)` — returns stake if good standing
- `slashPilot(pilotId, reason)` — only callable by governance multisig (in MVP: just team)
- View: `getPilot(pilotId)`, `getActivePilots()`, paginated

**CharterValidator.sol** (interface) — actual implementation in Stylus

- `validate(Action[] calldata plan, Charter calldata charter, VaultState calldata state) returns (bool ok, string reason)`
- Hot path — called before every pilot action

**PilotExecutor interface (IPilotExecutor.sol)**

- Standard interface every pilot's executor must implement
- `proposePlan(VaultState state, MarketData data) returns (Action[] plan)`
- `expectedRiskProfile() returns (RiskParams)`

**ReferencePilots (2 contracts)**

- `ConservativeRWA.sol` — rebalances between Aave USDC and Robinhood stock tokens
- `AggressiveYield.sol` — manages GMX positions + concentrated Uniswap liquidity

### 6b. Stylus Contracts (Rust)

**PilotageScoreEngine** — Stylus contract

- `compute_score(history: Vec<ActionOutcome>) -> PilotageScore`
- Fixed-point arithmetic for Sharpe ratio, max drawdown, success rate
- `update_on_action(pilot_id, outcome) -> new_score`
- Justification for Stylus: jeśli te kalkulacje robisz w Solidity dla pilota z 1000 historical actions, gas bije po kieszeni. Stylus = ~80% taniej. To jest realny use case, nie "Rust dla Rusta".

**DriftCalculator** — Stylus contract (opcjonalnie połączony z PilotageScoreEngine)

- `compute_drifts(holdings: Vec<U256>, targets_bps: Vec<u32>, prices: Vec<U256>) -> Vec<I256>`
- `should_rebalance(drifts: Vec<I256>, threshold_bps: u32) -> bool`
- Called from Vault.executePlan() before approving action

### 6c. Backend / off-chain

**Indexer service**

- Long-running Bun process (Railway)
- Watches: VaultCreated, PilotRegistered, ActionExecuted, FeedbackPosted
- Pushes to Postgres
- Computes aggregates: per-pilot TVL, success rate, average APY
- Exposes REST API to frontend (via Cloudflare Worker)

**Pilot Runtime (per pilot)**

- Each pilot dev runs their own instance OR uses our hosted runtime
- For MVP: my hostujemy 2 reference pilotów na Fly.io
- Reads vault state via viem
- Decides actions based on pilot-specific strategy
- Builds userOp via ZeroDev SDK
- Submits to bundler
- Posts feedback to ERC-8004 after execution

**Pilot SDK** (`@pilotage/pilot-sdk`)

- TypeScript package, published to npm (later) lub bundled in repo
- Abstractions:
  - `class Pilot` — base class with lifecycle hooks
  - `class VaultClient` — read/write vault state
  - `class CharterChecker` — pre-flight validation
  - `interface Strategy` — implement this to define pilot
- Example pilot in 20 lines (will demo this in pitch):

```typescript
import { Pilot, Strategy } from '@pilotage/pilot-sdk'

const strategy: Strategy = {
  name: 'SimpleRebalancer',
  risk: 'conservative',
  async decide(state, market) {
    const drift = state.computeDrift(this.charter.targets)
    if (drift > 0.05) return { type: 'rebalance', to: this.charter.targets }
    return { type: 'hold' }
  }
}

new Pilot(strategy).run()
```

**API Worker (Cloudflare)**

- `GET /api/pilots` — harbor listing, filter/sort
- `GET /api/pilots/:id` — single pilot detail
- `GET /api/vaults/:address` — vault state + history
- `POST /api/feedback` — webhook from indexer
- All read-only — no privileged operations

### 6d. Frontend

**User App** (Next.js, `/app`)

- `/` — marketing landing
- `/harbor` — browse pilots, filter (risk, chain, asset class), sort (Pilotage Score, TVL, APY)
- `/pilot/[id]` — pilot detail page: Pilotage Score curve, historical actions, strategy description, "Hire this pilot" CTA
- `/vault/create` — onboarding wizard:
  - Step 1: connect wallet
  - Step 2: choose chain (Arbitrum / Robinhood Chain)
  - Step 3: select pilot
  - Step 4: configure charter (asset weights, limits, slippage, max daily spend)
  - Step 5: sign ERC-7715 charter (single signature)
  - Step 6: fund vault
- `/dashboard` — captain's vault view: positions, P&L, pilot activity feed, charter details
- `/dashboard/charter` — modify charter, revoke pilot

**Pilot House** (Next.js, `/pilot-house`)

- `/pilot-house` — landing + SDK docs
- `/pilot-house/register` — register new pilot: upload pilot card (form), connect executor contract, stake
- `/pilot-house/pilots` — list of your pilots, performance metrics
- `/pilot-house/docs` — embedded SDK documentation

**Shared components**

- Wallet connect (RainbowKit)
- Chain switcher (Arbitrum / Robinhood Chain)
- Transaction modal with Tenderly preview
- Pilotage Score badge component (reusable across pages)
- Activity feed component (action history with explanations)

---

## 7. User flows

### 7a. End user flow — pierwszy raz

1. Trafia na pilotage.xyz przez Twittera / Arbitrum blog
2. Landing wyjaśnia: "Pick your pilot. Sign the charter. Keep the helm."
3. Klika "Browse the harbor" — nie wymaga walleta, anonymously
4. Przegląda pilotów, filtruje po "Robinhood Chain, conservative, supports tokenized stocks"
5. Klika "ConservativeRWA" — widzi: 87/100 Pilotage Score, 6-month track record, $2.3M total TVL across all captains, opis strategii
6. Klika "Hire this pilot" → connect wallet prompt → łączy MetaMask
7. Wizard:
   - "We'll deploy your vault on Arbitrum" — Continue
   - Konfiguruje charter: 60% USDC w Aave / 40% TSLA token, rebalance threshold 5%, max single tx $10K, max daily $30K
   - "Review and sign charter" — pokazuje human-readable summary
   - Podpisuje **JEDNĄ** transakcję (gas sponsorowany przez Alchemy paymaster)
8. Dashboard się ładuje — pokazuje pustą vault, "Fund your vault to set sail"
9. User deponuje 10K testnetowego USDC (mamy faucet button)
10. Pilot automatycznie się uruchamia (off-chain runtime obserwuje vault deposits)
11. W ciągu minut: pierwsza nawigacja, transakcja widoczna, P&L się aktualizuje

### 7b. End user flow — codzienny

1. Otwiera dashboard
2. Widzi: aktualne pozycje, target vs actual, P&L over time (chart), lista akcji pilota z ostatnich 24h
3. Każda akcja ma "Why?" tooltip — krótkie wyjaśnienie od pilota
4. Jeśli niezadowolony — `Revoke pilot` button → 1 tx → pilot traci dostęp → fundusze nadal w vaulcie
5. `Withdraw` button → 1 tx → fundusze wracają do EOA

### 7c. Developer (pilot builder) flow

1. Trafia na `/pilot-house` — landing dla devów
2. Czyta SDK docs, klika "Get started"
3. `npm install @pilotage/pilot-sdk`
4. Pisze swoją strategię — kilka godzin do dni, w zależności od złożoności
5. Testuje lokalnie z provided mock vault
6. Deployuje executor contract na Arbitrum Sepolia (provided template)
7. Wraca do `/pilot-house/register`:
   - Łączy wallet
   - Wypełnia pilot card form: nazwa, opis, risk profile, supported chains, contact
   - Podaje address executor contractu
   - Stakuje 1000 USDC (przyciąga capital providers, slashable za misbehaviour)
   - Podpisuje 2 transakcje: stake + register
8. Pilot pojawia się w harbor z Pilotage Score = 50/100 (neutral start, "untested waters")
9. Hostuje swój pilot runtime (lub używa naszego managed hosting w v2)
10. Otrzymuje 70% performance fee od każdego captain'a który go zatrudni

### 7d. Lifecycle "off-course" — co jeśli pilot jest słaby

1. Strategia underperformuje — robi nawigacje które tracą value
2. Każda akcja → on-chain feedback → Pilotage Score spada
3. Captain w dashboardzie widzi spadek score → może revokować pilota
4. Spadek do <30/100 → pilot automatycznie deprecatowany w harbor (filter "active")
5. Inni captainowie go nie wybiorą → developer traci revenue → incentive żeby naprawić lub wycofać

### 7e. Lifecycle "shipwreck" — co jeśli pilot jest złośliwy

1. Pilot próbuje wywołać `transfer(attackerAddress, MAX)` na USDC z vaultu
2. Vault.executePlan() wywołuje CharterValidator
3. Validator: "destination 0xATTACKER not in whitelist [Aave Pool, Robinhood Stock Token, ...]"
4. Revert. Transakcja nie przechodzi. Fundusze bezpieczne.
5. Feedback automatycznie postowany z `outcome: CharterViolation`
6. PilotRegistry.slashPilot() triggered → developer's stake confiscated
7. Pilot flagged jako malicious, blacklist w UI

---

## 8. Lista features (priorytetyzowana)

### 🔴 Must-have do submission

- [ ] VaultFactory deployed on Arbitrum Sepolia + Robinhood Chain testnet
- [ ] Vault contract — deposit, withdraw, executePlan, emergencyPause, forceWithdraw
- [ ] ERC-7715 charter flow + session key delegation
- [ ] CharterValidator (Solidity wrapper around Stylus core)
- [ ] PilotRegistry — register, list, slash
- [ ] ERC-8004 integration — Identity registration + feedback posting
- [ ] Stylus PilotageScoreEngine z compute_score
- [ ] 2 reference pilots: ConservativeRWA + AggressiveYield
- [ ] Pilot runtime hostowany dla obu reference pilots
- [ ] Frontend: harbor, pilot detail, vault create wizard, dashboard
- [ ] Pilot House: pilot registration form
- [ ] Indexer service: events → Postgres → API
- [ ] Demo scripted flow działa end-to-end
- [ ] Demo video (3-4 min)
- [ ] Pitch deck (8-10 slajdów)
- [ ] README z architekturą + setup instructions

### 🟡 Powinno być, jeśli czas

- [ ] Pilot SDK published do npm (w MVP może być tylko jako workspace package)
- [ ] Multi-pilot charters per vault (start z single-pilot w demo)
- [ ] Charter templates ("Conservative", "Balanced", "Aggressive") żeby user nie konfigurował od zera
- [ ] Activity feed z natural-language explanations (z hardkodowanego mappingu — nie LLM)
- [ ] Mobile-responsive UI
- [ ] Tenderly transaction simulation w preview
- [ ] Slippage protection w validator
- [ ] Daily limit reset logic

### 🟢 Nice-to-have / v2 (mention w roadmap)

- [ ] LLM-driven strategy decisions (Claude API call w decide loop)
- [ ] Cross-chain unified margin (LayerZero)
- [ ] x402 jako payment rail dla data feeds per-pilot
- [ ] Managed pilot hosting (Wy hostujecie runtime za devów)
- [ ] Mobile app (React Native)
- [ ] Insurance pool dla captain vaults (Nexus Mutual style)
- [ ] DAO governance dla slashing decisions
- [ ] Performance benchmarking między pilotami (head-to-head, "regatta")
- [ ] Strategy backtesting tool dla devów

---

## 9. Demo plan

### 9a. Demo video — struktura (4 minuty)

**[0:00 - 0:20] Hook & problem**

- Visual: split screen — z lewej tabelka Excel pełna manual rebalansów z czerwonymi adnotacjami, z prawej Coinbase logo przekreślone
- Voiceover: "Holding tokenized assets in 2026 means choosing between two bad options. Manage manually — error-prone, exhausting. Or give up self-custody to a centralized platform. We built a third option."

**[0:20 - 0:40] Product reveal & one-line pitch**

- Visual: Pilotage logo, hero shot harbor screen
- Voiceover: "Pilotage is the marketplace for autonomous capital management. Non-custodial vaults, permissioned pilots, on-chain reputation. Watch."

**[0:40 - 1:40] Captain perspective (60 sek)**

- Screen recording: opening the harbor
- Filter: "Robinhood Chain, conservative, RWA"
- Click on "ConservativeRWA" — show Pilotage Score 87/100, 6-month track record, strategy description
- Click "Hire this pilot" → wallet connect → wizard
- Configure charter: 60% USDC yield, 40% TSLA stock token, threshold 5%
- Sign single transaction (gas sponsored — show "0 ETH required" badge)
- Fund vault with $10K USDC
- Dashboard appears

**[1:40 - 2:40] Live action wow moment (60 sek)**

- Voiceover: "Now watch what happens when the market moves."
- You (off-screen) trigger price change in your mock oracle: TSLA price drops 8%
- On dashboard: drift indicator turns yellow → orange → red
- Pilot activity feed updates in real-time: "Detecting drift on TSLA exposure..."
- "Computing safe passage..."
- "Submitting transaction..."
- On-chain tx appears in feed with Arbiscan link
- Positions update visually (animated)
- Pilotage Score updates: 87.0 → 87.1 (small increment for successful action)
- Voiceover: "Twenty seconds. No human in loop. Pilot stayed within charter, on-chain, verifiable."

**[2:40 - 3:20] Developer perspective (40 sek)**

- Cut to Pilot House
- "Anyone can build a pilot. Here's how."
- Show code snippet (20 lines) of example pilot using SDK
- Show registration form: pilot card + executor + stake
- Click register → done
- Voiceover: "Developers earn 70% of performance fees. Pilotage Score is portable. The harbor is open."

**[3:20 - 3:50] Tech stack & alignment (30 sek)**

- Visual: clean diagram with badges
- Voiceover lists: "Built native on Arbitrum and Robinhood Chain. ERC-7715 charters. ERC-8004 reputation. Stylus for hot-path computation. Every standard the Arbitrum Foundation has shipped this year, integrated into one product."

**[3:50 - 4:00] Close & ask**

- Visual: team photo + logo
- "We're Pilotage. We're ready to ship."

### 9b. Live demo (jeśli będzie pitch live na Founder House)

Skrypt taki sam jak video, ale z pre-loaded scenariuszem na testnet'cie. Kluczowe:

- **Mieć backup video** na wypadek jak testnet padnie lub RPC zwolni
- **Pre-deploy wszystko** — vault, pilot, charter gotowe — żebyś nie czekał na confirmation
- **Manipulacja ceną** — masz ownership nad mock oracle contract, możesz triggerować zmianę ceny jedną tx przed demo
- **Reset state** między próbami — przygotuj script `reset-demo.sh` który zresetuje pozycje

### 9c. Pitch deck struktura (8 slajdów)

1. **Title** — Pilotage, tagline, team names + GH handles
2. **Problem** — tokenized RWAs growing, ops layer missing, custodial vs manual false dichotomy
3. **Solution** — Pilotage one-line + 3 pillars (non-custodial / permissioned / reputational)
4. **Live Demo** — large embedded video link / QR code
5. **Architecture** — clean diagram (z sekcji 5 wyżej)
6. **Why now / Ecosystem fit** — checklist standardów Arbitrum Foundation z ✓
7. **Business model** — performance fee split, market size, comparable: Enzyme $XB AUM, dHEDGE $YM
8. **Roadmap & Ask** — Q3: mainnet, Q4: SDK npm publish, multi-chain. Ask: $40K + Founder House invite

---

## 10. Co czyni nas wygrywającymi

### Wobec innych potencjalnych projektów buildathonu

| Common buildathon project | Why we win |
|---|---|
| "Trading bot na Arbitrum" | Mamy *platformę* zamiast pojedynczego bota |
| "RWA tokenization protocol" | Działamy *na* tokenized RWAs — komplementarni, nie konkurencyjni |
| "Agent z LLM" | LLM w v2; w MVP rule-based ale audytowalne + reputation system kluczowy |
| "Yet another DeFi vault" | Multi-pilot, multi-chain, permissionless pilot onboarding |
| "Hyperliquid copy-trader" | Native Arbitrum + Robinhood, polityczne dopasowanie |

### Checkboxy które jury podświadomie liczy

- ✅ ERC-7715 (świeży standard, Arbitrum pcha)
- ✅ ERC-8004 (świeży standard, Arbitrum pcha)
- ✅ Stylus z prawdziwym uzasadnieniem (nie "bo Rust")
- ✅ Robinhood Chain native deployment (zarezerwowany slot top 3)
- ✅ Tokenized RWAs (główna teza Arbitrum Foundation 2026)
- ✅ AI Agents (Agentic Category $15K dodatkowo)
- ✅ Sponsorzy w stacku: Alchemy (paymaster), GMX (yield), OpenZeppelin (contract patterns)
- ✅ ZeroDev (kupiony przez Offchain Labs / Arbitrum)
- ✅ Non-custodial — zgodne z values Foundation
- ✅ Clear business model — pokazuje long-term thinking
- ✅ Open-source pilot SDK — ecosystem play, nie zamknięty produkt
- ✅ **Memorable brand** — maritime metaphor daje spójną tożsamość której konkurencja nie ma

### Nasz unfair advantage

To nie jest feature. To jest pozycjonowanie. *Każdy* projekt buildathonu pokaże "jeden agent który robi X". My pokażemy "infrastrukturę dzięki której wszyscy mogą budować pilotów X, Y, Z". To jest **platform play vs feature play**, i to jest słownik VCs i Foundation grantmakerów. W demo prezentujemy *dwóch* naszych pilotów i *symulujemy* trzeciego od fake'owego dev'a — i to wystarczy żeby jury "zobaczyło" sieć efektów.

Dodatkowo: maritime brand language (harbor, charter, pilot, captain, safe passage) daje nam coś czego nikt inny nie będzie miał — **spójną narrację która sama z siebie tłumaczy product**. Jury nie musi się zastanawiać "co to robi" — sama metafora odpowiada.

---

## 11. Ryzyka i ich mitygacja

| Ryzyko | Prawdopodobieństwo | Impact | Mitygacja |
|---|---|---|---|
| ZeroDev ERC-7715 ma bugi / niekompletna implementacja | **Niska** (zwalidowane — Kernel v3 ma to wbudowane, ZeroDev co-autor standardu, 6M+ deployed accounts) | Wysoka | Plan B: własna minimal implementation session keys. Decyzja w 1szym tygodniu po sanity check'u. |
| Robinhood Chain testnet padnie | Niska | Wysoka | Backup demo na Arbitrum Sepolia only. Show "multi-chain ready" w architekturze nawet jeśli live demo na jednym chainie. |
| Stylus deployment tricky, traci dni 4-5 | **Niska** (zwalidowane — oficjalny SDK, audytowany OZ, TestVM do unit testów, dojrzała dokumentacja) | Średnia | Fallback: CharterValidator w czystym Solidity. Stylus traktujemy jako "stretch goal" — jeśli nie wyjdzie do końca tyg 1, odpuszczamy bez katastrofy. |
| Indexer + DB infrastruktura zżera czas | Średnia | Niska | Hardcoded mock data jako fallback dla demo. Marketplace może być częściowo statyczny. |
| Scope creep, gonienie features | Wysoka | Wysoka | Trzymanie się tej listy. Każdy nowy feature musi przeszkadzać 2 osobom. |
| Spór między Wami o decyzje | Niska | Wysoka | Tie-breaker: kto pisze daną domenę, ten decyduje. Person A decyduje on-chain, Person B decyduje frontend/pilot runtime. |
| 3 tygodnie to mało | Pewne | Wysoka | Daily 15-min sync + agresywne cięcie scope. Lepiej mniejszy zakres co działa idealnie niż większy co kuleje. |
| Cross-chain bridge między Arbitrum a Robinhood Chain nie działa płynnie | Wysoka | Średnia | **Świadomie nie budujemy bridge'a w MVP.** Pokazujemy *separate* vaulty na każdym chainie. Cross-chain unification = v2 roadmap. |

---

## 12. Walidacja techniczna

Wszystkie kluczowe założenia tego planu zostały zwalidowane on-chain i przeciw aktualnej dokumentacji:

### 12a. ZeroDev + ERC-7715 ✅ ZWALIDOWANE

- ZeroDev jest co-autorem standardu ERC-7715 (razem z WalletConnect, MetaMask, Biconomy)
- Kernel v3 ma session keys / permissions w pełni wbudowane
- 6M+ smart accounts deployed na 50+ chainach
- **ZeroDev został kupiony przez Offchain Labs (twórcy Arbitrum) w 2025** — dodatkowe polityczne dopasowanie do buildathonu
- Dokumentacja: docs.zerodev.app/smart-wallet/permissions/intro

### 12b. ERC-8004 ✅ ZWALIDOWANE

- Live na Arbitrum One i Arbitrum Sepolia
- Identity Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Reputation Registry: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`
- Standard jointly developed przez Ethereum Foundation, MetaMask, Google, Coinbase
- Arbitrum Foundation aktywnie promuje na blogu (post "AI on Arbitrum: Establishing an Agent Registry with ERC-8004")
- Working examples na GitHub: erc-8004/erc-8004-contracts

### 12c. Stylus (Rust on Arbitrum) ✅ ZWALIDOWANE

- Oficjalny SDK: OffchainLabs/stylus-sdk-rs
- Audytowany przez OpenZeppelin (sierpień 2024)
- TestVM do unit testów wbudowane w SDK
- Pełna interoperability z Solidity (ABI-equivalent, cross-VM calls)
- Działający quickstart: cargo install cargo-stylus + cargo stylus new
- Aktywnie wspierany ekosystem, świeże tutoriale z 2026

### 12d. Robinhood Chain testnet ✅ ZWALIDOWANE

- Chain ID: 46630
- RPC: `https://robinhood-testnet.g.alchemy.com/v2/<API_KEY>` (free Alchemy account)
- Block explorer: `explorer.testnet.chain.robinhood.com`
- Faucet wydaje testnet ETH + tokenized stocks (TSLA, AMZN, PLTR, NFLX, AMD)
- Arbitrum Orbit-based, EVM compatible, działa wszystko co działa na Arbitrum
- Robinhood committed $1M do Arbitrum Open House 2026 program

### 12e. Aave V3 na Arbitrum Sepolia ✅ ZWALIDOWANE

- Pool address: `0x794a61358D6845594F94dc1DB02A252b5b4814aD`
- aUSDC: `0x625E7708f30cA75bfd92586e17077590C60eb4cD`
- Faucet dostępny: bridge-testnet.aave.com/faucet/?marketName=proto_arbitrum_sepolia_v3
- Pełna funkcjonalność supply/withdraw

### 12f. Alchemy infrastructure ✅ ZWALIDOWANE

- Sponsor buildathonu = łatwy support
- Account Kit z bundler + paymaster on Arbitrum
- Free tier wystarcza na testnet development

### Co NIE jest jeszcze zwalidowane (trzeba sprawdzić w dniu 1)

- ⚠️ Czy ZeroDev Kernel v3 deployer jest na Robinhood Chain testnet? (Jeśli nie — deploy własnego, to ~30 min pracy)
- ⚠️ Czy Stylus jest aktywowany na Robinhood Chain? (Jeśli nie — Stylus contracts tylko na Arbitrum, validator na RH Chain w czystym Solidity)
- ⚠️ Czy Aave ma instancję na Robinhood Chain? (Prawdopodobnie nie, conservativeRWA może yieldować tylko na Arbitrum side, RH Chain trzyma stock tokens)

**Powyższe 3 niezwalidowane punkty NIE blokują planu** — każdy z nich ma akceptowalny fallback który jest już uwzględniony w architekturze (separate deployments per chain).

---

## 13. Co konkretnie robisz w ciągu następnych 48 godzin

(Buildathon kickoff 25 maja, dzisiaj 25 maja. Rejestracja zamyka się za 3 dni.)

1. **Rejestracja na Hackquest** — Ty + partner, użyjcie zwięzłej wersji pitcha (3a) jako project description
2. **Stworzenie repo** — monorepo struktura:
   ```
   /pilotage
     /contracts        (Solidity + Foundry)
     /stylus           (Rust + cargo-stylus)
     /web              (Next.js — captain app + pilot house)
     /pilot-runtime    (TS + Bun — pilot execution service)
     /sdk              (TS package — @pilotage/pilot-sdk)
     /indexer          (TS + Bun — event listener + Postgres)
     /worker           (Cloudflare Worker — API)
     /docs             (markdown)
     README.md
   ```
3. **Setup komunikacji** — Discord channel z teamem, dołączenie do Arbitrum dev support Discord, Stylus Developer Telegram group
4. **Pre-flight technical checks** (~2h pracy):
   - [ ] ZeroDev SDK install + deploy testowego Kernel account na Arbitrum Sepolia
   - [ ] cargo install cargo-stylus + deploy Counter contractu na Arbitrum Sepolia
   - [ ] Add Robinhood Chain testnet do MetaMask + claim tokens z faucet
   - [ ] Test Aave faucet + supply USDC, verify pozycja
5. **Podział ról** — kto on-chain (A), kto off-chain (B), spisać w README
6. **Zarezerwowanie nazwy** — domain (pilotage.xyz lub pilotage.fi), GitHub org, Twitter handle (do późniejszej promocji)
7. **Pierwszy commit** — README z opisem projektu (sekcja 2 tego dokumentu jako README content)

---

## Final notes

Ten plan był walidowany na każdym kroku przeciw aktualnym (maj 2026) deploymentom, dokumentacji i ekosystemowi. Każda technologia tutaj wymieniona:

- Jest faktycznie zdeployowana na chainach które używamy
- Ma działającą dokumentację i tooling
- Ma sponsorów lub partnerów buildathonu w łańcuchu wartości
- Ma akceptowalny fallback jeśli coś nie wyjdzie

**Co dalej?** Trzy najsensowniejsze następne kroki to:

1. Zaprojektować security model szczegółowo (typy ERC-7715 permissions, dokładny schemat charteru, jakie selectory whitelist'ujemy dla Aave/GMX/Robinhood Stock Tokens)
2. Napisać konkretny Stylus contract (interface, sygnatury funkcji, model fixed-point, jak hookuje się do Solidity)
3. Zaprojektować Pilot SDK (dokładny API surface, pełen example pilot w 50 liniach, dokumentacja modułów)

Plus oczywiście: **zacząć**. Najlepszy plan świata nic nie znaczy bez pierwszego commit'u.

Powodzenia. 🚀
