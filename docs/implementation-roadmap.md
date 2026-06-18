# Implementation Roadmap

This roadmap defines how to build the Flash Concurrency Visualizer incrementally from the approved project context, verified experiment data, and UI/UX specification.

The application is a static React visualization for recorded backend concurrency experiments from the public backend repository:

`https://github.com/roarjang/coupon-concurrency-lab`

It must not execute live concurrency tests, call a backend API, create serverless functions, or modify the backend repository.

## 1. Roadmap Overview

The implementation should proceed in small, inspectable steps:

`small implementation step -> verification -> commit`

The delivery order should establish the frontend foundation, define verified static data contracts, build one complete Point Lost Update vertical slice, validate that slice, and only then extend the same system to Coupon Overselling, Duplicate Coupon Issuance, and Redis-specific views.

Point Lost Update is the first vertical slice because it has the smallest scenario, the clearest expected-vs-actual contrast, and a strategy set that exercises the shared UI patterns: baseline failure reproduction, pessimistic lock, optimistic lock without retry, and atomic update.

Shared components should be validated with Point before they are generalized. Avoid broad abstractions until at least one complete experiment view exists and the actual duplication is visible.

## 2. Fixed Technical Decisions

Implementation must follow these settled decisions:

- React + TypeScript + Vite.
- Recharts for strategy comparison charts.
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
- Explicit animation play action, no autoplay.
- Replay, skip, and reduced-motion support.
- Collapsed evidence section on desktop and mobile.
- Public GitHub evidence links in rendered UI.
- Local `repositoryPath` values kept as development metadata and never rendered.
- Redis strategies presented separately from the first database comparison chart.

Do not reopen these decisions during MVP implementation.

## 3. Proposed Frontend Architecture

The frontend repository currently contains planning documents only. The structure below is a suggested future `src` layout once implementation begins.

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
        StrategySelector.tsx
      experiment/
        ExperimentWorkspace.tsx
        ExperimentConditions.tsx
        ExpectedActualSummary.tsx
        CauseMechanism.tsx
        TradeoffPanel.tsx
        EvidenceDisclosure.tsx
      charts/
        StrategyComparisonChart.tsx
        RedisGateChart.tsx
        ChartTextAlternative.tsx
      animation/
        RequestFlowAnimation.tsx
        animationStages.ts
      redis/
        RedisGateSection.tsx
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

- `app/` owns selected experiment, selected strategy, and animation reset behavior.
- `data/` contains verified static records only after Phase 1.
- `types/` defines the contract between data and UI.
- `components/experiment/` owns the shared explanation structure.
- `charts/` isolates Recharts usage and chart text alternatives.
- `animation/` owns representative request-flow rendering and state.
- `redis/` keeps Redis front-line gate explanation separate from database strategy comparison.

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
6. Define comparison chart values for database strategy charts.
7. Define Redis grouping data separately from database strategy comparison data.
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

Shared components should support all three experiment groups without forcing every experiment into the same chart or metric shape.

Shared components:

- Application shell.
- Landing section with recorded-result disclaimer.
- Experiment tabs.
- Strategy selector with Baseline, Database, and Redis groupings.
- Experiment condition display.
- Expected-vs-actual summary.
- Chart container and chart text alternative.
- Cause and mechanism explanation.
- Guarantee, limitation, and use-case panel.
- Collapsed evidence disclosure.
- Responsive layout shell.
- Representative request-flow animation shell.

Component ownership should follow the UX duplication rules:

- Conditions own setup values.
- Animation owns conceptual request flow.
- Summary owns the primary correctness conclusion.
- Chart owns strategy comparison.
- Tooltips and expandable details own secondary counts.
- Explanation owns cause and mechanism.
- Trade-off panel owns selection criteria.
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
- Store strategy groups: Baseline, Database strategies, Redis front-line gate.
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

Landing section, experiment tabs, default selection, strategy selection state, and animation reset behavior.

