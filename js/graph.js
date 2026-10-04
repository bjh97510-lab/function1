/**
 * GraphBoard — HTML5 Canvas 좌표평면
 * - interactive: true 이면 클릭/터치로 격자점에 점을 찍고, 드래그로 옮길 수 있음 (최대 2개)
 * - fixedLine {a, b}       : y = ax + b 직선 표시 (개념 탐험용)
 * - triangle {x0,y0,run,rise}: 기울기 삼각형 표시
 * - markers [{x,y,label,color}]
 * - answerPoints [[x,y],[x,y]] : 정답 직선(초록 점선) 표시
 */
(() => {
  const COLORS = {
    grid: '#F1EDF9',
    gridStrong: '#E1DAF2',
    axis: '#5E5873',
    label: '#8A84A0',
    line: '#8C7BEA',
    fixed: '#8C7BEA',
    answer: '#3DBE84',
    triangle: '#FF9F6B',
    points: ['#FF7E9A', '#4DA3FF'],
  };
  const FONT = '"Noto Sans KR", system-ui, sans-serif';

  class GraphBoard {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.min = opts.min ?? -8;
      this.max = opts.max ?? 8;
      this.maxSize = opts.maxSize ?? 560;
      this.interactive = !!opts.interactive;
      this.onChange = opts.onChange || null;
      this.onFull = opts.onFull || null;

      this.points = [];
      this.fixedLine = null;
      this.triangle = null;
      this.markers = [];
      this.answerPoints = null;
      this.refLine = null;
      this.polygon = null;
      this.arrows = [];
      this.locked = false;
      this.hover = null;
      this.dragIdx = -1;
      this.size = 0;
      this.pad = 18;

      this._onResize = () => this.resize();
      this.ro = new ResizeObserver(this._onResize);
      this.ro.observe(canvas.parentElement);
      if (this.interactive) this._bindPointer();
      this.resize();
    }

    destroy() {
      this.ro.disconnect();
    }

    setPoints(pts) {
      this.points = pts.map(([x, y]) => ({ x, y }));
      this.draw();
    }

    reset() {
      this.points = [];
      this.answerPoints = null;
      this.locked = false;
      this.draw();
      this._emit();
    }

    resize() {
      const w = Math.floor(Math.min(this.canvas.parentElement.clientWidth, this.maxSize));
      if (!w || w === this.size) return;
      const dpr = window.devicePixelRatio || 1;
      this.size = w;
      this.canvas.width = w * dpr;
      this.canvas.height = w * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = w + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }

    get unit() {
      return (this.size - 2 * this.pad) / (this.max - this.min);
    }

    toPx(x, y) {
      return [this.pad + (x - this.min) * this.unit, this.pad + (this.max - y) * this.unit];
    }

    toCoord(px, py) {
      return [this.min + (px - this.pad) / this.unit, this.max - (py - this.pad) / this.unit];
    }

    // ─────────── 포인터 이벤트 ───────────
    _eventCoord(e) {
      const r = this.canvas.getBoundingClientRect();
      const [rx, ry] = this.toCoord(e.clientX - r.left, e.clientY - r.top);
      const clamp = (v) => Math.max(this.min, Math.min(this.max, Math.round(v)));
      return { x: clamp(rx), y: clamp(ry), rx, ry };
    }

    _hitIndex(c) {
      let best = -1, bestD = 0.7;
      this.points.forEach((p, i) => {
        const d = Math.hypot(p.x - c.rx, p.y - c.ry);
        if (d < bestD) { best = i; bestD = d; }
      });
      return best;
    }

    _occupied(x, y, exceptIdx = -1) {
      return this.points.some((p, i) => i !== exceptIdx && p.x === x && p.y === y);
    }

    _bindPointer() {
      const cv = this.canvas;
      cv.style.touchAction = 'none';
      cv.style.cursor = 'crosshair';

      cv.addEventListener('pointerdown', (e) => {
        if (this.locked) return;
        e.preventDefault();
        const c = this._eventCoord(e);
        const hit = this._hitIndex(c);
        if (hit >= 0) {
          this.dragIdx = hit;
          cv.setPointerCapture(e.pointerId);
          cv.style.cursor = 'grabbing';
        } else if (this.points.length < 2) {
          if (!this._occupied(c.x, c.y)) {
            this.points.push({ x: c.x, y: c.y });
            this._emit();
          }
        } else if (this.onFull) {
          this.onFull();
        }
        this.hover = c;
        this.draw();
      });

      cv.addEventListener('pointermove', (e) => {
        const c = this._eventCoord(e);
        this.hover = c;
        if (this.dragIdx >= 0) {
          if (!this._occupied(c.x, c.y, this.dragIdx)) {
            const p = this.points[this.dragIdx];
            if (p.x !== c.x || p.y !== c.y) {
              this.points[this.dragIdx] = { x: c.x, y: c.y };
              this._emit();
            }
          }
        } else if (!this.locked) {
          cv.style.cursor = this._hitIndex(c) >= 0 ? 'grab' : 'crosshair';
        }
        this.draw();
      });

      const end = () => {
        if (this.dragIdx >= 0) {
          this.dragIdx = -1;
          cv.style.cursor = 'crosshair';
          this.draw();
        }
      };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);
      cv.addEventListener('pointerleave', () => {
        if (this.dragIdx < 0) { this.hover = null; this.draw(); }
      });
    }

    _emit() {
      if (this.onChange) this.onChange(this.points.slice());
    }

    // ─────────── 그리기 ───────────
    _line(x1, y1, x2, y2) {
      const c = this.ctx;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();
    }

    /** 좌표 (x1,y1)-(x2,y2)를 지나는 직선을 화면 밖까지 연장해 그림 */
    _infiniteLine(x1, y1, x2, y2) {
      const dx = x2 - x1, dy = y2 - y1;
      const L = Math.hypot(dx, dy);
      if (!L) return;
      const k = 100 / L;
      const [ax, ay] = this.toPx(x1 - dx * k, y1 - dy * k);
      const [bx, by] = this.toPx(x1 + dx * k, y1 + dy * k);
      this._line(ax, ay, bx, by);
    }

    _labelBox(text, px, py, color) {
      const c = this.ctx;
      c.font = `600 12px ${FONT}`;
      const w = c.measureText(text).width + 12;
      const h = 22;
      let x = px + 10, y = py - h - 8;
      if (x + w > this.size - 4) x = px - w - 10;
      if (y < 4) y = py + 10;
      c.fillStyle = 'rgba(255,255,255,0.94)';
      c.strokeStyle = color;
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect ? c.roundRect(x, y, w, h, 8) : c.rect(x, y, w, h);
      c.fill();
      c.stroke();
      c.fillStyle = '#3D3A4B';
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      c.fillText(text, x + 6, y + h / 2 + 1);
    }

    _dot(px, py, color, r = 7) {
      const c = this.ctx;
      c.beginPath();
      c.arc(px, py, r, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
      c.lineWidth = 2.5;
      c.strokeStyle = '#fff';
      c.stroke();
    }

    draw() {
      const c = this.ctx, S = this.size, pad = this.pad, u = this.unit;
      if (!S) return;
      const { min, max } = this;

      c.clearRect(0, 0, S, S);
      c.fillStyle = '#FFFFFF';
      c.fillRect(0, 0, S, S);

      // 격자
      c.lineWidth = 1;
      for (let i = min; i <= max; i++) {
        const [gx] = this.toPx(i, 0);
        const [, gy] = this.toPx(0, i);
        c.strokeStyle = i % 5 === 0 ? COLORS.gridStrong : COLORS.grid;
        this._line(gx, pad, gx, S - pad);
        this._line(pad, gy, S - pad, gy);
      }

      // 축
      const [ox, oy] = this.toPx(0, 0);
      c.strokeStyle = COLORS.axis;
      c.fillStyle = COLORS.axis;
      c.lineWidth = 1.6;
      this._line(pad - 6, oy, S - pad + 8, oy);
      this._line(ox, S - pad + 6, ox, pad - 8);
      c.beginPath(); // x축 화살표
      c.moveTo(S - pad + 10, oy); c.lineTo(S - pad + 2, oy - 4); c.lineTo(S - pad + 2, oy + 4); c.fill();
      c.beginPath(); // y축 화살표
      c.moveTo(ox, pad - 10); c.lineTo(ox - 4, pad - 2); c.lineTo(ox + 4, pad - 2); c.fill();

      // 눈금 숫자
      const step = u >= 26 ? 1 : 2;
      c.fillStyle = COLORS.label;
      c.font = `${u >= 26 ? 11 : 10}px ${FONT}`;
      for (let i = min + 1; i < max; i++) {
        if (i === 0 || i % step !== 0) continue;
        const [tx] = this.toPx(i, 0);
        c.textAlign = 'center'; c.textBaseline = 'top';
        c.fillText(String(i), tx, oy + 4);
        const [, ty] = this.toPx(0, i);
        c.textAlign = 'right'; c.textBaseline = 'middle';
        c.fillText(String(i), ox - 5, ty);
      }
      c.font = `italic 600 13px ${FONT}`;
      c.fillStyle = COLORS.axis;
      c.textAlign = 'right'; c.textBaseline = 'top';
      c.fillText('O', ox - 4, oy + 3);
      c.textAlign = 'right'; c.textBaseline = 'bottom';
      c.fillText('x', S - 4, oy - 4);
      c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText('y', ox + 7, 2);

      // ── 그래프 영역 클리핑 ──
      c.save();
      c.beginPath();
      c.rect(pad, pad, S - 2 * pad, S - 2 * pad);
      c.clip();

      if (this.polygon && this.polygon.length > 2) {
        c.beginPath();
        this.polygon.forEach(([x, y], i) => {
          const [px, py] = this.toPx(x, y);
          if (i) c.lineTo(px, py); else c.moveTo(px, py);
        });
        c.closePath();
        c.fillStyle = 'rgba(255, 159, 107, 0.28)';
        c.fill();
      }

      if (this.refLine) {
        const { a, b } = this.refLine;
        c.setLineDash([7, 6]);
        c.strokeStyle = '#B7B1C9';
        c.lineWidth = 2.2;
        this._infiniteLine(0, b, 1, a + b);
        c.setLineDash([]);
      }

      this.arrows.forEach(({ x1, y1, x2, y2 }) => {
        const [ax, ay] = this.toPx(x1, y1);
        const [bx, by] = this.toPx(x2, y2);
        const ang = Math.atan2(by - ay, bx - ax);
        c.strokeStyle = COLORS.triangle;
        c.fillStyle = COLORS.triangle;
        c.lineWidth = 2.4;
        this._line(ax, ay, bx - Math.cos(ang) * 6, by - Math.sin(ang) * 6);
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(bx - Math.cos(ang - 0.45) * 11, by - Math.sin(ang - 0.45) * 11);
        c.lineTo(bx - Math.cos(ang + 0.45) * 11, by - Math.sin(ang + 0.45) * 11);
        c.fill();
      });

      if (this.fixedLine) {
        const { a, b } = this.fixedLine;
        c.strokeStyle = COLORS.fixed;
        c.lineWidth = 3;
        this._infiniteLine(0, b, 1, a + b);
      }

      if (this.triangle) {
        const { x0, y0, run, rise } = this.triangle;
        const [p0x, p0y] = this.toPx(x0, y0);
        const [p1x, p1y] = this.toPx(x0 + run, y0);
        const [p2x, p2y] = this.toPx(x0 + run, y0 + rise);
        c.setLineDash([6, 5]);
        c.strokeStyle = COLORS.triangle;
        c.lineWidth = 2.2;
        this._line(p0x, p0y, p1x, p1y);
        this._line(p1x, p1y, p2x, p2y);
        c.setLineDash([]);
        c.fillStyle = '#E2783F';
        c.font = `700 12px ${FONT}`;
        c.textAlign = 'center';
        c.textBaseline = rise >= 0 ? 'top' : 'bottom';
        c.fillText(`+${run}`, (p0x + p1x) / 2, p0y + (rise >= 0 ? 5 : -5));
        c.textAlign = 'left';
        c.textBaseline = 'middle';
        const r = Math.round(rise * 100) / 100;
        c.fillText(r >= 0 ? `+${r}` : `${r}`, p1x + 6, (p1y + p2y) / 2);
      }

      if (this.answerPoints) {
        const [[x1, y1], [x2, y2]] = this.answerPoints;
        c.setLineDash([8, 6]);
        c.strokeStyle = COLORS.answer;
        c.lineWidth = 3;
        this._infiniteLine(x1, y1, x2, y2);
        c.setLineDash([]);
      }

      if (this.points.length === 2) {
        const [p, q] = this.points;
        c.strokeStyle = COLORS.line;
        c.lineWidth = 3.5;
        c.lineCap = 'round';
        this._infiniteLine(p.x, p.y, q.x, q.y);
      }
      c.restore();

      // 정답 점
      if (this.answerPoints) {
        this.answerPoints.forEach(([x, y]) => {
          const [px, py] = this.toPx(x, y);
          this._dot(px, py, COLORS.answer, 6);
        });
      }

      // 마커 (절편 등)
      this.markers.forEach((m) => {
        if (m.x < min || m.x > max || m.y < min || m.y > max) return;
        const [px, py] = this.toPx(m.x, m.y);
        this._dot(px, py, m.color || '#FF9F6B', 6);
        if (m.label) this._labelBox(m.label, px, py, m.color || '#FF9F6B');
      });

      // 호버 미리보기
      if (this.interactive && this.hover && !this.locked && this.dragIdx < 0 && this.points.length < 2) {
        const [hx, hy] = this.toPx(this.hover.x, this.hover.y);
        c.beginPath();
        c.arc(hx, hy, 7, 0, Math.PI * 2);
        c.fillStyle = 'rgba(140,123,234,0.25)';
        c.fill();
      }

      // 학생이 찍은 점
      this.points.forEach((p, i) => {
        const [px, py] = this.toPx(p.x, p.y);
        const color = COLORS.points[i];
        this._dot(px, py, color, this.dragIdx === i ? 10 : 8);
        this._labelBox(`(${p.x}, ${p.y})`, px, py, color);
      });

      // 현재 좌표 표시
      if (this.interactive && this.hover && !this.locked) {
        const t = `(${this.hover.x}, ${this.hover.y})`;
        c.font = `600 12px ${FONT}`;
        const w = c.measureText(t).width + 14;
        c.fillStyle = 'rgba(61,58,75,0.78)';
        c.beginPath();
        c.roundRect ? c.roundRect(S - w - 6, S - 30, w, 24, 8) : c.rect(S - w - 6, S - 30, w, 24);
        c.fill();
        c.fillStyle = '#fff';
        c.textAlign = 'left';
        c.textBaseline = 'middle';
        c.fillText(t, S - w + 1, S - 17);
      }
    }
  }

  window.GraphBoard = GraphBoard;
})();
