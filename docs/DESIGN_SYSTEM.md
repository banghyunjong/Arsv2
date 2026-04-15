# DESIGN SYSTEM — ARSV2 Tone & Manner

> Reference: [SPAO](https://spao.com/) 브랜드의 미니멀/클린 디자인을 기반으로 한 B2B 관리 시스템 톤앤매너

## Design Philosophy

SPAO의 "깔끔하고 군더더기 없는 패션 리테일" 감성을 관리 시스템에 적용한다.
화려하지 않되 정돈된 느낌, 정보 밀도가 높되 답답하지 않은 레이아웃을 지향한다.

**핵심 원칙:**

1. **White-space first** — 여백이 디자인이다. 콘텐츠 간 충분한 공간을 확보
2. **Monochrome base** — 흑백 기반에 최소한의 액센트 컬러
3. **Typography-driven** — 폰트 크기와 굵기로 시각 위계를 만든다
4. **Flat & Sharp** — 그림자와 둥근 모서리를 최소화, 직선적이고 단정한 느낌
5. **Content-first** — 장식 요소를 줄이고 데이터와 기능에 집중

---

## Color Palette

### Base Colors

| Token                  | Value     | Usage                          |
|------------------------|-----------|--------------------------------|
| `--color-black`        | `#111111` | 주요 텍스트, 헤더              |
| `--color-white`        | `#FFFFFF` | 배경                           |
| `--color-gray-50`      | `#FAFAFA` | 섹션 배경, 호버 배경           |
| `--color-gray-100`     | `#F5F5F5` | 카드 배경, 입력 배경           |
| `--color-gray-200`     | `#EEEEEE` | 구분선, 테두리                 |
| `--color-gray-300`     | `#DDDDDD` | 비활성 테두리                  |
| `--color-gray-400`     | `#BBBBBB` | 플레이스홀더 텍스트            |
| `--color-gray-500`     | `#999999` | 보조 텍스트, 캡션             |
| `--color-gray-600`     | `#666666` | 부가 정보 텍스트               |
| `--color-gray-700`     | `#333333` | 본문 텍스트                    |

### Semantic Colors

| Token                     | Value     | Usage                          |
|---------------------------|-----------|--------------------------------|
| `--color-primary`         | `#111111` | 주요 버튼, 강조 요소           |
| `--color-primary-hover`   | `#333333` | 주요 버튼 호버                 |
| `--color-accent`          | `#E8192C` | 세일/할인, 긴급 알림 (SPAO Red)|
| `--color-accent-hover`    | `#CC1526` | 액센트 호버                    |
| `--color-success`         | `#2E7D32` | 성공 상태, 정상 재고           |
| `--color-warning`         | `#F57C00` | 경고 상태, 부족 재고           |
| `--color-error`           | `#D32F2F` | 오류 상태, 위험 재고           |
| `--color-info`            | `#1565C0` | 정보 안내                      |

### Background & Surface

| Token                    | Value     | Usage                          |
|--------------------------|-----------|--------------------------------|
| `--bg-page`              | `#FFFFFF` | 페이지 배경                    |
| `--bg-surface`           | `#FAFAFA` | 카드/패널 배경                 |
| `--bg-surface-elevated`  | `#F5F5F5` | 강조 영역 배경                 |
| `--bg-overlay`           | `rgba(0,0,0,0.5)` | 모달 오버레이          |

---

## Typography

### Font Stack

```css
--font-family-base: 'Pretendard', -apple-system, BlinkMacSystemFont, 
                    'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                    'Noto Sans KR', sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

> Pretendard는 한글/영문 모두 깔끔한 산세리프로 SPAO 감성에 적합.
> CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css`

### Type Scale

| Level        | Size     | Weight | Line-Height | Token                  | Usage                |
|--------------|----------|--------|-------------|------------------------|----------------------|
| Display      | `28px`   | 700    | 1.2         | `--text-display`       | 페이지 타이틀        |
| Heading 1    | `22px`   | 700    | 1.3         | `--text-h1`            | 섹션 헤딩            |
| Heading 2    | `18px`   | 600    | 1.4         | `--text-h2`            | 서브 헤딩            |
| Heading 3    | `16px`   | 600    | 1.4         | `--text-h3`            | 카드 타이틀          |
| Body         | `14px`   | 400    | 1.6         | `--text-body`          | 본문 텍스트          |
| Body Small   | `13px`   | 400    | 1.5         | `--text-body-sm`       | 보조 정보            |
| Caption      | `12px`   | 400    | 1.4         | `--text-caption`       | 캡션, 힌트 텍스트    |
| Overline     | `11px`   | 600    | 1.2         | `--text-overline`      | 라벨, 태그           |

### Font Weight

| Token                   | Value | Usage                          |
|-------------------------|-------|--------------------------------|
| `--font-weight-regular` | 400   | 본문                           |
| `--font-weight-medium`  | 500   | 강조 본문                      |
| `--font-weight-semibold`| 600   | 서브 헤딩                      |
| `--font-weight-bold`    | 700   | 메인 헤딩                      |

---

## Spacing

8px 기반 스페이싱 시스템. 일관된 여백으로 정돈된 레이아웃 유지.

| Token            | Value  | Usage                          |
|------------------|--------|--------------------------------|
| `--space-1`      | `4px`  | 아이콘-텍스트 간격             |
| `--space-2`      | `8px`  | 인라인 요소 간격               |
| `--space-3`      | `12px` | 컴팩트 패딩                    |
| `--space-4`      | `16px` | 기본 패딩, 카드 내부           |
| `--space-5`      | `20px` | 섹션 내부 간격                 |
| `--space-6`      | `24px` | 섹션 간 간격                   |
| `--space-8`      | `32px` | 큰 섹션 간 간격                |
| `--space-10`     | `40px` | 페이지 내 주요 영역 간격       |
| `--space-12`     | `48px` | 페이지 상하 패딩               |

---

## Layout

### Container

```css
--container-max-width: 1200px;   /* 메인 콘텐츠 최대 너비 */
--container-padding: 24px;        /* 좌우 패딩 */
```

### Grid

- 12 컬럼 그리드 시스템
- 컬럼 간격: `16px`
- 반응형 브레이크포인트:

| Token              | Value    | Usage              |
|--------------------|----------|--------------------|
| `--breakpoint-sm`  | `640px`  | 모바일             |
| `--breakpoint-md`  | `768px`  | 태블릿             |
| `--breakpoint-lg`  | `1024px` | 데스크톱           |
| `--breakpoint-xl`  | `1280px` | 와이드 데스크톱    |

---

## Components

### Buttons

SPAO 스타일: 직선적, 미니멀, 흑백 기반.

**Primary Button (주요 액션)**
```
배경: --color-primary (#111111)
텍스트: --color-white
패딩: 10px 24px
폰트: 14px / semibold
테두리: none
border-radius: 2px
호버: --color-primary-hover (#333333)
```

**Secondary Button (보조 액션)**
```
배경: transparent
텍스트: --color-black
패딩: 10px 24px
폰트: 14px / semibold
테두리: 1px solid --color-gray-300
border-radius: 2px
호버: 배경 --color-gray-50
```

**Danger Button (삭제/위험 액션)**
```
배경: --color-error
텍스트: --color-white
패딩: 10px 24px
폰트: 14px / semibold
테두리: none
border-radius: 2px
호버: darken 10%
```

**Ghost Button (최소 강조)**
```
배경: transparent
텍스트: --color-gray-600
패딩: 10px 24px
폰트: 14px / regular
테두리: none
border-radius: 2px
호버: 배경 --color-gray-50
```

**공통 규칙:**
- `border-radius: 2px` — SPAO의 직선적 감성. 둥글지 않게
- `text-transform: none` — 한글 UI이므로 대문자 변환 없음
- 비활성: `opacity: 0.4`, `cursor: not-allowed`
- `transition: all 0.15s ease`

### Cards

```
배경: --bg-surface
테두리: 1px solid --color-gray-200
border-radius: 4px
패딩: --space-4 (16px)
그림자: none (flat)
호버: 테두리 --color-gray-300
```

### Input Fields

```
배경: --color-white
테두리: 1px solid --color-gray-300
border-radius: 2px
패딩: 10px 12px
폰트: 14px
포커스: 테두리 --color-black, outline none
플레이스홀더: --color-gray-400
```

### Tables

```
헤더 배경: --color-gray-100
헤더 텍스트: --color-gray-700, 12px, semibold, uppercase tracking
행 높이: 48px
행 호버: --color-gray-50
구분선: 1px solid --color-gray-200 (가로만)
```

### Navigation / Header

```
높이: 56px
배경: --color-white
하단 테두리: 1px solid --color-gray-200
로고: 좌측, bold, 16px
메뉴: 우측 정렬
```

### Badges / Tags

| Variant  | Background         | Text               |
|----------|--------------------|---------------------|
| Default  | `--color-gray-100` | `--color-gray-700`  |
| Success  | `#E8F5E9`          | `--color-success`   |
| Warning  | `#FFF3E0`          | `--color-warning`   |
| Error    | `#FFEBEE`          | `--color-error`     |
| Info     | `#E3F2FD`          | `--color-info`      |

```
패딩: 2px 8px
폰트: 11px / semibold
border-radius: 2px
```

### File Upload Zone

```
배경: --color-white
테두리: 2px dashed --color-gray-300
border-radius: 4px
패딩: --space-8 (32px)
텍스트: --color-gray-500, centered
드래그 호버: 테두리 --color-black, 배경 --color-gray-50
```

---

## Icons

- 스타일: **Line icons** (outlined, 1.5px stroke)
- 크기: `16px` (인라인), `20px` (버튼), `24px` (네비게이션)
- 색상: `currentColor` 상속
- 권장 라이브러리: [Lucide React](https://lucide.dev/) — 미니멀 라인 아이콘, SPAO 감성에 부합

---

## Motion / Animation

최소한의 모션. 화려한 애니메이션 대신 미세한 전환으로 피드백 제공.

| Property     | Duration | Easing              |
|-------------|----------|---------------------|
| 색상 변화    | `150ms`  | `ease`              |
| 배경 변화    | `150ms`  | `ease`              |
| 트랜스폼     | `200ms`  | `ease-out`          |
| 모달/오버레이 | `200ms`  | `ease-in-out`       |

**금지 사항:**
- 과도한 bounce/elastic 애니메이션
- 로딩 외 스피너/회전 효과
- 자동 재생 애니메이션

---

## Do & Don't

### DO

- 여백을 충분히 사용할 것
- 정보 위계를 폰트 크기/굵기로 명확히 할 것
- 흑백 기반 + 의미 있는 곳에만 컬러 사용
- 테이블/리스트에서 가로 구분선만 사용
- 한글 라벨 사용 (UI 전체 한국어)
- 숫자에 천 단위 콤마 표기 (예: 39,900)
- 상태 표시에 시맨틱 컬러 + 텍스트 병행 (색각이상 접근성)

### DON'T

- 둥근 버튼 사용 금지 (`border-radius` > 4px)
- 그라데이션 배경 사용 금지
- 색상만으로 상태 구분 금지 (반드시 텍스트 병행)
- 과도한 그림자 사용 금지 (`box-shadow` 최소화)
- 장식적 아이콘/일러스트 사용 금지
- 네온/형광 색상 사용 금지
- 3단계 이상 중첩된 카드 사용 금지

---

## Stock Level Color Mapping

재고 관리 시스템 특화 컬러 매핑:

| Stock Level    | Badge Color | Label    |
|----------------|-------------|----------|
| `CRITICAL`     | Error       | 위험     |
| `LOW`          | Warning     | 부족     |
| `ADEQUATE`     | Success     | 정상     |
| `OVERSTOCK`    | Info        | 과잉     |

---

## Reference

- 톤앤매너 참조: [SPAO](https://spao.com/)
- 폰트: [Pretendard](https://cactus.tistory.com/306)
- 아이콘: [Lucide](https://lucide.dev/)
- 이 문서는 모든 UI 작업의 기준이 된다. 새로운 컴포넌트를 만들 때 반드시 이 문서를 참조할 것.
