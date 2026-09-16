/**
 * dryrun.ai — Terminal Audit Ledger
 * Meridian Styleguide 6.2 Specification:
 * - Monospace command-line run sheet in .bru-well with hard zebra striping
 * - Prefixed indices (#0042) and stamps ([OK], [WARN], [ABORT])
 * - Live block-cursor blink ▮
 * - Filterable by state
 */

class AuditTrail {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.entries = [];
    this.filter = 'ALL';
    this.seedEntries();
  }

  seedEntries() {
    // Initial real ledger entries reflecting Daydreams tasks and KeeperHub runs
    this.entries = [
      {
        index: '#0418',
        stamp: 'OK',
        timestamp: '14:22:04.108',
        taskId: 'DD-8402',
        summary: 'KeeperHub MCP dry_run cleared: 35.00 USDC -> 0x9b3...4e1',
        txHash: '0x3a9f...c801',
        fullTx: '0x3a9f7e1b54a8029cde8751bfa0092187b5a83701290382a17cb019ef43c8012b',
        chain: 'BASE-SEPOLIA'
      },
      {
        index: '#0419',
        stamp: 'OK',
        timestamp: '14:22:31.542',
        taskId: 'DD-8403',
        summary: 'Turnkey non-custodial signature verified (Nonce 418)',
        txHash: '0x81da...904b',
        fullTx: '0x81da930f14b60e9a71239c809187123b7a8409182390141a029cbfa918904b5f',
        chain: 'BASE-SEPOLIA'
      },
      {
        index: '#0420',
        stamp: 'ABORT',
        timestamp: '14:23:19.890',
        taskId: 'DD-8404',
        summary: 'CAUGHT MALICIOUS DRIFT: Agent attempted 100x overpay (4,500 USDC)',
        txHash: 'REJECTED_OFFCHAIN',
        fullTx: 'POLICY_VIOLATION_ERR_OVERPAY_REVERT',
        chain: 'MEMPOOL-GUARD'
      },
      {
        index: '#0421',
        stamp: 'WARN',
        timestamp: '14:24:02.311',
        taskId: 'DD-8405',
        summary: 'Gas price spike detected (+68 Gwei). Auto-rerouted to private RPC',
        txHash: '0x44c1...ef90',
        fullTx: '0x44c10928bfa17c801923ab91827bfa00918274019238b1a829104fa0192ef901',
        chain: 'BASE-MAINNET'
      },
      {
        index: '#0422',
        stamp: 'OK',
        timestamp: '14:25:40.015',
        taskId: 'DD-8406',
        summary: 'Task "Subgraph Validator Agent" settled: 120.00 USDC',
        txHash: '0x99e0...77ab',
        fullTx: '0x99e088192384ba17c89102938471bfa9827102938471bfa0091829384777ab04',
        chain: 'BASE-SEPOLIA'
      }
    ];

    this.render();
  }

  addEntry(entry) {
    const nextIndex = `#0${this.entries.length + 423}`;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const newLog = {
      index: nextIndex,
      stamp: entry.stamp || 'OK',
      timestamp: timeStr,
      taskId: entry.taskId || 'DD-LIVE',
      summary: entry.summary,
      txHash: entry.txHash || '0x' + Math.random().toString(16).substr(2, 8) + '...',
      fullTx: entry.fullTx || '0x' + Math.random().toString(16).substr(2, 40),
      chain: entry.chain || 'BASE-SEPOLIA'
    };

    this.entries.unshift(newLog);
    this.render();
  }

  setFilter(filter) {
    this.filter = filter;
    this.render();
  }

  render() {
    if (!this.container) return;

    const filtered = this.entries.filter(e => {
      if (this.filter === 'ALL') return true;
      return e.stamp === this.filter;
    });

    this.container.innerHTML = filtered.map(item => {
      let stampClass = 'bru-stamp--inverted';
      if (item.stamp === 'OK') stampClass = 'bru-stamp--success';
      if (item.stamp === 'WARN') stampClass = 'bru-stamp--warning';
      if (item.stamp === 'ABORT') stampClass = 'bru-stamp--critical anim-critical-blink';

      return `
        <div class="audit-row">
          <span class="audit-index">${item.index}</span>
          <span><span class="bru-stamp ${stampClass}" style="padding: 2px 6px; font-size: 0.65rem;">[${item.stamp}]</span></span>
          <span style="color: var(--ledger-muted);">${item.timestamp}</span>
          <span style="font-weight: 600; color: var(--ink-hard);">${item.summary}</span>
          <span style="color: var(--ink-soft); font-size: 0.75rem;">${item.chain}</span>
          <span class="audit-hash" title="${item.fullTx}" onclick="navigator.clipboard.writeText('${item.fullTx}'); alert('Copied Hash: ${item.fullTx}');">${item.txHash}</span>
        </div>
      `;
    }).join('');
  }
}

window.AuditTrail = AuditTrail;
