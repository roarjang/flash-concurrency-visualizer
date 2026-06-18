# Implementation Roadmap

This roadmap defines how to build the Flash Concurrency Visualizer incrementally from the approved project context, verified experiment data, and UI/UX specification.

The application is a static React visualization for recorded backend concurrency experiments from the public backend repository:

`https://github.com/roarjang/coupon-concurrency-lab`

It must not execute live concurrency tests, call a backend API, create serverless functions, or modify the backend repository.

## 1. Roadmap Overview

The implementation should proceed in small, inspectable steps:

`small implementation step -> verification -> commit`

The delivery order should establish the frontend foundation, define verified static data contracts, build one complete Point Lost Update vertical slice, validate that slice, and only then extend the same system to Coupon Overselling, Duplicate Coupon Issuance, and the shared Redis architecture section.

Point Lost Update is the first vertical slice because it has the smallest scenario, the clearest expected-vs-actual contrast, and a strategy set that exercises the shared UI patterns: baseline failure reproduction, pessimistic lock, optimistic lock without retry, and atomic update.

Shared components should be validated with Point before they are generalized. Avoid broad abstractions until at least one complete experiment view exists and the actual duplication is visible.

## 2. Fixed Technical Decisions

Implementation must follow these settled decisions:

- React + TypeScript + Vite.
- Recharts for chart-based comparisons where a chart remains the clearest fit for later experiments.
- Static local data derived from `docs/experiment-data.md`.
- No backend API.
- No serverless functions.
- No database.
- No authentication.
- No live concurrency execution.
- Static Vercel deployment.
- Build command compatible with `npm run build`.
- Build output directory `dist`.
- Korean-first UI.
- English technical terminology as supporting text.
- Single-page experiment tabs.
- Point Lost Update selected by default.
- Duplicate Coupon Issuance included in the first public release.
- Explicit Point failure-playback action; no autoplay on page load, automatic progression once started.
- Replay, post-completion stage inspection, and reduced-motion support.
- Coupon Overselling uses no playback, strategy selector, chart, or dynamic result summary.
- Coupon Overselling uses a compact problem summary, four always-visible database strategy cards, and collapsed disclosures.
- Duplicate Coupon Issuance uses no playback, strategy selector, chart, or dynamic result summary.
- Duplicate Coupon Issuance uses a compact problem summary, two always-visible database strategy cards, and collapsed disclosures.
- Collapsed evidence section on desktop and mobile.
- Public GitHub evidence links in rendered UI.
- Local `repositoryPath` values kept as development metadata and never rendered.
- Redis is a shared coupon-issuance architecture extension, not a fourth experiment.
- Redis renders once after the experiment workspace and outside experiment selection.
- Redis uses a static architecture flow, two always-visible capability cards, and collapsed disclosures.
- Redis uses no playback, animation, chart, selector, dynamic summary, or dedicated tab.
- PostgreSQL remains the durable source of truth.

Do not reopen these decisions during MVP implementation.

## 3. Proposed Frontend Architecture

The structure below is a suggested target `src` layout for later implementation work.

Recommended approach: clear feature-based boundaries with a small shared layer. Do not introduce routing, global state libraries, a heavy design system, or a heavy animation dependency for the MVP.

Suggested directory tree:

```text
flash-concurrency-visualizer/
  src/
    app/
      App.tsx
      appState.ts
    components/
      layout/
        PageShell.tsx
        LandingSection.tsx
      selectors/
        ExperimentTabs.tsx
      experiment/
        ExperimentWorkspace.tsx
        ExperimentConditions.tsx
        EvidenceDisclosure.tsx
      point/
        PointWorkspace.tsx
        PointComparisonCards.tsx
        PointPlayback.tsx
        PointConditions.tsx
        PointExplanation.tsx
      coupon/
        CouponWorkspace.tsx
        CouponComparisonCards.tsx
        CouponConditions.tsx
        CouponExplanation.tsx
      duplicate/
        DuplicateWorkspace.tsx
        DuplicateComparisonCards.tsx
        DuplicateConditions.tsx
        DuplicateExplanation.tsx
      redis/
        RedisGateSection.tsx
        RedisCapabilityCards.tsx
        RedisResponsibilityDisclosure.tsx
        RedisEvidenceDisclosure.tsx
    data/
      experiments.ts
      strategies.ts
    types/
      experiment.ts
      strategy.ts
      evidence.ts
    utils/
      formatters.ts
      evidence.ts
      validation.ts
    a11y/
      reducedMotion.ts
      ids.ts
    styles/
      globals.css
```

Architecture guidance:

- `app/` owns the selected experiment.
- `data/` contains verified static records only after Phase 1.
- `types/` defines the contract between data and UI.
- `components/experiment/` owns the shared explanation structure.
- `components/point/PointPlayback.tsx` owns the focused Lost Update failure playback and state beginning in Phase 4.
- `components/coupon/` reuses the recruiter-first card and disclosure pattern without importing Point playback behavior.
- `components/duplicate/` reuses the finalized Coupon static comparison pattern without playback, charts, selectors, or Redis content.
- `redis/` owns one shared section rendered after the experiment panel, independent of the selected experiment.
- The shared Redis section applies only to coupon issuance scenarios and must not imply that Redis is part of Point Lost Update.

## 4. Static Data Model Plan

Recommended MVP representation: TypeScript constants with strict TypeScript types.

Why this choice:

- The data is static and authored by the same frontend codebase.
- TypeScript constants keep Korean and English labels, evidence metadata, chart values, and caveats close to the typed model.
- The MVP does not need JSON loading, schema parsing, or runtime fetch behavior.
- Development-time validation can still be added with small utility checks or unit tests.

