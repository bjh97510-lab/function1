/**
 * 🃏 카드 뒤집기 퀴즈
 *  intercept : 그래프를 보고 x절편·y절편 고르기 → 뒷면에 절편 표시 + 해설
 *  slope     : 두 점을 지나는 그래프를 보고 기울기 고르기 → 뒷면에 기울기 삼각형 + 해설
 * 카드마다 한 번만 도전할 수 있고, 결과는 app.js가 넘겨주는 콜백으로 처리합니다.
 */
(() => {
  const { Math: M } = window.FX;
  const RANGE = { min: -6, max: 6, maxSize: 300 };

  const TEXT = {
    intercept: {
      sub: '그래프를 보고 x절편과 y절편을 골라 보세요. 고르면 카드가 뒤집혀요!',
      q: '이 그래프의 $x$절편과 $y$절편은?',
    },
    slope: {
      sub: '두 점을 지나는 직선의 기울기를 골라 보세요. 고르면 카드가 뒤집혀요!',
      q: '이 직선의 기울기는?',
    },
    equation: {
      sub: '그래프를 보고 알맞은 일차함수의 식을 골라 보세요. 고르면 카드가 뒤집혀요!',
      q: '이 그래프의 일차함수 식은?',
    },
  };

  /** 카드 한 장의 직선 정보 (a, b) 와 정답 설명에 필요한 값 */
  function lineOf(type, item) {
    if (type === 'intercept') return { a: item.a, b: item.b };
    const [[x1, y1], [x2, y2]] = item.points;
    const a = (y2 - y1) / (x2 - x1);
    return { a, b: y1 - a * x1 };
  }

  function optionLabel(type, opt) {
    if (type === 'intercept') return `$x$절편 $${M.num(opt[0])}$ · $y$절편 $${M.num(opt[1])}$`;
    if (type === 'equation') return `$${M.linear(opt[0], opt[1])}$`;
    return `기울기 $${M.num(opt)}$`;
  }

  function backBody(type, item) {
    const { a, b } = lineOf(type, item);
    if (type === 'intercept') {
      const xi = -b / a;
      return `
        <p class="back-eq">$${M.linear(a, b)}$</p>
        <p><span class="dot-ic g"></span> $y$축과 만나는 점 $(0,\\ ${M.num(b)})$ → $y$절편 <b>$${M.num(b)}$</b></p>
        <p><span class="dot-ic o"></span> $x$축과 만나는 점 $(${M.num(xi)},\\ 0)$ → $x$절편 <b>$${M.num(xi)}$</b></p>`;
    }
    const [[x1, y1], [x2, y2]] = item.points;
    if (type === 'equation') {
      return `
        <p><b>①</b> $y$축과 만나는 점 $(0,\\ ${M.num(b)})$ → $y$절편 $b = ${M.num(b)}$</p>
        <p><b>②</b> 기울기 $= \\dfrac{${y2 - y1}}{${x2 - x1}} = ${M.num(a)}$</p>
        <p><b>③</b> 완성!</p>
        <p class="back-eq">$${M.linear(a, b)}$</p>`;
    }
    return `
      <p class="back-eq">$${M.linear(a, b)}$</p>
      <p>$x$의 증가량: $${x2} - ${x1 < 0 ? `(${x1})` : x1} = ${x2 - x1}$</p>
      <p>$y$의 증가량: $${y2} - ${y1 < 0 ? `(${y1})` : y1} = ${y2 - y1}$</p>
      <p>기울기 $= \\dfrac{${y2 - y1}}{${x2 - x1}} = $ <b>$${M.num(a)}$</b></p>`;
  }

  function html(step, results) {
    const { type, items } = step.cards;
    const t = TEXT[type];
    return `
      <section class="card flip-section" id="flip-section">
        <div class="card-head">
          <span class="pill pinkish">🃏 카드 뒤집기 퀴즈</span>
          <span class="card-sub">${t.sub}</span>
          <span class="flip-score" id="flip-score"></span>
        </div>
        <div class="flip-grid">
          ${items.map((item, i) => {
            const r = results[item.id];
            return `
              <div class="flip-card ${r ? 'flipped answered' : ''}" data-id="${item.id}">
                <div class="flip-inner">
                  <div class="face front" ${r ? 'aria-hidden="true"' : ''}>
                    <div class="face-head"><span class="card-no">카드 ${i + 1}</span><span class="card-q">❓</span></div>
                    <div class="board-wrap"><canvas id="fc-front-${item.id}" aria-label="카드 ${i + 1} 그래프"></canvas></div>
                    <p class="face-q">${t.q}</p>
                    <div class="flip-options">
                      ${item.options.map((o, k) => `
                        <button type="button" class="flip-opt" data-k="${k}">${optionLabel(type, o)}</button>`).join('')}
                    </div>
                    <button type="button" class="btn small ghost flip-toggle">뒷면 보기 ↻</button>
                  </div>
                  <div class="face back" ${r ? '' : 'aria-hidden="true"'}>
                    <div class="face-head"><span class="card-no">카드 ${i + 1}</span><span class="card-result" id="fc-result-${item.id}"></span></div>
                    <div class="board-wrap"><canvas id="fc-back-${item.id}" aria-label="카드 ${i + 1} 정답 그래프"></canvas></div>
                    <div class="back-body">${backBody(type, item)}</div>
                    <button type="button" class="btn small ghost flip-toggle">앞면 보기 ↺</button>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </section>`;
  }

  /**
   * @param step     현재 단계
   * @param results  { cardId: 'ok' | 'bad' } (이미 푼 카드 표시용)
   * @param ctx      { register(board), onAnswer(item, correct, buttonEl) }
   */
  function setup(step, results, ctx) {
    const { type, items } = step.cards;
    const section = document.getElementById('flip-section');

    const updateScore = () => {
      const done = items.filter((it) => results[it.id]).length;
      const ok = items.filter((it) => results[it.id] === 'ok').length;
      document.getElementById('flip-score').textContent = done ? `⭕ ${ok} / ${items.length}` : `${items.length}장`;
    };

    const markResult = (item, chosen) => {
      const card = section.querySelector(`.flip-card[data-id="${item.id}"]`);
      const ok = results[item.id] === 'ok';
      card.querySelectorAll('.flip-opt').forEach((b) => {
        const k = +b.dataset.k;
        b.disabled = true;
        if (k === item.answer) b.classList.add('is-ok');
        else if (k === chosen) b.classList.add('is-bad');
      });
      const res = document.getElementById(`fc-result-${item.id}`);
      res.className = `card-result ${ok ? 'ok' : 'bad'}`;
      res.textContent = ok ? '⭕ 정답! 🌰+1' : '❌ 아쉬워요';
      card.querySelector('.back').classList.toggle('bad', !ok);
    };

    items.forEach((item) => {
      const { a, b } = lineOf(type, item);
      const front = new window.GraphBoard(document.getElementById(`fc-front-${item.id}`), { ...RANGE });
      const back = new window.GraphBoard(document.getElementById(`fc-back-${item.id}`), { ...RANGE });
      ctx.register(front);
      ctx.register(back);
      front.fixedLine = { a, b };
      back.fixedLine = { a, b };

      if (type === 'intercept') {
        const xi = -b / a;
        front.markers = [{ x: 0, y: b, color: '#3DBE84' }, { x: xi, y: 0, color: '#FF9F6B' }];
        back.markers = [
          { x: 0, y: b, label: `y절편 ${b}`, color: '#3DBE84' },
          { x: xi, y: 0, label: `x절편 ${xi}`, color: '#FF9F6B' },
        ];
      } else {
        const [[x1, y1], [x2, y2]] = item.points;
        const pts = [{ x: x1, y: y1, label: `(${x1}, ${y1})`, color: '#FF7E9A' }, { x: x2, y: y2, label: `(${x2}, ${y2})`, color: '#4DA3FF' }];
        front.markers = pts;
        back.markers = pts;
        back.triangle = { x0: x1, y0: y1, run: x2 - x1, rise: y2 - y1 };
      }
      front.draw();
      back.draw();

      const card = section.querySelector(`.flip-card[data-id="${item.id}"]`);
      const flip = (to) => {
        card.classList.toggle('flipped', to);
        card.querySelector('.front').setAttribute('aria-hidden', String(to));
        card.querySelector('.back').setAttribute('aria-hidden', String(!to));
      };
      card.querySelectorAll('.flip-toggle').forEach((btn) => {
        btn.addEventListener('click', () => flip(!card.classList.contains('flipped')));
      });

      if (results[item.id]) markResult(item, -1);

      card.querySelectorAll('.flip-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (results[item.id]) return;
          const k = +btn.dataset.k;
          const correct = k === item.answer;
          results[item.id] = correct ? 'ok' : 'bad';
          markResult(item, k);
          card.classList.add('answered');
          updateScore();
          ctx.onAnswer(item, correct, btn);
          setTimeout(() => flip(true), 550);
        });
      });
    });

    updateScore();
    M.typeset(section);
  }

  window.FlipCards = { html, setup };
})();
