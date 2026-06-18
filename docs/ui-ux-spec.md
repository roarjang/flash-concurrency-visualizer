# UI/UX Specification

## 1. UX Overview

Flash Concurrency Visualizer is a static interactive explanation of recorded backend concurrency experiments from Flash Coupon Payment. The interface should help reviewers understand what was tested, what should have happened, what actually happened, and why a selected strategy changed the result.

The product is not a live test runner. It replays verified recorded results from backend JUnit concurrency tests and project documents. The UI must make this clear without making the page feel defensive or overly legalistic.

Primary reviewer journey:

1. Land on the page and understand that this is a recorded-result concurrency visualizer.
2. Pick an experiment group: Point Lost Update, Coupon Overselling, or Duplicate Coupon Issuance.
3. Pick a strategy or failure-reproduction scenario.
4. Review the scenario conditions.
5. Optionally start or skip a short representative request-flow animation.
6. See the expected-vs-actual correctness conclusion immediately.
7. Compare strategies, read the mechanism and trade-off, and open supporting evidence if desired.

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

Recommended MVP structure: a single-page application with near-top experiment tabs and strategy selectors.

Decision:

- Use a single-page layout for the MVP so each experiment can be understood without deep navigation.
- Use near-top experiment tabs for Point Lost Update, Coupon Overselling, and Duplicate Coupon Issuance.
- Point Lost Update is the default selected experiment.
- Switching experiments updates the main visualization content without navigating to another page.
- Do not require route-based experiment pages for the MVP.
- Keep the structure route-compatible for a possible future extension, but do not make routing part of the current UX requirement.
- Include Duplicate Coupon Issuance in the first public release as the third experiment tab. It demonstrates a distinct invariant: uniqueness of the user-coupon pair.

Recommended page structure:

1. Landing section.
2. Experiment selector.
3. Strategy selector.
4. Selected experiment workspace.
5. Database strategy comparison.
6. Redis-specific section where relevant.
7. Evidence links.
8. Next experiment navigation.

The first visible experiment should default to Point Lost Update because it has the smallest scenario and is easiest to understand quickly. Duplicate Coupon Issuance should be available from the first release, but it should not overcrowd the first viewport.

## 4. Primary User Flow

Complete interaction flow:

1. Landing and project explanation: mandatory.
2. Experiment selection: mandatory, default selected.
3. Strategy selection: mandatory, default to failure-reproduction scenario for the selected experiment.
4. Experiment conditions: mandatory and always visible near the result.
5. Recorded-request animation: optional to start; must support explicit play, replay, skip, and reduced-motion behavior.
6. Expected vs actual summary: mandatory and accessible without playing the animation.
7. Strategy comparison section: mandatory for database strategies when comparable data exists.
8. Cause explanation: mandatory, short.
9. Guarantee and limitation: mandatory for selected strategy.
10. Appropriate use case: mandatory for solution strategies; concise for baseline/failure reproduction.
11. Evidence links: mandatory when evidence exists; collapsed by default on desktop and mobile.
12. Next experiment navigation: mandatory at section end.

Skippable or collapsible:

- Animation playback can be skipped or never started.
- Test environment details should be collapsed.
- Evidence link groups should be collapsed on both desktop and mobile.
- Supporting counts can appear in comparison cards, chart tooltips, or expandable details.

The user should not need to read the comparison section before understanding the result. The expected-vs-actual summary owns the primary conclusion.

## 5. Landing Section

The first viewport should be compact and direct.

Required content:

- Project title: `Flash Concurrency Visualizer`
- One-sentence purpose: `백엔드 동시성 실험 결과를 기록된 테스트 결과 기반으로 시각화합니다.`
- Supporting English line: `Recorded-result visualization for backend concurrency experiments.`
- Recorded-result disclaimer: `이 화면은 backend JUnit 동시성 테스트에서 기록된 결과를 재생합니다. 브라우저에서 실시간 부하 테스트를 실행하지 않습니다.`
- Near-top experiment tabs:
  - `Point Lost Update`
  - `Coupon Overselling`
  - `Duplicate Coupon Issuance`
- Primary action: `첫 실험 보기` or `Point Lost Update 보기`

The landing section should not become a long portfolio introduction. Point Lost Update should be selected by default, and the first viewport should leave a hint of the selected experiment workspace visible below the landing content on typical desktop screens.

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

- Baseline:
  - `트랜잭션만 적용` / `Transaction Only`
- Database strategies:
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

Presentation:

- Use grouped segmented controls or grouped button rows: `Baseline`, `Database`, `Redis`.
- Keep the selected strategy visually prominent.
- Avoid a crowded single row when many strategies exist. On mobile, groups can stack vertically.
- Switching strategies should update conditions, animation state, summary, explanation, chart highlight, and evidence links.
- Switching strategies during playback should stop the current animation, load the new strategy state, and show a `재생` action rather than continuing mismatched animation.
- Do not make the user replay animation every time they switch strategies. Stable setup, summary, chart, and explanation should remain available without animation playback.

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

