# Product Requirements Document
## Lucid Ledger — KeeperHub × Daydreams Safe Payment Execution Layer for the Open Agentic Commerce Marketplace

**Event:** KeeperHub — The Agent Economy Hackathon (via DoraHacks)
**Track:** Main Track — Best Integration into a Live Project
**Prepared for:** Hackathon submission (build phase Sep 6 – Sep 18, 2026)
**Status:** Draft v1.0

---

## 1. Background

### 1.1 The hackathon ask
KeeperHub is running its second DoraHacks hackathon. The brief is narrower than a typical "build an AI agent" event: they want **integrations of KeeperHub into other live, already-running projects** — not standalone demos or generic wrappers. The integration must show KeeperHub actually executing value movement that the partner project triggers, consumes, or benefits from, backed by proof (a real transaction).

Named example projects (not exhaustive): Wayfinder, Daydreams, Almanak.

### 1.2 The problem with agents and money
AI agents are probabilistic. When an agent is asked to move funds on-chain, there is a real risk it misreads the instruction, sends the wrong amount, or sends it to the wrong place — and once a transaction lands on-chain, it can't be undone. Marketplaces where agents autonomously earn and get paid (like Daydreams' Open Agentic Commerce) currently have no independent, human-checkable safety step between "agent decides to pay" and "money moves."

### 1.3 What KeeperHub provides
KeeperHub is an execution layer: an agent composes a workflow through KeeperHub's MCP server, a human reviews it, it can be **dry-run** without touching the chain, and only then does that exact, reviewed workflow execute — nothing is reinterpreted at execution time. Underneath, KeeperHub handles nonce management, gas estimation, MEV-resistant private routing, retries, non-custodial wallets (via Turnkey), and a full audit trail, across 20+ protocols and 20+ networks.

---

## 2. Chosen Integration Target: Daydreams

Daydreams runs a live "Open Agentic Commerce" task marketplace: requesters fund tasks, agents bid on and claim tasks, complete the work, and get paid in USDC on-chain the moment the result is accepted — with no invoicing step.

**Why Daydreams over Wayfinder or Almanak:**

| Criteria | Daydreams | Wayfinder | Almanak |
|---|---|---|---|
| Payment trigger | Native to the platform already | Would need to be inferred from Shells/Paths | Native via SDK intents |
| Architecture complexity for a 3-day build | Low–medium | High (mature, less docs-friendly) | Low (well-documented SDK) |
| Narrative fit with "Agent Economy" theme | Very strong (agent-to-agent commerce) | Strong but harder to demo cleanly | Weaker (solo-strategy DeFi) |
| Judge legibility | High — explainable in 30 seconds | Medium | Medium |

Daydreams was selected because the payment trigger already exists on a live, purpose-built agent-economy protocol, minimizing the risk of running out of build time on infrastructure that isn't the point of the hackathon.

---

## 3. Product Summary (One-Liner)

> **Lucid Ledger** inserts KeeperHub as the safety-checked payment execution layer for Daydreams' Open Agentic Commerce marketplace — so when an agent completes a task and earns USDC, the payout is previewed, dry-run, and then executed through KeeperHub instead of firing directly from the agent.

---

## 4. Goals and Non-Goals

### 4.1 Goals
- Route at least one real Daydreams task-marketplace payout through KeeperHub's MCP-driven workflow (compose → dry-run → approve → execute).
- Produce a verifiable, real on-chain transaction (testnet or mainnet) executed by KeeperHub as a direct result of a Daydreams task being accepted.
- Demonstrate the dry-run step catching or previewing a payment before it is irreversible, including at least one deliberately "bad" case (wrong amount / wrong recipient) that is caught rather than executed.
- Produce a short demo video and a clean, judge-legible writeup that maps directly onto the rubric (integration depth, execution through KeeperHub, reliability, usefulness, code quality).

### 4.2 Non-Goals
- Not building a new agent framework or a new marketplace — both already exist and are out of scope to rebuild.
- Not attempting to replace or modify Daydreams' core settlement logic beyond what's needed to hook in KeeperHub as an execution layer.
- Not covering every KeeperHub surface (MCP, CLI, x402, MPP) — focus on the MCP server + audit trail path, and note others only if time allows.
- Not optimizing for multi-chain support beyond whatever network(s) Daydreams already operates on.

---

## 5. Users and Use Case

**Primary user:** An agent operator / requester on the Daydreams marketplace whose task has just been completed and accepted.

**Use case flow (plain language):**
1. A requester posts a paid task on Daydreams (e.g., "write a summary," "monitor a price feed").
2. An agent claims and completes the task.
3. Instead of Daydreams paying the agent directly and automatically, the payout event is routed to the integration layer.
4. The integration composes a KeeperHub workflow describing the payment (who, how much, from where).
5. KeeperHub dry-runs the workflow — a preview is generated without touching the chain.
6. The payment is approved (manually or via a pre-set policy) and KeeperHub executes exactly that reviewed workflow.
7. The transaction is logged in KeeperHub's audit trail, and the agent is paid.