### Files or areas likely to be affected

Suggested future areas:

- `src/app/App.tsx`
- `src/app/appState.ts`
- `src/components/layout/LandingSection.tsx`
- `src/components/selectors/ExperimentTabs.tsx`
- `src/components/selectors/StrategySelector.tsx`
- `src/components/experiment/ExperimentWorkspace.tsx`

### Tasks

- Implement compact landing content:
  - `Flash Concurrency Visualizer`
  - Korean one-sentence purpose.
  - Recorded-result disclaimer.
  - Experiment tabs near the top.
- Add experiment tabs:
  - Point Lost Update.
  - Coupon Overselling.
  - Duplicate Coupon Issuance.
- Select Point Lost Update by default.
- Switch experiment content without route navigation.
- Select a default baseline strategy for each experiment.
- Reset animation to stable idle state when experiment or strategy changes.
- Keep state URL-independent for the MVP.
- Keep internal data and component boundaries route-compatible for a future extension without adding routing.

### Acceptance Criteria

- Point Lost Update is selected on first load.
- All three experiment tabs are present.
- Duplicate Coupon Issuance appears as the third tab.
- Switching tabs updates available strategies and selected content.
- No route-based experiment pages are required.
- The page communicates that results are recorded and not live tests.

### Explicit Non-Goals

- Do not implement full experiment content yet.
- Do not implement animation playback.
- Do not add routing.
- Do not add persistence for selected tabs or strategies.

### Suggested Commit Boundary

`feat: add single-page experiment navigation`

## 9. Phase 3: Point Lost Update Static Vertical Slice

### Goal

Implement the complete static Point Lost Update experience without animation.

### Scope

Point strategy selector, conditions, expected-vs-actual summary, database comparison chart, cause and mechanism, trade-off panel, and evidence disclosure.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/experiment/ExperimentWorkspace.tsx`
- `src/components/experiment/ExperimentConditions.tsx`
- `src/components/experiment/ExpectedActualSummary.tsx`
- `src/components/charts/StrategyComparisonChart.tsx`
- `src/components/experiment/CauseMechanism.tsx`
- `src/components/experiment/TradeoffPanel.tsx`
- `src/components/experiment/EvidenceDisclosure.tsx`
- `src/data/experiments.ts`

### Tasks

- Show Point strategies:
  - `트랜잭션만 적용` / Transaction Only.
  - `비관적 락` / Pessimistic Lock.
  - `낙관적 락` / Optimistic Lock.
  - `조건부 원자적 업데이트` / Atomic Update.
- Display Point scenario conditions:
  - Initial balance `10,000`.
  - Deduction amount `1,000`.
  - Concurrent requests `15`.
  - Maximum valid successful deductions `10`.
  - Retry policy none.
  - Scenario-specific condition such as before `Point.@Version` for the transaction-only failure reproduction.
- Display expected-vs-actual summary with scenario-specific wording:
  - Expected final balance under this scenario.
  - Observed final balance.
  - Lost Update occurred or balance invariant preserved.
- Add Point database strategy chart using final balance as the primary y-axis.
- Add chart annotation such as `이 실험 조건의 기대 최종 잔액: 0원`.
- Put success/failure counts in tooltips or expandable details, not in every component.
- Add cause and mechanism copy.
- Add guarantee, limitation, and appropriate use case for each strategy.
- Add collapsed evidence links using public GitHub URLs.

### Acceptance Criteria

- The Point result is understandable without animation.
- Expected final balance `0` is always tied to the recorded Point scenario conditions.
- Transaction-only failure is framed as an intentional failure-reproduction configuration, not obsolete code.
- Optimistic-lock result is labeled as one documented observed example where counts are variable.
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

## 10. Phase 4: Point Request-Flow Animation

### Goal

Add a representative, optional request-flow animation to the completed Point slice.

### Scope

Animation state machine, explicit play control, replay, skip, reduced-motion behavior, and strategy-specific visual cues.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/animation/RequestFlowAnimation.tsx`
- `src/components/animation/animationStages.ts`
- `src/a11y/reducedMotion.ts`
- `src/components/experiment/ExperimentWorkspace.tsx`
- `src/styles/`

