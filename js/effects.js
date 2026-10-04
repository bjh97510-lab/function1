/**
 * 효과 모음: 수식 렌더링, 효과음, 토스트, 모달(큐), 도토리 날리기, 폭죽
 */
(() => {
  // ─────────── 수식 (KaTeX) ───────────
  const Math_ = {
    typeset(el) {
      if (!el || typeof window.renderMathInElement !== 'function') return;
      window.renderMathInElement(el, {
        delimiters: [{ left: '$', right: '$', display: false }],
        throwOnError: false,
      });
    },
    tex(src) {
      if (window.katex) return window.katex.renderToString(src, { throwOnError: false });
      return src;
    },
    /** 숫자를 TeX 문자열로 (0.5 → \frac{1}{2}) */
    num(n) {
      if (Number.isInteger(n)) return String(n);
      for (let d = 2; d <= 12; d++) {
        const k = n * d;
        if (Math.abs(k - Math.round(k)) < 1e-9) {
          const sign = n < 0 ? '-' : '';
          return `${sign}\\frac{${Math.abs(Math.round(k))}}{${d}}`;
        }
      }
      return String(Math.round(n * 100) / 100);
    },
    /** y = ax + b 를 TeX 문자열로 */
    linear(a, b) {
      let s = 'y = ';
      if (a === 0) return s + Math_.num(b);
      if (a === 1) s += 'x';
      else if (a === -1) s += '-x';
      else s += Math_.num(a) + 'x';
      if (b > 0) s += ' + ' + Math_.num(b);
      else if (b < 0) s += ' - ' + Math_.num(-b);
      return s;
    },
  };

  // ─────────── 효과음 (Web Audio) ───────────
  const Sound = {
    ctx: null,
    muted: false,
    unlock() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    },
    _tone(freq, start, dur, type = 'sine', vol = 0.18) {
      const ctx = this.ctx;
      const t0 = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    },
    _play(notes, type, vol) {
      if (this.muted) return;
      this.unlock();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      notes.forEach(([f, s, d]) => this._tone(f, s, d, type, vol));
    },
    correct() { this._play([[523.25, 0, 0.18], [659.25, 0.1, 0.18], [783.99, 0.2, 0.32]], 'triangle', 0.22); },
    wrong() { this._play([[330, 0, 0.2], [247, 0.16, 0.34]], 'sine', 0.16); },
    pop() { this._play([[880, 0, 0.08]], 'sine', 0.1); },
    stamp() {
      this._play([[392, 0, 0.14], [523.25, 0.12, 0.14], [659.25, 0.24, 0.14], [1046.5, 0.36, 0.5]], 'triangle', 0.22);
    },
    fanfare() {
      this._play([
        [523.25, 0, 0.15], [659.25, 0.15, 0.15], [783.99, 0.3, 0.15],
        [1046.5, 0.45, 0.3], [783.99, 0.75, 0.12], [1046.5, 0.87, 0.6],
      ], 'triangle', 0.22);
    },
  };

  // ─────────── 토스트 ───────────
  const Toast = {
    show(msg, kind = '') {
      const root = document.getElementById('toast-root');
      const t = document.createElement('div');
      t.className = `toast ${kind}`;
      t.innerHTML = msg;
      root.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
      }, 2400);
    },
  };

  // ─────────── 모달 (순서대로 하나씩 표시) ───────────
  const Modal = (() => {
    const queue = [];
    let isOpen = false;

    function show(opts) {
      return new Promise((resolve) => {
        queue.push({ opts, resolve });
        if (!isOpen) next();
      });
    }

    function next() {
      const item = queue.shift();
      const root = document.getElementById('modal-root');
      if (!item) { isOpen = false; root.innerHTML = ''; return; }
      isOpen = true;
      const { title = '', icon = '', html = '', variant = '', buttons } = item.opts;
      const btns = buttons || [{ label: '확인', value: true, cls: 'primary' }];
      root.innerHTML = `
        <div class="modal-backdrop">
          <div class="modal ${variant}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            ${icon ? `<div class="modal-icon">${icon}</div>` : ''}
            ${title ? `<h3 id="modal-title">${title}</h3>` : ''}
            <div class="modal-body">${html}</div>
            <div class="modal-actions">
              ${btns.map((b, i) => `<button type="button" class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}
            </div>
          </div>
        </div>`;
      Math_.typeset(root);
      const close = (value) => {
        document.removeEventListener('keydown', onKey);
        const bd = root.querySelector('.modal-backdrop');
        bd.classList.add('closing');
        setTimeout(() => { item.resolve(value); next(); }, 180);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') close(btns[0].value);
      };
      document.addEventListener('keydown', onKey);
      root.querySelectorAll('.modal-actions .btn').forEach((b) => {
        b.addEventListener('click', () => close(btns[+b.dataset.i].value), { once: true });
      });
      const last = root.querySelector('.modal-actions .btn:last-child');
      if (last) last.focus();
    }

    return { show };
  })();

  // ─────────── 도토리 날아가기 ───────────
  function flyAcorn(fromEl, toEl, onDone) {
    if (!fromEl || !toEl) { onDone && onDone(); return; }
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    const ex = b.left + b.width / 2, ey = b.top + b.height / 2;
    const node = document.createElement('div');
    node.className = 'flying-acorn';
    node.textContent = '🌰';
    node.style.left = sx + 'px';
    node.style.top = sy + 'px';
    document.body.appendChild(node);
    const dx = ex - sx, dy = ey - sy;
    const anim = node.animate([
      { transform: 'translate(-50%,-50%) scale(1)', offset: 0 },
      { transform: `translate(calc(-50% + ${dx * 0.35}px), calc(-50% + ${dy * 0.35 - 80}px)) scale(1.8)`, offset: 0.35 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.7)`, offset: 1 },
    ], { duration: 750, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = () => {
      node.remove();
      toEl.classList.remove('bump');
      void toEl.offsetWidth;
      toEl.classList.add('bump');
      onDone && onDone();
    };
  }

  // ─────────── 폭죽 ───────────
  const Confetti = (() => {
    const colors = ['#FFB3C6', '#BDE0FE', '#CDB4DB', '#B9FBC0', '#FFD6A5', '#FDFFB6', '#8C7BEA', '#FF8FA3'];
    let parts = [], raf = 0, until = 0;

    function burst(duration = 2600) {
      const cv = document.getElementById('confetti');
      const ctx = cv.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth, H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const origins = [[W * 0.2, H * 0.75], [W * 0.5, H * 0.65], [W * 0.8, H * 0.75]];
      origins.forEach(([ox, oy]) => {
        for (let i = 0; i < 60; i++) {
          const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
          const sp = 7 + Math.random() * 9;
          parts.push({
            x: ox, y: oy,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
            rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
            color: colors[(Math.random() * colors.length) | 0],
            circle: Math.random() < 0.3,
          });
        }
      });
      until = performance.now() + duration;
      cv.classList.add('on');

      const tick = (now) => {
        ctx.clearRect(0, 0, W, H);
        parts.forEach((p) => {
          p.vy += 0.25; p.vx *= 0.99; p.vy *= 0.99;
          p.x += p.vx; p.y += p.vy; p.rot += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
          else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        parts = parts.filter((p) => p.y < H + 40);
        if (now < until && parts.length) raf = requestAnimationFrame(tick);
        else { ctx.clearRect(0, 0, W, H); parts = []; cv.classList.remove('on'); raf = 0; }
      };
      if (!raf) raf = requestAnimationFrame(tick);
    }
    return { burst };
  })();

  window.FX = { Math: Math_, Sound, Toast, Modal, flyAcorn, Confetti };
})();