---

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Detect or intercept a Daydreams task-completion / payout-trigger event | Must |
| FR-2 | Translate the payout event (recipient, amount, token, task reference) into a KeeperHub-composed workflow via the MCP server | Must |
| FR-3 | Execute a dry-run of the composed workflow and surface a human-readable preview | Must |
| FR-4 | On approval, execute the exact dry-run workflow (no re-inference at execution time) | Must |
| FR-5 | Capture and expose the resulting transaction hash / link for submission proof | Must |
| FR-6 | Log the full run (composed workflow, dry-run output, execution result) to KeeperHub's audit trail | Should |
| FR-7 | Demonstrate at least one rejected/caught bad payment in dry-run (wrong amount or recipient) | Should |
| FR-8 | Provide a minimal UI or CLI output showing the preview → approve → execute flow for the demo video | Should |
| FR-9 | Document which KeeperHub surfaces were used (MCP, CLI, x402, MPP, agent-authored workflows, audit trail) | Must (submission requirement) |

---

## 7. Data Integrity Requirement — No Mock Data

**This is a hard constraint on the build, not a preference.**

- No mock, hardcoded, sample, or simulated data may be used anywhere in the integration — not for task events, not for payout amounts/recipients, not for the dry-run preview, and not for the final transaction. Every value the system acts on must come from a real, live source (the actual Daydreams marketplace and the actual KeeperHub execution layer).
- This applies to the demo video and submission as well: the transaction shown must be a genuine one executed through KeeperHub as a result of a genuine Daydreams event, not a staged or faked flow. Judges review at repository level and a simulated transaction will be treated as "just another wrapper," which is explicitly what the hackathon does not want.
- **Whenever the build requires real-time data that isn't yet available or accessible** — for example, live credentials, API keys, a Daydreams task-market endpoint, wallet/network details, or any other live input — **stop and ask the user to provide it.** Do not substitute a placeholder, assumption, or fabricated value to keep moving. Flag exactly what's missing and why it's needed, then wait for the real input before proceeding.
- If a genuinely live data source is temporarily unavailable (e.g., testnet downtime), the correct response is to pause and report the blocker — not to fall back to mock data to keep the demo working.

---

## 8. Non-Functional Requirements

- **Reliability:** The flow must survive non-happy-path conditions (e.g., a stuck transaction, a malformed payout event) without silently failing — leverage KeeperHub's existing nonce management and retry/backoff handling.
- **Auditability:** Every execution must be traceable end-to-end from the Daydreams task ID to the on-chain transaction.
- **Transparency in submission:** The submission must candidly state what still breaks or is unfinished, per KeeperHub's stated preference for honest answers.
- **Time-boxing:** The whole build must be achievable within the Sep 6–18 build window, given this is a wiring/integration project rather than new infrastructure.

---

## 9. Open Risks and Dependencies

| Risk | Impact | Mitigation |
|---|---|---|
| Daydreams' settlement step may be fully internal with no external hook for an agent/integration to sit in the payout loop | High — could block the entire approach | Verify via Daydreams docs / Discord **before** committing further build time (top priority, day 1) |
| Demo must show a real transaction, not a simulated one | High — judges review at repo level and will notice hand-waved execution | Prioritize getting one genuine end-to-end transaction working early; treat everything else as polish |
| Other teams may also target Daydreams, reducing originality | Medium | Differentiate via demo quality, a real caught error case, and clean documentation rather than concept alone |
| 3-day/short build window with two live systems to integrate | Medium | Scope ruthlessly to FR-1 through FR-6; treat FR-7 through FR-9 as stretch/polish |
| Build may hit a point where required real-time data (credentials, endpoints, wallet/network details, etc.) is missing | Medium | Do not substitute mock data — pause and request the real input from the user before proceeding (see Section 7) |

**Immediate next action:** Confirm whether Daydreams' task-market API/skill exposes an external hook at the payout step. This determines whether the project is viable as scoped.

---

## 10. Success Metrics (for Submission)

- ✅ One verifiable transaction link showing execution through KeeperHub, triggered by a real Daydreams event.
- ✅ Demo video showing: task completed on Daydreams → payment previewed via dry-run → approval → execution → audit trail entry.
- ✅ Source code link (GitHub/GitLab/Bitbucket) with clear setup instructions ("could another team pick this up?").
- ✅ Submission form answers completed candidly, including known limitations.

---

## 11. Submission Checklist (per hackathon requirements)

- [ ] Source code repository link
- [ ] Short demo video of the integration working
- [ ] Link to a transaction executed through KeeperHub
- [ ] Answer: which project integrated with, and what the integration does
- [ ] Answer: which KeeperHub surfaces used
- [ ] Answer: testnet or mainnet
- [ ] Answer: what still breaks or is unfinished
- [ ] Reachable contact (email + X or Discord handle)

---

## 12. Timeline Alignment

| Date | Milestone |
|---|---|
| Sep 6 | Build phase begins; verify Daydreams payout hook exists |
| Sep 6–10 | Core integration: event capture → KeeperHub workflow composition → dry-run |
| Sep 10–14 | Execution path, audit trail, error/caught-payment case |
| Sep 14–17 | Polish, UI/CLI output for demo, record demo video |
| Sep 18, 12:00 CEST | Submission deadline — nothing accepted after |
| Sep 18–25 | Judging window; possible live finalist panel invite |
| Sep 24/25 | Winners announced |
