/**
 * 일차함수 탐험대 — Google Apps Script 백엔드
 *
 * [시트 구성]
 *  - '학습현황' : 학생 1명당 1행 (학교 이름 + 학번 기준으로 갱신)
 *  - '제출기록' : 모든 제출 이벤트를 한 줄씩 누적 기록 (로그)
 *
 * [배포 방법]  README.md 참고
 *  확장 프로그램 > Apps Script 에 이 코드를 붙여넣고
 *  배포 > 새 배포 > 유형: 웹 앱 / 실행 사용자: 나 / 액세스 권한: 모든 사용자
 */

const SHEET_STATUS = '학습현황';
const SHEET_LOG = '제출기록';
const TZ = 'Asia/Seoul';

const STATUS_HEADERS = ['학교 이름', '학번', '현재 도토리 수', '획득한 칭찬도장 수', '최종 학습 완료 단계', '최종 접속/제출 시간'];
const LOG_HEADERS = ['기록 시간', '이벤트', '학교 이름', '학번', '현재 도토리 수', '획득한 칭찬도장 수', '최종 학습 완료 단계', '첫 시도 정답 수', '재도전 정답 수', '학생 기기 시간', '카드 퀴즈 정답 수'];

const EVENT_LABELS = {
  login: '로그인',
  answer: '문제 제출',
  step_complete: '단계 완료',
  card: '카드 퀴즈',
  logout: '로그아웃',
};

/** 학생 앱에서 보내는 POST 요청 처리 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // 여러 학생이 동시에 제출해도 행이 꼬이지 않도록

    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const school = clean_(data.school);
    const studentId = clean_(data.studentId);
    if (!school || !studentId) return json_({ ok: false, error: '학교 이름/학번 누락' });

    const now = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const acorns = toInt_(data.acorns);
    const stamps = toInt_(data.stamps);
    const stepLabel = clean_(data.completedStepLabel);

    upsertStatus_(getSheet_(ss, SHEET_STATUS, STATUS_HEADERS, [2]), [school, studentId, acorns, stamps, stepLabel, now]);

    getSheet_(ss, SHEET_LOG, LOG_HEADERS, [4]).appendRow([
      now,
      EVENT_LABELS[data.event] || clean_(data.event),
      school,
      studentId,
      acorns,
      stamps,
      stepLabel,
      toInt_(data.totalCorrect),
      toInt_(data.retryCorrect),
      clean_(data.timestamp),
      toInt_(data.cardCorrect),
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/** 브라우저로 웹 앱 URL을 열었을 때 동작 확인용 */
function doGet() {
  return json_({ ok: true, message: '일차함수 탐험대 API가 정상 동작 중입니다.' });
}

/** (선택) 편집기에서 한 번 실행하면 시트와 머리글을 미리 만들어 둡니다. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  getSheet_(ss, SHEET_STATUS, STATUS_HEADERS, [2]);
  getSheet_(ss, SHEET_LOG, LOG_HEADERS, [4]);
}

// ───────────────────────── 내부 함수 ─────────────────────────

/** 시트가 없으면 만들고 머리글을 넣음. textCols: 텍스트 서식으로 둘 열 번호(학번 앞자리 0 보존) */
function getSheet_(ss, name, headers, textCols) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#E6E0FC').setHorizontalAlignment('center');
    sh.setFrozenRows(1);
    (textCols || []).forEach((c) => sh.getRange(1, c, sh.getMaxRows(), 1).setNumberFormat('@'));
    sh.autoResizeColumns(1, headers.length);
  }
  return sh;
}

/** 학교 이름 + 학번이 같은 행이 있으면 덮어쓰고, 없으면 새 행 추가 */
function upsertStatus_(sh, row) {
  const last = sh.getLastRow();
  if (last > 1) {
    const keys = sh.getRange(2, 1, last - 1, 2).getDisplayValues();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i][0] === row[0] && keys[i][1] === row[1]) {
        sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }
  sh.appendRow(row);
}

/** 문자열 정리 + 수식 주입 방지(=, +, -, @ 로 시작하면 작은따옴표 붙임) */
function clean_(v) {
  const s = String(v == null ? '' : v).trim().slice(0, 60);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function toInt_(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