### Tasks

- Implement stages:
  - idle.
  - ready.
  - simultaneous start.
  - read/check.
  - update attempt.
  - conflict/failure/success.
  - completed.
- Use 8 to 12 representative request nodes.
- Add explicit play button with Korean label such as `기록된 요청 흐름 재생`.
- Add replay and skip controls.
- Respect `prefers-reduced-motion` by skipping or heavily simplifying motion.
- Keep summary, chart, and explanation accessible before playback.
- Reset animation to idle on experiment or strategy switch.
- Add copy explaining that the animation replays simplified recorded results and does not run Java concurrency tests.
- Implement with React state and CSS transitions if sufficient.
- Avoid a heavy animation library unless later implementation proves CSS transitions are inadequate.

### Acceptance Criteria

- Animation does not autoplay.
- Result remains understandable when animation is never played.
- Skip immediately reaches completed visual state.
- Replay restarts the sequence.
- Reduced-motion mode avoids unnecessary motion.
- No visual timing is presented as a benchmark.
- Representative nodes do not imply one node per actual request.

### Explicit Non-Goals

- Do not animate all 15 Point requests individually.
- Do not introduce real timers as performance evidence.
- Do not add a heavy animation dependency without a documented reason.
- Do not implement coupon-specific animation yet.

### Suggested Commit Boundary

`feat: add point request flow animation`

## 11. Phase 5: Point Chart and Content Validation

### Goal

Verify the Point slice before copying the architecture to other experiments.

### Scope

Content review, chart interpretation, mobile check, evidence-link check, and accessibility review for the Point slice.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/charts/StrategyComparisonChart.tsx`
- `src/components/experiment/ExpectedActualSummary.tsx`
- `src/components/experiment/EvidenceDisclosure.tsx`
- `src/data/experiments.ts`
- `src/styles/`

### Tasks

- Validate chart labels and axis text.
- Confirm expected-vs-observed distinction.
- Confirm Point expected balance is always scenario-specific.
- Confirm optimistic-lock observed-example caveat is visible.
- Check that success/failure counts are not repeated in summary, chart labels, and paragraph text at the same time.
- Verify mobile readability for selectors, summary, and chart.
- Add or refine chart text alternative.
- Verify evidence links open public GitHub URLs.
- Review technical wording against `docs/project-context.md` and `docs/experiment-data.md`.

### Acceptance Criteria

- A reviewer can understand Point Lost Update within about ten seconds.
- Chart and summary do not contradict each other.
- The animation is clearly representational.
- The page does not imply live backend execution.
- No local paths appear in rendered UI.
- Point slice is stable enough to use as the pattern for Overselling and Duplicate.

### Explicit Non-Goals

- Do not expand scope to all experiments before this validation is complete.
- Do not add new metrics that are not in `docs/experiment-data.md`.
- Do not tune visual timing as if it were measured backend performance.

### Suggested Commit Boundary

`test: validate point slice content and chart behavior`

## 12. Phase 6: Coupon Overselling Extension

### Goal

Extend the validated Point system to Coupon Overselling.

### Scope

Overselling experiment tab content, database strategies, stock conditions, expected-vs-actual summary, comparison chart, adapted animation, explanations, and evidence links.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/experiment/ExperimentWorkspace.tsx`
- `src/components/experiment/ExperimentConditions.tsx`
- `src/components/experiment/ExpectedActualSummary.tsx`
- `src/components/charts/StrategyComparisonChart.tsx`
- `src/components/animation/RequestFlowAnimation.tsx`
- `src/data/experiments.ts`

### Tasks

