# UI/UX Specification

## 1. UX Overview

Flash Concurrency Visualizer is a static interactive explanation of recorded backend concurrency experiments from Flash Coupon Payment. The interface should help reviewers understand what was tested, what should have happened, what actually happened, and why different strategies changed the result.

The product is not a live test runner. It replays verified recorded results from backend JUnit concurrency tests and project documents. The UI must make this clear without making the page feel defensive or overly legalistic.

Primary reviewer journey:

1. Land on the page and see the compact project message and three experiment groups.
2. Start with Point Lost Update by default.
3. Understand the Point problem through its compact workspace summary.
4. Optionally play the stage-based Lost Update explanation.
5. Compare all four Point strategy outcomes together without selecting a strategy.
6. Open conditions, technical explanation, the static-data limitation, or evidence only when more depth is wanted.

Coupon Overselling follows the same recruiter-first comparison pattern without playback, strategy selection, charts, or a dynamic summary.

Duplicate Coupon Issuance reuses the finalized Coupon static comparison pattern with two always-visible cards. Its `1건 → 10건` violation is immediately understandable, so it also uses no playback, chart, strategy selector, or dynamic summary.

Redis is not a fourth experiment. It appears once after the selected experiment workspace as a shared coupon-issuance architecture extension. It uses a static flow and two always-visible capability cards to explain admission control before PostgreSQL persistence.

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
- Render the shared Redis section once outside the experiment tab panel, after the selected experiment workspace.
- Redis must not become a fourth experiment or a dedicated experiment tab.

Point Lost Update page structure:

1. Compact project title and one-line Korean message.
2. Three experiment tabs.
3. Compact Point Lost Update problem summary.
4. Optional Lost Update failure playback.
5. Four compact strategy comparison cards.
6. Optional collapsed details for experiment conditions, technical explanation, static-data limitation, and code/evidence.

Coupon Overselling page structure:

1. Compact Coupon Overselling problem summary.
2. Four always-visible database strategy comparison cards.
3. Collapsed experiment conditions.
4. Collapsed strategy explanation.
5. Collapsed evidence and static-data limitation.

Duplicate Coupon Issuance page structure:

1. Compact Duplicate Coupon Issuance problem summary.
2. Two always-visible database strategy comparison cards.
3. Collapsed experiment conditions.
4. Collapsed strategy explanation.
5. Collapsed evidence and static-data limitation.

Overall page structure:

1. Project header.
2. Experiment tabs.
3. Selected experiment workspace: Point, Coupon, or Duplicate.
4. Shared Redis section.
5. Footer.

The first visible experiment should default to Point Lost Update because it has the smallest scenario and is easiest to understand quickly. Duplicate Coupon Issuance should be available from the first release, but it should not overcrowd the first viewport.

## 4. Primary User Flow

Point Lost Update interaction flow:

1. See the project title and the message `같은 요청도 적용한 전략에 따라 결과가 달라집니다.`
2. See the three explored concurrency scenarios.
3. Understand the Point Lost Update problem in one concise workspace summary.
4. Optionally play the conceptual Lost Update failure flow.
5. Compare all four strategy outcomes without selecting a strategy or moving attention to another section.
6. Open conditions, technical explanation, static-data limitation, or code/evidence only when more depth is wanted.

Collapsed by default:

- Experiment conditions and test environment details.
- Compact strategy mechanism and trade-off explanation.
- Static recorded-data limitation.
- Evidence link groups.

The compact Point workspace summary owns the problem definition. Playback owns the failure mechanism. The four strategy comparison cards own all Point strategy-specific outcomes.

Coupon Overselling interaction flow:

1. Read the stock limit and overselling problem in a compact summary.
2. Scan all four database strategy outcomes together.
3. Open conditions, strategy explanation, or evidence only when more depth is wanted.

The Coupon problem summary owns the failure definition. The strategy cards own the recorded outcomes. Disclosures own technical depth.

Duplicate Coupon Issuance interaction flow:

1. Read `허용 1건`, `발급 기록 10건`, and `중복 발급 발생` in a compact summary.
2. Compare the transaction-only result with the DB UNIQUE result.
3. Open conditions, strategy explanation, or evidence only when more depth is wanted.

Recruiter scan path:

`허용 1건 → 발급 기록 10건 → 중복 발급 발생 → DB UNIQUE 적용 후 1건`