Implementation order:

1. Define shared experiment and strategy types.
2. Define evidence metadata types with separate `repositoryPath` and `githubUrl` fields.
3. Define scenario condition types for point, stock, duplicate, and Redis records.
4. Define expected result and observed result shapes.
5. Define invariant assertions separately from documented observed examples.
6. Define comparison values for Point and Coupon strategy cards and any separately approved later visualizations.
7. Keep Redis admission-control records separate from database strategy comparison data.
8. Define Korean and English display names.
9. Define caveat fields, especially for optimistic-lock observed examples.
10. Keep `testStatus` and `currentlyExecutable` as evidence metadata, not user-facing result logic.

Validation principles:

- No invented values.
- No silent numeric defaults for missing data.
- Optional fields must be explicit and intentionally handled.
- Optimistic-lock observed runs must be labeled as examples.
- Current executability must not invalidate recorded experiment results.
- Local `repositoryPath` values must not be rendered in the UI.
- Public GitHub URLs may be rendered.
- Missing evidence links should be omitted or shown as unavailable, not guessed.

## 5. Shared UI Foundation

Shared components should support all three experiment groups without forcing every experiment into the same comparison shape.

Shared components:

- Application shell.
- Compact title and one-line Korean message.
- Experiment tabs.
- Experiment condition display.
- Compact Point, Coupon, and Duplicate problem summaries.
- Point comparison cards.
- Coupon comparison cards.
- Duplicate comparison cards.
- Shared Redis architecture flow and capability cards.
- Compact collapsed strategy explanation.
- Collapsed evidence disclosure.
- Responsive layout shell.
- Focused Lost Update failure playback introduced in Phase 4.

Component ownership should follow the UX duplication rules:

- Conditions own setup values.
- Playback owns the transaction-only Lost Update failure mechanism beginning in Point Phase 4.
- Problem summary owns the concise failure definition.
- Point comparison cards own all Point strategy-specific outcomes.
- Coupon comparison cards own all Coupon database-strategy outcomes.
- Duplicate comparison cards own the transaction-only and DB UNIQUE outcomes.
- Tooltips and expandable details own secondary counts.
- Strategy explanation owns concise mechanism and trade-off copy.
- The shared Redis flow owns admission control; Redis capability cards own Counter/Lua responsibilities; the Redis disclosure owns PostgreSQL and cross-store boundaries.
- Evidence disclosure owns source verification.

## 6. Phase 0: Project Foundation

### Goal

Prepare the frontend project so later phases can add typed data and UI safely.

### Scope

Repository setup, dependency confirmation, base Vite React TypeScript foundation, global layout baseline, and production build verification.

### Files or areas likely to be affected

Suggested future areas:

- `package.json`
- `vite.config.*`
- `tsconfig*.json`
- `src/app/`
- `src/styles/`
- `src/main.*`
- `src/App.*`

### Tasks

- Inspect current frontend repository state.
- Confirm whether a Vite React TypeScript project already exists.
- Initialize Vite React TypeScript only if needed.
- Install only required dependencies for the MVP: React, TypeScript tooling, Vite, and Recharts.
- Establish base TypeScript configuration.
- Establish global layout shell and typography baseline.
- Add minimal design tokens for spacing, typography, status colors, and focus states.
- Add initial accessibility baseline for document structure and focus visibility.
- Ensure `npm run build` succeeds.

### Acceptance Criteria

- The project builds with `npm run build`.
- No backend API, serverless function, database, authentication, or runtime concurrency execution exists.
- Recharts is available for later chart phases.
- The base page renders a static shell without experiment logic.
- The build output remains compatible with Vite `dist`.

### Explicit Non-Goals

- Do not implement experiment data.
- Do not implement charts.
- Do not implement animation.
- Do not deploy to Vercel yet.
- Do not add routing.

### Suggested Commit Boundary

`chore: initialize visualizer frontend foundation`

## 7. Phase 1: Data Contracts and Verified Static Data

### Goal

Turn `docs/experiment-data.md` into typed static frontend data before building experiment-specific UI.

### Scope

Type definitions, static constants, evidence metadata, data validation, and transcription checks.

### Files or areas likely to be affected

Suggested future areas:

- `src/types/experiment.ts`
- `src/types/strategy.ts`
- `src/types/evidence.ts`
- `src/data/experiments.ts`
- `src/data/strategies.ts`
- `src/utils/validation.ts`
- Optional data validation test files in the later testing phase.

### Tasks

- Create TypeScript domain types for experiments, strategies, scenario conditions, expected results, observed results, caveats, and evidence metadata.
- Transcribe verified Point, Overselling, Duplicate, and Redis records from `docs/experiment-data.md`.
- Store Korean and English names for experiments and strategies.
- Store baseline scenarios as intentional failure-reproduction configurations.
- Store strategy groups: Baseline, Database strategies, and Redis admission control.
- Store chart-ready values without losing the underlying recorded values.
- Store optimistic-lock values as documented observed examples where applicable.
- Store `testStatus` and `currentlyExecutable` separately from user-facing result conclusions.
- Add lightweight validation to prevent missing required values and accidental local path rendering.
- Verify every numeric value against `docs/experiment-data.md`.

### Acceptance Criteria

- Every displayed experiment record comes from `docs/experiment-data.md`.
- Point, Overselling, Duplicate, Redis Counter, and Redis Lua records are available in typed data.
- No local backend path is marked as renderable UI content.
- Public GitHub URLs are available for evidence rendering.
- No numeric field is silently defaulted.
- Optimistic-lock example values are explicitly labeled as observed examples.

