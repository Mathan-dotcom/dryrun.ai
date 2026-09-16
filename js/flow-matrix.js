/**
 * dryrun.ai — FlowMatrix Canvas Circuit
 * Meridian Styleguide 6.1 Specification:
 * - 70+ nodes on a visible blueprint grid (48px)
 * - Circuit diagram traces (hard 1px lines, right-angle orthos)
 * - Square nodes (fillRect), zero soft particle glow
 * - Dynamic states: Normal, Hazard Alert, Recovery Lock
 */

class FlowMatrix {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.traces = [];
    this.packets = [];
    this.gridSize = 48;
    this.state = 'normal'; // 'normal' | 'hazard' | 'recovery'
    this.animFrame = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initGraph();
    this.startLoop();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height || 440;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    if (this.nodes.length === 0) {
      this.initGraph();
    }
  }

  initGraph() {
    this.nodes = [];
    this.traces = [];
    this.packets = [];

    const cols = Math.floor(this.width / this.gridSize);
    const rows = Math.floor(this.height / this.gridSize);

    // Create 72+ structured nodes pinned strictly to the 48px grid intersections
    for (let c = 1; c < cols; c++) {
      for (let r = 1; r < rows; r++) {
        // Deterministic inclusion to form an architectural network of 70+ nodes
        if ((c * 7 + r * 11) % 3 !== 0) {
          const type = (c === 2 && r === 2) ? 'hub' :
                       (c === cols - 2 && r === rows - 2) ? 'settle' :
                       ((c + r) % 5 === 0) ? 'validator' : 'agent';
          this.nodes.push({
            x: c * this.gridSize,
            y: r * this.gridSize,
            gridX: c,
            gridY: r,
            type: type,
            size: type === 'hub' ? 10 : (type === 'settle' ? 9 : 6),
            active: Math.random() > 0.4
          });
        }
      }
    }

    // Ensure we have at least 70 nodes
    while (this.nodes.length < 72) {
      const rx = Math.floor(Math.random() * (cols - 1) + 1) * this.gridSize;
      const ry = Math.floor(Math.random() * (rows - 1) + 1) * this.gridSize;
      if (!this.nodes.some(n => n.x === rx && n.y === ry)) {
        this.nodes.push({
          x: rx,
          y: ry,
          gridX: rx / this.gridSize,
          gridY: ry / this.gridSize,
          type: 'agent',
          size: 6,
          active: true
        });
      }
    }

    // Connect nodes with rectilinear (orthogonal) 1px traces
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[j];
        const dist = Math.abs(n1.gridX - n2.gridX) + Math.abs(n1.gridY - n2.gridY);
        // Direct grid neighbors
        if (dist === 1 || (dist === 2 && Math.random() > 0.6)) {
          this.traces.push({
            from: n1,
            to: n2,
            active: Math.random() > 0.3
          });
        }
      }
    }

    // Spawn 12 active packets
    for (let p = 0; p < 12; p++) {
      this.spawnPacket();
    }
  }

  spawnPacket() {
    if (this.traces.length === 0) return;
    const trace = this.traces[Math.floor(Math.random() * this.traces.length)];
    this.packets.push({
      from: trace.from,
      to: trace.to,
      progress: Math.random(),
      speed: 0.008 + Math.random() * 0.014,
      color: this.state === 'hazard' ? '#ffb300' : (this.state === 'recovery' ? '#00c853' : '#2e5bff')
    });
  }

  setState(newState) {
    this.state = newState;
    this.packets.forEach(p => {
      p.color = this.state === 'hazard' ? '#ff2e2e' :
                (this.state === 'recovery' ? '#00c853' : '#2e5bff');
    });
  }

  startLoop() {
    const loop = () => {
      this.draw();
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Raw Steel substrate
    ctx.fillStyle = '#0c0c0e';
    ctx.fillRect(0, 0, w, h);

    // 2. 48px Blueprint Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += this.gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += this.gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 3. Draw Orthogonal Traces
    this.traces.forEach(trace => {
      ctx.beginPath();
      if (this.state === 'hazard' && trace.active) {
        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 1.5;
      } else if (this.state === 'recovery' && trace.active) {
        ctx.strokeStyle = '#00c853';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = trace.active ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
      }

      ctx.moveTo(trace.from.x, trace.from.y);
      ctx.lineTo(trace.to.x, trace.to.y);
      ctx.stroke();
    });

    // 4. Update and Draw Square Data Packets
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += p.speed;
      if (p.progress >= 1) {
        this.packets.splice(i, 1);
        this.spawnPacket();
        continue;
      }

      const curX = p.from.x + (p.to.x - p.from.x) * p.progress;
      const curY = p.from.y + (p.to.y - p.from.y) * p.progress;

      ctx.fillStyle = p.color;
      ctx.fillRect(curX - 2.5, curY - 2.5, 5, 5);
    }

    // 5. Draw Square Nodes (No circles!)
    this.nodes.forEach(node => {
      let nodeColor = '#3f3f46';
      let border = '#ffffff';

      if (node.type === 'hub') {
        nodeColor = '#2e5bff'; // KeeperHub MCP
      } else if (node.type === 'settle') {
        nodeColor = '#00c853'; // Turnkey settlement
      } else if (this.state === 'hazard') {
        nodeColor = '#ff2e2e'; // Outage / drift
      } else if (node.active) {
        nodeColor = '#d9d9d7';
      }

      const half = node.size / 2;
      ctx.fillStyle = nodeColor;
      ctx.fillRect(node.x - half, node.y - half, node.size, node.size);

      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(node.x - half, node.y - half, node.size, node.size);
    });

    // 6. Corner stamps
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px "IBM Plex Mono"';
    ctx.fillText(`NODES: ${this.nodes.length} // TRACES: ${this.traces.length} // GRID: 48PX`, 16, h - 14);
    ctx.fillText(`STATE: [${this.state.toUpperCase()}]`, w - 140, h - 14);
  }
}

window.FlowMatrix = FlowMatrix;