Conditions should be compact, scannable, and always available near the selected result.
For Point Lost Update, prefer progressive disclosure so the first screen stays focused on the result hook.

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

## 9. Recorded Request Animation

Purpose:

- Explain the request flow conceptually.
- Make concurrency behavior visible without implying live execution.
- Prepare the user for the expected-vs-actual summary.

Required copy near the animation:

`단순화된 재생입니다. 실제 기록된 요청 수는 조건과 차트에 표시되며, 브라우저에서 DB 요청을 실행하지 않습니다.`

Recommended supporting message:

`백엔드 JUnit 동시성 테스트에서 기록된 요청 흐름과 결과를 단순화해 재생합니다.`

Stages:

| Stage | Meaning |
| --- | --- |
| idle | Strategy selected, stable setup and result available, ready for explicit playback |
| ready | Representative request nodes are queued |
| simultaneous start | Requests begin together |
| read/check | Requests read balance, stock, duplicate state, or Redis state |
| update/issue attempt | Requests attempt deduction, stock increment, insert, Redis admission, or Lua script |
| success/conflict/failure | Nodes split into success, conflict, sold-out, duplicate, or overwritten paths |
| completed | Summary appears and chart highlight updates |

Animation requirements:

- Use a small representative number of visual nodes, around 8 to 12.
- Never draw 100 or 1,000 individual nodes.
- Actual recorded counts must remain in text, chart data, or tooltip details.
- Recommended duration: 1.8 to 2.8 seconds.
- Do not autoplay.
- Initial page load should display experiment setup, summary, chart, and explanation without motion.
- Start animation only through an explicit user action such as `기록된 요청 흐름 재생`.
- Provide `Replay` and `Skip` controls.
- Respect `prefers-reduced-motion`: skip animation by default and show the completed state.
- The expected-vs-actual result must remain understandable even if the animation is never played.
- Animation must not block access to the expected-vs-actual conclusion.
- When switching experiments or strategies, reset animation to a stable idle state.
- Do not imply that the play button runs a live Java concurrency test.
- Do not use animation duration or node speed as a performance benchmark.
- Do not animate lock waiting in a way that implies measured latency unless the value is explicitly documented and labeled.

Strategy-specific animation cues:

- Transaction-only lost update: several requests read the same old value, then final persisted value does not match accepted successes.
- Pessimistic lock: one request enters the locked row at a time.
- Optimistic lock: conflicts appear at commit/update time.
- Atomic update: requests hit one conditional update gate.
- Unique constraint: duplicate insert attempts hit the database invariant.
- Redis Counter: Redis admits only stock-sized slots before PostgreSQL persistence.
- Redis Lua: stock and duplicate checks happen atomically inside Redis before PostgreSQL persistence.

## 10. Expected vs Actual Summary

This is the most important post-animation component.

Placement:

- Immediately below or beside the animation.
- Visible without scrolling on desktop after animation completion.
- On mobile, it should appear directly below the animation and above the chart.

Visual hierarchy:

- Large conclusion label.
- Two or three high-signal values.
- Small condition reminder.
- Avoid dense metric tables.

Point fields:

- Expected final balance under the recorded scenario conditions.
- Observed final balance.
- Conclusion:
  - `Lost Update 발생`
  - or `잔액 불변식 유지`

Point context requirement:

- The expected final balance must be shown as scenario-specific, not universal.
- Required nearby condition context: initial balance `10,000`, deduction amount `1,000`, concurrent requests `15`, maximum successful deductions `10`.
- Recommended concise label: `이 실험 조건의 기대 최종 잔액: 0원`.
- Keep supporting success/failure counts outside the primary summary unless they are needed in a tooltip or expandable detail.

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
| Card content | strategy name, expected result, recorded result, invariant match, one short mechanism or conclusion, required caveats |
| Layout | Compact grid on desktop, single-column cards on mobile |
| Hook | Lead with `15건 모두 성공으로 기록됐지만 최종 잔액은 8,000원이었습니다.` for Transaction Only |
| Optimistic-lock note | Label the numeric result as one documented observed execution example and keep the no-retry / run-variability caveat visible |
| Caveat | Expected balance `0` comes from the recorded condition: initial balance `10,000`, deduction amount `1,000`, concurrent requests `15`, and maximum successful deductions `10` |
| Non-goal | Do not present Point as a chart-led report or a separate `수치로 보기` table |

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

## 16. Content Hierarchy and Duplication Rules

Component ownership:

| Component | Owns |
| --- | --- |
| Landing | Project purpose, recorded-result disclaimer, experiment entry |
| Experiment selector | Experiment group choice and short problem description |
| Strategy selector | Relevant strategy choice and grouping |
| Conditions | Setup: initial balance, stock, requests, user pattern, retry, scenario-specific condition |
| Animation | Conceptual request flow |
| Expected/actual summary | Primary correctness conclusion |
| Point comparison cards | Strategy comparison for Point Lost Update |
| Chart | Strategy comparison where a chart is the clearest fit for later experiments |
| Tooltip/expandable details | Secondary counts such as successCount, failCount, Redis count, issued-user set size |
| Cause section | Why the result happened and what invariant was affected |
| Trade-off section | Guarantee, limitation, appropriate use case |
| Redis section | Redis/PostgreSQL boundary and Redis admission control |
| Evidence section | Source verification |

