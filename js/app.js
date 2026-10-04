/**
 * 일차함수 탐험대 — 메인 앱
 * - 상태는 메모리에만 보관합니다. 새로고침/로그아웃 시 항상 로그인 화면부터, 모든 기록이 초기화됩니다.
 * - 문제 규칙: 첫 시도에 맞히면 도토리 +1 / 틀리면 힌트와 함께 재도전 (재도전 정답은 도토리 없음)
 *              마지막 기회까지 틀리면 정답과 해설 팝업
 */
(() => {
  'use strict';

  const { Math: M, Sound, Toast, Modal, flyAcorn, Confetti } = window.FX;
  const CURR = window.CURRICULUM;
  const CFG = window.APP_CONFIG;
  const PER_STAMP = CFG.ACORNS_PER_STAMP || 10;
  const MAX_ATTEMPTS = CFG.MAX_ATTEMPTS || 2;
  const LAST_STEP = CURR.length;
  const TOTAL_Q = CURR.reduce((n, s) => n + s.questions.length, 0);
  const CARD_TOTAL = CURR.reduce((n, s) => n + (s.cards ? s.cards.items.length : 0), 0);
  const MARKS = '①②③④⑤⑥';
  const $ = (id) => document.getElementById(id);

  const initialState = () => ({
    school: '',
    studentId: '',
    acorns: 0,
    stamps: 0,
    firstCorrect: 0, // 첫 시도 정답 수 (= 지금까지 받은 도토리 수)
    retryCorrect: 0, // 재도전 정답 수
    cardCorrect: 0, // 카드 뒤집기 퀴즈 정답 수
    cards: {}, // cardId -> 'ok' | 'bad'
    doneSteps: [], // 모든 문제를 푼 단계 id 목록 (순서와 상관없이 자유 이동 가능)
    currentStep: 1,
    qIndex: Object.fromEntries(CURR.map((s) => [s.id, 0])),
    results: {}, // qid -> 'first' | 'retry' | 'fail'
    finalShown: false,
  });

  let state = initialState();
  let boards = []; // 현재 화면의 GraphBoard (화면 전환 시 정리)
  let quizBoard = null; // 학생이 점을 찍는 좌표평면
  let quizBoards = []; // 현재 문제에 속한 좌표평면 전부 (문제 그림 포함)

  // 헤더 표시는 도토리 애니메이션이 끝난 뒤 갱신하기 위해 별도로 보관
  const shown = { acorns: 0, stamps: 0 };

  // ════════════════════════ 로그인 / 로그아웃 ════════════════════════
  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const school = $('login-school').value.trim();
    const sid = $('login-id').value.trim();
    const err = $('login-error');
    if (!school) { err.textContent = '학교 이름을 입력해 주세요.'; $('login-school').focus(); return; }
    if (!/^\d{4,6}$/.test(sid)) { err.textContent = '학번은 숫자 4~6자리로 입력해 주세요. (예: 20101)'; $('login-id').focus(); return; }
    err.textContent = '';

    Sound.unlock();
    state = initialState();
    state.school = school;
    state.studentId = sid;
    shown.acorns = 0;
    shown.stamps = 0;

    showScreen('app');
    renderAll();
    window.Sheets.send(state, 'login');
    Toast.show(`👋 ${escapeHtml(school)} ${sid} 학생, 환영해요!`);
  });

  $('logout-btn').addEventListener('click', async () => {
    const ok = await Modal.show({
      icon: '🚪',
      title: '로그아웃할까요?',
      html: '<p>로그아웃하면 <b>학습 진행 상황, 도토리, 칭찬도장이 모두 초기화</b>돼요.<br>다시 로그인하면 1단계부터 새로 시작해요.</p>',
      buttons: [
        { label: '취소', value: false, cls: 'ghost' },
        { label: '로그아웃', value: true, cls: 'danger' },
      ],
    });
    if (!ok) return;
    window.Sheets.send(state, 'logout');
    destroyBoards();
    state = initialState();
    $('login-form').reset();
    $('content').innerHTML = '';
    showScreen('login');
    $('login-school').focus();
  });

  $('sound-btn').addEventListener('click', () => {
    Sound.muted = !Sound.muted;
    $('sound-btn').textContent = Sound.muted ? '🔇' : '🔊';
    $('sound-btn').setAttribute('aria-label', Sound.muted ? '소리 켜기' : '소리 끄기');
  });

  $('acorn-badge').addEventListener('click', showRewardInfo);
  $('stamp-badge').addEventListener('click', showRewardInfo);

  function showScreen(name) {
    $('login-screen').classList.toggle('active', name === 'login');
    $('app-screen').classList.toggle('active', name === 'app');
    window.scrollTo(0, 0);
  }

  // ════════════════════════ 렌더링 ════════════════════════
  function renderAll() {
    renderHeader();
    renderStepper();
    renderStep();
  }

  function renderHeader() {
    $('user-info').textContent = `${state.school} · ${state.studentId}`;
    $('acorn-count').textContent = shown.acorns;
    $('acorn-bar').style.width = `${(shown.acorns / PER_STAMP) * 100}%`;
    $('stamp-count').textContent = shown.stamps;
  }

  function syncShownRewards() {
    shown.acorns = state.acorns;
    shown.stamps = state.stamps;
    renderHeader();
  }

  function renderStepper() {
    const nav = $('stepper');
    nav.innerHTML = CURR.map((s) => {
      const done = state.doneSteps.includes(s.id);
      const solved = state.qIndex[s.id];
      const partial = !done && solved > 0;
      const cur = s.id === state.currentStep;
      const cls = [done && 'done', partial && 'partial', cur && 'current'].filter(Boolean).join(' ');
      const badge = done ? '✓' : s.id;
      const progress = partial ? ` <em>${solved}/${s.questions.length}</em>` : '';
      return `
        <button type="button" class="step-btn ${cls}" data-step="${s.id}" ${cur ? 'aria-current="step"' : ''}>
          <span class="step-num">${badge}</span>
          <span class="step-name"><small>${s.id}단계${progress}</small>${s.short}</span>
        </button>`;
    }).join('<span class="step-link" aria-hidden="true"></span>');

    nav.querySelectorAll('.step-btn').forEach((b) => {
      b.addEventListener('click', () => goStep(+b.dataset.step));
    });
  }

  /** 어느 단계든 바로 이동 (이전 단계를 끝내지 않아도 됨) */
  function goStep(id) {
    if (id === state.currentStep) return;
    state.currentStep = id;
    renderStepper();
    renderStep();
  }

  const allDone = () => state.doneSteps.length === CURR.length;

  function destroyBoards() {
    boards.forEach((b) => b.destroy());
    boards = [];
    quizBoards = [];
    quizBoard = null;
  }

  const curStep = () => CURR[state.currentStep - 1];

  function renderStep() {
    destroyBoards();
    const step = curStep();
    const main = $('content');
    main.innerHTML = `
      <div class="step-hero theme-${step.id}">
        <div class="hero-text">
          <span class="step-tag">${step.id}단계</span>
          <h2>${step.title}</h2>
          <p>${step.summary}</p>
        </div>
        <div class="hero-emoji" aria-hidden="true">${step.emoji}</div>
      </div>

      <section class="card concept">
        <div class="card-head"><span class="pill lav">📖 개념 설명</span></div>
        ${step.concept}
      </section>

      ${step.lab ? window.Labs.html(step) : ''}

      ${step.cards ? window.FlipCards.html(step, state.cards) : ''}

      <section class="card quiz" id="quiz-area" aria-live="polite"></section>

      <nav class="step-nav" aria-label="단계 이동">
        ${step.id > 1 ? `<button type="button" class="btn ghost" data-go="${step.id - 1}">← ${step.id - 1}단계 ${CURR[step.id - 2].short}</button>` : '<span></span>'}
        ${step.id < LAST_STEP ? `<button type="button" class="btn ghost" data-go="${step.id + 1}">${step.id + 1}단계 ${CURR[step.id].short} →</button>` : ''}
      </nav>`;
    main.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => goStep(+b.dataset.go)));
    M.typeset(main);
    if (step.lab) window.Labs.setup(step, (b) => boards.push(b));
    if (step.cards) {
      window.FlipCards.setup(step, state.cards, { register: (b) => boards.push(b), onAnswer: onCardAnswer });
    }
    renderQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ════════════════════════ 문제 풀이 ════════════════════════
  function dotsHTML(step) {
    const idx = state.qIndex[step.id];
    return step.questions.map((q, i) => {
      const r = state.results[q.id];
      const cls = r ? { first: 'ok', retry: 'retry', fail: 'bad' }[r] : i === idx ? 'now' : '';
      return `<span class="dot ${cls}" title="${i + 1}번"></span>`;
    }).join('');
  }

  function renderQuiz() {
    const step = curStep();
    const area = $('quiz-area');
    quizBoards.forEach((b) => b.destroy());
    boards = boards.filter((b) => !quizBoards.includes(b));
    quizBoards = [];
    quizBoard = null;
    const qs = step.questions;
    const idx = state.qIndex[step.id];
    const label = step.id === LAST_STEP ? '🏔️ 복합 문제' : '📝 확인 문제';

    if (idx >= qs.length) {
      renderSummary(step, area);
      return;
    }

    const q = qs[idx];
    area.innerHTML = `
      <div class="quiz-head">
        <span class="pill peach">${label}</span>
        <span class="q-count">${idx + 1} / ${qs.length}</span>
        <span class="tries" id="tries">${triesHTML(1)}</span>
        <div class="dots">${dotsHTML(step)}</div>
      </div>
      <div class="q-body">
        <p class="q-text"><span class="q-num">Q${idx + 1}</span>${q.text}</p>
        ${q.figure ? '<div class="board-wrap figure-board"><canvas id="fig-board" aria-label="문제의 일차함수 그래프"></canvas></div>' : ''}
        ${q.note ? `<p class="q-hint">✍️ ${q.note}</p>` : ''}
        ${answerUI(q)}
      </div>
      <div class="feedback" id="feedback" hidden></div>
      <div class="q-actions" id="q-actions">
        ${q.type === 'graph' ? '<button type="button" class="btn ghost" id="reset-btn">↺ 다시 찍기</button>' : ''}
        <button type="button" class="btn primary" id="submit-btn">제출하기</button>
      </div>`;
    M.typeset(area);
    bindQuestion(q);
  }

  /** 남은 기회 표시 (하트) */
  function triesHTML(attempt) {
    const left = MAX_ATTEMPTS - attempt + 1;
    return `<span class="sr-only">남은 기회 ${left}번</span>` +
      Array.from({ length: MAX_ATTEMPTS }, (_, i) => `<i class="${i < left ? 'on' : ''}" aria-hidden="true">♥</i>`).join('');
  }

  function answerUI(q) {
    switch (q.type) {
      case 'mc':
        return `<div class="options ${q.options.length > 4 ? 'one-col' : ''}" role="radiogroup">
          ${q.options.map((o, i) => `
            <button type="button" class="option" role="radio" aria-checked="false" data-i="${i}">
              <span class="opt-mark">${MARKS[i]}</span><span class="opt-text">${o}</span>
            </button>`).join('')}
        </div>`;
      case 'short':
        return `<div class="short-row">
          <label class="sr-only" for="ans-0">정답 입력</label>
          <input class="answer-input" id="ans-0" type="text" autocomplete="off" placeholder="정답 입력">
          ${q.unit ? `<span class="unit">${q.unit}</span>` : ''}
        </div>`;
      case 'ab':
        return `<div class="ab-row">
          <span class="ab-y">$y =$</span>
          <input class="answer-input small" id="ans-0" type="text" autocomplete="off" placeholder="a" aria-label="a 값">
          <span>$x \\;+$</span>
          <input class="answer-input small" id="ans-1" type="text" autocomplete="off" placeholder="b" aria-label="b 값">
        </div>
        <p class="q-hint">✍️ $b$가 음수이면 <b>-3</b>처럼 부호를 붙여 입력해요. 분수는 <b>1/2</b>처럼 입력해요.</p>`;
      case 'multi':
        return `<div class="multi-row">
          ${q.fields.map((f, i) => `
            <label class="multi-field">
              <span>${f.label}</span>
              <input class="answer-input small" id="ans-${i}" type="text" autocomplete="off" placeholder="?">
            </label>`).join('')}
        </div>`;
      case 'graph':
        return `<div class="board-wrap quiz-board"><canvas id="quiz-board" aria-label="그래프 그리기 좌표평면"></canvas></div>
          <p class="board-status" id="board-status">좌표평면을 눌러 첫 번째 점을 찍어 보세요. (0/2)</p>`;
      default:
        return '';
    }
  }

  /** 문제 유형별 정답 목록 (입력칸 순서대로) */
  function expectedValues(q) {
    if (q.type === 'short') return [q.answer];
    if (q.type === 'ab') return [q.a, q.b];
    if (q.type === 'multi') return q.fields.map((f) => f.answer);
    return [];
  }

  function bindQuestion(q) {
    const submit = $('submit-btn');
    const ctx = { attempt: 1, selected: -1 };

    if (q.type === 'mc') {
      document.querySelectorAll('.option').forEach((b) => {
        b.addEventListener('click', () => {
          if (b.disabled) return;
          ctx.selected = +b.dataset.i;
          document.querySelectorAll('.option').forEach((o) => {
            const on = o === b;
            o.classList.toggle('selected', on);
            o.setAttribute('aria-checked', on);
          });
          Sound.pop();
        });
      });
    }

    if (q.figure) {
      // 문제 그림: 그래프와 두 축과의 교점을 표시 (눈금을 읽어서 절편을 맞히는 문제)
      const { a, b } = q.figure;
      const fig = new window.GraphBoard($('fig-board'), { interactive: false, maxSize: 400 });
      fig.fixedLine = { a, b };
      fig.markers = [{ x: 0, y: b, color: '#3DBE84' }, { x: -b / a, y: 0, color: '#FF9F6B' }];
      fig.draw();
      boards.push(fig);
      quizBoards.push(fig);
    }

    if (q.type === 'graph') {
      quizBoard = new window.GraphBoard($('quiz-board'), {
        interactive: true,
        onChange: (pts) => {
          const st = $('board-status');
          if (!st) return;
          if (pts.length === 0) st.textContent = '좌표평면을 눌러 첫 번째 점을 찍어 보세요. (0/2)';
          else if (pts.length === 1) st.textContent = `첫 번째 점 (${pts[0].x}, ${pts[0].y}) — 두 번째 점을 찍어 보세요. (1/2)`;
          else st.textContent = `(${pts[0].x}, ${pts[0].y}), (${pts[1].x}, ${pts[1].y}) 를 지나는 직선 완성! 맞으면 제출하세요. (2/2)`;
        },
        onFull: () => Toast.show('점은 2개까지! 점을 드래그해서 옮기거나 [다시 찍기]를 눌러요.', 'warn'),
      });
      boards.push(quizBoard);
      quizBoards.push(quizBoard);
      $('reset-btn').addEventListener('click', () => quizBoard && quizBoard.reset());
    }

    document.querySelectorAll('.answer-input').forEach((inp) => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); submit.click(); }
      });
      inp.addEventListener('input', () => inp.classList.remove('is-bad'));
    });
    const first = document.querySelector('.answer-input');
    if (first && window.matchMedia('(pointer: fine)').matches) first.focus({ preventScroll: true });

    submit.addEventListener('click', () => {
      const correct = evaluate(q, ctx);
      if (correct === null) return; // 입력 부족
      if (correct) {
        resolve(q, ctx.attempt === 1 ? 'first' : 'retry', submit);
      } else if (ctx.attempt < MAX_ATTEMPTS) {
        ctx.attempt += 1;
        showHint(q, ctx.attempt);
      } else {
        resolve(q, 'fail', submit);
      }
    });
  }

  /** 채점: true / false, 입력이 부족하면 null */
  function evaluate(q, ctx) {
    switch (q.type) {
      case 'mc': {
        if (ctx.selected < 0) { Toast.show('답을 하나 골라 주세요!', 'warn'); return null; }
        const opt = document.querySelector(`.option[data-i="${ctx.selected}"]`);
        opt.classList.remove('selected');
        if (ctx.selected === q.answer) {
          opt.classList.add('is-ok');
          return true;
        }
        // 틀린 보기는 다시 고를 수 없게
        opt.classList.add('is-bad');
        opt.disabled = true;
        opt.setAttribute('aria-checked', 'false');
        ctx.selected = -1;
        return false;
      }
      case 'short':
      case 'ab':
      case 'multi': {
        const expected = expectedValues(q);
        const inputs = expected.map((_, i) => $(`ans-${i}`));
        const values = inputs.map((inp) => parseNum(inp.value));
        const emptyIdx = values.findIndex((v) => Number.isNaN(v));
        if (emptyIdx >= 0) {
          Toast.show(inputs.length > 1 ? '모든 칸을 숫자로 입력해 주세요! (예: -4, 1/2)' : '숫자로 답을 입력해 주세요! (예: -4, 1/2)', 'warn');
          inputs[emptyIdx].focus();
          return null;
        }
        let all = true;
        inputs.forEach((inp, i) => {
          const ok = near(values[i], expected[i]);
          inp.classList.remove('is-ok', 'is-bad');
          void inp.offsetWidth; // 흔들림 애니메이션 재시작
          inp.classList.add(ok ? 'is-ok' : 'is-bad');
          if (!ok) all = false;
        });
        if (!all) {
          const bad = inputs.find((inp) => inp.classList.contains('is-bad'));
          if (bad) { bad.focus({ preventScroll: true }); bad.select(); }
        }
        return all;
      }
      case 'graph': {
        const pts = quizBoard.points;
        if (pts.length < 2) { Toast.show('점 두 개를 찍어서 직선을 그려 주세요!', 'warn'); return null; }
        // strict: 정해진 두 점(예: 두 절편)을 정확히 찍어야 정답
        if (q.strict) return q.points.every(([x, y]) => pts.some((p) => p.x === x && p.y === y));
        return pts.every((p) => near(p.y, q.a * p.x + q.b));
      }
      default:
        return false;
    }
  }

  /** 첫 시도 오답 → 힌트 + 재도전 */
  function showHint(q, attempt) {
    Sound.wrong();
    $('tries').innerHTML = triesHTML(attempt);
    const fb = $('feedback');
    fb.hidden = false;
    fb.className = 'feedback hint';
    fb.innerHTML = `
      <div class="fb-title">💡 힌트를 보고 다시 도전해 보세요!</div>
      <div class="fb-body">${q.hint}</div>
      <p class="note">🔁 재도전 기회가 ${MAX_ATTEMPTS - attempt + 1}번 남았어요. (도토리는 첫 번째 시도에 맞혔을 때만 받을 수 있어요)</p>`;
    M.typeset(fb);
    // 다시 그리기 쉽게 그래프 점 초기화
    if (q.type === 'graph' && quizBoard) quizBoard.reset();
    $('submit-btn').textContent = '다시 제출하기 🔁';
    const area = $('quiz-area');
    area.classList.remove('shake');
    void area.offsetWidth;
    area.classList.add('shake');
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** 문제 최종 처리: status = 'first' | 'retry' | 'fail' */
  function resolve(q, status, submitBtn) {
    const step = curStep();
    document.querySelectorAll('.answer-input').forEach((i) => { i.disabled = true; });
    document.querySelectorAll('.option').forEach((o) => { o.disabled = true; });
    if ($('reset-btn')) $('reset-btn').disabled = true;
    if (quizBoard) {
      quizBoard.locked = true;
      if (status === 'fail') quizBoard.answerPoints = q.points;
      quizBoard.draw();
    }
    if (status === 'fail' && q.type === 'mc') {
      document.querySelector(`.option[data-i="${q.answer}"]`).classList.add('is-ok');
    }

    // ── 상태 갱신 ──
    state.results[q.id] = status;
    state.qIndex[step.id] += 1;
    let converted = false;
    if (status === 'first') {
      state.firstCorrect += 1;
      converted = addAcorn();
    } else if (status === 'retry') {
      state.retryCorrect += 1;
    }
    const stepDone = state.qIndex[step.id] >= step.questions.length;
    if (stepDone && !state.doneSteps.includes(step.id)) state.doneSteps.push(step.id);

    // ── 구글 시트 기록 ──
    window.Sheets.send(state, stepDone ? 'step_complete' : 'answer');

    // ── 화면 갱신 ──
    $('q-actions').innerHTML = `<button type="button" class="btn primary" id="next-btn">${stepDone ? '단계 결과 보기 🎉' : '다음 문제 →'}</button>`;
    $('next-btn').addEventListener('click', () => {
      renderStepper();
      renderQuiz();
      $('quiz-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.querySelector('.dots').innerHTML = dotsHTML(step);
    $('tries').innerHTML = '';

    const fb = $('feedback');
    fb.hidden = false;
    let extra = '';
    if (q.type === 'graph' && status !== 'fail' && q.method === 'intercepts') {
      const usedIntercepts = q.points.every(([x, y]) => quizBoard.points.some((p) => p.x === x && p.y === y));
      if (!usedIntercepts) {
        extra = `<p class="note">👍 직선은 정확해요! 두 절편 $(${q.points[0].join(', ')})$, $(${q.points[1].join(', ')})$을 이용하면 더 쉽게 그릴 수 있어요.</p>`;
      }
    }

    if (status === 'first') {
      Sound.correct();
      if (q.type === 'graph') Confetti.burst(2200);
      fb.className = 'feedback ok';
      fb.innerHTML = `
        <div class="fb-title">🎉 한 번에 정답! <span class="acorn-gain">🌰 +1</span></div>
        <div class="fb-body">${q.explain}</div>${extra}`;
      M.typeset(fb);
      showAcornGain(submitBtn.isConnected ? submitBtn : $('next-btn'), converted);
    } else if (status === 'retry') {
      Sound.correct();
      fb.className = 'feedback retry';
      fb.innerHTML = `
        <div class="fb-title">👏 재도전 성공!</div>
        <div class="fb-body">${q.explain}</div>${extra}
        <p class="note">🌰 도토리는 첫 번째 시도에 맞혔을 때만 받아요. 다음 문제는 한 번에 맞혀 봐요!</p>`;
      M.typeset(fb);
    } else {
      Sound.wrong();
      fb.className = 'feedback bad';
      fb.innerHTML = `<div class="fb-title">🤔 아쉬워요! 정답과 해설을 확인해 봐요.</div><div class="fb-body">${q.explain}</div>`;
      M.typeset(fb);
      Modal.show({
        icon: '🐿️',
        title: '아쉬워요, 정답을 확인해 볼까요?',
        variant: 'wrong',
        html: `
          <div class="answer-box"><span class="ab-label">정답</span>${correctAnswerHTML(q)}</div>
          <div class="explain-box"><span class="ab-label">해설</span><div>${q.explain}</div></div>`,
        buttons: [{ label: '해설 이해했어요 👍', value: true, cls: 'primary' }],
      });
    }
  }

  /** 도토리 +1 (10개가 되면 칭찬도장으로 변환). 변환되었으면 true */
  function addAcorn() {
    state.acorns += 1;
    if (state.acorns >= PER_STAMP) {
      state.acorns -= PER_STAMP;
      state.stamps += 1;
      return true;
    }
    return false;
  }

  /** 도토리가 날아가는 연출 후 헤더 갱신, 필요하면 칭찬도장 축하 */
  function showAcornGain(fromEl, converted) {
    flyAcorn(fromEl, $('acorn-badge'), () => {
      if (converted) {
        shown.acorns = PER_STAMP;
        renderHeader();
        setTimeout(() => {
          syncShownRewards();
          celebrateStamp();
        }, 350);
      } else {
        syncShownRewards();
      }
    });
  }

  /** 🃏 카드 뒤집기 퀴즈 결과 처리: 맞히면 도토리 +1 */
  function onCardAnswer(item, correct, btn) {
    if (correct) {
      state.cardCorrect += 1;
      Sound.correct();
      showAcornGain(btn, addAcorn());
    } else {
      Sound.wrong();
    }
    window.Sheets.send(state, 'card');
  }

  function correctAnswerHTML(q) {
    switch (q.type) {
      case 'mc': return `${MARKS[q.answer]} ${q.options[q.answer]}`;
      case 'short': return q.answerText;
      case 'ab': return `${q.answerText} &nbsp;<small>($a = ${M.num(q.a)}$, $b = ${M.num(q.b)}$)</small>`;
      case 'multi': return q.fields.map((f) => `${f.label} $= ${M.num(f.answer)}$`).join(', &nbsp;');
      case 'graph': return `두 점 $(${q.points[0].join(', ')})$, $(${q.points[1].join(', ')})$ 을 지나는 직선`;
      default: return '';
    }
  }

  function celebrateStamp() {
    Sound.stamp();
    Modal.show({
      variant: 'stamp-modal',
      title: '칭찬도장 획득!',
      html: `
        <div class="stamp-show">
          <div class="acorn-pile" aria-hidden="true">${'🌰'.repeat(PER_STAMP)}</div>
          <div class="stamp big slam" aria-hidden="true"><span>참</span><span>잘했어요</span></div>
        </div>
        <p>도토리 ${PER_STAMP}개가 <b>칭찬도장</b>으로 변신했어요!<br>지금까지 모은 칭찬도장: <b class="hl">${state.stamps}개</b></p>`,
      buttons: [{ label: '야호! 계속하기', value: true, cls: 'primary' }],
    });
  }

  // ════════════════════════ 단계 완료 요약 ════════════════════════
  function renderSummary(step, area) {
    const qs = step.questions;
    const count = (s) => qs.filter((q) => state.results[q.id] === s).length;
    const first = count('first'), retry = count('retry');
    const isFinal = allDone();
    const msg = first === qs.length ? '완벽해요! 모든 문제를 한 번에 맞혔어요 💯'
      : first + retry >= qs.length * 0.7 ? '잘했어요! 틀렸던 문제는 해설을 다시 확인해 봐요.'
      : '괜찮아요! 개념 설명과 실험실을 한 번 더 살펴보면 훨씬 쉬워질 거예요.';
    const icon = { first: '⭕', retry: '🔁', fail: '❌' };
    area.innerHTML = `
      <div class="summary">
        <div class="summary-emoji">${isFinal ? '🏆' : '🎉'}</div>
        <h3>${step.id}단계 완료!</h3>
        <div class="summary-stats">
          <div><b>${first}</b><span>⭕ 한 번에 정답</span></div>
          <div><b>${retry}</b><span>🔁 재도전 성공</span></div>
          <div><b>${first}</b><span>🌰 획득 도토리</span></div>
        </div>
        <p class="summary-msg">${msg}</p>
        <ul class="review-list">
          ${qs.map((q, i) => {
            const r = state.results[q.id];
            return `<li class="${r}"><span>${icon[r]}</span> Q${i + 1}. ${q.short}</li>`;
          }).join('')}
        </ul>
        <div class="q-actions center">${summaryActions(step)}</div>
      </div>`;

    area.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => goStep(+b.dataset.go)));
    if ($('final-btn')) $('final-btn').addEventListener('click', showFinal);
    if (allDone() && !state.finalShown) {
      state.finalShown = true;
      setTimeout(showFinal, 500);
    }
  }

  /** 단계 완료 후 버튼: 다음 단계 / 아직 남은 단계 / 최종 결과 */
  function summaryActions(step) {
    if (allDone()) return '<button type="button" class="btn primary big" id="final-btn">🏆 최종 결과 보기</button>';
    const next = step.id < LAST_STEP ? step.id + 1 : null;
    const left = CURR.filter((s) => !state.doneSteps.includes(s.id)).map((s) => s.id);
    const target = next && !state.doneSteps.includes(next) ? next : left[0];
    const label = target === next ? `${target}단계로 출발 →` : `남은 ${target}단계 풀러 가기 →`;
    return `<button type="button" class="btn primary big" data-go="${target}">${label}</button>`;
  }

  function showFinal() {
    Sound.fanfare();
    Confetti.burst(3200);
    Modal.show({
      variant: 'final',
      icon: '🏆',
      title: '일차함수 탐험 완료!',
      html: `
        <p><b>${escapeHtml(state.school)} ${state.studentId}</b> 학생, ${LAST_STEP}단계를 모두 마쳤어요!</p>
        <div class="final-stats">
          <div><span class="fs-num">${state.firstCorrect}<small>/${TOTAL_Q}</small></span><span class="fs-label">한 번에 정답</span></div>
          <div><span class="fs-num">${state.retryCorrect}</span><span class="fs-label">재도전 성공</span></div>
          <div><span class="fs-num">${state.stamps}</span><span class="fs-label">칭찬도장</span></div>
          <div><span class="fs-num">${state.acorns}</span><span class="fs-label">남은 도토리</span></div>
        </div>
        <p class="small-note">🃏 카드 뒤집기 퀴즈 정답 <b>${state.cardCorrect}</b> / ${CARD_TOTAL}</p>
        <div class="stamp-board">${stampBoardHTML()}</div>
        <p class="small-note">학습 결과는 선생님께 자동으로 전달돼요 📮</p>`,
      buttons: [{ label: '확인', value: true, cls: 'primary' }],
    });
  }

  function stampBoardHTML() {
    if (!state.stamps) return `<p class="empty">아직 칭찬도장이 없어요. 도토리 ${PER_STAMP}개를 모으면 도장으로 바뀌어요!</p>`;
    return Array.from({ length: state.stamps }, () => '<div class="stamp"><span>참</span><span>잘했어요</span></div>').join('');
  }

  function showRewardInfo() {
    Modal.show({
      icon: '🎒',
      title: '나의 보상 주머니',
      html: `
        <div class="reward-info">
          <div class="ri-row"><span class="ri-ic">🌰</span><span>도토리</span><b>${state.acorns}개</b></div>
          <div class="acorn-progress"><i style="width:${(state.acorns / PER_STAMP) * 100}%"></i></div>
          <p class="small-note">칭찬도장까지 도토리 <b>${PER_STAMP - state.acorns}개</b> 남았어요!</p>
          <div class="ri-row"><span class="ri-ic"><span class="stamp-mini">참</span></span><span>칭찬도장</span><b>${state.stamps}개</b></div>
          <div class="stamp-board">${stampBoardHTML()}</div>
          <ul class="rules">
            <li>문제를 <b>첫 번째 시도</b>에 맞히면 도토리 🌰 1개</li>
            <li>틀리면 💡 힌트와 함께 재도전 기회! (재도전 정답은 도토리 없음)</li>
            <li>🃏 카드 뒤집기 퀴즈를 맞혀도 도토리 1개 (카드마다 한 번만 도전)</li>
            <li>도토리 ${PER_STAMP}개가 모이면 칭찬도장 1개로 자동 변신!</li>
          </ul>
        </div>`,
    });
  }

  // ════════════════════════ 유틸 ════════════════════════
  function parseNum(raw) {
    const s = String(raw).trim().replace(/\s+/g, '').replace(/[−–—]/g, '-');
    if (!s) return NaN;
    const frac = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (frac) {
      const d = parseFloat(frac[2]);
      return d === 0 ? NaN : parseFloat(frac[1]) / d;
    }
    if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }

  function near(a, b) {
    return Math.abs(a - b) < 1e-6;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
})();