The Duplicate problem summary owns the failure definition. The two comparison cards own the strategy outcomes. Disclosures own technical depth.

Shared Redis interaction flow:

1. Finish or skip the selected experiment workspace.
2. Read the static flow `많은 요청 → Redis 선행 승인 → PostgreSQL 저장`.
3. Compare the Redis Counter and Redis Lua capabilities together.
4. Open responsibility details or Redis evidence only when more depth is wanted.

Recruiter scan path:

`Point → Coupon → Duplicate → Redis`

The architecture flow owns the admission-control sequence. The capability cards own Redis-specific responsibilities. Collapsed disclosures own Redis/PostgreSQL boundaries and evidence.

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
| `duplicate-coupon-issuance` | `쿠폰 중복 발급` | `Duplicate Issuance` | `한 사용자가 같은 쿠폰을 여러 번 발급받을 수 있는 문제` |

Behavior:

- Desktop: use a segmented tab row or compact cards with clear active state.
- Mobile: allow horizontal scrolling segmented controls or stacked buttons if labels wrap cleanly.
- Selection should change the current page section content, not require a full route change in the MVP.
- Active state must be visually obvious and keyboard-accessible.
- Each option should show a short plain-language explanation, not only the technical name.
- Point Lost Update is selected by default.
- Duplicate Coupon Issuance is included in the first public release as the third tab, but the first impression should remain focused on Point Lost Update.

The selector must not include Redis as an experiment group. Redis is a shared coupon-issuance architecture extension outside experiment selection.

## 7. Strategy Presentation

Point Lost Update:

- Do not use a separate strategy selector or strategy tabs.
- Show all four strategies together as comparison cards:
  - `트랜잭션만 적용`
  - `비관적 락`
  - `낙관적 락`
  - `조건부 원자적 업데이트`

Coupon Overselling:

- Do not use a strategy selector or strategy tabs.
- Show the four database strategies together as always-visible comparison cards:
  - `트랜잭션만 적용`
  - `비관적 락`
  - `낙관적 락`
  - `조건부 원자적 업데이트`
- Keep Redis Counter and Redis Lua in the shared Redis section after the experiment workspace.
- Do not hide the database comparison behind interaction.

Duplicate Coupon Issuance:

- Do not use a strategy selector or strategy tabs.
- Show both database strategies together as always-visible comparison cards:
  - `트랜잭션만 적용`
  - `DB 유니크 제약조건`
- Keep Redis Lua in the shared Redis section after the experiment workspace.
- Do not hide the comparison behind interaction.

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

Terminology rules:

- Korean is the primary visible label.
- Point, Coupon, and Duplicate comparison cards use Korean strategy names only.
- In explanatory content, include the English term on first occurrence where helpful.
- Use the same terminology across cards, explanations, and evidence sections.
- Do not introduce alternative Korean names without a documented reason.

## 8. Experiment Conditions

Conditions should be compact and scannable.
For Point Lost Update, place all conditions inside one collapsed disclosure near the lower part of the Point section.

Primary condition chips or rows:

Point Lost Update:

- `초기 잔액 10,000`
- `동시 요청 15`
- `차감 1,000`
- `최대 유효 성공 10`
- Place failure reproduction context below the numeric conditions with lightweight separation:
  - `@Version 적용 전 · Retry 없음 · 트랜잭션 기반 차감`

Coupon Overselling:

- `쿠폰 재고 100`
- `동시 요청 1,000`
- `서로 다른 사용자 1,000명`
- `조건: Coupon.@Version 적용 전` for the transaction-only failure scenario
- `Lock hold 5ms` only where relevant

Duplicate Coupon Issuance:

- `동시 요청 100`
- `같은 사용자`
- `같은 쿠폰`
- `허용 발급 1건`
- Place failure reproduction context below the numeric conditions:
  - `DB UNIQUE 적용 전 · Retry 없음 · 애플리케이션 레벨 중복 확인`
- Do not show coupon stock in the Duplicate conditions grid or present Phase 6 as a stock-control comparison.

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

Finalized presentation:

- Section title: `Lost Update 발생 과정`.
- Before playback, show only `현재 잔액` and `10,000원` in a lightweight presentation.
- Keep the play action in the section header with icon and text:
  - `▶ 재생` before playback.
  - `↻ 다시 보기` after completion.