- Add Overselling strategy set:
  - `트랜잭션만 적용`.
  - `비관적 락`.
  - `낙관적 락`.
  - `조건부 원자적 업데이트`.
- Display stock scenario conditions:
  - Coupon stock `100`.
  - Concurrent requests `1,000`.
  - Distinct users `1,000`.
  - Retry policy none.
  - Before `Coupon.@Version` for transaction-only failure reproduction.
  - Lock hold or delay only where relevant.
- Show expected-vs-actual summary:
  - Maximum allowed issuances.
  - Observed issued records.
  - Overselling occurred or stock limit preserved.
- Add grouped bar chart for issued records vs stock limit.
- Keep Redis Counter and Redis Lua out of the first database comparison chart.
- Adapt animation cues for stock check, issue attempt, success, sold-out, and overselling.
- Add cause, mechanism, guarantee, limitation, use case, and collapsed evidence links.

### Acceptance Criteria

- Overselling can be selected from the second experiment tab.
- The stock limit and issued-record count are clearly distinguished.
- Transaction-only overselling is framed as intentional failure reproduction.
- Optimistic-lock stock-control counts are labeled as a documented observed example where applicable.
- Redis strategies are not mixed into the first database chart.
- Reused components do not force Point-specific wording into coupon content.

### Explicit Non-Goals

- Do not implement Duplicate Issuance in this phase.
- Do not implement Redis section in this phase.
- Do not present the documented pessimistic-lock duration as a general benchmark.

### Suggested Commit Boundary

`feat: add coupon overselling database strategies`

## 13. Phase 7: Duplicate Coupon Issuance Extension

### Goal

Extend the shared system to Duplicate Coupon Issuance for the first public release.

### Scope

