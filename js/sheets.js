/**
 * 구글 시트 연동 (Google Apps Script 웹 앱으로 POST)
 *
 * - Content-Type을 text/plain으로 보내 CORS 사전요청(preflight)을 피합니다.
 * - mode: 'no-cors' 이므로 응답 본문은 읽을 수 없지만, 요청은 정상 전달됩니다.
 * - 전송 항목: 학교 이름, 학번, 현재 도토리 수, 칭찬도장 수, 최종 학습 완료 단계, 시간
 */
(() => {
  /** 완료한 단계 목록 → '1·2·4단계 완료 (3/5)' 형태 (단계는 자유롭게 이동 가능하므로 목록으로 기록) */
  function stepLabel(doneSteps) {
    const total = (window.CURRICULUM || []).length;
    if (!doneSteps.length) return '완료한 단계 없음';
    if (doneSteps.length === total) return `전체 완료 (${total}/${total})`;
    const list = doneSteps.slice().sort((a, b) => a - b).join('·');
    return `${list}단계 완료 (${doneSteps.length}/${total})`;
  }

  function nowString() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  function setStatus(kind, text) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.dataset.kind = kind;
    el.querySelector('.sync-text').textContent = text;
  }

  async function send(state, event) {
    const payload = {
      event,
      school: state.school,
      studentId: state.studentId,
      acorns: state.acorns,
      stamps: state.stamps,
      completedSteps: state.doneSteps.length,
      completedStepLabel: stepLabel(state.doneSteps),
      totalCorrect: state.firstCorrect,
      retryCorrect: state.retryCorrect,
      cardCorrect: state.cardCorrect,
      timestamp: nowString(),
    };

    const url = (window.APP_CONFIG && window.APP_CONFIG.GAS_URL) || '';
    if (!url) {
      console.info('[Sheets] GAS_URL이 설정되지 않아 전송을 건너뜁니다.', payload);
      setStatus('off', '시트 미연결');
      return;
    }

    setStatus('busy', '저장 중…');
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      setStatus('ok', `저장됨 ${payload.timestamp.slice(11, 16)}`);
    } catch (err) {
      console.warn('[Sheets] 전송 실패', err);
      setStatus('err', '저장 실패');
    }
  }

  window.Sheets = { send };
})();
