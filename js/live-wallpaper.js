/**
 * dryrun.ai — Live Brutalist Architectural Wallpaper
 * Meridian Styleguide 3.0:
 * - Fullscreen 48px blueprint grid with kinetic industrial scanline
 * - Orthogonal packet traces running along grid intersections
 * - Datum marks (+, [•]), telemetry coordinates, and mouse interaction
 */

class LiveBrutalistWallpaper {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 48;
    this.scanlineY = 0;
    this.packets = [];
    this.datumPoints = [];
    this.mouse = { x: -1000, y: -1000, active: false };
    this.enabled = true;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });

    this.initElements();
    this.loop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initElements();
  }

  initElements() {
    this.datumPoints = [];
    this.packets = [];

    const cols = Math.ceil(this.width / this.gridSize);
    const rows = Math.ceil(this.height / this.gridSize);

    // Seed datum crosshairs at deterministic grid coordinates
    for (let c = 1; c < cols; c += 3) {
      for (let r = 1; r < rows; r += 3) {
        if ((c * 3 + r * 7) % 5 === 0) {
          this.datumPoints.push({
            x: c * this.gridSize,
            y: r * this.gridSize,
            label: `[${String(c * 48).padStart(4, '0')}:${String(r * 48).padStart(4, '0')}]`,
            symbol: '+'
          });
        }
      }
    }

    // Spawn 18 ambient packets
    for (let i = 0; i < 18; i++) {
      this.spawnPacket();
    }
  }

  spawnPacket() {
    const isHorizontal = Math.random() > 0.5;
    const cols = Math.floor(this.width / this.gridSize);
    const rows = Math.floor(this.height / this.gridSize);

    if (isHorizontal) {
      const row = Math.floor(Math.random() * rows);
      this.packets.push({
        x: 0,
        y: row * this.gridSize,
        vx: 1.5 + Math.random() * 2,
        vy: 0,
        length: 24 + Math.random() * 40,
        color: Math.random() > 0.3 ? '#2e5bff' : '#ffb300'
      });
    } else {
      const col = Math.floor(Math.random() * cols);
      this.packets.push({
        x: col * this.gridSize,
        y: 0,
        vx: 0,
        vy: 1.5 + Math.random() * 2,
        length: 24 + Math.random() * 40,
        color: Math.random() > 0.4 ? '#2e5bff' : '#00c853'
      });
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    return this.enabled;
  }

  loop() {
    if (this.enabled) {
      this.draw();
    }
    requestAnimationFrame(() => this.loop());
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Substrate: light raw concrete tone with slight age
    ctx.fillStyle = '#d9d9d7';
    ctx.fillRect(0, 0, w, h);

    // 1. Draw 48px Blueprint Grid Lines
    ctx.strokeStyle = 'rgba(10, 10, 11, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += this.gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += this.gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 2. Mouse Proximity Grid Highlight
    if (this.mouse.active) {
      const snapX = Math.round(this.mouse.x / this.gridSize) * this.gridSize;
      const snapY = Math.round(this.mouse.y / this.gridSize) * this.gridSize;

      ctx.strokeStyle = 'rgba(46, 91, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Horizontal cross
      ctx.moveTo(Math.max(0, snapX - this.gridSize * 3), snapY);
      ctx.lineTo(Math.min(w, snapX + this.gridSize * 3), snapY);
      // Vertical cross
      ctx.moveTo(snapX, Math.max(0, snapY - this.gridSize * 3));
      ctx.lineTo(snapX, Math.min(h, snapY + this.gridSize * 3));
      ctx.stroke();

      // Center crosshair marker
      ctx.fillStyle = '#2e5bff';
      ctx.fillRect(snapX - 3, snapY - 3, 6, 6);
    }

    // 3. Datum Crosshairs & Coordinates
    ctx.font = '9px "IBM Plex Mono", monospace';
    this.datumPoints.forEach(pt => {
      ctx.fillStyle = 'rgba(10, 10, 11, 0.25)';
      ctx.fillText(pt.symbol, pt.x - 3, pt.y + 3);

      // Micro coordinate tag
      ctx.fillStyle = 'rgba(10, 10, 11, 0.18)';
      ctx.fillText(pt.label, pt.x + 6, pt.y + 10);
    });

    // 4. Kinetic Orthogonal Grid Packets
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.x += p.vx;
      p.y += p.vy;

      ctx.fillStyle = p.color;
      if (p.vx > 0) {
        // Horizontal packet
        ctx.fillRect(p.x, p.y - 1.5, p.length, 3);
        if (p.x > w + 50) {
          this.packets.splice(i, 1);
          this.spawnPacket();
        }
      } else {
        // Vertical packet
        ctx.fillRect(p.x - 1.5, p.y, 3, p.length);
        if (p.y > h + 50) {
          this.packets.splice(i, 1);
          this.spawnPacket();
        }
      }
    }

    // 5. Hard Industrial Scanline Sweep (Step-wise motion)
    this.scanlineY += 1.2;
    if (this.scanlineY > h) this.scanlineY = 0;

    const scanInt = Math.floor(this.scanlineY / 2) * 2;
    ctx.strokeStyle = 'rgba(46, 91, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, scanInt);
    ctx.lineTo(w, scanInt);
    ctx.stroke();

    // Scanline datum label
    ctx.fillStyle = 'rgba(46, 91, 255, 0.4)';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillText(`▲ RADAR SCAN: L_${String(Math.floor(scanInt)).padStart(4, '0')}`, 16, scanInt - 4);
  }
}

window.LiveBrutalistWallpaper = LiveBrutalistWallpaper;
