# UI/UX Specification

## 1. UX Overview

Flash Concurrency Visualizer is a static interactive explanation of recorded backend concurrency experiments from Flash Coupon Payment. The interface should help reviewers understand what was tested, what should have happened, what actually happened, and why different strategies changed the result.

The product is not a live test runner. It replays verified recorded results from backend JUnit concurrency tests and project documents. The UI must make this clear without making the page feel defensive or overly legalistic.

Primary reviewer journey:

1. Land on the page and see the compact project message and three experiment groups.
2. Start with Point Lost Update by default.
3. Understand the Point problem through one concise definition.
4. Compare all four Point strategy outcomes together without selecting a strategy.
5. Open conditions, technical explanation, the static-data limitation, or evidence only when more depth is wanted.
6. In Phase 4, optionally play the Lost Update failure explanation without changing the already-visible card outcomes.

Later coupon experiments may use strategy selection and expected-vs-actual summaries where their separately approved designs require them.

The interface should feel like an interactive technical explanation, not a generic analytics dashboard and not an animation showcase.

## 2. Audience and Review Context

Primary users:

- Recruiters who need the high-level result and honest project scope.
- Backend engineers who will inspect correctness claims and source evidence.
- Technical interviewers who may use the page to ask follow-up questions.
- Engineering managers who want to understand trade-offs and communication quality.

Review context:

- Many users may arrive from a resume, portfolio page, GitHub README, or shared Vercel link.
- First impressions may happen on desktop during portfolio review, but mobile access from a resume link must still work.
- A reviewer should understand the first selected experiment within about ten seconds.
- Deeper details should be available without forcing every user through all source evidence.

The UI should use Korean as the primary display language and English technical terminology as supporting labels, for example `포인트 차감 Lost Update` and `Optimistic Lock`.

## 3. Information Architecture

Recommended MVP structure: a single-page application with near-top experiment tabs and experiment-specific comparison patterns.

Decision:

- Use a single-page layout for the MVP so each experiment can be understood without deep navigation.
- Use near-top experiment tabs for Point Lost Update, Coupon Overselling, and Duplicate Coupon Issuance.
- Point Lost Update is the default selected experiment.
- Switching experiments updates the main visualization content without navigating to another page.
- Do not require route-based experiment pages for the MVP.
- Keep the structure route-compatible for a possible future extension, but do not make routing part of the current UX requirement.
- Include Duplicate Coupon Issuance in the first public release as the third experiment tab. It demonstrates a distinct invariant: uniqueness of the user-coupon pair.

Point Lost Update page structure:

1. Compact project title and one-line Korean message.
2. Three experiment tabs.
3. Compact Point Lost Update problem definition.
4. Four compact strategy comparison cards.
5. Optional collapsed details for experiment conditions, technical explanation, static-data limitation, and code/evidence.

The first visible experiment should default to Point Lost Update because it has the smallest scenario and is easiest to understand quickly. Duplicate Coupon Issuance should be available from the first release, but it should not overcrowd the first viewport.

## 4. Primary User Flow

Point Lost Update interaction flow:

1. See the project title and the message `같은 요청도 적용한 전략에 따라 결과가 달라집니다.`
2. See the three explored concurrency scenarios.
3. Understand the Point Lost Update problem in one concise statement.
4. Compare all four strategy outcomes without selecting a strategy or moving attention to another section.
5. Open conditions, technical explanation, static-data limitation, or code/evidence only when more depth is wanted.

Collapsed by default:

- Experiment conditions and test environment details.
- Cause, mechanism, guarantee, limitation, and appropriate use case.
- Static recorded-data limitation.
- Evidence link groups.

The compact Point problem statement owns the problem definition. The four strategy comparison cards own all Point strategy-specific outcomes.

## 5. Landing Section

The first viewport should be compact and direct.

Required first-view content:

- Project title: `Flash Concurrency Visualizer`
- One concise Korean message: `같은 요청도 적용한 전략에 따라 결과가 달라집니다.`
- Near-top experiment tabs:
  - `Point Lost Update`
  - `Coupon Overselling`
  - `Duplicate Coupon Issuance`