### Explicit Non-Goals

- Do not build visual experiment UI yet.
- Do not add live data loading.
- Do not create JSON as the primary MVP format unless TypeScript constants prove insufficient.
- Do not invent missing experiment values.

### Suggested Commit Boundary

`feat: add verified static experiment data model`

## 8. Phase 2: Application Shell and Navigation

### Goal

Build the single-page structure and state flow that all experiments will use.

### Scope

Landing section, experiment tabs, default experiment selection, and state boundaries for later experiment-specific controls.

### Files or areas likely to be affected

Suggested future areas:

- `src/app/App.tsx`
- `src/app/appState.ts`
- `src/components/layout/LandingSection.tsx`
- `src/components/selectors/ExperimentTabs.tsx`
- `src/components/experiment/ExperimentWorkspace.tsx`

### Tasks

- Implement compact landing content:
  - `Flash Concurrency Visualizer`
  - `같은 요청도 적용한 전략에 따라 결과가 달라집니다.`
  - Experiment tabs near the top.
- Remove `RECORDED CONCURRENCY EXPERIMENTS`, the English supporting purpose line, the primary live-test disclaimer, and the `EXPERIMENT` eyebrow from the first-view hierarchy.
- Keep the static recorded-data limitation available in secondary content rather than the hero.
- Add experiment tabs:
  - Point Lost Update.
  - Coupon Overselling.
  - Duplicate Coupon Issuance.
- Select Point Lost Update by default.
- Switch experiment content without route navigation.
- Do not create Point strategy-selection state; all four Point outcomes will be shown together in Phase 3.
- Allow only separately approved later experiments to add selected-strategy state.
- Do not create Point playback state or reserve request-flow layout in Phase 2.
- Keep state URL-independent for the MVP.
- Keep internal data and component boundaries route-compatible for a future extension without adding routing.

### Acceptance Criteria

- Point Lost Update is selected on first load.
- All three experiment tabs are present.
- Duplicate Coupon Issuance appears as the third tab.
- Switching tabs updates the selected experiment content; later experiments may expose their own strategy controls.
- No route-based experiment pages are required.
- The first view stays compact while the recorded-data limitation remains discoverable in secondary content.

### Explicit Non-Goals

- Do not implement full experiment content yet.
- Do not implement animation playback.
- Do not add routing.
- Do not add persistence for selected tabs or later strategy controls.

### Suggested Commit Boundary

`feat: add single-page experiment navigation`

## 9. Phase 3: Point Lost Update Static Vertical Slice

### Goal

Implement a recruiter-first static Point Lost Update experience that communicates the problem and four strategy outcomes within about 30 seconds.

### Scope

Hero simplification, three scenario tabs, compact Point workspace summary, four compact strategy comparison cards, and consolidated secondary disclosures.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/experiment/ExperimentWorkspace.tsx`
- `src/components/experiment/ExperimentConditions.tsx`
- `src/components/point/PointWorkspace.tsx`
- `src/components/point/PointComparisonCards.tsx`
- `src/components/point/PointConditions.tsx`
- `src/components/point/PointExplanation.tsx`
- `src/components/experiment/EvidenceDisclosure.tsx`
- `src/components/layout/LandingSection.tsx`

### Tasks

- Simplify the first-view hero:
  - Keep `Flash Concurrency Visualizer`.
  - Keep only `같은 요청도 적용한 전략에 따라 결과가 달라집니다.` as primary supporting copy.
  - Remove the English supporting line, recorded-experiment eyebrow, primary live-test disclaimer, and experiment eyebrow from the first-view hierarchy.
  - Move the static recorded-data limitation into secondary disclosure or footer content.
- Keep all three scenario tabs near the top.
- Add a compact Point workspace summary without strategy-specific values.
- Remove the separate selected-strategy result summary.
- Remove the Point strategy selector; show all four strategy cards together instead.
- Display Point scenario conditions in a collapsed disclosure:
  - Initial balance `10,000`.
  - Deduction amount `1,000`.
  - Concurrent requests `15`.
  - Maximum valid successful deductions `10`.
  - Separate the compact failure-reproduction context from the numeric grid:
    - `@Version 적용 전 · Retry 없음 · 트랜잭션 기반 차감`.
- Add four substantially compact strategy cards:
  - Transaction Only: `문제 발생`, `잔액 8,000원`.
  - Pessimistic Lock: `정상 차감`, `잔액 0원`.
  - Optimistic Lock: `충돌 감지`, `잔액 7,000원`.
  - Atomic Update: `정상 차감`, `잔액 0원`.
- Limit each card to Korean strategy name, prominent status, neutral numeric result, and one short mechanism or conclusion.
- Do not use `불변식` as the primary recruiter-facing label.
- For Optimistic Lock, do not add an `실행 예시` badge; keep no-retry and run-variability detail in collapsed technical content.
- Remove report-style card content:
  - `성공 수 기준 잔액 -5,000원`.
  - Repeated execution-condition labels.
  - Long invariant explanations.
  - Duplicated caveat blocks.
- Avoid a separate `수치로 보기` table for the Point view.
- Do not present the Point comparison as a chart-led report.
- Remove the static request-flow placeholder from Phase 3.
- Consolidate strategy mechanism and the most important trade-off into two concise lines per strategy in one collapsed explanation.
- Keep the static-data limitation and public evidence links in collapsed secondary content.

### Acceptance Criteria

- The Point result is understandable without animation.
- The Point comparison is presented as compact cards rather than a chart/table pair.
- All four cards are visible together without a Point strategy selector.
- No separate selected-strategy result summary duplicates card content.
- The Point workspace summary contains no strategy-specific result block.
- Transaction-only failure is framed as an intentional failure-reproduction configuration, not obsolete code.
- Optimistic-lock variability detail remains available in collapsed technical content without adding a badge to the card.
- Conditions, technical explanation, static-data limitation, and evidence are collapsed by default.
- No static request-flow placeholder appears in Phase 3.
- Evidence is collapsed by default and uses public GitHub URLs.
- No local repository paths are rendered.
- No duplicated metric block repeats the same values unnecessarily.

### Explicit Non-Goals

- Do not implement Overselling or Duplicate views yet.
- Do not implement Redis views yet.
- Do not implement request-flow animation yet.
- Do not add live backend behavior.

### Suggested Commit Boundary

`feat: implement point lost update static slice`

## 10. Phase 4: Point Lost Update Failure Playback

### Goal

Add one focused playback that explains why the transaction-only Lost Update failure occurred.

### Scope

A working playback state machine, explicit play control, automatic progression through visible stages, replay, post-completion stage inspection, reduced-motion behavior, and the conceptual Lost Update overwrite story.

Phase boundary:

- Phase 3 contains no static request-flow placeholder.
- Phase 4 introduces the request-flow area together with the working failure playback and controls.
- Do not add a large request-flow area before the experience is functional.
- Playback owns the failure mechanism only. The static strategy cards continue to own strategy differences and outcomes.
- This phase is not a benchmark, live load test, performance visualization, or strategy-comparison animation.
- The playback is conceptual, not a literal replay of all 15 concurrent requests.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/point/PointPlayback.tsx`
- `src/components/point/PointWorkspace.tsx`
- `src/index.css`