Avoid repeating:

- Request count in summary if it is already in conditions.
- Success/failure counts in both summary and point comparison card copy.
- Full environment metadata in the primary experiment area.
- Redis/PostgreSQL boundary explanation in every Redis tooltip; show it once clearly in the Redis section.
- Long strategy descriptions in selector labels.
- The full point scenario context in every component; keep it near the summary and chart, then use concise labels elsewhere.

The expected-vs-actual summary should stay concise. Supporting metrics belong in the Point comparison cards, tooltips, or expandable details.

## 17. Responsive Design

Desktop:

- Two-column experiment workspace is acceptable: result hook/summary on one side and comparison cards or explanation on the other.
- Keep selectors visible near the top.
- Evidence appears as a collapsed section with a clear `근거 자료 보기` control.

Tablet:

- Use a single-column or balanced two-column layout depending on width.
- Strategy selector may wrap by group.
- Charts should use shorter labels or angled labels if needed.

Mobile:

- Stack content in this order: experiment selector, strategy selector, expected/actual summary, conditions, animation placeholder, comparison cards, explanation, evidence.
- The primary conclusion must be readable without horizontal scrolling.
- Experiment selector can scroll horizontally if touch targets remain large.
- Strategy groups should stack vertically.
- Comparison cards should fit the viewport; use horizontal scroll only as a last resort and never for the primary conclusion.
- Animation should use fewer visual nodes.
- Evidence links must have comfortable touch targets.

## 18. Accessibility

Requirements:

- Use semantic headings in page order.
- Selectors must be keyboard-accessible and expose selected state.
- Focus states must be visible.
- Animation controls must be buttons with screen-reader labels.
- Evidence expand/collapse controls must be keyboard-accessible and expose expanded/collapsed state.
- Provide chart text alternatives where charts are used, and concise card alternatives for Point Lost Update.
- Do not communicate success or failure by color alone.
- Ensure sufficient contrast for text, chart labels, and status indicators.
- Respect reduced-motion preferences.
- Provide a skip control for animations.
- Keep evidence links descriptive; avoid multiple identical `View source` labels without context.

For screen readers, the expected-vs-actual summary should announce the conclusion before secondary metrics.

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
| Initial state | Point Lost Update selected, Transaction Only selected, animation idle, conditions visible |
| Experiment selected | Strategy list updates to relevant strategies; default strategy selected |
| Strategy selected | Summary, conditions, animation placeholder, comparison cards, explanation, and evidence update |
| Animation running | Replay/skip controls visible; strategy switching stops playback and resets for new strategy |
| Animation skipped | Completed state appears immediately; summary remains shown |
| Completed | Expected-vs-actual summary and comparison cards visible |
| Reduced-motion mode | Animation is skipped or heavily simplified by default |
| Missing optional evidence | Show available evidence and omit missing link; do not block the experiment |
| Invalid or incomplete static data | Show a clear fallback such as `검증되지 않은 데이터` and avoid rendering invented values |

Because the app uses static verified data, network loading should not be emphasized. Lightweight loading states are acceptable only for code splitting or chart rendering.

## 21. Success Criteria

- The first experiment is understandable within about ten seconds.
- Point Lost Update is selected by default in a single-page tab layout.
- Duplicate Coupon Issuance is included in the first public release as the third experiment tab.
- Expected and observed values are immediately distinguishable.
- Baseline and solution strategies are easy to switch.
- Animation does not autoplay and the result remains understandable without playing it.
- No component unnecessarily repeats the same metrics.
- Animation is clearly representational.
- Variable optimistic-lock observations are labeled correctly.
- Redis and PostgreSQL responsibilities are not conflated.
- Evidence links are discoverable through a collapsed section without dominating the page.
- Mobile users can understand the conclusion without horizontal scrolling.
- The UI remains useful when animation is skipped.
- Korean primary labels and English technical terms work together without visual clutter.
- Scenario-specific conditions such as `without @Version` or `before unique constraint` remain visible.
- The Point strategy comparison section reads as a compact set of cards instead of a chart-led report.
- The Point comparison section communicates expected, recorded, and invariant-match status without a separate `수치로 보기` table.

## 22. Open UX Decisions

No blocking UX decisions remain for the MVP implementation roadmap.

Do not reopen settled technical decisions: static Vite app, Vercel deployment, Recharts for charts, Korean primary UI language, recorded-result visualization, public GitHub evidence links, single-page experiment tabs, Point Lost Update as the default experiment, Duplicate Coupon Issuance in the first public release, explicit animation playback, collapsed evidence sections, standardized Korean strategy labels, and separate Redis strategy grouping.