Remove these items from the primary first-view hierarchy:

- `RECORDED CONCURRENCY EXPERIMENTS`
- `Recorded-result visualization for backend concurrency experiments.`
- `브라우저에서 실시간 부하 테스트를 실행하지 않습니다.`
- `EXPERIMENT`

The static recorded-data limitation must remain available in a secondary disclosure or footer. The landing section should not become a portfolio introduction, and the Point problem and strategy outcomes should begin near the top of the page.

## 6. Experiment Selector

Experiment options:

| id | Primary label | Supporting label | Short description |
| --- | --- | --- | --- |
| `point-lost-update` | `포인트 Lost Update` | `Point Lost Update` | `동시 차감 요청이 같은 잔액을 덮어쓰는 문제` |
| `coupon-overselling` | `쿠폰 재고 초과 발급` | `Coupon Overselling` | `재고보다 많은 발급 기록이 생성되는 문제` |
| `duplicate-coupon-issuance` | `중복 쿠폰 발급` | `Duplicate Issuance` | `같은 사용자가 같은 쿠폰을 여러 번 받는 문제` |

Behavior:

- Desktop: use a segmented tab row or compact cards with clear active state.
- Mobile: allow horizontal scrolling segmented controls or stacked buttons if labels wrap cleanly.
- Selection should change the current page section content, not require a full route change in the MVP.
- Active state must be visually obvious and keyboard-accessible.
- Each option should show a short plain-language explanation, not only the technical name.
- Point Lost Update is selected by default.
- Duplicate Coupon Issuance is included in the first public release as the third tab, but the first impression should remain focused on Point Lost Update.

The selector should not include Redis as an experiment group. Redis is a strategy grouping within coupon-related experiments.

## 7. Strategy Selector

Strategies must be filtered by selected experiment.

Point Lost Update:

- Do not use a separate strategy selector or strategy tabs.
- Show all four strategies together as comparison cards:
  - `트랜잭션만 적용` / `Transaction Only`
  - `비관적 락` / `Pessimistic Lock`
  - `낙관적 락` / `Optimistic Lock`
  - `조건부 원자적 업데이트` / `Atomic Update`

Coupon Overselling:

- Baseline:
  - `트랜잭션만 적용` / `Transaction Only`
- Database strategies:
  - `비관적 락` / `Pessimistic Lock`
  - `낙관적 락` / `Optimistic Lock`
  - `조건부 원자적 업데이트` / `Atomic Update`
- Redis strategies:
  - `Redis 카운터` / `Redis Counter`
  - `Redis Lua 스크립트` / `Redis Lua Script`

Duplicate Coupon Issuance:

- Baseline:
  - `트랜잭션만 적용` / `Transaction Only`
- Database strategies:
  - `DB 유니크 제약조건` / `Database Unique Constraint`
- Redis strategies:
  - `Redis Lua 스크립트` / `Redis Lua Script`

Presentation for coupon experiments:

- Use grouped segmented controls or grouped button rows: `Baseline`, `Database`, `Redis`.
- Keep the selected strategy visually prominent.
- Avoid a crowded single row when many strategies exist. On mobile, groups can stack vertically.
- Switching strategies should update conditions, summary, explanation, chart highlight, and evidence links where a later experiment uses strategy selection.

Baseline labels should be framed as failure-reproduction configurations, not obsolete code.

Standard strategy labels:

| English terminology | Primary Korean label |
| --- | --- |
| Transaction Only | `트랜잭션만 적용` |
| Pessimistic Lock | `비관적 락` |
| Optimistic Lock | `낙관적 락` |
| Atomic Update | `조건부 원자적 업데이트` |
| Database Unique Constraint | `DB 유니크 제약조건` |
| Redis Counter | `Redis 카운터` |
| Redis Lua Script | `Redis Lua 스크립트` |

Display rules:

- Korean is the primary visible label.
- English terminology may appear as supporting text.
- On wide screens, a strategy control may show two lines, for example `비관적 락` and `Pessimistic Lock`.
- On narrow screens, show only the Korean label when space is limited.
- In explanatory content, include the English term on first occurrence where helpful.
- Use the same terminology across selectors, charts, summaries, explanations, and evidence sections.
- Do not introduce alternative Korean names without a documented reason.

