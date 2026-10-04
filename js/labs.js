/**
 * 🧪 실험실 — 각 단계 개념 설명에 붙는 인터랙티브 실험
 *  intercepts : a, b 슬라이더 → 두 절편 관찰
 *  slope      : a, b, x증가량 슬라이더 → 기울기 삼각형 (비율이 항상 a)
 *  twoPoints  : 두 점 드래그 → 기울기 → b → 식 완성 과정
 *  shift      : y = ax 를 y축 방향으로 b만큼 평행이동
 *  area       : 그래프와 두 축으로 둘러싸인 삼각형의 넓이
 */
(() => {
  const { Math: M } = window.FX;
  const $ = (id) => document.getElementById(id);

  const TITLES = {
    intercepts: 'a와 b를 바꿔 보며 두 절편이 어떻게 변하는지 관찰해요',
    slope: 'x의 증가량을 바꿔도 기울기는 변할까요?',
    twoPoints: '두 점을 드래그하면 일차함수의 식이 만들어지는 과정을 볼 수 있어요',
    shift: 'y = ax 의 그래프를 y축 방향으로 평행이동해 봐요',
    area: '그래프와 x축, y축으로 둘러싸인 삼각형의 넓이를 관찰해요',
  };

  const slider = (id, label, min, max, step, value) => `
    <label class="slider">
      <span>${label} = <output id="${id}-val"></output></span>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
    </label>`;

  // 음수는 괄호로 감싼 TeX
  const p = (n) => (n < 0 ? `(${M.num(n)})` : M.num(n));

  function html(step) {
    const L = step.lab;
    let controls = '';
    switch (L.type) {
      case 'intercepts':
      case 'shift':
      case 'area':
        controls = slider('lab-a', '기울기 <b>a</b>', -3, 3, 0.5, L.a) + slider('lab-b', (L.type === 'shift' ? '평행이동 <b>b</b>' : 'y절편 <b>b</b>'), -6, 6, 1, L.b);
        break;
      case 'slope':
        controls = slider('lab-a', '기울기 <b>a</b>', -3, 3, 0.5, L.a)
          + slider('lab-b', 'y절편 <b>b</b>', -5, 5, 1, L.b)
          + slider('lab-run', '<b>x</b>의 증가량', 1, 4, 1, 2);
        break;
      case 'twoPoints':
        controls = '<p class="lab-tip">👆 분홍 점과 파란 점을 <b>드래그</b>해서 옮겨 보세요.</p>';
        break;
    }
    return `
      <section class="card lab">
        <div class="card-head"><span class="pill mint">🧪 실험실</span><span class="card-sub">${TITLES[L.type]}</span></div>
        <div class="explorer-grid">
          <div class="board-wrap"><canvas id="lab-board" aria-label="실험실 좌표평면"></canvas></div>
          <div class="controls">
            <div class="formula-live" id="lab-formula"></div>
            ${controls}
            <div class="readout" id="lab-readout"></div>
          </div>
        </div>
      </section>`;
  }

  function setup(step, register) {
    const L = step.lab;
    const interactive = L.type === 'twoPoints';
    const board = new window.GraphBoard($('lab-board'), {
      interactive,
      maxSize: 460,
      onChange: interactive ? () => update() : null,
    });
    register(board);
    if (interactive) board.setPoints(L.points);

    const val = (id) => {
      const el = $(id);
      if (!el) return 0;
      const v = +el.value;
      $(id + '-val').textContent = v;
      return v;
    };

    const show = (formulaTex, body) => {
      $('lab-formula').innerHTML = M.tex(formulaTex);
      const r = $('lab-readout');
      r.innerHTML = body;
      M.typeset(r);
      board.draw();
    };

    const notLinear = (b) => `<p class="warn-text">⚠️ $a = 0$이면 $y = ${b}$ 가 되어 <b>일차함수가 아니에요!</b></p>`;

    function update() {
      board.markers = [];
      board.triangle = null;
      board.refLine = null;
      board.polygon = null;
      board.arrows = [];
      board.fixedLine = null;

      const a = val('lab-a');
      const b = val('lab-b');

      switch (L.type) {
        case 'intercepts': {
          board.fixedLine = { a, b };
          if (a === 0) return show(M.linear(a, b), notLinear(b));
          const xi = -b / a;
          board.markers = [
            { x: 0, y: b, label: `y절편 ${b}`, color: '#3DBE84' },
            { x: xi, y: 0, label: `x절편 ${Math.round(xi * 100) / 100}`, color: '#FF9F6B' },
          ];
          return show(M.linear(a, b), `
            <p><span class="dot-ic g"></span> $y$절편: $x=0$ 대입 → $y = ${M.num(b)}$</p>
            <p><span class="dot-ic o"></span> $x$절편: $0 = ${M.linear(a, b).slice(4)}$ → $x = ${M.num(xi)}$</p>`);
        }

        case 'slope': {
          const run = val('lab-run');
          board.fixedLine = { a, b };
          if (a === 0) return show(M.linear(a, b), notLinear(b));
          board.triangle = { x0: 0, y0: b, run, rise: run * a };
          board.markers = [{ x: 0, y: b, color: '#8C7BEA' }];
          return show(M.linear(a, b), `
            <p>$x$가 $${run}$ 증가할 때 $y$는 $${M.num(run * a)}$ 증가</p>
            <p>기울기 $= \\dfrac{${M.num(run * a)}}{${run}} = ${M.num(a)}$</p>
            <p class="dir ${a > 0 ? 'up' : 'down'}">${a > 0 ? '↗ 오른쪽 위로 향해요' : '↘ 오른쪽 아래로 향해요'}</p>
            <p class="small">💡 $x$의 증가량을 바꿔도 비율은 항상 $${M.num(a)}$!</p>`);
        }

        case 'twoPoints': {
          const [P, Q] = board.points;
          if (!P || !Q) return show('?', '<p>점 두 개가 필요해요.</p>');
          if (P.x === Q.x) {
            return show(`x = ${P.x}`, `<p class="warn-text">⚠️ 두 점의 $x$좌표가 같으면 $y$축에 평행한 직선이 되어 <b>일차함수가 아니에요!</b></p>`);
          }
          const sa = (Q.y - P.y) / (Q.x - P.x);
          const sb = P.y - sa * P.x;
          board.markers = [{ x: 0, y: sb, label: `y절편 ${Math.round(sb * 100) / 100}`, color: '#3DBE84' }];
          const step1 = `<p><b>①</b> 기울기 $= \\dfrac{${Q.y} - ${p(P.y)}}{${Q.x} - ${p(P.x)}} = \\dfrac{${Q.y - P.y}}{${Q.x - P.x}} = ${M.num(sa)}$</p>`;
          if (sa === 0) {
            return show(`y = ${P.y}`, step1 + `<p class="warn-text">⚠️ 기울기가 $0$이면 $y = ${P.y}$ 꼴이라 <b>일차함수가 아니에요!</b></p>`);
          }
          return show(M.linear(sa, sb), step1 + `
            <p><b>②</b> 점 $(${P.x},\\ ${P.y})$ 대입: $${P.y} = ${M.num(sa)} \\times ${p(P.x)} + b$ → $b = ${M.num(sb)}$</p>
            <p><b>③</b> 완성! $${M.linear(sa, sb)}$</p>`);
        }

        case 'shift': {
          board.refLine = { a, b: 0 };
          board.fixedLine = { a, b };
          if (a === 0) return show(M.linear(a, b), notLinear(b));
          if (b !== 0) {
            [-2, 2].forEach((x0) => board.arrows.push({ x1: x0, y1: a * x0, x2: x0, y2: a * x0 + b }));
          }
          board.markers = [{ x: 0, y: b, label: `y절편 ${b}`, color: '#3DBE84' }];
          const dir = b > 0 ? `위로 $${b}$만큼` : b < 0 ? `아래로 $${-b}$만큼` : '이동하지 않음';
          return show(M.linear(a, b), `
            <p><span class="line-ic ref"></span> 점선: $${M.linear(a, 0)}$</p>
            <p><span class="line-ic main"></span> 실선: $${M.linear(a, b)}$</p>
            <p>$y$축의 방향으로 <b>${dir}</b> 평행이동</p>
            <p class="small">💡 기울기 $${M.num(a)}$는 그대로, $y$절편만 $${M.num(b)}$로 바뀌어요.</p>`);
        }

        case 'area': {
          board.fixedLine = { a, b };
          if (a === 0) return show(M.linear(a, b), notLinear(b));
          const xi = -b / a;
          board.markers = [
            { x: 0, y: b, label: `y절편 ${b}`, color: '#3DBE84' },
            { x: xi, y: 0, label: `x절편 ${Math.round(xi * 100) / 100}`, color: '#FF9F6B' },
          ];
          if (b === 0) {
            return show(M.linear(a, b), '<p>그래프가 원점을 지나서 삼각형이 만들어지지 않아요. $b$를 바꿔 보세요!</p>');
          }
          board.polygon = [[0, 0], [xi, 0], [0, b]];
          const area = Math.abs(xi * b) / 2;
          return show(M.linear(a, b), `
            <p><span class="dot-ic o"></span> $x$절편: $${M.num(xi)}$ &nbsp; <span class="dot-ic g"></span> $y$절편: $${M.num(b)}$</p>
            <p>넓이 $= \\dfrac{1}{2} \\times ${M.num(Math.abs(xi))} \\times ${M.num(Math.abs(b))} = ${M.num(area)}$</p>`);
        }
      }
      return undefined;
    }

    document.querySelectorAll('.lab input[type=range]').forEach((i) => i.addEventListener('input', update));
    update();
  }

  window.Labs = { html, setup };
})();
