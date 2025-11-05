# APNG 이미지 효과 생성기

이미지를 업로드하면 삼각형 조각으로 산산조각나는 효과를 주어 APNG(애니메이션 PNG)로 변환하는 웹 애플리케이션입니다.

## 🎨 주요 기능

- **이미지 업로드**: 드래그 앤 드롭 또는 파일 선택으로 이미지 업로드 (최대 5MB)
- **산산조각 효과**: Delaunay 삼각분할을 사용한 자연스러운 조각 효과
- **실시간 옵션 조절**:
  - 조각 개수 (30-200개)
  - 떨어지는 속도 (중력 강도)
  - 흩어지는 방향
  - 배경색 / 투명 배경 선택
- **APNG 생성**: 30fps, 약 2-3초 길이의 애니메이션 PNG 생성
- **반응형 디자인**: 데스크톱과 모바일 모두 지원

## 🚀 시작하기

### 설치

```bash
# 의존성 설치
bun install
```

### 개발 서버 실행

```bash
bun run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
bun run build
```

### 프로덕션 실행

```bash
bun run start
```

## 🛠️ 기술 스택

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **Canvas API** - 이미지 조작 및 렌더링
- **upng-js** - APNG 인코딩
- **Delaunator** - Delaunay 삼각분할

## 📁 프로젝트 구조

```
/app
  /page.tsx               # 메인 페이지
  /layout.tsx             # 레이아웃
  /globals.css            # 전역 스타일
/components
  /ImageUploader.tsx      # 이미지 업로드 컴포넌트
  /EffectPreview.tsx      # 미리보기 및 생성 컴포넌트
  /EffectOptions.tsx      # 효과 옵션 컴포넌트
  /ShatterOptions.tsx     # 산산조각 효과 설정
  /ui/                    # shadcn/ui 컴포넌트
/lib
  /effects
    /shatter.ts           # 삼각형 조각 생성 및 물리 시뮬레이션
  /apng-generator.ts      # APNG 생성 로직
  /types.ts               # 타입 정의
  /utils.ts               # 유틸리티 함수
```

## 🌟 작동 원리

1. **이미지 업로드**: 사용자가 이미지를 업로드하면 Canvas에 로드됩니다.
2. **삼각형 생성**: Delaunay 삼각분할 알고리즘으로 이미지를 불규칙한 삼각형 조각으로 분할합니다.
3. **물리 시뮬레이션**: 각 조각에 중력과 초기 속도를 적용하여 떨어지고 회전하는 애니메이션을 생성합니다.
4. **프레임 렌더링**: 60프레임에 걸쳐 각 조각의 위치와 회전을 계산하여 렌더링합니다.
5. **APNG 인코딩**: upng-js 라이브러리로 모든 프레임을 APNG 형식으로 인코딩합니다.
6. **다운로드**: 생성된 APNG를 자동으로 다운로드합니다.

## 🚢 배포

### Vercel에 배포

```bash
# Vercel CLI 설치 (전역)
bun install -g vercel

# 배포
vercel
```

또는 GitHub에 푸시 후 Vercel 대시보드에서 프로젝트를 연결하세요.

## 📝 향후 개발 계획

- [ ] 다양한 효과 추가 (폭발, 페이드, 모자이크 등)
- [ ] 애니메이션 길이 및 프레임 수 커스터마이징
- [ ] GIF 변환 지원
- [ ] 미리보기 애니메이션 재생
- [ ] 프리셋 효과 템플릿

## 📄 라이선스

MIT License