## 8. Experiment Conditions

Conditions should be compact and scannable.
For Point Lost Update, place all conditions inside one collapsed disclosure near the lower part of the Point section.

Primary condition chips or rows:

Point Lost Update:

- `초기 잔액 10,000`
- `동시 요청 15`
- `차감 1,000`
- `Retry 없음`
- `조건: Point.@Version 적용 전` for the transaction-only failure scenario

Coupon Overselling:

- `쿠폰 재고 100`
- `동시 요청 1,000`
- `서로 다른 사용자 1,000명`
- `Retry 없음`
- `조건: Coupon.@Version 적용 전` for the transaction-only failure scenario
- `Lock hold 5ms` only where relevant

Duplicate Coupon Issuance:

- `쿠폰 재고 1,000`
- `동시 요청 100`
- `같은 사용자`
- `같은 쿠폰`
- `조건: UNIQUE 제약 적용 전` for the transaction-only failure scenario

Expandable test environment:

- Java version.
- Spring Boot version.
- PostgreSQL version.
- Redis version where relevant.
- Docker Compose usage.
- `ddl-auto=update` caveat where relevant to unique constraint evidence.

Do not display all environment metadata in the primary condition area.

## 9. Point Lost Update Failure Playback

Point Phase 3 direction:

- Do not render a static request-flow placeholder.
- Do not reserve a large empty request-flow area.
- The request-flow area returns in Phase 4 only with a working Lost Update failure playback.

Purpose:

- Explain why the transaction-only Lost Update failure occurred.
- Present a conceptual, stage-based playback that uses a small representative set of requests, such as A and B, to explain the Lost Update mechanism.
- Make shared reads, calculated balances, competing writes, and overwritten writes visible without implying live execution.
- Lead the viewer from the failure mechanism to the existing strategy comparison cards.

The playback is not a benchmark, live load test, performance visualization, or strategy-comparison animation.

Required copy near the animation:

`단순화된 재생입니다. 실제 기록된 결과는 카드와 상세 정보에 표시되며, 브라우저에서 DB 요청을 실행하지 않습니다.`

Recommended supporting message:

`백엔드 JUnit 동시성 테스트에서 기록된 요청 흐름과 결과를 단순화해 재생합니다.`

Playback story:

| Stage | Meaning |
| --- | --- |
| Concurrent Read | Representative requests read the same balance |
| Independent Calculation | Each request calculates its own new balance |
| Competing Writes | Requests write their calculated values |
| Overwrite | Later writes overwrite earlier deductions |
| Result | Show the recorded inconsistent final balance |
| Transition | Direct attention to the static strategy comparison cards |

Playback requirements:

- Use a small representative number of visual nodes, such as A and B or a similarly small set.
- Never draw all 15 individual requests as separate animated nodes.
- Actual recorded counts must remain in the comparison cards or collapsed details.
- Recommended duration: 1.8 to 2.8 seconds.
- Do not autoplay on page load.
- Initial page load should display the compact Point problem and all four cards without motion.
- Start animation only through an explicit user action such as `기록된 요청 흐름 재생`.
- Once started, the playback progresses automatically through the visible stages.
- Respect `prefers-reduced-motion`: skip animation by default and show the completed state.
- The Point problem and strategy outcomes must remain understandable even if the playback is never started.
- Playback must not block access to the comparison cards.
- When switching experiments, reset playback to a stable idle state.
- Do not imply that the play button runs a live Java concurrency test.
- Do not use animation duration or node speed as a performance benchmark.

Responsibility boundary:

- Playback explains the Lost Update problem and failure mechanism.
- Strategy cards explain how the four strategies differ and what outcomes they produced.
- Playback must not animate, update, or replace the strategy cards, a chart, or a selected-strategy summary.

Out of scope:

- Next-step navigation between stages.
- Pause and resume controls.
- Speed controls.
- Strategy-specific animations.
- Separate pessimistic-lock, optimistic-lock, or atomic-update playback.
- Replaying every experiment record.
- Coupon, duplicate-issuance, or Redis playback.
- Performance or latency visualization.