- Do not add instructional copy explaining how playback controls work.
- Keep the recorded-data and no-live-execution limitation in the secondary evidence disclosure.

Playback story:

| Stage | Meaning |
| --- | --- |
| `동시 읽기` | A and B read the same `10,000원` balance |
| `각자 계산` | A and B each calculate `9,000원` |
| `A 저장` | A saves `9,000원` first |
| `덮어쓰기` | B saves the same `9,000원` without knowing about A's change |
| `결과` | Show the conceptual two-request result: two deductions attempted, final balance `9,000원`, Lost Update |

Playback requirements:

- Use a small representative number of visual nodes, such as A and B or a similarly small set.
- Never draw all 15 individual requests as separate animated nodes.
- The conceptual playback result must not be presented as the recorded 15-request result.
- The recorded transaction-only balance `8,000원` remains in the comparison card and supporting data.
- Keep stages 1 through 4 visible for approximately two seconds each; the result remains visible until user interaction.
- Do not autoplay on page load.
- Initial page load should display the compact Point summary, lightweight current balance, play action, and all four cards without motion.
- Start animation only through the explicit `▶ 재생` action.
- Once started, the playback progresses automatically through the visible stages.
- During automatic playback, stage badges are visible but non-interactive.
- After completion, stage badges become clickable so reviewers can inspect a specific stage immediately.
- Do not add next/previous controls, pause/resume, speed controls, or timeline scrubbing.
- Respect `prefers-reduced-motion`: skip timed progression and expose the explanatory stages immediately.
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

- Next/previous navigation between stages.
- Pause and resume controls.
- Speed controls.
- Timeline scrubbing.
- Strategy-specific animations.
- Separate pessimistic-lock, optimistic-lock, or atomic-update playback.
- Replaying every experiment record.
- Coupon, duplicate-issuance, or Redis playback.
- Performance or latency visualization.

## 10. Dynamic Result Summaries

Point Lost Update does not use a separate selected-strategy result summary.

Point ownership:

- The compact Point workspace summary explains the concurrency failure.
- The four comparison cards own expected and recorded strategy outcomes.
- Changing or emphasizing a card must not update a separate result panel elsewhere on the page.

Reason:

- A result above a control makes the viewer move attention backward.
- The same strategy result should not be repeated in a separate summary and comparison card.
- Recruiter-facing comprehension is faster when all outcomes remain visible together.

Coupon Overselling also does not use a separate dynamic expected-vs-actual summary.

Coupon ownership:

- The compact problem summary establishes stock `100`, recorded issuance `1,000`, and the overselling conclusion.
- The four comparison cards own strategy-specific outcomes.
- No strategy selection updates a separate result area.

Duplicate Coupon Issuance also does not use a separate dynamic expected-vs-actual summary.

Duplicate ownership:

- The compact problem summary establishes the allowed maximum `1건`, recorded result `10건`, and `중복 발급 발생`.
- The two comparison cards own the transaction-only and DB UNIQUE outcomes.
- No strategy selection updates a separate result area.

Do not repeat every supporting count in the primary view. Success/failure counts and optimistic-lock variability belong in collapsed details.

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
| Transaction Only | `문제 발생`, `잔액 8,000원` |
| Pessimistic Lock | `정상 차감`, `잔액 0원` |
| Optimistic Lock | `충돌 감지`, `잔액 7,000원` |
| Atomic Update | `정상 차감`, `잔액 0원` |
| Optimistic-lock note | Do not add an `실행 예시` badge; keep no-retry and run-variability context in collapsed technical content |
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

Coupon Overselling strategy comparison cards:

| Item | Recommendation |
| --- | --- |
| Card content | strategy name, primary issued-record outcome, plain-language status, one short explanation when useful |
| Layout | Four always-visible cards; compact grid on desktop and single column on mobile |
| Transaction Only | `재고 초과 발급`, `발급 기록 1,000건` |
| Pessimistic Lock | `재고 한도 유지`, `발급 기록 100건` |
| Optimistic Lock | `충돌 감지`, `발급 기록 100건` |
| Atomic Update | `재고 한도 유지`, `발급 기록 100건` |
| Optimistic-lock note | Treat the recorded `100건` as a documented observed example in collapsed technical detail |
| Non-goal | No grouped bar chart, strategy selector, playback, or dynamic result summary |

Duplicate Coupon Issuance strategy comparison cards:

