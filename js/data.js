/**
 * 학습 콘텐츠 (중2 일차함수와 그 그래프) — 5단계 × 10문제
 * - 수식은 KaTeX 문법($...$). 백슬래시 문제를 피하려고 String.raw(R``)로 작성합니다.
 * - lab: 개념 설명에 붙는 실험실 종류 (intercepts | slope | twoPoints | shift | area)
 * - 문제 공통 필드
 *   id, type, short(목록용 제목), text, hint(오답 시 보여줄 힌트), explain(해설), note(입력 안내, 선택)
 * - 문제 유형
 *   mc    : 객관식 (options, answer: 정답 인덱스)
 *   short : 단답형 (answer: 숫자, answerText, unit 선택). 분수 '1/2' 입력 허용
 *   ab    : y = ax + b 의 a, b 입력 (a, b, answerText)
 *   multi : 여러 칸 입력 (fields: [{label, answer}])
 *   graph : 좌표평면에 두 점 찍기 (a, b: 목표 직선, points: 모범 답 두 점, method: intercepts|slope|any)
 */
(() => {
  const R = String.raw;

  window.CURRICULUM = [
    // ═════════════════════════════ 1단계: 절편 ═════════════════════════════
    {
      id: 1,
      title: '일차함수의 뜻과 절편',
      short: '절편',
      emoji: '🌱',
      summary: '일차함수가 무엇인지 알아보고, 그래프가 축과 만나는 점을 찾아봐요.',
      concept: R`
        <h3>📘 일차함수란?</h3>
        <p>함수 $y = f(x)$에서 $y$가 $x$에 대한 일차식</p>
        <div class="formula-box">$y = ax + b$ <small>($a$, $b$는 상수, $a \neq 0$)</small></div>
        <p>로 나타내어질 때, 이 함수를 <b>$x$에 대한 일차함수</b>라고 해요.</p>
        <div class="chip-row">
          <span class="chip ok">$y = 2x + 1$ ⭕</span>
          <span class="chip ok">$y = -\frac{1}{3}x$ ⭕</span>
          <span class="chip no">$y = 5$ ❌</span>
          <span class="chip no">$y = x^2 - 1$ ❌</span>
          <span class="chip no">$y = \frac{2}{x}$ ❌</span>
        </div>

        <h3>🖼️ 그림으로 보는 절편</h3>
        <figure class="concept-fig">
          <svg viewBox="0 0 320 240" role="img" aria-label="y = x + 2 의 그래프와 x절편, y절편">
            <g stroke="#F1EDF9" stroke-width="1">
              <path d="M40 8V232M70 8V232M100 8V232M130 8V232M190 8V232M220 8V232M250 8V232M280 8V232M310 8V232"/>
              <path d="M10 20H312M10 50H312M10 80H312M10 110H312M10 170H312M10 200H312M10 230H312"/>
            </g>
            <g stroke="#5E5873" stroke-width="1.6" fill="#5E5873">
              <path d="M10 140H306"/><path d="M314 140l-9-4.5v9z"/>
              <path d="M160 234V14"/><path d="M160 6l-4.5 9h9z"/>
            </g>
            <g font-family="Noto Sans KR, sans-serif" font-size="13" font-style="italic" fill="#5E5873">
              <text x="304" y="132">x</text><text x="168" y="16">y</text><text x="146" y="156">O</text>
            </g>
            <g font-family="Noto Sans KR, sans-serif" font-size="11" fill="#8A84A0">
              <text x="94" y="156">−2</text><text x="148" y="84">2</text>
            </g>
            <path d="M160 140V80" stroke="#3DBE84" stroke-width="3" stroke-dasharray="5 4"/>
            <path d="M160 140H100" stroke="#FF9F6B" stroke-width="3" stroke-dasharray="5 4"/>
            <line x1="30" y1="210" x2="240" y2="0" stroke="#8C7BEA" stroke-width="3.5" stroke-linecap="round"/>
            <text x="222" y="34" font-family="Noto Sans KR, sans-serif" font-size="13" font-weight="700" fill="#8C7BEA">y = x + 2</text>
            <circle cx="160" cy="80" r="7" fill="#3DBE84" stroke="#fff" stroke-width="2.5"/>
            <circle cx="100" cy="140" r="7" fill="#FF9F6B" stroke="#fff" stroke-width="2.5"/>
            <g font-family="Noto Sans KR, sans-serif">
              <path d="M136 58L153 74" stroke="#3DBE84" stroke-width="1.5"/>
              <rect x="12" y="34" width="124" height="46" rx="10" fill="#fff" stroke="#3DBE84" stroke-width="1.5"/>
              <text x="22" y="53" font-size="13" font-weight="700" fill="#24895C">y절편 = 2</text>
              <text x="22" y="71" font-size="11" fill="#5E5873">점 (0, 2) · x = 0인 점</text>
              <path d="M128 164L106 147" stroke="#FF9F6B" stroke-width="1.5"/>
              <rect x="118" y="164" width="140" height="46" rx="10" fill="#fff" stroke="#FF9F6B" stroke-width="1.5"/>
              <text x="128" y="183" font-size="13" font-weight="700" fill="#C2622F">x절편 = −2</text>
              <text x="128" y="201" font-size="11" fill="#5E5873">점 (−2, 0) · y = 0인 점</text>
            </g>
          </svg>
          <figcaption>
            <span><i class="dot-ic g"></i> 그래프가 <b>$y$축</b>과 만나는 점 → $y$절편</span>
            <span><i class="dot-ic o"></i> 그래프가 <b>$x$축</b>과 만나는 점 → $x$절편</span>
          </figcaption>
        </figure>

        <div class="concept-grid">
          <div class="mini-card mint">
            <h4>📍 $y$절편</h4>
            <p>그래프가 <b>$y$축과 만나는 점의 $y$좌표</b></p>
            <p class="how">➡ $x = 0$을 대입! &nbsp; $y = b$</p>
            <p class="small">$y$축 위의 점은 항상 $(0,\ \square)$ 꼴</p>
          </div>
          <div class="mini-card peach">
            <h4>📍 $x$절편</h4>
            <p>그래프가 <b>$x$축과 만나는 점의 $x$좌표</b></p>
            <p class="how">➡ $y = 0$을 대입! &nbsp; $x = -\frac{b}{a}$</p>
            <p class="small">$x$축 위의 점은 항상 $(\square,\ 0)$ 꼴</p>
          </div>
        </div>

        <div class="tip">
          <b>예시</b> &nbsp; $y = 3x + 6$ 에서<br>
          · $y$절편: $x=0$ 대입 → $y = 6$ → 점 $(0,\ 6)$<br>
          · $x$절편: $y=0$ 대입 → $0 = 3x + 6$ → $x = -2$ → 점 $(-2,\ 0)$
        </div>`,
      lab: { type: 'intercepts', a: 2, b: -4 },
      // 🃏 카드 뒤집기 퀴즈: 그래프를 보고 두 절편 고르기 (options: [x절편, y절편])
      cards: {
        type: 'intercept',
        items: [
          { id: 'c1-1', a: 2, b: 4, options: [[-2, 4], [4, -2], [2, 4]], answer: 0 },
          { id: 'c1-2', a: -1, b: 3, options: [[-3, 3], [3, 3], [3, -3]], answer: 1 },
          { id: 'c1-3', a: 0.5, b: -2, options: [[-2, 4], [-4, -2], [4, -2]], answer: 2 },
          { id: 'c1-4', a: -1.5, b: -3, options: [[-2, -3], [2, -3], [-3, -2]], answer: 0 },
        ],
      },
      questions: [
        {
          id: 'q1-1', type: 'mc', short: '일차함수 찾기',
          text: R`다음 중 $y$가 $x$에 대한 <b>일차함수</b>인 것은?`,
          options: [R`$y = 5$`, R`$y = x^2 + 1$`, R`$y = -2x + 5$`, R`$y = \frac{1}{x} + 2$`],
          answer: 2,
          hint: R`$y = ax + b$ 꼴이고 $a \neq 0$인지 확인해요. $x$가 분모에 있거나 제곱이면 일차함수가 아니에요!`,
          explain: R`$y = ax + b$ ($a \neq 0$) 꼴인 것은 $y = -2x + 5$ 뿐이에요.<br>
            $y = 5$는 $x$항이 없고, $y = x^2+1$은 이차식, $y = \frac{1}{x}+2$는 $x$가 분모에 있어요.`,
        },
        {
          id: 'q1-2', type: 'short', short: 'y = 2x − 4의 y절편',
          text: R`일차함수 $y = 2x - 4$의 그래프의 <b>$y$절편</b>을 구하세요.`,
          answer: -4, answerText: R`$-4$`,
          hint: R`$y$절편은 그래프가 $y$축과 만나는 점이에요. $y$축 위의 점은 $x = 0$이죠!`,
          explain: R`$x = 0$을 대입하면 $y = 2 \times 0 - 4 = -4$ 이므로 $y$절편은 $-4$예요.`,
        },
        {
          id: 'q1-3', type: 'short', short: 'y = 2x − 4의 x절편',
          text: R`일차함수 $y = 2x - 4$의 그래프의 <b>$x$절편</b>을 구하세요.`,
          answer: 2, answerText: R`$2$`,
          hint: R`$x$절편을 구하려면 $y = 0$을 대입해요. $0 = 2x - 4$를 풀어 보세요.`,
          explain: R`$0 = 2x - 4$ → $2x = 4$ → $x = 2$ 이므로 $x$절편은 $2$예요.`,
        },
        {
          id: 'q1-4', type: 'mc', short: 'y = −3x + 6의 두 절편',
          text: R`일차함수 $y = -3x + 6$의 그래프의 $x$절편과 $y$절편을 바르게 짝지은 것은?`,
          options: [
            R`$x$절편: $2$, &nbsp;$y$절편: $6$`,
            R`$x$절편: $6$, &nbsp;$y$절편: $2$`,
            R`$x$절편: $-2$, &nbsp;$y$절편: $6$`,
            R`$x$절편: $2$, &nbsp;$y$절편: $-6$`,
          ],
          answer: 0,
          hint: R`$x = 0$을 대입하면 $y$절편, $y = 0$을 대입하면 $x$절편이에요.`,
          explain: R`$y$절편: $x=0$ 대입 → $y = 6$<br>$x$절편: $y=0$ 대입 → $0 = -3x + 6$ → $x = 2$`,
        },
        {
          id: 'q1-5', type: 'multi', short: '그래프 보고 절편 읽기 ①',
          text: R`아래 좌표평면에 그려진 일차함수의 그래프를 보고 $x$절편과 $y$절편을 각각 구하세요.`,
          figure: { a: -0.5, b: 2 },
          fields: [{ label: R`$x$절편`, answer: 4 }, { label: R`$y$절편`, answer: 2 }],
          hint: R`그래프가 <b>$x$축과 만나는 점</b>의 $x$좌표가 $x$절편, <b>$y$축과 만나는 점</b>의 $y$좌표가 $y$절편이에요. 점이 찍힌 곳의 눈금을 읽어 보세요.`,
          explain: R`그래프가 $x$축과 점 $(4,\ 0)$에서, $y$축과 점 $(0,\ 2)$에서 만나요.<br>따라서 $x$절편은 $4$, $y$절편은 $2$예요.`,
        },
        {
          id: 'q1-6', type: 'short', short: 'y = 4x + 8의 x절편',
          text: R`일차함수 $y = 4x + 8$의 그래프의 <b>$x$절편</b>을 구하세요.`,
          answer: -2, answerText: R`$-2$`,
          hint: R`$y = 0$을 대입해서 $0 = 4x + 8$을 풀어요. 이항할 때 부호에 주의!`,
          explain: R`$0 = 4x + 8$ → $4x = -8$ → $x = -2$`,
        },
        {
          id: 'q1-7', type: 'graph', short: '절편을 좌표평면에 찍기', strict: true,
          text: R`일차함수 $y = -x + 3$의 그래프의 <b>$x$절편과 $y$절편을 나타내는 두 점</b>을 좌표평면에 찍어 보세요.`,
          note: '좌표평면을 눌러 점을 찍고, 찍은 점은 드래그해서 옮길 수 있어요.',
          a: -1, b: 3, points: [[3, 0], [0, 3]],
          hint: R`$x$절편을 나타내는 점은 $x$축 위에 $(\square,\ 0)$, $y$절편을 나타내는 점은 $y$축 위에 $(0,\ \square)$ 꼴로 찍혀야 해요.`,
          explain: R`$y$절편: $x = 0$ → $y = 3$ → 점 $(0,\ 3)$<br>$x$절편: $0 = -x + 3$ → $x = 3$ → 점 $(3,\ 0)$`,
        },
        {
          id: 'q1-8', type: 'multi', short: '그래프 보고 절편 읽기 ②',
          text: R`아래 좌표평면에 그려진 일차함수의 그래프를 보고 $x$절편과 $y$절편을 각각 구하세요.`,
          figure: { a: 1.5, b: -3 },
          fields: [{ label: R`$x$절편`, answer: 2 }, { label: R`$y$절편`, answer: -3 }],
          hint: R`$y$축과 만나는 점이 원점보다 <b>아래</b>에 있으면 $y$절편은 음수예요.`,
          explain: R`그래프가 $x$축과 점 $(2,\ 0)$에서, $y$축과 점 $(0,\ -3)$에서 만나요.<br>따라서 $x$절편은 $2$, $y$절편은 $-3$이에요.`,
        },
        {
          id: 'q1-9', type: 'mc', short: 'y축과 만나는 점의 좌표',
          text: R`일차함수 $y = 3x - 5$의 그래프가 <b>$y$축과 만나는 점의 좌표</b>는?`,
          options: [R`$(0,\ -5)$`, R`$(-5,\ 0)$`, R`$(0,\ 3)$`, R`$\left(\frac{5}{3},\ 0\right)$`],
          answer: 0,
          hint: R`$y$축 위에 있는 점은 $x$좌표가 항상 $0$이에요.`,
          explain: R`$x = 0$을 대입하면 $y = -5$ 이므로 점 $(0,\ -5)$에서 만나요.<br>$\left(\frac{5}{3},\ 0\right)$은 $x$축과 만나는 점이에요.`,
        },
        {
          id: 'q1-10', type: 'short', short: 'x절편으로 a 구하기',
          text: R`일차함수 $y = ax + 6$의 그래프의 $x$절편이 $3$일 때, 상수 $a$의 값을 구하세요.`,
          answer: -2, answerText: R`$-2$`,
          hint: R`$x$절편이 $3$이면 그래프는 점 $(3,\ 0)$을 지나요. 식에 $x = 3$, $y = 0$을 대입해 보세요.`,
          explain: R`점 $(3,\ 0)$을 대입하면 $0 = 3a + 6$ → $3a = -6$ → $a = -2$`,
        },
      ],
    },

    // ═════════════════════════════ 2단계: 기울기 ═════════════════════════════
    {
      id: 2,
      title: '기울기의 개념',
      short: '기울기',
      emoji: '⛰️',
      summary: '그래프가 얼마나 기울어져 있는지 수로 나타내 봐요.',
      concept: R`
        <h3>📐 기울기란?</h3>
        <p>일차함수 $y = ax + b$에서 $x$의 값의 증가량에 대한 $y$의 값의 증가량의 비율은 항상 일정하고, 그 값은 $a$와 같아요. 이것을 <b>기울기</b>라고 해요.</p>
        <div class="formula-box">$(\text{기울기}) = \dfrac{(y\text{의 값의 증가량})}{(x\text{의 값의 증가량})} = a$</div>

        <h3>✌️ 두 점이 주어지면?</h3>
        <p>두 점 $(x_1, y_1)$, $(x_2, y_2)$를 지나는 직선의 기울기는</p>
        <div class="formula-box">$\dfrac{y_2 - y_1}{x_2 - x_1}$ <small>(단, $x_1 \neq x_2$)</small></div>

        <div class="concept-grid">
          <div class="mini-card mint">
            <h4>↗ $a > 0$</h4>
            <p>오른쪽 <b>위</b>로 향하는 직선<br>($x$가 증가하면 $y$도 증가)</p>
          </div>
          <div class="mini-card pink">
            <h4>↘ $a < 0$</h4>
            <p>오른쪽 <b>아래</b>로 향하는 직선<br>($x$가 증가하면 $y$는 감소)</p>
          </div>
        </div>
        <div class="tip">
          💡 $|a|$가 클수록 그래프는 <b>가파르고</b> $y$축에 가까워져요.<br>
          💡 $(y\text{의 값의 증가량}) = (\text{기울기}) \times (x\text{의 값의 증가량})$
        </div>`,
      lab: { type: 'slope', a: 1.5, b: -1 },
      // 🃏 카드 뒤집기 퀴즈: 두 점을 지나는 그래프를 보고 기울기 고르기
      cards: {
        type: 'slope',
        items: [
          { id: 'c2-1', points: [[-2, -3], [2, 5]], options: [2, -2, 0.5], answer: 0 },
          { id: 'c2-2', points: [[0, 3], [3, 0]], options: [1, 3, -1], answer: 2 },
          { id: 'c2-3', points: [[-4, -1], [2, 2]], options: [2, 0.5, -0.5], answer: 1 },
          { id: 'c2-4', points: [[-1, 4], [1, -2]], options: [3, -3, -1 / 3], answer: 1 },
        ],
      },
      questions: [
        {
          id: 'q2-1', type: 'short', short: '(1, 2), (3, 8)의 기울기',
          text: R`두 점 $(1,\ 2)$, $(3,\ 8)$을 지나는 직선의 <b>기울기</b>를 구하세요.`,
          answer: 3, answerText: R`$3$`,
          hint: R`기울기 $= \dfrac{y_2 - y_1}{x_2 - x_1}$ 에 두 점의 좌표를 넣어 보세요.`,
          explain: R`$\dfrac{8 - 2}{3 - 1} = \dfrac{6}{2} = 3$`,
        },
        {
          id: 'q2-2', type: 'short', short: '(−2, 5), (2, −3)의 기울기',
          text: R`두 점 $(-2,\ 5)$, $(2,\ -3)$을 지나는 직선의 <b>기울기</b>를 구하세요.`,
          answer: -2, answerText: R`$-2$`,
          hint: R`$x$의 증가량은 $2 - (-2)$, $y$의 증가량은 $-3 - 5$예요. 음수 계산에 주의!`,
          explain: R`$\dfrac{-3 - 5}{2 - (-2)} = \dfrac{-8}{4} = -2$`,
        },
        {
          id: 'q2-3', type: 'mc', short: '증가량으로 기울기 구하기',
          text: R`일차함수 $y = ax + b$에서 $x$의 값이 $2$만큼 증가할 때, $y$의 값은 $6$만큼 <b>감소</b>한다. 상수 $a$의 값은?`,
          options: [R`$3$`, R`$-3$`, R`$\frac{1}{3}$`, R`$-\frac{1}{3}$`],
          answer: 1,
          hint: R`"감소"는 증가량이 음수라는 뜻이에요. 기울기 $= \dfrac{(y\text{의 증가량})}{(x\text{의 증가량})}$`,
          explain: R`$y$의 값이 $6$만큼 감소 → 증가량은 $-6$<br>$a = \dfrac{-6}{2} = -3$`,
        },
        {
          id: 'q2-4', type: 'short', short: '(0, 1), (4, 3)의 기울기',
          text: R`두 점 $(0,\ 1)$, $(4,\ 3)$을 지나는 직선의 <b>기울기</b>를 구하세요.`,
          note: '분수는 1/2 처럼 입력해요.',
          answer: 0.5, answerText: R`$\frac{1}{2}$`,
          hint: R`$\dfrac{3-1}{4-0}$을 계산하고 약분해 보세요.`,
          explain: R`$\dfrac{3 - 1}{4 - 0} = \dfrac{2}{4} = \dfrac{1}{2}$`,
        },
        {
          id: 'q2-5', type: 'mc', short: '가장 가파른 직선 찾기',
          text: R`다음 일차함수의 그래프 중 <b>오른쪽 아래로 향하면서 가장 가파른</b> 것은?`,
          options: [R`$y = -x + 1$`, R`$y = 3x$`, R`$y = -4x + 2$`, R`$y = -\frac{1}{2}x$`],
          answer: 2,
          hint: R`오른쪽 아래로 향하려면 $a < 0$, 가장 가파르려면 $|a|$가 가장 커야 해요.`,
          explain: R`기울기가 음수인 것 중 $|a|$가 가장 큰 것은 $|-4| = 4$인 $y = -4x + 2$예요.`,
        },
        {
          id: 'q2-6', type: 'short', short: 'y의 값의 증가량 ①',
          text: R`일차함수 $y = -3x + 1$에서 $x$의 값이 $4$만큼 증가할 때, $y$의 값의 증가량을 구하세요.`,
          answer: -12, answerText: R`$-12$`,
          hint: R`$(y\text{의 증가량}) = (\text{기울기}) \times (x\text{의 증가량})$ 이에요.`,
          explain: R`$(-3) \times 4 = -12$ 이므로 $y$의 값은 $12$만큼 감소해요. (증가량 $-12$)`,
        },
        {
          id: 'q2-7', type: 'short', short: 'y의 값의 증가량 ②',
          text: R`일차함수 $y = \frac{2}{3}x + 1$에서 $x$의 값이 $6$만큼 증가할 때, $y$의 값의 증가량을 구하세요.`,
          answer: 4, answerText: R`$4$`,
          hint: R`기울기 $\frac{2}{3}$에 $x$의 증가량 $6$을 곱해 보세요.`,
          explain: R`$\frac{2}{3} \times 6 = 4$`,
        },
        {
          id: 'q2-8', type: 'mc', short: 'y = −2x + 3의 성질',
          text: R`일차함수 $y = -2x + 3$의 그래프에 대한 설명으로 <b>옳은</b> 것은?`,
          options: [
            '오른쪽 위로 향하는 직선이다.',
            R`$x$의 값이 $1$만큼 증가하면 $y$의 값은 $2$만큼 감소한다.`,
            R`$y$절편은 $-2$이다.`,
            R`점 $(1,\ 2)$를 지난다.`,
          ],
          answer: 1,
          hint: R`기울기가 $-2$라는 것은 $x$가 $1$ 증가할 때 $y$가 어떻게 변한다는 뜻일까요? 점은 직접 대입해 확인해요.`,
          explain: R`① 기울기가 음수 → 오른쪽 아래로 향해요.<br>③ $y$절편은 $3$이에요.<br>④ $x = 1$을 대입하면 $y = 1$ 이므로 점 $(1,\ 1)$을 지나요.`,
        },
        {
          id: 'q2-9', type: 'short', short: '기울기로 k 구하기',
          text: R`두 점 $(1,\ k)$, $(3,\ 7)$을 지나는 직선의 기울기가 $2$일 때, $k$의 값을 구하세요.`,
          answer: 3, answerText: R`$3$`,
          hint: R`기울기 공식에 두 점을 넣어 식을 세우고, 그 값이 $2$가 되도록 해요.`,
          explain: R`$\dfrac{7 - k}{3 - 1} = 2$ → $7 - k = 4$ → $k = 3$`,
        },
        {
          id: 'q2-10', type: 'short', short: '두 절편으로 기울기',
          text: R`$x$절편이 $-2$, $y$절편이 $4$인 직선의 <b>기울기</b>를 구하세요.`,
          answer: 2, answerText: R`$2$`,
          hint: R`$x$절편 $-2$ → 점 $(-2,\ 0)$, $y$절편 $4$ → 점 $(0,\ 4)$. 두 점으로 기울기를 구해요.`,
          explain: R`$\dfrac{4 - 0}{0 - (-2)} = \dfrac{4}{2} = 2$`,
        },
      ],
    },

    // ═════════════════════════════ 3단계: 함수식 ═════════════════════════════
    {
      id: 3,
      title: '일차함수 식 세우기',
      short: '함수식',
      emoji: '🧩',
      summary: '주어진 조건으로 y = ax + b의 a와 b를 찾아 식을 완성해요.',
      concept: R`
        <h3>🧩 세 가지 경우를 기억해요</h3>
        <div class="case">
          <div class="case-num">1</div>
          <div>
            <h4>기울기 $a$와 $y$절편 $b$가 주어질 때</h4>
            <p>바로 $y = ax + b$ 로 써요.</p>
            <p class="ex">예) 기울기 $2$, $y$절편 $3$ → $y = 2x + 3$</p>
          </div>
        </div>
        <div class="case">
          <div class="case-num">2</div>
          <div>
            <h4>기울기 $a$와 한 점 $(x_1, y_1)$이 주어질 때</h4>
            <p>$y = ax + b$에 점의 좌표를 대입해서 $b$를 구해요.</p>
            <p class="ex">예) 기울기 $3$, 점 $(1, 5)$ → $5 = 3 \times 1 + b$ → $b = 2$ → $y = 3x + 2$</p>
          </div>
        </div>
        <div class="case">
          <div class="case-num">3</div>
          <div>
            <h4>서로 다른 두 점이 주어질 때</h4>
            <p>① 두 점으로 <b>기울기</b>를 먼저 구하고 → ② 한 점을 대입해서 $b$를 구해요.</p>
            <p class="ex">예) $(1, 3)$, $(3, 7)$ → $a = \frac{7-3}{3-1} = 2$ → $3 = 2 + b$ → $b = 1$ → $y = 2x + 1$</p>
          </div>
        </div>
        <div class="tip">💡 $x$절편 $m$과 $y$절편 $n$이 주어지면? 두 점 $(m, 0)$, $(0, n)$을 지나는 직선이에요!</div>`,
      lab: { type: 'twoPoints', points: [[-2, -1], [2, 3]] },
      // 🃏 카드 뒤집기 퀴즈: 그래프를 보고 알맞은 함수식 고르기 (options: [a, b])
      cards: {
        type: 'equation',
        items: [
          { id: 'c3-1', points: [[0, -3], [2, 1]], options: [[2, -3], [-2, -3], [2, 3]], answer: 0 },
          { id: 'c3-2', points: [[0, 4], [4, 0]], options: [[1, 4], [-1, 4], [-1, -4]], answer: 1 },
          { id: 'c3-3', points: [[0, 1], [4, 3]], options: [[2, 1], [0.5, -1], [0.5, 1]], answer: 2 },
          { id: 'c3-4', points: [[0, 2], [2, -1]], options: [[-1.5, 2], [-2 / 3, 2], [1.5, 2]], answer: 0 },
        ],
      },
      questions: [
        {
          id: 'q3-1', type: 'ab', short: '기울기 4, y절편 −1',
          text: R`기울기가 $4$이고 $y$절편이 $-1$인 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: 4, b: -1, answerText: R`$y = 4x - 1$`,
          hint: R`$y = ax + b$에서 $a$는 기울기, $b$는 $y$절편이에요. 그대로 넣어 보세요.`,
          explain: R`기울기 $a = 4$, $y$절편 $b = -1$ → $y = 4x - 1$`,
        },
        {
          id: 'q3-2', type: 'ab', short: '기울기 −2, 점 (1, 3)',
          text: R`기울기가 $-2$이고 점 $(1,\ 3)$을 지나는 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: -2, b: 5, answerText: R`$y = -2x + 5$`,
          hint: R`$y = -2x + b$에 $x = 1$, $y = 3$을 대입해서 $b$를 구해요.`,
          explain: R`$3 = -2 \times 1 + b$ → $b = 5$ → $y = -2x + 5$`,
        },
        {
          id: 'q3-3', type: 'ab', short: '두 점 (1, 1), (3, 7)',
          text: R`두 점 $(1,\ 1)$, $(3,\ 7)$을 지나는 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: 3, b: -2, answerText: R`$y = 3x - 2$`,
          hint: R`먼저 두 점으로 기울기를 구하고, 한 점을 대입해 $b$를 구해요.`,
          explain: R`① 기울기: $\dfrac{7-1}{3-1} = 3$<br>② $1 = 3 \times 1 + b$ → $b = -2$<br>따라서 $y = 3x - 2$`,
        },
        {
          id: 'q3-4', type: 'ab', short: 'x절편 2, y절편 −6',
          text: R`$x$절편이 $2$이고 $y$절편이 $-6$인 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: 3, b: -6, answerText: R`$y = 3x - 6$`,
          hint: R`두 점 $(2,\ 0)$, $(0,\ -6)$을 지나는 직선이에요. $y$절편은 바로 $b$!`,
          explain: R`기울기: $\dfrac{-6 - 0}{0 - 2} = 3$, $y$절편: $-6$ → $y = 3x - 6$`,
        },
        {
          id: 'q3-5', type: 'ab', short: '기울기 ½, y절편 3',
          text: R`기울기가 $\frac{1}{2}$이고 $y$절편이 $3$인 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: 0.5, b: 3, answerText: R`$y = \frac{1}{2}x + 3$`,
          hint: R`분수 기울기는 <b>1/2</b>처럼 입력하면 돼요.`,
          explain: R`$a = \frac{1}{2}$, $b = 3$ → $y = \frac{1}{2}x + 3$`,
        },
        {
          id: 'q3-6', type: 'ab', short: '증가량과 y절편',
          text: R`$x$의 값이 $2$만큼 증가할 때 $y$의 값은 $8$만큼 증가하고, $y$절편이 $-5$인 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: 4, b: -5, answerText: R`$y = 4x - 5$`,
          hint: R`기울기 $= \dfrac{(y\text{의 증가량})}{(x\text{의 증가량})} = \dfrac{8}{2}$`,
          explain: R`기울기 $\frac{8}{2} = 4$, $y$절편 $-5$ → $y = 4x - 5$`,
        },
        {
          id: 'q3-7', type: 'ab', short: '기울기 −3, 점 (2, −1)',
          text: R`기울기가 $-3$이고 점 $(2,\ -1)$을 지나는 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: -3, b: 5, answerText: R`$y = -3x + 5$`,
          hint: R`$-1 = -3 \times 2 + b$ 를 풀어 보세요.`,
          explain: R`$-1 = -6 + b$ → $b = 5$ → $y = -3x + 5$`,
        },
        {
          id: 'q3-8', type: 'ab', short: '두 점 (−1, 4), (2, −2)',
          text: R`두 점 $(-1,\ 4)$, $(2,\ -2)$를 지나는 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: -2, b: 2, answerText: R`$y = -2x + 2$`,
          hint: R`기울기: $\dfrac{-2 - 4}{2 - (-1)}$. 그다음 한 점을 대입해요!`,
          explain: R`① 기울기: $\dfrac{-6}{3} = -2$<br>② $4 = -2 \times (-1) + b$ → $b = 2$<br>따라서 $y = -2x + 2$`,
        },
        {
          id: 'q3-9', type: 'ab', short: '두 점 (0, −3), (4, 3)',
          text: R`두 점 $(0,\ -3)$, $(4,\ 3)$을 지나는 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: 1.5, b: -3, answerText: R`$y = \frac{3}{2}x - 3$`,
          hint: R`점 $(0,\ -3)$은 $y$축 위의 점이니 $y$절편이 바로 보여요! 기울기는 약분해서 분수로.`,
          explain: R`기울기: $\dfrac{3 - (-3)}{4 - 0} = \dfrac{6}{4} = \dfrac{3}{2}$, $y$절편 $-3$ → $y = \frac{3}{2}x - 3$`,
        },
        {
          id: 'q3-10', type: 'ab', short: '기울기 2, x절편 3',
          text: R`기울기가 $2$이고 $x$절편이 $3$인 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: 2, b: -6, answerText: R`$y = 2x - 6$`,
          hint: R`$x$절편이 $3$ → 점 $(3,\ 0)$을 지나요. $0 = 2 \times 3 + b$`,
          explain: R`$0 = 6 + b$ → $b = -6$ → $y = 2x - 6$`,
        },
      ],
    },

    // ═════════════════════════════ 4단계: 그래프 ═════════════════════════════
    {
      id: 4,
      title: '일차함수의 그래프',
      short: '그래프',
      emoji: '✏️',
      summary: '평행이동과 그래프의 모양을 이해하고, 좌표평면에 직접 그래프를 그려봐요!',
      concept: R`
        <h3>🚚 평행이동</h3>
        <p>일차함수 $y = ax + b$의 그래프는 $y = ax$의 그래프를 <b>$y$축의 방향으로 $b$만큼 평행이동</b>한 직선이에요.</p>
        <div class="shift-wrap">
          <figure class="concept-fig shift-fig">
            <svg viewBox="0 0 300 260" role="img" aria-label="y = 1/2 x 의 그래프를 위로 3만큼, 아래로 2만큼 평행이동한 그림">
              <g stroke="#F1EDF9" stroke-width="1">
                <path d="M30 10V250M50 10V250M70 10V250M90 10V250M110 10V250M130 10V250M170 10V250M190 10V250M210 10V250M230 10V250M250 10V250M270 10V250"/>
                <path d="M10 30H290M10 50H290M10 70H290M10 90H290M10 110H290M10 150H290M10 170H290M10 190H290M10 210H290M10 230H290"/>
              </g>
              <g stroke="#5E5873" stroke-width="1.6" fill="#5E5873">
                <path d="M8 130H284"/><path d="M292 130l-9-4.5v9z"/>
                <path d="M150 252V12"/><path d="M150 4l-4.5 9h9z"/>
              </g>
              <g font-family="Noto Sans KR, sans-serif" font-size="13" font-style="italic" fill="#5E5873">
                <text x="282" y="122">x</text><text x="158" y="14">y</text><text x="138" y="146">O</text>
              </g>

              <!-- 기준 직선 y = 1/2 x (점선) -->
              <line x1="10" y1="200" x2="290" y2="60" stroke="#B7B1C9" stroke-width="3" stroke-dasharray="8 6"/>
              <!-- 위로 3만큼: y = 1/2 x + 3 -->
              <line x1="10" y1="140" x2="270" y2="10" stroke="#8C7BEA" stroke-width="3.5" stroke-linecap="round"/>
              <!-- 아래로 2만큼: y = 1/2 x - 2 -->
              <line x1="10" y1="240" x2="290" y2="100" stroke="#F27A92" stroke-width="3.5" stroke-linecap="round"/>

              <!-- 이동 화살표 -->
              <g stroke-width="2.6" stroke-linecap="round">
                <path d="M70 168V117M230 88V37" stroke="#8C7BEA"/>
                <path d="M70 172V203M230 92V123" stroke="#F27A92"/>
              </g>
              <g>
                <path d="M70 111l-5.5 9h11zM230 31l-5.5 9h11z" fill="#8C7BEA"/>
                <path d="M70 209l-5.5-9h11zM230 129l-5.5-9h11z" fill="#F27A92"/>
              </g>
              <g font-family="Noto Sans KR, sans-serif" font-size="13" font-weight="700" paint-order="stroke" stroke="#fff" stroke-width="4">
                <text x="76" y="146" fill="#6E5DD3">+3</text><text x="236" y="66" fill="#6E5DD3">+3</text>
                <text x="76" y="196" fill="#D9536E">−2</text><text x="236" y="116" fill="#D9536E">−2</text>
              </g>

              <!-- y절편 -->
              <path d="M150 128V72" stroke="#8C7BEA" stroke-width="4" opacity=".35"/>
              <path d="M150 132V168" stroke="#F27A92" stroke-width="4" opacity=".35"/>
              <circle cx="150" cy="70" r="6.5" fill="#8C7BEA" stroke="#fff" stroke-width="2.5"/>
              <circle cx="150" cy="130" r="6" fill="#B7B1C9" stroke="#fff" stroke-width="2.5"/>
              <circle cx="150" cy="170" r="6.5" fill="#F27A92" stroke="#fff" stroke-width="2.5"/>
              <g font-family="Noto Sans KR, sans-serif" font-size="12" font-weight="700" paint-order="stroke" stroke="#fff" stroke-width="4">
                <text x="142" y="66" text-anchor="end" fill="#6E5DD3">y절편 3</text>
                <text x="158" y="186" fill="#D9536E">y절편 −2</text>
              </g>
            </svg>
            <figcaption>
              <span><i class="line-ic ref"></i> $y = \frac{1}{2}x$</span>
              <span><i class="line-ic main"></i> $y = \frac{1}{2}x + 3$</span>
              <span><i class="line-ic pink"></i> $y = \frac{1}{2}x - 2$</span>
            </figcaption>
          </figure>

          <div class="shift-eq">
            <h4>📝 그래프가 움직이면 식은?</h4>
            <table class="shift-table">
              <thead><tr><th>이동</th><th>식</th><th>기울기</th><th>$y$절편</th></tr></thead>
              <tbody>
                <tr class="base"><td>그대로</td><td>$y = \frac{1}{2}x$</td><td>$\frac{1}{2}$</td><td>$0$</td></tr>
                <tr class="up"><td>⬆ 위로 $3$</td><td>$y = \frac{1}{2}x$ <b class="hl-up">$+\,3$</b></td><td>$\frac{1}{2}$</td><td><b class="hl-up">$3$</b></td></tr>
                <tr class="down"><td>⬇ 아래로 $2$</td><td>$y = \frac{1}{2}x$ <b class="hl-down">$-\,2$</b></td><td>$\frac{1}{2}$</td><td><b class="hl-down">$-2$</b></td></tr>
              </tbody>
            </table>
            <ul class="shift-points">
              <li>그래프 전체가 <b>위아래로 미끄러지듯</b> 움직여요.</li>
              <li><b>기울기는 그대로</b> → 세 직선은 서로 나란해요.</li>
              <li>위로 $b$만큼 → 식 뒤에 $+\,b$, &nbsp;아래로 $b$만큼 → $-\,b$</li>
              <li><b>$y$절편이 이동한 만큼 바뀌어요.</b> ($0 \to 3$, $0 \to -2$)</li>
            </ul>
          </div>
        </div>
        <div class="tip">예) $y = 2x$의 그래프를 $y$축의 방향으로 $-3$만큼 평행이동 → $y = 2x - 3$ ($y$절편 $0 \to -3$)</div>

        <h3>✏️ 그래프 그리는 두 가지 방법</h3>
        <div class="concept-grid">
          <div class="mini-card mint">
            <h4>① 두 절편 이용</h4>
            <p>$y$절편 → 점 $(0,\ b)$<br>$x$절편 → 점 $\left(-\frac{b}{a},\ 0\right)$<br>두 점을 직선으로 연결!</p>
            <p class="small">예) $y = -\frac{1}{2}x + 3$ → $(0, 3)$, $(6, 0)$</p>
          </div>
          <div class="mini-card peach">
            <h4>② 기울기와 $y$절편 이용</h4>
            <p>점 $(0,\ b)$를 찍고,<br>기울기만큼 이동한 점을 하나 더 찍어 연결!</p>
            <p class="small">예) $y = \frac{1}{3}x + 1$ → $(0, 1)$에서 오른쪽 $3$, 위로 $1$ → $(3, 2)$</p>
          </div>
        </div>

        <h3>🧭 $a$, $b$의 부호와 그래프 모양</h3>
        <div class="concept-grid">
          <div class="mini-card sky">
            <h4>$a$의 부호 → 방향</h4>
            <p>$a > 0$: 오른쪽 위로 ↗<br>$a < 0$: 오른쪽 아래로 ↘</p>
          </div>
          <div class="mini-card pink">
            <h4>$b$의 부호 → $y$축과 만나는 곳</h4>
            <p>$b > 0$: $y$축의 양의 부분(원점 위)<br>$b < 0$: $y$축의 음의 부분(원점 아래)</p>
          </div>
        </div>
        <div class="tip">예) $y = -x + 3$ ($a<0$, $b>0$)은 제1, 2, 4사분면을 지나고 <b>제3사분면은 지나지 않아요.</b></div>

        <h3>🖱️ 좌표평면 사용법</h3>
        <ul class="howto">
          <li>좌표평면을 <b>클릭(터치)</b>하면 가장 가까운 격자점에 점이 찍혀요.</li>
          <li>찍은 점을 <b>드래그</b>하면 위치를 옮길 수 있어요.</li>
          <li>점 두 개를 찍으면 직선이 자동으로 그려져요. 다 그렸으면 <b>제출</b>!</li>
        </ul>`,
      lab: { type: 'shift', a: 1, b: 3 },
      questions: [
        {
          id: 'q4-1', type: 'graph', short: 'y = −½x + 3 그리기', method: 'intercepts',
          text: R`일차함수 $y = -\frac{1}{2}x + 3$의 그래프를 <b>두 절편</b>을 이용하여 그려보세요.`,
          a: -0.5, b: 3, points: [[0, 3], [6, 0]],
          hint: R`$y$절편은 $3$, $x$절편은 $0 = -\frac{1}{2}x + 3$을 풀어서 구해요.`,
          explain: R`$y$절편 $3$ → 점 $(0, 3)$, $x$절편 $6$ → 점 $(6, 0)$을 이은 직선이에요. (초록 점선)`,
        },
        {
          id: 'q4-2', type: 'graph', short: 'y = 2x − 4 그리기', method: 'intercepts',
          text: R`일차함수 $y = 2x - 4$의 그래프를 <b>두 절편</b>을 이용하여 그려보세요.`,
          a: 2, b: -4, points: [[0, -4], [2, 0]],
          hint: R`$y$절편 $-4$ → 점 $(0, -4)$. $x$절편은 $0 = 2x - 4$에서 구해요.`,
          explain: R`$y$절편 $-4$ → 점 $(0, -4)$, $x$절편 $2$ → 점 $(2, 0)$`,
        },
        {
          id: 'q4-3', type: 'mc', short: 'y = 2x의 평행이동',
          text: R`일차함수 $y = 2x$의 그래프를 $y$축의 방향으로 $-3$만큼 평행이동한 그래프의 식은?`,
          options: [R`$y = 2x + 3$`, R`$y = 2x - 3$`, R`$y = -3x + 2$`, R`$y = -2x - 3$`],
          answer: 1,
          hint: R`$y = ax$를 $y$축 방향으로 $b$만큼 평행이동하면 $y = ax + b$예요. 기울기는 변하지 않아요!`,
          explain: R`$y = 2x$ → $y = 2x + (-3) = 2x - 3$`,
        },
        {
          id: 'q4-4', type: 'graph', short: 'y = ⅔x − 2 그리기', method: 'intercepts',
          text: R`일차함수 $y = \frac{2}{3}x - 2$의 그래프를 <b>두 절편</b>을 이용하여 그려보세요.`,
          a: 2 / 3, b: -2, points: [[0, -2], [3, 0]],
          hint: R`$y$절편은 $-2$예요. $0 = \frac{2}{3}x - 2$ → $\frac{2}{3}x = 2$ 를 풀어 $x$절편을 구해요.`,
          explain: R`$y$절편 $-2$ → 점 $(0, -2)$, $x$절편 $3$ → 점 $(3, 0)$`,
        },
        {
          id: 'q4-5', type: 'graph', short: 'y = 3x − 1 그리기', method: 'slope',
          text: R`일차함수 $y = 3x - 1$의 그래프를 <b>기울기와 $y$절편</b>을 이용하여 그려보세요.`,
          a: 3, b: -1, points: [[0, -1], [1, 2]],
          hint: R`$(0,\ -1)$에서 출발해서 오른쪽으로 $1$, 위로 $3$만큼 이동한 점을 찍어요.`,
          explain: R`$y$절편 $-1$ → 점 $(0, -1)$, 기울기 $3$ → 오른쪽 $1$, 위로 $3$ → 점 $(1, 2)$`,
        },
        {
          id: 'q4-6', type: 'short', short: '평행이동 후 y절편',
          text: R`일차함수 $y = -2x + 4$의 그래프를 $y$축의 방향으로 $3$만큼 평행이동한 그래프의 <b>$y$절편</b>을 구하세요.`,
          answer: 7, answerText: R`$7$`,
          hint: R`평행이동한 식은 $y = -2x + 4 + 3$이에요.`,
          explain: R`$y = -2x + 7$ 이므로 $y$절편은 $7$이에요.`,
        },
        {
          id: 'q4-7', type: 'mc', short: '지나지 않는 사분면',
          text: R`일차함수 $y = -x + 3$의 그래프가 <b>지나지 않는</b> 사분면은?`,
          options: ['제1사분면', '제2사분면', '제3사분면', '제4사분면'],
          answer: 2,
          hint: R`두 절편 $(3,\ 0)$, $(0,\ 3)$을 이어서 그래프를 머릿속으로 그려 보세요. 오른쪽 아래로 향하는 직선이에요.`,
          explain: R`기울기 $<0$, $y$절편 $>0$ 이므로 제1, 2, 4사분면을 지나고 <b>제3사분면</b>은 지나지 않아요.`,
        },
        {
          id: 'q4-8', type: 'graph', short: 'y = −x + 2 그리기', method: 'intercepts',
          text: R`일차함수 $y = -x + 2$의 그래프를 <b>두 절편</b>을 이용하여 그려보세요.`,
          a: -1, b: 2, points: [[0, 2], [2, 0]],
          hint: R`$x = 0$일 때 $y$는? $y = 0$일 때 $x$는? 두 점을 찍어요.`,
          explain: R`$y$절편 $2$ → 점 $(0, 2)$, $x$절편 $2$ → 점 $(2, 0)$`,
        },
        {
          id: 'q4-9', type: 'graph', short: 'y = ⅓x + 1 그리기', method: 'slope',
          text: R`일차함수 $y = \frac{1}{3}x + 1$의 그래프를 <b>기울기와 $y$절편</b>을 이용하여 그려보세요.`,
          a: 1 / 3, b: 1, points: [[0, 1], [3, 2]],
          hint: R`기울기 $\frac{1}{3}$은 오른쪽으로 $3$ 갈 때 위로 $1$ 올라간다는 뜻이에요. $(0,\ 1)$에서 출발!`,
          explain: R`$y$절편 $1$ → 점 $(0, 1)$, 기울기 $\frac{1}{3}$ → 오른쪽 $3$, 위로 $1$ → 점 $(3, 2)$`,
        },
        {
          id: 'q4-10', type: 'mc', short: 'a, b의 부호와 그래프',
          text: R`$a > 0$, $b < 0$일 때, 일차함수 $y = ax + b$의 그래프에 대한 설명으로 옳은 것은?`,
          options: [
            R`오른쪽 위로 향하고, $y$축과 원점 위에서 만난다.`,
            R`오른쪽 위로 향하고, $y$축과 원점 아래에서 만난다.`,
            R`오른쪽 아래로 향하고, $y$축과 원점 위에서 만난다.`,
            R`오른쪽 아래로 향하고, $y$축과 원점 아래에서 만난다.`,
          ],
          answer: 1,
          hint: R`$a$의 부호는 그래프의 방향을, $b$의 부호는 $y$축과 만나는 위치를 결정해요.`,
          explain: R`$a > 0$ → 오른쪽 위로 향해요.<br>$b < 0$ → $y$절편이 음수이므로 원점 아래에서 $y$축과 만나요.`,
        },
      ],
    },

    // ═════════════════════════════ 5단계: 복합 문제 ═════════════════════════════
    {
      id: 5,
      title: '복합 문제 도전',
      short: '복합 문제',
      emoji: '🏔️',
      summary: '절편, 기울기, 식, 그래프를 모두 활용하는 최종 도전이에요!',
      concept: R`
        <h3>🏆 한눈에 보는 총정리</h3>
        <div class="concept-grid">
          <div class="mini-card mint"><h4>📍 절편</h4><p>$y$절편: $x = 0$ 대입<br>$x$절편: $y = 0$ 대입</p></div>
          <div class="mini-card sky"><h4>📐 기울기</h4><p>$\dfrac{y_2 - y_1}{x_2 - x_1}$ $= a$</p></div>
          <div class="mini-card peach"><h4>🧩 식 세우기</h4><p>기울기 먼저 → 한 점 대입해 $b$</p></div>
          <div class="mini-card pink"><h4>✏️ 그래프</h4><p>$y = ax$를 $y$축 방향으로 $b$만큼 평행이동</p></div>
        </div>

        <h3>🧠 복합 문제 해결 전략</h3>
        <div class="case">
          <div class="case-num">1</div>
          <div><h4>"점 $(p,\ q)$가 그래프 위에 있다"</h4><p>식에 대입하면 성립해요 → $q = ap + b$</p></div>
        </div>
        <div class="case">
          <div class="case-num">2</div>
          <div><h4>"세 점이 한 직선 위에 있다"</h4><p>어느 두 점을 골라도 <b>기울기가 같아요.</b></p></div>
        </div>
        <div class="case">
          <div class="case-num">3</div>
          <div><h4>그래프와 $x$축, $y$축으로 둘러싸인 삼각형의 넓이</h4>
            <p>$\dfrac{1}{2} \times |x\text{절편}| \times |y\text{절편}|$</p></div>
        </div>
        <div class="case">
          <div class="case-num">4</div>
          <div><h4>활용 문제</h4><p>처음 값 → $y$절편 $b$, 일정하게 변하는 양 → 기울기 $a$</p>
            <p class="ex">예) 처음 물의 양 $10$L, 1분마다 $2$L씩 증가 → $y = 2x + 10$</p></div>
        </div>`,
      lab: { type: 'area', a: -1, b: 4 },
      questions: [
        {
          id: 'q5-1', type: 'short', short: '삼각형의 넓이',
          text: R`일차함수 $y = 2x + 4$의 그래프와 $x$축, $y$축으로 둘러싸인 <b>삼각형의 넓이</b>를 구하세요.`,
          answer: 4, answerText: R`$4$`,
          hint: R`두 절편을 구하면 삼각형의 밑변과 높이가 보여요. 넓이 $= \frac{1}{2} \times |x\text{절편}| \times |y\text{절편}|$`,
          explain: R`$x$절편 $-2$, $y$절편 $4$ → 넓이 $= \frac{1}{2} \times 2 \times 4 = 4$`,
        },
        {
          id: 'q5-2', type: 'short', short: '그래프 위의 점',
          text: R`점 $(2,\ k)$가 일차함수 $y = 3x - 1$의 그래프 위에 있을 때, $k$의 값을 구하세요.`,
          answer: 5, answerText: R`$5$`,
          hint: R`점이 그래프 위에 있다 = 식에 대입하면 성립한다! $x = 2$, $y = k$를 대입해요.`,
          explain: R`$k = 3 \times 2 - 1 = 5$`,
        },
        {
          id: 'q5-3', type: 'ab', short: '식 세우기 + 평행이동',
          text: R`두 점 $(1,\ 2)$, $(3,\ 6)$을 지나는 직선을 $y$축의 방향으로 $-1$만큼 평행이동한 그래프의 식을 완성하세요.`,
          a: 2, b: -1, answerText: R`$y = 2x - 1$`,
          hint: R`① 두 점을 지나는 직선의 식을 먼저 구하고 ② $y$축 방향으로 $-1$만큼 평행이동해요.`,
          explain: R`① 기울기 $\frac{6-2}{3-1} = 2$, $2 = 2 + b$ → $b = 0$ → $y = 2x$<br>② $-1$만큼 평행이동 → $y = 2x - 1$`,
        },
        {
          id: 'q5-4', type: 'short', short: '한 직선 위의 세 점',
          text: R`세 점 $(1,\ 1)$, $(3,\ 5)$, $(5,\ k)$가 한 직선 위에 있을 때, $k$의 값을 구하세요.`,
          answer: 9, answerText: R`$9$`,
          hint: R`한 직선 위의 세 점이라면 어느 두 점을 골라도 기울기가 같아요.`,
          explain: R`$(1,1)$, $(3,5)$의 기울기 $= \frac{5-1}{3-1} = 2$<br>$(3,5)$, $(5,k)$의 기울기 $= \frac{k-5}{2} = 2$ → $k = 9$`,
        },
        {
          id: 'q5-5', type: 'graph', short: '식 세우고 그래프 그리기', method: 'any',
          text: R`기울기가 $2$이고 점 $(1,\ 3)$을 지나는 일차함수의 그래프를 그려보세요.`,
          a: 2, b: 1, points: [[0, 1], [1, 3]],
          hint: R`먼저 식을 완성해 보세요. $3 = 2 \times 1 + b$ → $b = ?$ 그다음 $y$절편과 점 $(1, 3)$을 찍어요.`,
          explain: R`$3 = 2 + b$ → $b = 1$ → $y = 2x + 1$<br>점 $(0, 1)$과 $(1, 3)$을 지나는 직선이에요.`,
        },
        {
          id: 'q5-6', type: 'short', short: '두 절편의 합',
          text: R`일차함수 $y = 3x - 6$의 그래프의 $x$절편을 $m$, $y$절편을 $n$이라 할 때, $m + n$의 값을 구하세요.`,
          answer: -4, answerText: R`$-4$`,
          hint: R`$m$은 $0 = 3x - 6$의 해, $n$은 $x = 0$일 때의 $y$값이에요.`,
          explain: R`$m = 2$, $n = -6$ → $m + n = -4$`,
        },
        {
          id: 'q5-7', type: 'mc', short: '그래프 성질 종합',
          text: R`일차함수 $y = -\frac{3}{2}x + 3$의 그래프에 대한 설명으로 <b>옳지 않은</b> 것은?`,
          options: [
            R`기울기는 $-\frac{3}{2}$이다.`,
            R`$x$절편은 $2$이다.`,
            R`$y$절편은 $3$이다.`,
            '제3사분면을 지난다.',
            R`$x$의 값이 $2$만큼 증가하면 $y$의 값은 $3$만큼 감소한다.`,
          ],
          answer: 3,
          hint: R`보기를 하나씩 확인해요. 두 절편으로 그래프를 그려 보면 지나는 사분면을 알 수 있어요.`,
          explain: R`$x$절편 $2$, $y$절편 $3$, 오른쪽 아래로 향하므로 제1, 2, 4사분면을 지나요.<br><b>제3사분면은 지나지 않아요.</b>`,
        },
        {
          id: 'q5-8', type: 'short', short: '대입 후 x절편',
          text: R`일차함수 $y = ax - 2$의 그래프가 점 $(3,\ 4)$를 지날 때, 이 그래프의 <b>$x$절편</b>을 구하세요.`,
          answer: 1, answerText: R`$1$`,
          hint: R`먼저 $(3,\ 4)$를 대입해 $a$를 구하고, 그다음 $x$절편을 구해요.`,
          explain: R`$4 = 3a - 2$ → $a = 2$ → $y = 2x - 2$<br>$0 = 2x - 2$ → $x = 1$`,
        },
        {
          id: 'q5-9', type: 'ab', short: '기울기가 같고 x절편 3',
          text: R`일차함수 $y = -2x + 1$의 그래프와 기울기가 같고, $x$절편이 $3$인 직선을 그래프로 하는 일차함수의 식을 완성하세요.`,
          a: -2, b: 6, answerText: R`$y = -2x + 6$`,
          hint: R`기울기는 $-2$로 같고, $x$절편 $3$ → 점 $(3,\ 0)$을 지나요.`,
          explain: R`$y = -2x + b$에 $(3, 0)$ 대입 → $0 = -6 + b$ → $b = 6$ → $y = -2x + 6$`,
        },
        {
          id: 'q5-10', type: 'short', short: '활용: 높이와 기온', unit: '°C',
          text: R`지면의 기온이 $20\,^\circ\text{C}$이고, 지면에서 $1$ km 높아질 때마다 기온이 $6\,^\circ\text{C}$씩 내려간다고 한다. 지면에서 높이가 $3$ km인 곳의 기온을 구하세요.`,
          answer: 2, answerText: R`$2\,^\circ\text{C}$`,
          hint: R`처음 기온이 $y$절편, 1 km마다 변하는 양이 기울기예요. 식을 세워 $x = 3$을 대입!`,
          explain: R`높이 $x$ km에서의 기온 $y$: $y = -6x + 20$<br>$x = 3$ → $y = -18 + 20 = 2$ ($^\circ$C)`,
        },
      ],
    },
  ];
})();