## 10. Expected vs Actual Summary

Point Lost Update does not use a separate selected-strategy result summary.

Point ownership:

- The compact Point problem definition explains the concurrency failure.
- The four comparison cards own expected and recorded strategy outcomes.
- Changing or emphasizing a card must not update a separate result panel elsewhere on the page.

Reason:

- A result above a control makes the viewer move attention backward.
- The same strategy result should not be repeated in a separate summary and comparison card.
- Recruiter-facing comprehension is faster when all outcomes remain visible together.

Later experiment guidance:

- Coupon and duplicate experiments may still use an expected-vs-actual summary if their later approved designs benefit from one.

Coupon Overselling fields:

- Maximum allowed issuances.
- Observed issued records.
- Conclusion:
  - `재고 초과 발급 발생`
  - or `재고 한도 유지`

Duplicate Issuance fields:

- Expected issuance count per user.
- Observed issuance count for the same user and coupon.
- Conclusion:
  - `중복 발급 발생`
  - or `중복 발급 방지`

Do not include every supporting count here. Success/failure counts belong in chart tooltips, expandable details, or condition-adjacent supporting text.

## 11. Strategy Comparison

The comparison section compares strategy outcomes. It should not be the only explanation.

General chart rules:

- Use Recharts for chart-based comparisons where a chart is the clearest fit.
- Use clear Korean labels with English strategy names where helpful.
- Keep chart captions close to the chart.
- Use tooltips for success/failure counts and caveats.
- Do not force incomparable metrics onto one axis.
- Do not treat timing measurements as general performance benchmarks.
- Mark optimistic-lock numeric values as documented observed examples when counts can vary.

Point Lost Update strategy comparison cards:

| Item | Recommendation |
| --- | --- |
| Card content | strategy name, primary outcome, plain-language status, one short mechanism or conclusion when useful |
| Layout | Compact grid on desktop, single-column cards on mobile |
| Transaction Only | `15건 성공 · 잔액 8,000원`, `Lost Update 발생` or `문제 발생` |
| Pessimistic Lock | `10건 성공 · 잔액 0원`, `정상 차감` |
| Optimistic Lock | `잔액 7,000원 · 실행 예시`, `충돌 감지` |
| Atomic Update | `10건 성공 · 잔액 0원`, `정상 차감` |
| Optimistic-lock note | Do not present `7,000원` as deterministic; move no-retry and run-variability detail into collapsed technical content |
| Non-goal | Do not present Point as a chart-led report or a separate `수치로 보기` table |

Point card copy rules:

- Use `결과`, not repeated `기록된 결과`.
- Do not use `불변식` as a primary recruiter-facing status label.
- Prefer direct labels such as `문제 발생`, `정상 차감`, and `충돌 감지`.
- Keep `잔액 불변식` only in optional technical details.
- Remove report-style content such as `성공 수 기준 잔액 -5,000원`.
- Do not repeat execution-condition labels inside every card.
- Do not show a long optimistic-lock caveat block inside the card.
- Keep the four cards substantially more compact than the technical details below.

Coupon Overselling chart:

| Item | Recommendation |
| --- | --- |
| Chart type | Grouped bar chart |
| Primary y-axis | Issued records vs stock limit |
| x-axis | 트랜잭션만 적용, 비관적 락, 낙관적 락, 조건부 원자적 업데이트 |
| Series | `허용 재고`, `발급 기록 수` |
| Tooltip | successCount, failCount, finalIssuedQuantity, caveat for optimistic lock |
| Caveat | Do not include Redis in the first database chart |

Duplicate Coupon Issuance chart:

| Item | Recommendation |
| --- | --- |
| Chart type | Bar chart |
| Primary y-axis | Issued count for same user-coupon pair |
| x-axis | 트랜잭션만 적용, DB 유니크 제약조건 |
| Annotation | Expected maximum `1` |
| Tooltip | successCount, failCount, scenario condition |
| Caveat | Unique constraint protects duplicate issuance, not total stock |

Redis chart context:

