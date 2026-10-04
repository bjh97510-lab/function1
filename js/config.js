/**
 * 앱 설정
 * - GAS_URL: Google Apps Script 웹 앱 배포 후 받은 URL을 붙여넣으세요.
 *   (예: 'https://script.google.com/macros/s/XXXXXXXX/exec')
 *   비워두면 구글 시트 전송 없이 동작하며, 전송 데이터는 브라우저 콘솔에만 출력됩니다.
 */
window.APP_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbyh9gELrEy41ST4xQgDAdkK5-guvnZ23C9VWrtq6HdVINDGqulfwWTKax-RZHkks7xe/exec',
  ACORNS_PER_STAMP: 10,
  // 문제당 시도 횟수 (첫 시도 + 재도전). 첫 시도에 맞혀야 도토리 지급
  MAX_ATTEMPTS: 2,
};