| Item | Recommendation |
| --- | --- |
| Card content | strategy name, user-coupon issued-record outcome, plain-language status, one short explanation |
| Layout | Two always-visible cards; two columns on desktop and one column on mobile |
| Transaction Only | `중복 발급 발생`, `발급 기록 10건` |
| DB Unique Constraint | `중복 발급 방지`, `발급 기록 1건` |
| Boundary | DB UNIQUE protects `(user_id, coupon_id)` uniqueness; it is not stock control |
| Non-goal | No playback, chart, strategy selector, dynamic summary, Redis content, or stock-control comparison |

## 12. Strategy Explanation

Point, Coupon, and Duplicate strategy explanations should remain in one compact disclosure below the comparison cards.

Use two concise lines per strategy:

1. Explain how the strategy handles the concurrent update.
2. State the most important trade-off or limitation in plain language.

Point examples:

- 비관적 락:
  - `한 번에 하나의 요청만 수정하도록 락을 건다.`
  - `정확하지만 충돌이 많으면 대기 시간이 늘어날 수 있다.`
- 낙관적 락:
  - `버전 충돌을 감지해 오래된 갱신을 거부한다.`
  - `재시도가 없으면 일부 요청은 실패할 수 있다.`
- 조건부 원자적 업데이트:
  - `조건 확인과 차감을 하나의 UPDATE로 처리한다.`
  - `단순한 수량 제어에 효과적이다.`

Coupon should adapt the same compact pattern to stock control. Do not restore separate `보장`, `한계`, or `적합한 경우` headings. Avoid long report-style paragraphs and do not claim universal performance superiority.

Duplicate should use the same two-line pattern:

- 트랜잭션만 적용:
  - `여러 요청이 중복 확인을 통과할 수 있다.`
  - `애플리케이션 조회만으로 최종 유일성을 보장할 수 없다.`
- DB 유니크 제약조건:
  - `같은 사용자-쿠폰 조합의 두 번째 저장을 DB가 거부한다.`
  - `중복 발급을 막지만 전체 쿠폰 재고를 제어하지는 않는다.`

## 13. Technical Detail Boundaries

- Keep scheduling-dependent optimistic-lock behavior in the collapsed explanation.
- Keep lock waiting and query-centered trade-offs concise.
- Keep database uniqueness in Duplicate details and Redis/PostgreSQL boundaries in the shared Redis disclosure.
- Do not repeat the primary card outcome inside every technical paragraph.

## 14. Shared Redis Section

Redis is a shared coupon-issuance architecture extension, not a fourth concurrency problem. Render it once outside the experiment tab panel, after the selected Point, Coupon, or Duplicate workspace and before the footer. It remains visible regardless of the selected experiment.

Section title:

`Redis 기반 선행 제어`

Supporting description:

`쿠폰 발급 요청을 PostgreSQL 저장 전에 선별하는 아키텍처입니다.`

Section structure:

1. Compact introduction.
2. Static architecture flow.
3. Two always-visible capability cards.
4. Collapsed responsibility explanation.
5. Collapsed Redis evidence.

Static architecture flow:

`많은 요청 → Redis 선행 승인 → PostgreSQL 저장`

Boundary copy:

`Redis 승인은 발급 완료가 아닙니다.`

`PostgreSQL 저장이 완료되어야 최종 기록이 됩니다.`

Capability cards:

| Capability | Primary responsibility | Recorded examples | Important boundary |
| --- | --- | --- | --- |
| `Redis 카운터` | 재고 슬롯 선행 제어 | `1,000건 요청 → 100건 승인` | 사용자 중복은 확인하지 않음 |
| `Redis Lua 스크립트` | 재고와 사용자 조건을 함께 확인 | 재고 `1,000건 → 100건`, 중복 `100건 → 1건` | Redis 내부 확인과 갱신만 원자적임 |

Responsibility ownership:

- The architecture flow explains request admission before persistence.
- The capability cards explain Redis Counter and Redis Lua responsibilities.
- The responsibility disclosure explains that PostgreSQL remains durable truth, database uniqueness constraints remain necessary, and Redis/PostgreSQL do not form one distributed transaction.
- The evidence disclosure owns test-fixture and Redis-boundary source links.

Explicit non-goals:

