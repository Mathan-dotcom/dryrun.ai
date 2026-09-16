/**
 * dryrun.ai — Main Application Bootstrapper
 */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Fullscreen Kinetic Brutalist Wallpaper
  const liveWallpaper = new LiveBrutalistWallpaper('bgLiveWallpaper');

  // Wallpaper Toggle Button
  const wallpaperBtn = document.getElementById('wallpaperToggleBtn');
  if (wallpaperBtn) {
    wallpaperBtn.addEventListener('click', () => {
      const active = liveWallpaper.toggle();
      wallpaperBtn.textContent = active ? 'WALLPAPER: [ACTIVE]' : 'WALLPAPER: [PAUSED]';
      wallpaperBtn.style.color = active ? 'var(--signal-accent)' : 'var(--ink-soft)';
      if (window.brutalAudio) window.brutalAudio.click();
    });
  }

  // 1. Initialize Canvas Circuit (FlowMatrix)
  const flowMatrix = new FlowMatrix('flowMatrixCanvas');

  // 2. Initialize Segmented Confidence Gate
  const confidenceGate = new ConfidenceGate('confidenceGateContainer');

  // 3. Initialize Terminal Audit Trail
  const auditTrail = new AuditTrail('auditTrailBody');

  // 4. Initialize Mission Control Console
  const missionControl = new MissionControl(confidenceGate, auditTrail, flowMatrix);

  // 5. Connect Audit Filter Buttons
  const filterBtns = document.querySelectorAll('.audit-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      auditTrail.setFilter(btn.dataset.filter);
      if (window.brutalAudio) window.brutalAudio.click();
    });
  });

  // 6. Sound Toggle
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = window.brutalAudio.toggleMute();
      soundBtn.textContent = isMuted ? 'AUDIO: [MUTED]' : 'AUDIO: [ENGAGED]';
      soundBtn.style.color = isMuted ? 'var(--ink-soft)' : 'var(--recovered-mark)';
      if (!isMuted) window.brutalAudio.click();
    });
  }

  // 7. Flow Matrix HUD controls
  const btnPulseFlow = document.getElementById('btnPulseFlow');
  const btnSpikeFlow = document.getElementById('btnSpikeFlow');
  const btnResetFlow = document.getElementById('btnResetFlow');

  if (btnPulseFlow) {
    btnPulseFlow.addEventListener('click', () => {
      flowMatrix.setState('recovery');
      if (window.brutalAudio) window.brutalAudio.click();
    });
  }
  if (btnSpikeFlow) {
    btnSpikeFlow.addEventListener('click', () => {
      flowMatrix.setState('hazard');
      if (window.brutalAudio) window.brutalAudio.alarm();
    });
  }
  if (btnResetFlow) {
    btnResetFlow.addEventListener('click', () => {
      flowMatrix.setState('normal');
      if (window.brutalAudio) window.brutalAudio.click();
    });
  }

  // 8. Auto-update live time stamp in telemetry box
  const liveClock = document.getElementById('telemetryClock');
  if (liveClock) {
    setInterval(() => {
      const now = new Date();
      liveClock.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    }, 1000);
  }

  console.log('dryrun.ai initialized — Concrete Brutalism Mission Control v3.0.0');
});