### Tasks

- Implement the playback story:
  - show the initial balance.
  - show representative requests, such as A and B, reading the same balance.
  - show each request calculating a new balance.
  - show A saving `9,000원`.
  - show B saving the same `9,000원` without knowing about A's change.
  - show the conceptual two-request result: two deductions attempted, final balance `9,000원`, Lost Update.
  - transition attention to the unchanged strategy comparison cards.
- Organize the sequence into the five visible stages `동시 읽기`, `각자 계산`, `A 저장`, `덮어쓰기`, and `결과`.
- Use a small representative number of visual nodes rather than all 15 requests.
- Keep the recorded 15-request result, including balance `8,000원`, in the static transaction-only strategy card rather than the conceptual playback result.
- Before playback, show only the lightweight current balance `10,000원`.
- Add the explicit `▶ 재생` action and change it to `↻ 다시 보기` after completion.
- Keep stages 1 through 4 visible for approximately two seconds each; keep the result visible until user interaction.
- Keep stage badges non-interactive during playback and make them selectable after completion.
- Respect `prefers-reduced-motion` by skipping timed progression and exposing the explanatory stages immediately.
- Keep the compact Point workspace summary, comparison cards, and collapsed details accessible before playback.
- Reset playback to idle when the experiment changes.
- Keep all four strategy cards static during playback; do not animate strategies, update a chart, or create/update a selected-strategy summary.
- Do not add instructional control copy around the idle state.
- Keep the recorded-data and no-live-execution limitation in the secondary evidence disclosure.
- Do not add next/previous navigation, pause/resume controls, speed controls, or timeline scrubbing.
- Implement with React state and CSS transitions if sufficient.
- Avoid a heavy animation library unless later implementation proves CSS transitions are inadequate.

### Acceptance Criteria

- Playback does not autoplay on page load.
- Result remains understandable when playback is never started.
- The playback earns its page space by explaining the Lost Update failure mechanism; it is not a decorative placeholder.
- Playback makes the stale-read/competing-write/overwrite sequence understandable.
- Playback ends by directing attention to the static strategy cards rather than animating a solution.
- Playback completion does not alter the four card outcomes or reveal a separate dynamic result panel.
- Replay restarts the sequence.
- After completion, selecting a stage badge shows that stage immediately without restarting automatic playback.
- Reduced-motion mode avoids unnecessary motion.
- No visual timing is presented as a benchmark.
- Representative nodes do not imply one node per actual request, and the playback does not replay all 15 requests one by one.

### Explicit Non-Goals

- Do not animate all 15 Point requests individually.
- Do not introduce real timers as performance evidence.
- Do not add a heavy animation dependency without a documented reason.
- Do not implement strategy-specific animations.
- Do not implement separate pessimistic-lock, optimistic-lock, or atomic-update playback.
- Do not replay every experiment record or every recorded request.
- Do not add next/previous navigation, pause/resume controls, speed controls, or timeline scrubbing.
- Do not implement coupon, duplicate-issuance, or Redis playback.
- Do not add a Point strategy selector to control playback.

### Suggested Commit Boundary

`feat: add point lost update failure playback`

## 11. Phase 5: Coupon Overselling Extension

### Goal

Extend the finalized recruiter-first Point comparison pattern to Coupon Overselling without copying Point playback.

### Scope

Compact Coupon problem summary, four always-visible database strategy comparison cards, collapsed conditions, collapsed strategy explanation, and collapsed evidence.

### Files or areas likely to be affected

Suggested future areas:

- `src/App.tsx`
- `src/components/coupon/CouponWorkspace.tsx`
- `src/components/coupon/CouponComparisonCards.tsx`
- `src/components/coupon/CouponConditions.tsx`
- `src/components/coupon/CouponExplanation.tsx`
- Shared evidence disclosure only where reuse does not introduce Point-specific wording.
- `src/index.css`