Duplicate experiment tab content, pre-unique-constraint failure reproduction, database unique constraint strategy, adapted chart, adapted animation, explanation, and evidence links.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/experiment/ExperimentWorkspace.tsx`
- `src/components/experiment/ExperimentConditions.tsx`
- `src/components/experiment/ExpectedActualSummary.tsx`
- `src/components/charts/StrategyComparisonChart.tsx`
- `src/components/animation/RequestFlowAnimation.tsx`
- `src/data/experiments.ts`

### Tasks

- Add Duplicate strategy set:
  - `트랜잭션만 적용`.
  - `DB 유니크 제약조건`.
- Display duplicate scenario conditions:
  - Coupon stock `1,000`.
  - Concurrent requests `100`.
  - Same user.
  - Same coupon.
  - Before unique constraint for transaction-only failure reproduction.
- Show expected-vs-actual summary:
  - Expected issuance count per user-coupon pair.
  - Observed issuance count for the same user and coupon.
  - Duplicate issuance occurred or duplicate prevented.
- Add duplicate chart using issued count for the same user-coupon pair.
- Add annotation that the expected maximum is `1`.
- Adapt animation for concurrent duplicate checks and insert attempts.
- Explain that the database unique constraint protects duplicate issuance, not total stock.
- Add collapsed evidence links.

### Acceptance Criteria

- Duplicate Coupon Issuance is included in the first public release.
- It appears as the third experiment tab.
- The uniqueness invariant is distinct from Point balance and global stock limits.
- The unique constraint is not described as a full stock-control strategy.
- Evidence links use public GitHub URLs.

### Explicit Non-Goals

- Do not defer Duplicate out of the MVP.
- Do not merge Duplicate into the Overselling explanation.
- Do not imply unique constraints replace Redis or stock-control strategies.

### Suggested Commit Boundary

`feat: add duplicate coupon issuance experiment`

## 14. Phase 8: Redis Front-Line Gate Section

### Goal

Implement Redis strategy views separately from the database comparison chart.

### Scope

Redis Counter, Redis Lua stock gate, Redis Lua duplicate gate, Redis/PostgreSQL boundary explanation, Redis-specific charts, and evidence links.

### Files or areas likely to be affected

Suggested future areas:

- `src/components/redis/RedisGateSection.tsx`
- `src/components/charts/RedisGateChart.tsx`
- `src/components/experiment/TradeoffPanel.tsx`
- `src/components/experiment/EvidenceDisclosure.tsx`
- `src/data/experiments.ts`

### Tasks

- Add a separate section titled `Redis 기반 Front-line Gate`.
- Present Redis Counter and Redis Lua as Redis strategies, not database strategies.
- Include Redis Counter for stock gate.
- Include Redis Lua for stock gate and duplicate gate.
- Explain Redis-side atomicity:
  - Redis Counter gates stock slots.
  - Redis Lua atomically checks Redis-side stock and user admission state.
- Explain PostgreSQL boundary:
  - PostgreSQL remains the durable source of truth.
  - Redis acceptance is not final issuance completion.
  - Redis and PostgreSQL are not one distributed transaction.
  - Database constraints remain necessary.
- Label Redis implementation paths as experiment fixtures, not public production APIs.
- Reuse summary, trade-off, evidence, and chart patterns where they fit.
- Add Redis-specific chart context rather than mixing Redis values into the first database chart.

### Acceptance Criteria

- Redis strategies are visually and conceptually separated from database strategy comparison.
- Redis Counter is not described as duplicate protection.
- Redis Lua is not described as durable database truth.
- No distributed transaction claim appears.
- Evidence links include relevant public GitHub documents and source files.

### Explicit Non-Goals

- Do not add backend Redis APIs.
- Do not add live Redis calls.
- Do not imply Redis replaces PostgreSQL persistence.
- Do not add reconciliation, TTL, or production monitoring features not documented as implemented.

### Suggested Commit Boundary

`feat: add redis front-line gate section`

## 15. Phase 9: Responsive Design and Accessibility

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
  - experiment selector,
  - strategy selector,
  - conditions,
  - animation,
  - summary,
  - chart,
  - explanation,
  - evidence.
- Ensure expected-vs-actual summary stacks cleanly on mobile.
- Keep chart labels readable and avoid horizontal scrolling for the primary conclusion.
- Simplify animation node count on mobile where needed.
- Ensure selectors are keyboard-accessible and expose selected state.
- Ensure focus states are visible.
- Ensure evidence disclosure exposes expanded and collapsed state.
- Add chart text alternatives.
- Ensure skip and replay controls are accessible.
- Respect reduced-motion preferences.
- Ensure state is not communicated by color alone.
- Ensure evidence links have comfortable touch targets.

### Acceptance Criteria

- Mobile users can understand the conclusion without horizontal scrolling.
- Keyboard users can operate tabs, strategy selectors, animation controls, and evidence disclosure.
- Screen readers receive the conclusion before secondary metrics.
- Reduced-motion users can access completed state without motion-heavy playback.
- Charts have useful text alternatives.

### Explicit Non-Goals

- Do not add a full design system.
- Do not add an internationalization framework.
- Do not optimize for every possible chart viewport before MVP validation.

### Suggested Commit Boundary

`feat: improve responsive and accessible experience`

## 16. Phase 10: Testing and Quality Verification

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
- Strategy switching tests.
- Animation skip and replay tests.
- Reduced-motion behavior check.
- Basic accessibility checks for controls and disclosures.
- Manual desktop and mobile responsive checks.

Optional checks:

- Component snapshot tests for static sections.
- Visual regression screenshots.
- Additional chart rendering tests.
- Link availability checks that access the network, if approved and stable.

### Acceptance Criteria

- `npm run build` succeeds.
- TypeScript catches invalid data shape changes.
- Data validation prevents missing required numeric fields.
- Switching experiments and strategies does not show stale animation state.
- Evidence links do not render local repository paths.
- Animation controls work with keyboard and reduced-motion settings.
- No major accessibility issue blocks MVP review.

### Explicit Non-Goals

- Do not build excessive end-to-end infrastructure before the MVP is stable.
- Do not require backend services in tests.
- Do not require network access for the normal test suite.
- Do not test actual Java concurrency behavior from the frontend.

### Suggested Commit Boundary

`test: add visualizer quality checks`

## 17. Phase 11: Vercel Deployment

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

## 18. Phase 12: Portfolio Integration

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

## 19. Commit Plan

Recommended small commit groups:

| Group | Example commit message |
| --- | --- |
| Project foundation | `chore: initialize visualizer frontend foundation` |
| Experiment data model | `feat: add verified static experiment data model` |
| Shared application shell | `feat: add single-page experiment navigation` |
| Point static view | `feat: implement point lost update static slice` |
| Point animation | `feat: add point request flow animation` |
| Point validation | `test: validate point slice content and chart behavior` |
| Overselling support | `feat: add coupon overselling database strategies` |
| Duplicate support | `feat: add duplicate coupon issuance experiment` |
| Redis section | `feat: add redis front-line gate section` |
| Accessibility and responsive work | `feat: improve responsive and accessible experience` |
| Tests | `test: add visualizer quality checks` |
| Deployment documentation or setup | `chore: prepare vercel static deployment` |
| Portfolio integration | `docs: add visualizer portfolio integration notes` |

Do not create commits during roadmap authoring. Each implementation commit should be small enough to inspect independently.

## 20. Definition of Done

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
- Expected-vs-actual summaries exist for every experiment.
- Database strategy charts exist where comparable data exists.
- Optimistic-lock observed examples are labeled correctly.
- Redis Counter and Redis Lua appear in a separate Redis front-line gate section.
- Redis is not presented as PostgreSQL durability or as a distributed transaction.
- Animations are optional, explicit, replayable, skippable, and reduced-motion aware.
- The result remains understandable without playing animation.
- Evidence links are collapsed by default.
- Evidence links render public GitHub URLs only.
- Local repository paths are never rendered.
- Mobile users can understand the primary conclusion without horizontal scrolling.
- Keyboard and screen reader accessibility baseline is met.
- Chart text alternatives are present.
- Vercel deployment succeeds as a static app.
- Public deployed URL is verified on desktop and mobile.
- Portfolio link to the deployed visualizer is verified.

## 21. Deferred Work

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

## 22. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Incorrect transcription of recorded values | Complete Phase 1 before UI work and verify every numeric value against `docs/experiment-data.md`. |
| Animation mistaken for live execution | Use explicit play action, non-live disclaimer, representative nodes, and no benchmark-like timing in Phase 4. |
| Duplicated information causes drift | Follow component ownership rules in Phase 3 and validate duplication in Phase 5. |
| Scope grows too large before a usable slice exists | Complete Point static slice and validation before Overselling, Duplicate, and Redis phases. |
| Chart metrics confuse reviewers | Use experiment-specific chart types and avoid forcing incomparable values onto one axis. |
| Optimistic-lock example counts look deterministic | Store and display caveats as observed examples in Phase 1 and validate wording in Phase 5. |
| Redis and PostgreSQL responsibilities are conflated | Implement Redis as a separate Phase 8 section with boundary copy and separate chart context. |
| Mobile chart readability is poor | Address chart labels, alternatives, and stacking in Phase 9 before deployment. |
| Evidence links break or expose local paths | Validate public GitHub URLs and prevent renderable local paths in Phases 1 and 10. |
| Vercel setup becomes more complex than needed | Use Vite defaults and add Vercel-specific configuration only if required in Phase 11. |

## 23. Implementation Order Summary

1. Foundation.
2. Static data contracts.
3. Shared shell.
4. Point static slice.
5. Point animation.
6. Point validation.
7. Overselling.
8. Duplicate Issuance.
9. Redis section.
10. Responsive and accessibility.
11. Testing.
12. Vercel deployment.
13. Portfolio integration.
