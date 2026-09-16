# dryrun.ai — KeeperHub × Daydreams Safe Payment Execution Layer

> **High-Precision Autonomous Financial Mission Control for the Open Agentic Commerce Marketplace**  
> Built for the **KeeperHub DoraHacks Hackathon 2026** (Main Track: Best Integration into a Live Project).  
> Design Language: **Meridian Concrete Brutalism v3.0.0**

---

## 1. Overview & Problem Statement

In **Daydreams’ Open Agentic Commerce**, autonomous AI agents complete marketplace tasks and are paid on-chain in USDC upon deliverable acceptance. However, AI agents are probabilistic:
- Agents can hallucinate or misread task instructions.
- Prompt injection or model drift can alter the payout amount (e.g., claiming 4,500 USDC instead of 45 USDC).
- Rogue agents can swap the recipient sink to an unverified address.
- Once a transaction hits the blockchain, it is irreversible.

**dryrun.ai** solves this by inserting **KeeperHub** as the deterministic, safety-checked execution layer between task completion and on-chain settlement:
1. **Detects Task Acceptance:** Intercepts the payout trigger event (`FR-1`).
2. **KeeperHub MCP Workflow Composition:** Formulates an explicit workflow via KeeperHub's Model Context Protocol (MCP) server (`FR-2`).
3. **Off-Chain Dry-Run Simulation:** Evaluates balances, gas, nonces, and policy rules off-chain without broadcasting (`FR-3`).
4. **Bayesian Autonomy Gate:** Evaluates risk against an autonomy confidence threshold (≥ 0.70) to catch drift (`FR-7`).
5. **Deterministic Dispatch:** Executes the exact pre-flight workflow with zero re-inference at execution time (`FR-4`).
6. **Turnkey Non-Custodial MPC:** Cryptographic signing with private RPC and MEV protection (`FR-5`).
7. **Immutable Audit Ledger:** Full end-to-end provenance logged in KeeperHub's audit trail (`FR-6`).

---

## 2. Meridian Concrete Brutalism Design System

The application strictly implements the **Meridian Concrete Brutalism v3.0.0** styleguide:
- **Zero Border-Radius:** `border-radius: 0px !important` across all buttons, inputs, panels, and canvases.
- **Architectural Depth:** Solid offset shadows (`5px 5px 0`, `10px 10px 0`, `12px 12px 0`) with zero blur or spread softness.
- **Substrates:** Raw poured light concrete (`#d9d9d7`), shadow-side concrete (`#c9c9c6`), and cast black steel (`#111113`).
- **Tri-Font Discipline:**
  - `Archivo Black`: Monumental display numbers and uppercase hero titles.
  - `Space Grotesk`: Technical UI typography and uppercase section labels.
  - `IBM Plex Mono`: Financial ledger timestamps, hashes, and formula parameters.
- **Safety Signage Accents:** Hazard amber (`#ffb300`), signal red (`#ff2e2e`), blueprint blue (`#2e5bff`), and recovery green (`#00c853`).
- **Signature Components:**
  - `FlowMatrix`: 2D Canvas with 70+ square circuit nodes pinned to a 48px blueprint grid.
  - `ConfidenceGate`: 10-cell segmented horizontal bar with a 0.70 autonomy gate flag.
  - `AuditTrail`: Monospace command-line run sheet with hard zebra striping and live block cursor `▮`.
  - `BrutalAudio`: Web Audio API mechanical relay clicks and stamp thuds.

---

## 3. Local Development & Preview

To run locally:
```bash
# Option 1: Using npx serve
npx -y serve -l 3000 .

# Option 2: Using Python built-in server
python -m http.server 3000

# Option 3: Open index.html directly in any modern browser
```
Open `http://localhost:3000` in your browser.

---

## 4. PRD Requirements Verification Matrix

| ID | Requirement | Implementation Status |
|---|---|---|
| **FR-1** | Detect or intercept Daydreams task-completion event | Implemented in Mission Control event hook & telemetry |
| **FR-2** | Translate payout into KeeperHub MCP workflow | Implemented with live `keeperhub/compose_workflow` inspector |
| **FR-3** | Execute off-chain dry-run with preview | Implemented with off-chain state diff and gas/balance check |
| **FR-4** | Deterministic execution without re-inference | Implemented with locked workflow dispatch |
| **FR-5** | Real on-chain transaction hash proof | Verified on Base Sepolia (`0x3f069068e7b5a7e851a1facf6f34676d2dc6cced3326d9ef3ca8964f3b640296`) |
| **FR-6** | KeeperHub immutable audit trail logging | Implemented in Monospace Terminal Audit Ledger |
| **FR-7** | Demonstrate caught bad payment in dry-run | Implemented via Scenario B (100x overpay + sink drift) |
| **FR-8** | Interactive UI for preview → approve → execute | Implemented via 5-step interactive Mission Control |
| **FR-9** | Documented KeeperHub surfaces used | Documented in Hackathon Dossier section |

---

## 5. Verifiable On-Chain Proof (FR-5)
- **Transaction Hash:** [`0x3f069068e7b5a7e851a1facf6f34676d2dc6cced3326d9ef3ca8964f3b640296`](https://sepolia.basescan.org/tx/0x3f069068e7b5a7e851a1facf6f34676d2dc6cced3326d9ef3ca8964f3b640296)
- **Block Number:** `46,885,954`
- **Network:** Base Sepolia (Chain ID `84532`)
- **Signer Address:** `0xa9c97E3D0f95be9Fc990B3686997eC346D96833e`
- **Verification Status:** Confirmed On-Chain with Zero Mock Data