### Tasks

- Add a compact problem summary that makes this scan path clear:
  - Coupon stock `100`.
  - Issued records `1,000`.
  - `재고 초과 발급`.
  - Strategy differences.
- Show all four database strategies together:
  - `트랜잭션만 적용`.
  - `비관적 락`.
  - `낙관적 락`.
  - `조건부 원자적 업데이트`.
- Give each card a prominent plain-language status, a neutral numeric outcome, and one short explanation:
  - Transaction Only: `재고 초과 발급`, `발급 기록 1,000건`.
  - Pessimistic Lock: `재고 한도 유지`, `발급 기록 100건`.
  - Optimistic Lock: `충돌 감지`, `발급 기록 100건`.
  - Atomic Update: `재고 한도 유지`, `발급 기록 100건`.
- Keep optimistic-lock scheduling and no-retry variability in collapsed technical detail rather than a large badge or caveat block.
- Add collapsed stock conditions:
  - Coupon stock `100`.
  - Concurrent requests `1,000`.
  - Distinct users `1,000`.
  - Before `Coupon.@Version` for transaction-only failure reproduction.
  - Lock hold or delay only where relevant.
- Add a compact collapsed strategy explanation.
- Add collapsed evidence and keep the recorded-data limitation secondary.
- Keep Redis Counter and Redis Lua for the shared Phase 7 section outside experiment selection.

### Acceptance Criteria

- Overselling can be selected from the second experiment tab.
- A reviewer can scan `재고 100장 → 발급 기록 1,000건 → 재고 초과 발급 → 전략별 결과` within a few seconds.
- All four database strategy outcomes are visible together.
- The stock limit and issued-record count are clearly distinguished without a chart.
- Transaction-only overselling is framed as intentional failure reproduction.
- Optimistic-lock variability remains discoverable in collapsed technical detail.
- Conditions, strategy explanation, static-data limitation, and evidence are collapsed by default.
- Reused components do not force Point-specific wording into coupon content.
- Coupon uses no playback, strategy selector, grouped bar chart, or dynamic summary section.

### Explicit Non-Goals

- Do not implement Duplicate Issuance in this phase.
- Do not implement Redis section in this phase.
- Do not implement Coupon playback.
- Do not add a strategy selector.
- Do not add a grouped bar chart.
- Do not add a separate dynamic expected-vs-actual summary.
- Do not present the documented pessimistic-lock duration as a general benchmark.

### Suggested Commit Boundary

`feat: add coupon overselling database strategies`

## 12. Phase 6: Duplicate Coupon Issuance Extension

### Goal

Extend the finalized Coupon static comparison pattern to Duplicate Coupon Issuance for the first public release.

### Scope

Compact Duplicate problem summary, two always-visible comparison cards, collapsed conditions, collapsed strategy explanation, and collapsed evidence.

### Files or areas likely to be affected

Suggested future areas:

- `src/App.tsx`
- `src/components/duplicate/DuplicateWorkspace.tsx`
- `src/components/duplicate/DuplicateComparisonCards.tsx`
- `src/components/duplicate/DuplicateConditions.tsx`
- `src/components/duplicate/DuplicateExplanation.tsx`
- Shared evidence disclosure only where reuse does not introduce Point- or Coupon-specific wording.
- `src/index.css`

### Tasks

- Add a compact problem summary that makes this scan path clear:
  - Allowed issuance for the same user-coupon pair: `1`.
  - Recorded issued records: `10`.
  - `중복 발급 발생`.
  - DB UNIQUE result: `1`.
- Show both database strategies together:
  - `트랜잭션만 적용`.
  - `DB 유니크 제약조건`.
- Give each card a prominent plain-language status, neutral numeric outcome, and one short explanation:
  - Transaction Only: `중복 발급 발생`, `발급 기록 10건`.
  - DB Unique Constraint: `중복 발급 방지`, `발급 기록 1건`.
- Add collapsed duplicate scenario conditions:
  - Concurrent requests `100`.
  - Same user.
  - Same coupon.
  - Allowed issuance `1`.
  - `DB UNIQUE 적용 전 · Retry 없음 · 애플리케이션 레벨 중복 확인`.
- Do not show coupon stock in the Duplicate conditions grid or present Phase 6 as a stock-control comparison.
- Add a compact collapsed strategy explanation using two concise lines per strategy.
  - Transaction Only: `여러 요청이 중복 확인을 통과할 수 있다.`
  - Application-level lookup alone cannot guarantee final uniqueness.
- Explain that DB UNIQUE protects `(user_id, coupon_id)` uniqueness and is not stock control.
- Add collapsed evidence and keep the recorded-data limitation secondary.
- Keep Redis Lua for the shared Phase 7 section outside experiment selection.

### Acceptance Criteria

- Duplicate Coupon Issuance is included in the first public release.
- It appears as the third experiment tab.
- A reviewer can scan `허용 1건 → 발급 기록 10건 → 중복 발급 발생 → DB UNIQUE 적용 후 1건` within a few seconds.
- Both database strategy outcomes are visible together.
- The uniqueness invariant is distinct from Point balance and global stock limits.
- The problem summary, cards, and disclosures have distinct information ownership.
- Conditions, strategy explanation, static-data limitation, and evidence are collapsed by default.
- The unique constraint is described as the final database guard for user-coupon uniqueness, not as stock control.
- Duplicate uses no playback, chart, strategy selector, dynamic summary, or Redis content.
- Evidence links use public GitHub URLs.

