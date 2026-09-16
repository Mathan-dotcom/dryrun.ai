/**
 * dryrun.ai — ConfidenceGate
 * Meridian Styleguide 6.3 Specification:
 * - Segmented horizontal block bar (10 solid cells, 2px separated)
 * - Threshold marker at 70% (≥ 0.70)
 * - Color progression: hazard-amber (< 0.40), blue-black (0.40-0.69), blueprint-blue (≥ 0.70)
 * - Auto-approval stamp when crossing threshold
 */

class ConfidenceGate {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.score = 0.0;
    this.render();
  }

  setScore(score, factors = {}) {
    this.score = Math.max(0, Math.min(1.0, score));
    this.factors = factors;
    this.update();
  }

  render() {
    this.container.innerHTML = `
      <div class="confidence-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="text-heading" style="font-size: 0.95rem;">AUTONOMY CONFIDENCE GATE</span>
          <span class="bru-stamp ${this.score >= 0.70 ? 'bru-stamp--success' : 'bru-stamp--warning'}" id="gateStatusStamp">
            ${this.score >= 0.70 ? 'POLICY: PASS' : 'POLICY: PENDING'}
          </span>
        </div>
        <span class="text-data" style="font-size: 1.15rem; font-weight: 700;" id="gateScoreVal">0.00</span>
      </div>

      <div class="confidence-segments-wrap">
        <div class="confidence-threshold-marker">
          <span>▲ GATE 0.70</span>
        </div>
        <div class="confidence-threshold-line"></div>
        <div class="confidence-segments" id="gateCells">
          ${Array(10).fill(0).map((_, i) => `<div class="confidence-cell" data-cell="${i}"></div>`).join('')}
        </div>
      </div>

      <div class="confidence-metrics">
        <span>MIN AUTONOMY: 0.700</span>
        <span id="gateVerdictText">AWAITING MCP DRY RUN</span>
        <span>BAYESIAN CONFIDENCE</span>
      </div>
    `;
    this.update();
  }

  update() {
    const scoreVal = document.getElementById('gateScoreVal');
    const stamp = document.getElementById('gateStatusStamp');
    const verdict = document.getElementById('gateVerdictText');
    const cells = this.container.querySelectorAll('.confidence-cell');

    if (scoreVal) scoreVal.textContent = this.score.toFixed(3);

    const filledCount = Math.round(this.score * 10);

    cells.forEach((cell, idx) => {
      cell.className = 'confidence-cell';
      if (idx < filledCount) {
        if (this.score < 0.40) {
          cell.classList.add('filled-red');
        } else if (this.score < 0.70) {
          cell.classList.add('filled-amber');
        } else if (idx === 9) {
          cell.classList.add('filled-green');
        } else {
          cell.classList.add('filled-blue');
        }
      }
    });

    if (stamp && verdict) {
      if (this.score >= 0.70) {
        stamp.className = 'bru-stamp bru-stamp--success';
        stamp.textContent = 'GATE: CLEARED (AUTO)';
        verdict.textContent = 'EXECUTION PERMITTED';
        verdict.style.color = 'var(--recovered-mark)';
      } else if (this.score > 0 && this.score < 0.40) {
        stamp.className = 'bru-stamp bru-stamp--critical';
        stamp.textContent = 'GATE: BLOCKED (DRIFT)';
        verdict.textContent = 'CRITICAL DRIFT DETECTED';
        verdict.style.color = 'var(--critical-accent)';
      } else {
        stamp.className = 'bru-stamp bru-stamp--warning';
        stamp.textContent = 'GATE: MANUAL REVIEW';
        verdict.textContent = 'POLICY CHECK REQUIRED';
        verdict.style.color = 'var(--at-risk-accent)';
      }
    }
  }
}

window.ConfidenceGate = ConfidenceGate;