- Use a separate section or chart.
- Redis Counter stock gate can compare accepted Redis count, DB issued records, and stock limit.
- Redis Lua stock gate can compare Redis count, Redis issued-user set size, DB issued records, and stock limit.
- Redis Lua duplicate gate can compare Redis accepted user count and DB duplicate count.
- Keep Redis/PostgreSQL source-of-truth boundary visible.

## 12. Cause and Mechanism Explanation

For Point Lost Update, cause, mechanism, guarantee, limitation, and appropriate use case should be consolidated into one or two compact disclosures near the bottom of the Point section. They must not appear as multiple large report-style sections.

Use a short three-part structure:

| Part | Purpose |
| --- | --- |
| Cause | What concurrency behavior produced the result |
| Mechanism | How the selected strategy changes execution |
| Result | Which invariant failed or was preserved |

Example patterns:

- Lost Update Cause: `여러 요청이 같은 잔액을 읽고 각자 차감한 뒤, 나중 저장이 이전 저장을 덮어썼습니다.`
- Pessimistic Lock Mechanism: `같은 row를 한 번에 하나의 트랜잭션만 수정하도록 직렬화합니다.`
- Atomic Update Mechanism: `조건 확인과 갱신을 하나의 SQL UPDATE로 처리합니다.`
- Unique Constraint Mechanism: `DB가 같은 user-coupon 조합의 두 번째 insert를 거부합니다.`
- Redis Lua Mechanism: `Redis 안에서 재고와 중복 여부를 한 스크립트로 원자적으로 확인합니다.`

Avoid long report-style paragraphs. Use two or three short blocks with direct copy.

## 13. Guarantee, Limitation, and Use Case

Every strategy detail panel should use the same three-part structure.

| Strategy | Guarantee | Limitation | Appropriate use case |
| --- | --- | --- | --- |
| 트랜잭션만 적용 / Transaction Only | One request's local transaction commits or rolls back as a unit | Does not serialize shared-row concurrent updates | Failure reproduction or low-contention simple flows |
| 비관적 락 / Pessimistic Lock | Serializes updates to the locked row | Lock waiting, lower throughput under high contention, potential deadlock concerns in larger workflows | High-contention cases where deterministic correctness matters |
| 낙관적 락 / Optimistic Lock without retry | Detects version conflicts and rejects stale updates | No retry means many conflicts can fail; exact success counts may vary | Low to moderate contention where retry or conflict response is acceptable |
| 조건부 원자적 업데이트 / Atomic Update | Checks condition and updates in one database statement | Query-centered logic; less flexible for complex domain rules | Simple counters such as point balance deduction or stock increment |
| DB 유니크 제약조건 / Database Unique Constraint | Enforces final uniqueness for `(user_id, coupon_id)` | Does not solve stock overselling | Final duplicate-issuance guard |
| Redis 카운터 / Redis Counter | Provides front-line stock-slot admission | Does not track duplicates; not durable truth; no Redis/PostgreSQL distributed transaction | High-traffic stock gate before DB persistence |
| Redis Lua 스크립트 / Redis Lua Script | Atomically checks Redis-side stock and duplicate state | Still not durable truth; operational complexity; DB constraints still needed | Front-line admission control when stock and duplicate checks both matter |

Do not claim universal performance superiority for any strategy.

## 14. Redis-Specific Section

Recommended presentation: a separate strategy group and follow-up section after database strategies.

The Redis section should explain:

- Redis is a front-line gate in these experiments.
- Redis Counter limits stock-sized admission slots.
- Redis Lua can atomically execute Redis-side stock and duplicate checks.
- PostgreSQL remains the durable source of truth.
- Redis does not replace database constraints.
- Redis and PostgreSQL are not one distributed transaction.
- The implementation paths are controlled experiment fixtures, not public production APIs.

Recommended UI:

- A section titled `Redis 기반 Front-line Gate`.
- A short boundary diagram: `Request -> Redis gate -> PostgreSQL persistence`.
- Separate cards or tabs for `Redis Counter` and `Redis Lua`.
- A small warning/caveat box: `Redis 통과는 최종 발급 완료가 아닙니다. DB 저장이 성공해야 durable record가 됩니다.`
- Evidence links to the concurrency test fixture and Redis consistency boundary document.