- No fourth experiment tab.
- No dedicated Redis tab.
- No playback or animation.
- No chart.
- No capability selector or tabs.
- No dynamic summary.
- No live Redis calls.
- Do not imply that Redis applies to Point Lost Update.
- Do not imply that Redis approval equals issuance completion.

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
| Conditions | Setup: initial balance, stock, requests, user pattern, retry, scenario-specific condition |
| Playback | Transaction-only Lost Update failure mechanism beginning in Point Phase 4 |
| Problem summary | Concise explanation of the selected failure |
| Point comparison cards | All Point strategy-specific outcomes and plain-language statuses |
| Coupon comparison cards | All Coupon database-strategy outcomes and plain-language statuses |
| Duplicate comparison cards | Transaction-only and DB UNIQUE outcomes for the user-coupon uniqueness invariant |
| Expandable details | Secondary counts such as successCount, failCount, Redis count, issued-user set size |
| Strategy explanation | Concise mechanism and most important trade-off |
| Redis architecture flow | Request admission before PostgreSQL persistence |
| Redis capability cards | Redis Counter and Redis Lua responsibilities |
| Redis responsibility disclosure | PostgreSQL durability, DB constraints, and cross-store boundaries |
| Evidence section | Source verification |
| Static-data disclosure/footer | Recorded-result and no-live-execution limitation |

Avoid repeating:

- The same Point outcome in a separate summary and comparison card.
- The same Coupon outcome in a separate dynamic summary and comparison card.
- The same Duplicate outcome in a separate dynamic summary and comparison card.
- Request counts outside cards when they are already available in conditions.
- Full environment metadata in the primary experiment area.
- Redis/PostgreSQL boundary explanation in every capability card; show it once clearly in the responsibility disclosure.
- Long strategy descriptions in selector labels.
- The full Point scenario context in every card; keep it in the collapsed conditions disclosure.
- Calculated diagnostic values such as `expectedBalanceBySuccessCount` in the recruiter-facing view.

Point, Coupon, and Duplicate problem summaries should stay concise. Their comparison cards own only the high-signal outcomes; technical interpretation belongs in collapsed details.

## 17. Responsive Design

Desktop:

- Use a compact card grid that keeps all four Point outcomes visible together.
- Keep all four Coupon outcomes and both Duplicate outcomes visible together.
- Keep the three experiment tabs visible near the top.
- Place the shared Redis section after the selected experiment workspace and outside the tab panel.
- Keep both Redis capability cards visible together.
- Evidence appears as a collapsed section with a clear `근거 자료 보기` control.

Tablet:

- Use a single-column or balanced two-column layout depending on width.
- Keep the Redis flow and both capability cards readable without horizontal scrolling.

Mobile:

- Point order: title/message, experiment tabs, problem summary, playback, four comparison cards, collapsed details.
- Coupon order: title/message, experiment tabs, problem summary, four comparison cards, collapsed details.
- Duplicate order: title/message, experiment tabs, problem summary, two comparison cards, collapsed details.
- After the selected experiment workspace, show the shared Redis introduction, static flow, two capability cards, and collapsed disclosures.
- The Point problem and strategy outcomes must be readable without horizontal scrolling.
- The Coupon problem and strategy outcomes must be readable without horizontal scrolling.
- The Duplicate problem and strategy outcomes must be readable without horizontal scrolling.
- The Redis flow and both capability cards must be readable without horizontal scrolling.
- Experiment selector can scroll horizontally if touch targets remain large.
- Comparison cards should fit the viewport; use horizontal scroll only as a last resort and never for the primary conclusion.
- Evidence links must have comfortable touch targets.

## 18. Accessibility

Requirements:

- Use semantic headings in page order.
- Experiment tabs must be keyboard-accessible and expose selected state.
- Focus states must be visible.
- Playback controls must be buttons with screen-reader labels.
- Evidence expand/collapse controls must be keyboard-accessible and expose expanded/collapsed state.
- Redis capability cards and the static flow must have meaningful semantic reading order.
- Do not communicate success or failure by color alone.
- Ensure sufficient contrast for text, chart labels, and status indicators.
- Respect reduced-motion preferences.
- Completed Point stage badges must be keyboard-accessible; they remain disabled during automatic progression.
- Keep evidence links descriptive; avoid multiple identical `View source` labels without context.

For screen readers, the compact problem summary should precede the comparison cards, and each card should announce strategy name, plain-language status, result, and optional mechanism copy in that order.