### Explicit Non-Goals

- Do not defer Duplicate out of the MVP.
- Do not merge Duplicate into the Overselling explanation.
- Do not implement playback.
- Do not add chart visualization.
- Do not add a strategy selector.
- Do not add a separate dynamic expected-vs-actual summary.
- Do not implement Redis content in Phase 6.
- Do not implement or compare stock-control strategies.
- Do not imply DB UNIQUE controls total coupon stock.

### Suggested Commit Boundary

`feat: add duplicate coupon issuance experiment`

## 13. Phase 7: Shared Redis Admission-Control Section

### Goal

Implement one shared coupon-issuance architecture section that explains Redis admission control before PostgreSQL persistence.

### Scope

One shared Redis section outside the experiment tab panel, a static architecture flow, two always-visible capability cards, a collapsed responsibility explanation, and collapsed evidence.

### Files or areas likely to be affected

Suggested future areas:

- `src/App.tsx`
- `src/components/redis/RedisGateSection.tsx`
- `src/components/redis/RedisCapabilityCards.tsx`
- `src/components/redis/RedisResponsibilityDisclosure.tsx`
- `src/components/redis/RedisEvidenceDisclosure.tsx`
- `src/index.css`

### Tasks

- Render `RedisGateSection` once after the selected experiment workspace and outside the experiment tab panel.
- Keep Point, Coupon, and Duplicate workspaces unchanged.
- Do not add Redis to experiment selection or create a fourth experiment tab.
- Add the section title `Redis 기반 선행 제어`.
- Add the supporting description `쿠폰 발급 요청을 PostgreSQL 저장 전에 선별하는 아키텍처입니다.`
- Add the static architecture flow:
  - `많은 요청`.
  - `Redis 선행 승인`.
  - `PostgreSQL 저장`.
- Place this boundary copy near the flow:
  - `Redis 승인은 발급 완료가 아닙니다.`
  - `PostgreSQL 저장이 완료되어야 최종 기록이 됩니다.`
- Show two capability cards together without interaction:
  - Redis Counter:
    - `재고 슬롯 선행 제어`.
    - `1,000건 요청 → 100건 승인`.
    - `사용자 중복은 확인하지 않음`.
  - Redis Lua Script:
    - `재고와 사용자 조건을 함께 확인`.
    - Stock scenario: `1,000건 → 100건`.
    - Duplicate scenario: `100건 → 1건`.
- Add a collapsed responsibility explanation:
  - PostgreSQL remains the durable source of truth.
  - Redis approval is not issuance completion.
  - Database uniqueness constraints remain necessary.
  - Redis and PostgreSQL are not one distributed transaction.
- Add collapsed Redis evidence for the test fixture, Lua script, and Redis consistency boundary document.
- Label Redis implementation paths as experiment fixtures, not public production APIs.
- Reuse the existing card and disclosure visual language.

### Acceptance Criteria

- Redis renders exactly once.
- Redis is outside experiment selection and remains independent of the selected Point, Coupon, or Duplicate tab.
- Redis is presented as a shared coupon-issuance architecture extension, not a fourth concurrency problem.
- The Point, Coupon, and Duplicate workspaces remain unchanged.
- The architecture flow communicates `많은 요청 → Redis 선행 승인 → PostgreSQL 저장`.
- Redis Counter and Redis Lua are visible together without a selector.
- Redis applies to coupon issuance scenarios only and is not associated with Point Lost Update.
- Redis Counter is not described as duplicate protection.
- Redis Lua is not described as durable database truth.
- Redis approval is not described as issuance completion.
- PostgreSQL remains the durable source of truth and DB uniqueness remains the final duplicate guard.
- No distributed transaction claim appears.
- Evidence links include relevant public GitHub documents and source files.

### Explicit Non-Goals

- Do not add a fourth experiment or dedicated Redis tab.
- Do not add playback or animation.
- Do not add a chart.
- Do not add a selector, capability tabs, or dynamic summary.
- Do not add backend Redis APIs.
- Do not add live Redis calls.
- Do not imply Redis replaces PostgreSQL persistence.
- Do not add reconciliation, TTL, or production monitoring features not documented as implemented.

### Suggested Commit Boundary

`feat: add shared redis admission section`

## 14. Phase 8: Responsive Design and Accessibility

### Goal

Make the MVP usable and understandable across desktop, tablet, mobile, keyboard, screen reader, and reduced-motion contexts.

### Scope

Responsive layout refinement, interaction accessibility, chart alternatives, disclosure behavior, motion preferences, and touch usability.

### Files or areas likely to be affected

Suggested future areas:

- `src/styles/`
- `src/components/layout/`
- `src/components/selectors/`
- `src/components/charts/`
- `src/components/animation/`
- `src/components/experiment/EvidenceDisclosure.tsx`
- `src/a11y/`

### Tasks

- Verify desktop layout for scanability.
- Verify tablet layout with wrapping selectors.
- Verify mobile layout order:
  - compact title and message,
  - experiment tabs,
  - Point workspace summary,
  - Point playback,
  - four Point strategy cards,
  - collapsed Point details.
- Verify Coupon layout order: problem summary, four strategy cards, collapsed details.
- Verify Duplicate layout order: problem summary, two strategy cards, collapsed details.
- Verify the shared Redis section follows the experiment panel and remains outside tab selection.
- Keep the Redis flow and both capability cards readable without horizontal scrolling.
- Keep the finalized representative Point request count on mobile.
- Ensure experiment tabs are keyboard-accessible and expose selected state.
- Ensure focus states are visible.
- Ensure evidence disclosure exposes expanded and collapsed state.
- Ensure replay and post-completion stage controls are accessible.
- Respect reduced-motion preferences.
- Ensure state is not communicated by color alone.
- Ensure evidence links have comfortable touch targets.

