module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 제목 길이 제한
    'header-max-length': [2, 'always', 100],
    'subject-max-length': [2, 'always', 50],
    
    // 제목 형식
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    
    // 타입 제한
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새로운 기능
        'fix',      // 버그 수정
        'docs',     // 문서 수정
        'style',    // 코드 포맷팅, 세미콜론 누락 등
        'refactor', // 코드 리팩토링
        'perf',     // 성능 개선
        'test',     // 테스트 추가/수정
        'chore',    // 빌드 과정 또는 보조 기능 수정
        'ci',       // CI 설정 수정
        'build',    // 빌드 시스템 수정
        'revert',   // 이전 커밋 되돌리기
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    
    // 스코프 설정 (선택사항)
    'scope-case': [2, 'always', 'lower-case'],
    
    // 본문 설정
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    
    // 푸터 설정
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};