---
name: NextJS-16-TanStack-Query-Agent
description: Rules for Next.js 16 App Router, Turbopack, React Compiler, TanStack Query, and Custom Styling.
---

## Tech Stack Rules
- **Next.js 16+**: Prefer React Server Components (RSC) by default. Use `"use client"` only for components requiring hooks (`useState`, `useEffect`) or browser APIs. Use the new `async` App Router APIs for params/searchParams.
- **TypeScript**: No `any`. Enforce strict typing. Utilize discriminators for component variant states.
- **Styling**: Use Tailwind CSS utility classes following a consistent layout approach.

## Directory Architecture Reference
Always respect and maintain this exact project structure:
- `app/`: Next.js 16 App Router pages, layouts, and API routes (`route.ts`).
- `components/[Feature]/`: Presentational UI components with companion `.stories.tsx` files.
- `lib/`: Core application logic (`agent/`, `auth/`, and `utils/`).
- `tests/unit/`: Unit tests matching codebase features.
- Root: Configuration files (`jest.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`).

## Next.js 16 Framework Paradigms
- **Turbopack Build System**: Turbopack is the default bundler. Do not introduce legacy Webpack plugins or custom loaders that break Turbopack compliance.
- **React Compiler & Memoization**: Support the native React Compiler. Do not manually add `useMemo` or `useCallback` hooks unless explicit non-reactive references are required; let the compiler manage memoization.
- **Routing & Parallel Slots**: All parallel routes require explicit `default.js` files returning `null` or `notFound()`. Builds fail without them.
- **Proxy Layer**: If network requests or headers must be intercepted, use Next.js 16 explicit `proxy.ts` implementations instead of legacy `middleware.ts`.

## TanStack Query Integration
- **Server Cache & Tags**: Leverage Next.js 16 caching controls alongside data layers. When coordinating mutations via `useMutation`, use modern `updateTag()` or `revalidateTag(tag, cacheLife)` for immediate server-side chunk updates.
- **Client Sync**: In client-side components inside `components/`, always trigger `queryClient.invalidateQueries({ queryKey })` within mutation lifecycles to trigger layout recalculations.
- **Loading & Fallbacks**: Utilize React 19.2 features (like `<Suspense>` combined with `<Activity>` for background rendering tasks) to manage active query interfaces without breaking layout state.

## Visual System & Custom Design Language
- Do **NOT** install or use Radix UI or Shadcn UI.
- Adhere strictly to the existing design system: Use a Slate palette (`bg-slate-50`, `text-slate-900`, `border-slate-200`).
- Ensure all container layout cards explicitly feature a `rounded-2xl` border-radius signature.
- Apply transition wrappers (`transition-all duration-200`) to interactive buttons for smooth UI scaling.

## Component Standards & Accessibility (a11y)
- All components must be modular, scalable, and self-contained inside `@/components`.
- Fully comply with WCAG 2.1 AA standards. Ensure interactive elements use appropriate semantic HTML.
- Enforce mandatory `aria-*` tags, keyboard navigability (`tabIndex`), and explicit descriptive labels for screen readers.

## Documentation & Storybook
- Every UI component requires a `.stories.tsx` file alongside it using Storybook Component Story Format 3 (CSF 3).
- Add decorators mocking the Next.js 16 navigation routers if testing path parameters.
- Provide mocked argTypes for all complex variants.
- Generate concise JSDoc blocks for all exported component TypeScript interfaces.

## Automated Verification & Testing
- Every component needs a corresponding Jest unit test (`.test.tsx`) utilizing `@testing-library/react`.
- Always test for: Correct rendering, expected user interactions, and explicit a11y regressions (using `jest-axe`).
- **ESLint Configs**: Code linter modifications must conform strictly to the ESLint Flat Config format natively handled in `eslint.config.mjs`.
- **Autonomy Loop**: You must run `npm run test` or `npm run lint` in the integrated terminal to self-correct any compilation or test suite regressions prior to declaring a task finished.