This should be visible after the database comparison, not mixed into the first chart.

## 15. Evidence and Source Links

Evidence links should use the public backend repository:

`https://github.com/roarjang/coupon-concurrency-lab`

Recommended labels:

- `View test`
- `View implementation`
- `View repository query`
- `View entity constraint`
- `View experiment document`
- `View Redis boundary`
- `View Lua script`

Placement:

- Near the end of the selected experiment section.
- Collapsed by default on both desktop and mobile.
- Group links by purpose rather than listing raw file paths first.
- Recommended collapsed label: `근거 자료 보기`, optionally with count, such as `근거 자료 보기 (4)`.
- Expanded links should use concise labels such as `테스트 코드 보기`, `구현 코드 보기`, `실험 문서 보기`, and `Lua 스크립트 보기`.
- Use an accessible expand/collapse control with keyboard support and an appropriate accessible name.

Do not expose local repository paths in the rendered UI. Local `repositoryPath` values are development metadata only. GitHub URLs are the user-facing evidence paths.

The static recorded-data limitation should appear in a nearby collapsed disclosure or secondary footer, not in the hero. It should state that the page visualizes recorded backend tests and does not execute live concurrency traffic in the browser.

## 16. Content Hierarchy and Duplication Rules

Component ownership:

| Component | Owns |
| --- | --- |
| Landing | Project title, one-line Korean message, experiment entry |
| Experiment selector | Experiment group choice and short problem description |
| Strategy selector | Relevant strategy choice and grouping for later experiments that use selection |
| Conditions | Setup: initial balance, stock, requests, user pattern, retry, scenario-specific condition |
| Playback | Transaction-only Lost Update failure mechanism beginning in Point Phase 4 |
| Point problem definition | Concise explanation of the Lost Update problem |
| Expected/actual summary | Primary correctness conclusion for later experiments where separately approved |
| Point comparison cards | All Point strategy-specific outcomes and plain-language statuses |
| Chart | Strategy comparison where a chart is the clearest fit for later experiments |
| Tooltip/expandable details | Secondary counts such as successCount, failCount, Redis count, issued-user set size |
| Cause section | Why the result happened and what invariant was affected |
| Trade-off section | Guarantee, limitation, appropriate use case |
| Redis section | Redis/PostgreSQL boundary and Redis admission control |
| Evidence section | Source verification |
| Static-data disclosure/footer | Recorded-result and no-live-execution limitation |

Avoid repeating:

- The same Point outcome in a separate summary and comparison card.
- Request counts outside cards when they are already available in conditions.
- Full environment metadata in the primary experiment area.
- Redis/PostgreSQL boundary explanation in every Redis tooltip; show it once clearly in the Redis section.
- Long strategy descriptions in selector labels.
- The full Point scenario context in every card; keep it in the collapsed conditions disclosure.
- Calculated diagnostic values such as `expectedBalanceBySuccessCount` in the recruiter-facing view.

The Point problem definition should stay concise. The comparison cards own only the high-signal outcomes; technical interpretation belongs in collapsed details.

## 17. Responsive Design

Desktop:

- Use a compact card grid that keeps all four Point outcomes visible together.
- Keep the three experiment tabs visible near the top.
- Evidence appears as a collapsed section with a clear `근거 자료 보기` control.

Tablet:

- Use a single-column or balanced two-column layout depending on width.
- Strategy selector may wrap by group.
- Charts should use shorter labels or angled labels if needed.

Mobile:

- Stack content in this order: title/message, experiment tabs, Point problem definition, four comparison cards, collapsed details.
- The Point problem and strategy outcomes must be readable without horizontal scrolling.
- Experiment selector can scroll horizontally if touch targets remain large.
- Comparison cards should fit the viewport; use horizontal scroll only as a last resort and never for the primary conclusion.
- Evidence links must have comfortable touch targets.

## 18. Accessibility

Requirements:

