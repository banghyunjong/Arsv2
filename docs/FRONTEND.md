# FRONTEND — UI Conventions

## Stack

- **React 18** with TypeScript
- **Vite** for dev server and build
- **CSS**: Custom design tokens + global styles (no CSS framework)
- **Font**: Pretendard (CDN)
- **Icons**: Lucide React (planned)

## Design System

**톤앤매너 기준 문서: [docs/DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**

SPAO(spao.com) 브랜드의 미니멀/클린 디자인을 참조한다. 모든 UI 작업 시 반드시 이 문서를 참조할 것.

- `packages/ui/src/styles/tokens.css` — CSS custom properties (색상, 타이포, 간격 등)
- `packages/ui/src/styles/global.css` — 글로벌 리셋 + 공통 컴포넌트 클래스

## Architecture

The UI package (`@arsv2/ui`, Layer 5) only depends on `@arsv2/types` for shared type definitions. All data flows through HTTP calls to the Runtime API (`/api/*`).

**The UI never imports from Repo, Service, or Runtime packages.**

## Conventions

### File Structure

```
packages/ui/src/
├── main.tsx          # Entry point (global.css import)
├── App.tsx           # Root component
├── styles/
│   ├── tokens.css    # Design tokens (CSS custom properties)
│   └── global.css    # Global reset + component classes
├── components/       # Reusable UI components (Phase 2)
├── pages/            # Page-level components (Phase 2)
├── hooks/            # Custom React hooks (Phase 2)
└── lib/              # API client, utilities (Phase 2)
```

### API Communication

- Use `fetch` for API calls (no axios in Phase 1)
- All responses are typed as `ApiResponse<T>` from `@arsv2/types`
- API base URL is proxied via Vite config (`/api` → `http://localhost:3000`)

### Component Guidelines

- Functional components only
- Props interfaces defined inline or co-located
- State management: React useState/useReducer for Phase 1, evaluate Zustand for Phase 2 if needed
- **UI 톤앤매너는 반드시 `docs/DESIGN_SYSTEM.md`를 따를 것**
- CSS 클래스는 `global.css`에 정의된 공통 클래스를 사용, 컴포넌트 고유 스타일은 co-located CSS module
- `border-radius` > 4px 금지, 그라데이션 금지, 과도한 box-shadow 금지

## Phase 1 Scope

Minimal UI focused on:
1. CSV file upload (products + inventory)
2. Upload result display

## Phase 2 Planned

- Dashboard with inventory summary
- Low stock alert list
- Reorder history table
- Product catalog browser
