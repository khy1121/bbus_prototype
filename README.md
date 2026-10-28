# 붕붕어스 (bbus)

커플 드라이브 웹앱 — React 19 + TypeScript + Vite, SCSS Modules, Vitest + React Testing Library.

## 시작하기

```bash
npm install
cp .env.example .env   # VITE_KAKAO_MAP_KEY 에 카카오 JavaScript 키 입력
npm run dev
```

키가 없으면 지도 자리에 플레이스홀더가 표시된다. 카카오 개발자 콘솔에서 사용할 도메인(예: `http://localhost:5173`)을 플랫폼 > Web 에 등록해야 한다.

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm test` | Vitest watch |
| `npm run test:run` | 전체 테스트 1회 실행 |
| `npm run typecheck` | 타입 검사 |
| `npm run build` | 프로덕션 빌드 |

## 구조

```
src/
  styles/          디자인 토큰(_tokens.scss, tokens.ts), 믹스인, 전역 스타일
  components/      공통 UI 컴포넌트 (Button, Chip, Modal, BottomSheet, DraggableSheet, KakaoMap …)
  app/             라우터, 레이아웃(모바일 하단 네비 / 데스크톱 사이드바)
  stores/          전역 상태 (zustand): user, drive, ui
  features/
    home/          홈, 알림, 장소 상세, 공유/연인에게 보내기
    drive/         드라이브 모드 (경로, 휴게소 스탬프, DJ 플레이리스트, 라디오, 게임)
    map/           기록 지도, 카드 상세, 공유
    drive-start/   드라이브명 입력/수정 팝업
    permissions/   위치 권한 안내
  lib/kakao/       카카오맵 SDK 로더 + 타입
```

각 feature 는 `api.ts`(백엔드 연동 자리, 현재 목업 반환)와 `mocks.ts` 를 가진다.
백엔드 연동이 필요한 곳은 `TODO(backend)` 로 표시되어 있다: `grep -rn "TODO(backend)" src`.

## 디자인 시스템

- 색상: `var(--color-coral)` 등 CSS 변수 (`src/styles/_tokens.scss` 의 `$colors`). TS 에서는 `@/styles/tokens`.
- 타이포: SCSS `@include typo('body-m-bold')` 또는 `<Text variant="body-m-bold">`.
  Title(L/M/S, Bold) · Body(L, M, M-Regular 15px, S) · Caption(기본, S) · card-myungjo.
- 모든 SCSS 모듈에 토큰/믹스인이 자동 주입된다 (`vite.config.ts` → `additionalData`).
- 반응형: 모바일 <768px(Figma 기준) · 태블릿 768–1023px · 데스크톱 ≥1024px(사이드바 + 2단, `@include desktop`, `useIsDesktop()`).

## 폰트

- Pretendard (CDN)
- Figma 의 김정철 명조는 무료 대체 폰트 Nanum Myeongjo(Google Fonts) 로 적용.

## 개선 과제

남은 작업과 개선 아이디어는 [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) 에 정리되어 있다.