## 19. Visual Direction

The style should be understated, technical, and portfolio-appropriate.

Recommended characteristics:

- Calm and professional.
- Clear typography.
- Strong hierarchy for result conclusions.
- Restrained color use.
- Cards used selectively for repeated items, summaries, and evidence groups.
- Clean static architecture presentation.
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
| Initial state | Point Lost Update selected; compact summary, idle balance, play action, and all four cards visible |
| Experiment selected | Selected experiment content replaces the Point section |
| Point details closed | Conditions, technical explanation, static-data limitation, and evidence remain collapsed |
| Coupon details closed | Conditions, strategy explanation, static-data limitation, and evidence remain collapsed |
| Duplicate details closed | Conditions, strategy explanation, static-data limitation, and evidence remain collapsed |
| Playback running | The stage sequence progresses automatically; stage badges remain non-interactive |
| Completed | The result remains visible; stage badges become selectable and `↻ 다시 보기` preserves replay behavior |
| Reduced-motion mode | Timed progression is skipped and the explanatory stages are exposed immediately |
| Missing optional evidence | Show available evidence and omit missing link; do not block the experiment |
| Invalid or incomplete static data | Show a clear fallback such as `검증되지 않은 데이터` and avoid rendering invented values |

Because the app uses static verified data, network loading should not be emphasized. Lightweight loading states are acceptable only for code splitting.

## 21. Success Criteria

- The first experiment is understandable within about ten seconds.
- Point Lost Update is selected by default in a single-page tab layout.
- Duplicate Coupon Issuance is included in the first public release as the third experiment tab.
- The first view communicates the three explored scenarios, the Point Lost Update problem, and all four Point outcomes.
- Point outcomes are immediately distinguishable without a strategy selector or separate result summary.
- Point playback does not autoplay on page load and the result remains understandable without playing it.
- No component unnecessarily repeats the same metrics.
- Phase 4 playback explains only the Lost Update failure mechanism and does not compare strategies, update charts, or update result summaries.
- Variable optimistic-lock observations are labeled correctly.
- Redis and PostgreSQL responsibilities are not conflated.
- Evidence links are discoverable through a collapsed section without dominating the page.
- Mobile users can understand the conclusion without horizontal scrolling.
- The UI remains useful when timed motion is skipped.
- Korean primary labels and English technical terms work together without visual clutter.
- Scenario-specific conditions such as `without @Version` or `before unique constraint` remain visible.
- The Point strategy comparison section reads as a compact set of cards instead of a chart-led report.
- The Point comparison section uses plain-language statuses rather than `불변식` as its primary recruiter-facing label.
- Coupon Overselling uses a compact problem summary and four always-visible database strategy cards.
- Coupon Overselling uses no playback, strategy selector, grouped bar chart, or dynamic summary.
- Duplicate Coupon Issuance communicates `허용 1건 → 발급 기록 10건 → 중복 발급 발생 → DB UNIQUE 적용 후 1건` within a few seconds.
- Duplicate Coupon Issuance uses a compact problem summary and two always-visible comparison cards.
- Duplicate Coupon Issuance uses no playback, chart, strategy selector, dynamic summary, Redis content, or stock-control comparison.
- DB UNIQUE is described as protection for the user-coupon uniqueness invariant, not as stock control.
- Redis renders once outside experiment selection as a shared coupon-issuance architecture section.
- Redis uses the static flow `많은 요청 → Redis 선행 승인 → PostgreSQL 저장`.
- Redis Counter and Redis Lua are always visible together without playback, animation, chart, selector, or dynamic summary.
- Redis approval is distinguished from issuance completion, and PostgreSQL remains the durable source of truth.
- Technical conditions, limitations, and evidence remain available through collapsed details.

## 22. Open UX Decisions

No blocking UX decisions remain for the MVP implementation roadmap.

Do not reopen settled technical decisions: static Vite app, Vercel deployment, Korean primary UI language, recorded-result visualization, public GitHub evidence links, three single-page experiment tabs, Point Lost Update as the default experiment, Duplicate Coupon Issuance in the first public release, explicit Lost Update failure playback, no Coupon or Duplicate playback, always-visible Point, Coupon, and Duplicate database strategy cards, collapsed evidence sections, standardized Korean strategy labels, and one shared Redis section outside experiment selection.