- Use semantic headings in page order.
- Selectors must be keyboard-accessible and expose selected state.
- Focus states must be visible.
- Playback controls must be buttons with screen-reader labels.
- Evidence expand/collapse controls must be keyboard-accessible and expose expanded/collapsed state.
- Provide chart text alternatives where charts are used, and concise card alternatives for Point Lost Update.
- Do not communicate success or failure by color alone.
- Ensure sufficient contrast for text, chart labels, and status indicators.
- Respect reduced-motion preferences.
- Provide a skip control for the Phase 4 playback.
- Keep evidence links descriptive; avoid multiple identical `View source` labels without context.

For screen readers, the compact Point problem definition should precede the four strategy cards, and each card should announce strategy name, result, and plain-language status before optional mechanism copy.

## 19. Visual Direction

The style should be understated, technical, and portfolio-appropriate.

Recommended characteristics:

- Calm and professional.
- Clear typography.
- Strong hierarchy for result conclusions.
- Restrained color use.
- Cards used selectively for repeated items, summaries, and evidence groups.
- Clean chart presentation.
- Subtle animation that supports explanation.

Avoid:

- Gaming-style effects.
- Excessive gradients.
- Decorative animation unrelated to request flow.
- Overly playful motion.
- Visuals that resemble live infrastructure monitoring.
- Dense dashboard styling that hides the conclusion.

The app may visually align with the broader backend portfolio, but it should remain a standalone interactive technical explanation.

## 20. UX States

Expected states:

| State | Behavior |
| --- | --- |
| Initial state | Point Lost Update selected; compact problem definition and all four cards visible |
| Experiment selected | Selected experiment content replaces the Point section |
| Point details closed | Conditions, technical explanation, static-data limitation, and evidence remain collapsed |
| Playback running | Replay/skip controls are visible; the stage sequence progresses automatically; experiment switching stops playback and resets it |
| Playback skipped | The completed failure state appears immediately; comparison cards remain available |
| Completed | Phase 4 playback shows the inconsistent balance and transitions attention to the unchanged comparison cards |
| Reduced-motion mode | Playback is skipped or heavily simplified by default |
| Missing optional evidence | Show available evidence and omit missing link; do not block the experiment |
| Invalid or incomplete static data | Show a clear fallback such as `검증되지 않은 데이터` and avoid rendering invented values |

Because the app uses static verified data, network loading should not be emphasized. Lightweight loading states are acceptable only for code splitting or chart rendering.

## 21. Success Criteria

- The first experiment is understandable within about ten seconds.
- Point Lost Update is selected by default in a single-page tab layout.
- Duplicate Coupon Issuance is included in the first public release as the third experiment tab.
- The first view communicates the three explored scenarios, the Point Lost Update problem, and all four Point outcomes.
- Point outcomes are immediately distinguishable without a strategy selector or separate result summary.
- When Phase 4 playback is introduced, it does not autoplay on page load and the result remains understandable without playing it.
- No component unnecessarily repeats the same metrics.
- Phase 4 playback explains only the Lost Update failure mechanism and does not compare strategies, update charts, or update result summaries.
- Variable optimistic-lock observations are labeled correctly.
- Redis and PostgreSQL responsibilities are not conflated.
- Evidence links are discoverable through a collapsed section without dominating the page.
- Mobile users can understand the conclusion without horizontal scrolling.
- The UI remains useful when animation is skipped.
- Korean primary labels and English technical terms work together without visual clutter.
- Scenario-specific conditions such as `without @Version` or `before unique constraint` remain visible.
- The Point strategy comparison section reads as a compact set of cards instead of a chart-led report.
- The Point comparison section uses plain-language statuses rather than `불변식` as its primary recruiter-facing label.
- Technical conditions, limitations, and evidence remain available through collapsed details.

## 22. Open UX Decisions

No blocking UX decisions remain for the MVP implementation roadmap.

Do not reopen settled technical decisions: static Vite app, Vercel deployment, Recharts for charts, Korean primary UI language, recorded-result visualization, public GitHub evidence links, single-page experiment tabs, Point Lost Update as the default experiment, Duplicate Coupon Issuance in the first public release, explicit Lost Update failure playback, collapsed evidence sections, standardized Korean strategy labels, and separate Redis strategy grouping.