### Acceptance Criteria

- Mobile users can understand the conclusion without horizontal scrolling.
- Keyboard users can operate tabs, Point playback controls, completed stage badges, and evidence disclosure.
- Screen readers receive each experiment problem summary and card outcomes before secondary details.
- Reduced-motion users can access completed state without motion-heavy playback.
- The Redis flow and capability cards have a meaningful semantic reading order.

### Explicit Non-Goals

- Do not add a full design system.
- Do not add an internationalization framework.
- Do not optimize for every possible chart viewport before MVP validation.

### Suggested Commit Boundary

`feat: improve responsive and accessible experience`

## 15. Phase 9: Testing and Quality Verification

### Goal

Add practical portfolio-frontend quality checks without excessive infrastructure.

### Scope

Type checks, production build, linting, data validation, key component tests, interaction tests, evidence URL checks, accessibility checks, and responsive manual checks.

### Files or areas likely to be affected

Suggested future areas:

- `package.json`
- Test configuration files only if needed.
- `src/**/*.test.*`
- `src/data/`
- `src/utils/validation.ts`

### Tasks

Essential checks:

- TypeScript check.
- Production build.
- Linting if a linter is configured.
- Data validation tests for required fields and no renderable local paths.
- Evidence URL format checks for public GitHub `main` branch links.
- Experiment switching tests.
- Point playback replay and completed-stage selection tests.
- Reduced-motion behavior check.
- Basic accessibility checks for controls and disclosures.
- Manual desktop and mobile responsive checks.

Optional checks:

- Component snapshot tests for static sections.
- Visual regression screenshots.
- Shared Redis section rendering and placement tests.
- Link availability checks that access the network, if approved and stable.

### Acceptance Criteria

- `npm run build` succeeds.
- TypeScript catches invalid data shape changes.
- Data validation prevents missing required numeric fields.
- Switching experiments does not leave stale Point playback state.
- Evidence links do not render local repository paths.
- Point playback controls work with keyboard and reduced-motion settings.
- No major accessibility issue blocks MVP review.

### Explicit Non-Goals

- Do not build excessive end-to-end infrastructure before the MVP is stable.
- Do not require backend services in tests.
- Do not require network access for the normal test suite.
- Do not test actual Java concurrency behavior from the frontend.

### Suggested Commit Boundary

`test: add visualizer quality checks`

## 16. Phase 10: Vercel Deployment

### Goal

Deploy the static Vite application to Vercel with the simplest possible setup.

### Scope

Build verification, Vercel project setup, public URL verification, evidence link verification, mobile check, and metadata.

### Files or areas likely to be affected

Suggested future areas:

- `package.json`
- Vite metadata files if already present.
- `index.html`
- Vercel configuration only if Vite defaults are insufficient.

### Tasks

- Verify local production build with `npm run build`.
- Confirm output directory is `dist`.
- Connect the GitHub repository to Vercel.
- Use Vercel build command `npm run build`.
- Use Vercel output directory `dist`.
- Avoid serverless functions, API routes, databases, and authentication.
- Avoid required environment variables for the MVP.
- Add Vercel-specific configuration only if required.
- Verify direct page refresh behavior for the single-page MVP.
- Verify public GitHub evidence links from the deployed site.
- Verify mobile rendering from the deployed URL.
- Set appropriate page title and metadata.
- Defer custom domain unless separately approved.

### Acceptance Criteria

- Vercel deployment succeeds from the connected GitHub repository.
- The deployed app is static.
- No secrets or runtime environment variables are required.
- The public URL shows all three experiment tabs.
- Evidence links point to `https://github.com/roarjang/coupon-concurrency-lab`.
- Mobile first impression remains clear.

### Explicit Non-Goals

- Do not add backend deployment.
- Do not add Vercel serverless functions.
- Do not add a database.
- Do not add custom domain work unless approved later.

### Suggested Commit Boundary

`chore: prepare vercel static deployment`

## 17. Phase 11: Portfolio Integration

### Goal

Make the deployed visualizer discoverable from the broader portfolio and supporting repository materials.

### Scope

Portfolio link updates, visualizer repository README updates, short project explanation, and recruiter-facing final checks.

### Files or areas likely to be affected

Suggested future areas:

- Visualizer repository `README.md`.
- Portfolio repository or portfolio content, if separately approved.
- Resume or PDF portfolio link, if separately approved.

### Tasks

- Add deployed visualizer URL to the portfolio.
- Add or update the visualizer repository README.
- Clearly distinguish the backend repository and visualizer repository.
- Link to the backend evidence repository.
- Add a short explanation that this is a recorded-result visualizer, not a live test runner.
- Verify first impression from the final portfolio path.
- Verify the link works from the final PDF portfolio.

### Acceptance Criteria

- Recruiters can reach the visualizer from the portfolio.
- The visualizer README distinguishes static frontend from backend concurrency project.
- The backend public repository link is easy to find.
- The final portfolio link opens the deployed Vercel app.

### Explicit Non-Goals

- Do not modify portfolio assets during earlier roadmap phases.
- Do not rewrite the backend README unless separately approved.
- Do not present the project as a production payment system.

### Suggested Commit Boundary

`docs: add visualizer portfolio integration notes`

## 18. Commit Plan

Recommended small commit groups:

| Group | Example commit message |
| --- | --- |
| Project foundation | `chore: initialize visualizer frontend foundation` |
| Experiment data model | `feat: add verified static experiment data model` |
| Shared application shell | `feat: add single-page experiment navigation` |
| Point static view | `feat: implement point lost update static slice` |
| Point failure playback | `feat: add point lost update failure playback` |
| Overselling support | `feat: add coupon overselling database strategies` |
| Duplicate support | `feat: add duplicate coupon issuance experiment` |
| Redis section | `feat: add shared redis admission section` |
| Accessibility and responsive work | `feat: improve responsive and accessible experience` |
| Tests | `test: add visualizer quality checks` |
| Deployment documentation or setup | `chore: prepare vercel static deployment` |
| Portfolio integration | `docs: add visualizer portfolio integration notes` |

Do not create commits during roadmap authoring. Each implementation commit should be small enough to inspect independently.

## 19. Definition of Done

MVP completion checklist:

- Single-page React + TypeScript + Vite app exists.
- Production build succeeds with `npm run build`.
- Build output is `dist`.
- No backend API, serverless function, database, authentication, or live concurrency execution exists.
- Static data comes only from verified records in `docs/experiment-data.md`.
- No invented numeric values are displayed.
- All three experiment tabs exist:
  - Point Lost Update.
  - Coupon Overselling.
  - Duplicate Coupon Issuance.
- Point Lost Update is selected by default.
- Duplicate Coupon Issuance ships in the first public release.
- Korean is the primary UI language.
- English technical terms appear as supporting labels where useful.
- Strategy labels match the approved Korean terminology.
- Baseline scenarios are framed as intentional failure-reproduction configurations.
- Scenario-specific conditions such as before `@Version` or before unique constraint are visible with results.
- Point and Coupon database strategy outcomes exist in four compact, always-visible cards.
- Coupon Overselling has no playback, strategy selector, grouped bar chart, or dynamic result summary.
- Duplicate Coupon Issuance has a compact problem summary and two always-visible database strategy cards.
- Duplicate Coupon Issuance has no playback, strategy selector, chart, dynamic result summary, or Redis content.
- DB UNIQUE is presented as a user-coupon uniqueness guard, not as stock control.
- Optimistic-lock observed examples are labeled correctly.
- Redis Counter and Redis Lua appear once in a shared section after the experiment workspace.
- Redis is not a fourth experiment and has no dedicated tab.
- Redis uses no playback, animation, chart, selector, or dynamic summary.
- The shared Redis section applies only to coupon issuance scenarios.
- Redis is not presented as PostgreSQL durability or as a distributed transaction.
- Point failure playback is optional, explicit, replayable, stage-inspectable after completion, and reduced-motion aware.
- The result remains understandable without starting playback.
- Point Phase 3 contains no static request-flow placeholder.
- Evidence links are collapsed by default.
- Evidence links render public GitHub URLs only.
- Local repository paths are never rendered.
- Mobile users can understand the primary conclusion without horizontal scrolling.
- Keyboard and screen reader accessibility baseline is met.
- Vercel deployment succeeds as a static app.
- Public deployed URL is verified on desktop and mobile.
- Portfolio link to the deployed visualizer is verified.

## 20. Deferred Work

These items are not part of the MVP phases unless separately approved:

- Route-based experiment URLs.
- Live backend execution.
- Public real load testing.
- A new Spring backend API.
- Vercel serverless functions or API routes.
- User-configurable experiment parameters.
- Persistent frontend state.
- Downloadable raw logs.
- Internationalization framework.
- Advanced chart filtering.
- Detailed code-snippet viewer.
- Analytics.
- Custom domain.
- Backend deployment.
- Redis reconciliation, TTL policy, rebuild process, or production monitoring.
- Production payment, order, or commerce functionality.

## 21. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Incorrect transcription of recorded values | Complete Phase 1 before UI work and verify every numeric value against `docs/experiment-data.md`. |
| Playback mistaken for live execution | Use an explicit play action, representative nodes, secondary recorded-data disclosure, and no benchmark-like timing in Phase 4. |
| Duplicated information causes drift | Keep problem summaries, comparison cards, and disclosures responsible for distinct information. |
| Scope grows too large before a usable slice exists | Reuse the finalized Point card pattern for Coupon and avoid adding interaction without explanatory value. |
| Coupon becomes report-like | Keep all four outcomes visible and omit playback, selectors, charts, and dynamic summaries in Phase 5. |
| Duplicate becomes report-like | Keep both outcomes visible and omit playback, selectors, charts, dynamic summaries, Redis, and stock-control concerns in Phase 6. |
| Optimistic-lock example counts look deterministic | Keep scheduling and no-retry variability in collapsed technical detail. |
| Redis and PostgreSQL responsibilities are conflated | Show one shared Phase 7 architecture flow with explicit approval, persistence, and durability boundaries. |
| Redis looks like a fourth experiment | Keep it outside experiment selection and render it once after the selected workspace. |
| Evidence links break or expose local paths | Validate public GitHub URLs and prevent renderable local paths in Phases 1 and 9. |
| Vercel setup becomes more complex than needed | Use Vite defaults and add Vercel-specific configuration only if required in Phase 10. |

## 22. Implementation Order Summary

1. Foundation.
2. Static data contracts.
3. Shared shell.
4. Point static slice.
5. Point Lost Update failure playback.
6. Coupon Overselling.
7. Duplicate Issuance.
8. Redis section.
9. Responsive and accessibility.
10. Testing.
11. Vercel deployment.
12. Portfolio integration.
