# Flash Concurrency Visualizer Project Context

## 1. Project Overview

Flash Coupon Payment is a Java/Spring backend portfolio project for reproducing and comparing concurrency problems in point deduction and first-come-first-served coupon issuance.

The project is not a complete commerce, payment, or production traffic system. Its main purpose is to make concurrency anomalies observable, verify final database state after concurrent requests, and compare the guarantees and trade-offs of different consistency strategies.

Flash Concurrency Visualizer is planned as a separate static frontend application. It will present verified recorded experiment scenarios and observed results from the backend repository in an interactive format that is easier for recruiters, interviewers, and backend reviewers to understand quickly.

## 2. Problem Statement

The backend repository already contains source code, executable tests, disabled earlier-scenario tests, README content, and detailed Markdown documentation. However, concurrency experiments can be hard to evaluate quickly from raw tests and long strategy documents.

Reviewers may need to understand:

- which problem was reproduced,
- which test conditions were used,
- which values were expected,
- which values were observed,
- why a strategy changed the result,
- which guarantees the strategy does and does not provide.

Those details are spread across README content, strategy documents, implementation notes, entity mappings, repository queries, service methods, and JUnit concurrency tests. The visualizer should reduce that reading burden without changing or embellishing the experimental evidence.

## 3. Visualization Goal

The React application should help a reviewer understand a selected concurrency experiment in about ten seconds.

For each supported experiment and strategy, the UI should make these items immediately visible:

- the tested problem,
- the test conditions,
- the expected invariant,
- the observed result,
- the cause of the result,
- the strategy guarantee,
- the strategy limitation,
- links or references to supporting backend test code and documentation.

The application should explain the selected strategy without presenting any strategy as universally best. It should make correctness, contention, retry behavior, lock waiting, Redis/PostgreSQL boundaries, and operational complexity understandable at a portfolio-review level.

## 4. Target Audience

The primary audience is:

- recruiters,
- backend engineers reviewing the portfolio,
- technical interviewers,
- engineering managers.

Many viewers may spend only a short time on the page. The first screen for a selected experiment should prioritize the problem, expected value, actual value, and reason for the result before deeper technical details.

## 5. Source Backend Project

The backend reference project is `flash-coupon-payment`. It must be treated as read-only by this frontend project.

Verified backend stack and tooling:

- Java 21, verified in `flash-coupon-payment/build.gradle`.
- Spring Boot, Spring Data JPA, Spring Security, Spring Data Redis, and Spring Web, verified in `flash-coupon-payment/build.gradle`.
- PostgreSQL 16 and Redis 7.4 Alpine through Docker Compose, verified in `flash-coupon-payment/docker-compose.yml`.
- JUnit 5 through Gradle `useJUnitPlatform()`, verified in `flash-coupon-payment/build.gradle`.
- AssertJ assertions in concurrency tests, verified in `flash-coupon-payment/src/test/java/...`.
- Local PostgreSQL and Redis configuration in `flash-coupon-payment/src/main/resources/application.yml`.

Verified implemented backend areas:

- User/Auth exists with signup, login, JWT, and security files.
- Point domain exists with point balance, charge, deduction, pessimistic lock, optimistic lock, and atomic update paths.
- Coupon domain exists with coupon definitions, issued coupon records, duplicate constraints, stock-control paths, and Redis experiment paths.
- Runtime `CouponIssueService` contains the transaction-only coupon issuance path.
- Redis Counter and Redis Lua coupon strategies are implemented in the coupon concurrency test fixture, not as production-facing runtime API paths.

Verified experiment areas:

- Point lost update and point deduction strategies are documented and tested in `PointServiceConcurrencyTest`.
- Coupon stock overselling, duplicate issuance, database locking, optimistic locking, atomic update, Redis Counter, and Redis Lua are documented as recorded scenarios and supported by `CouponIssueConcurrencyTest` and related docs.
- Concurrency tests use fixed thread pools and `CountDownLatch` to align concurrent request start timing.
- Final verification checks persisted state such as point balance, coupon issued quantity, issued coupon record counts, duplicate record counts, and Redis key state.
- Some recorded scenarios describe earlier experiment configurations, such as point deduction before `Point.@Version` or duplicate issuance before the database unique constraint. Current executability is evidence metadata, not the main product concept.

## 6. Product Principles

### Evidence before presentation

All displayed experiment conditions and results must come from repository evidence:

- executed or executable tests,
- disabled tests that preserve earlier experiment scenarios,
- source code,
- repository queries,
- entity constraints,
- existing experiment documents,
- recorded observed results.

Do not invent, smooth, normalize, or improve values to make the visualization cleaner. If a value cannot be verified, mark it as `TODO` or `Unverified`.

### Recorded experiments, not current repository mirroring

The frontend visualizes verified recorded experiments. It does not attempt to reproduce the current executable state of the backend repository.

A scenario can be included when it was actually executed, its conditions are documented, its observed result is recorded, and supporting evidence exists in source code, README content, or project documents. A test does not need to remain active in the current test suite to be visualized.

Scenario-specific conditions must be shown with the result. Examples include `transaction-only point deduction before Point.@Version`, `coupon overselling before Coupon.@Version`, and `duplicate issuance before the database unique constraint`.

Current repository implementation state may be shown as supporting metadata, but it should not be treated as the primary user-facing explanation.

### Visualization, not backend simulation

The frontend visualizes recorded experiment results. It must not execute real load tests, database locks, Redis operations, concurrent requests, or Spring backend calls.

The UI must clearly state that animations are simplified visual explanations based on previously recorded backend JUnit tests.

### Preserve experiment context

Do not show numeric results without their conditions. Each result should include relevant context such as:

- initial balance or coupon stock,
- deduction amount,
- request count,
- same-user or distinct-user condition,
- artificial delay or lock-hold delay when relevant,
- retry behavior,
- expected invariant,
- success and failure definitions.

### Do not overstate guarantees

The application must use conservative wording:

- `@Transactional` alone should not be described as preventing shared-row concurrency anomalies.
- Optimistic locking should be described as conflict detection and stale update rejection. For no-retry experiments, do not claim universal full stock exhaustion.
- A database unique constraint is a final database invariant for duplicate user-coupon rows, not a complete stock-control strategy.
- Redis is a front-line gate in the experiments, not the durable source of truth.
- Redis Lua provides Redis-side atomic checks over Redis keys, but it does not create one distributed transaction across Redis and PostgreSQL.

### Explain trade-offs

The visualizer should compare strategies by selection criteria such as:

- collision frequency,
- correctness requirements,
- retry policy,
- lock waiting,
- database contention,
- query-centered logic,
- operational complexity,
- persistence and recovery guarantees.

### Keep the portfolio honest

Do not describe Flash Coupon Payment or this visualizer as:

- a production payment platform,
- a large-scale traffic system,
- a complete commerce application,
- a benchmark proving universal performance superiority,
- a system serving real customers.

It is a controlled backend concurrency experiment and strategy-comparison portfolio project.

## 7. Visualization Model

The application should use static recorded data derived from backend repository evidence. The data model should distinguish experiment scenario conditions, observed results, and current repository implementation state.

The planned interaction model is:

1. Select an experiment.
2. Select a strategy.
3. Review the test conditions.
4. Replay a simplified concurrent-request animation.
5. See expected values and actual values immediately.
6. Compare strategies with a chart.
7. Read cause, guarantee, limitation, trade-off, and suitable use case.
8. Open the relevant backend test code or documentation as evidence.

The animation is explanatory only. It should represent concepts such as simultaneous reads, stale writes, lock waiting, version conflicts, atomic updates, Redis gates, or duplicate rejection. It must not imply that the browser is executing live concurrent database requests.

## 8. Initial Scope

### Confirmed first-release scope

The first public release includes the three experiment groups below. They have clear evidence, high explanatory value, and distinct invariants.

Point Lost Update:

- Failure-reproduction scenario: transaction-only point deduction before `Point.@Version`.
- Scenario conditions: initial balance `10,000`, `15` concurrent deduction requests, deduction amount `1,000`.
- Correct invariant: `10` successes, `5` failures, final balance `0`.
- Observed failure result: `successCount = 15`, `failCount = 0`, `finalBalance = 8000`, `expectedBalanceBySuccessCount = -5000`.
- Current repository implementation state: `Point` now has `@Version`, so the original transaction-only no-version scenario is an earlier recorded experiment configuration.
- Strategy evidence exists for pessimistic lock, optimistic lock without retry, and atomic update.
- Pessimistic lock and atomic update have deterministic documented results of `successCount = 10`, `failCount = 5`, `finalBalance = 0`.
- Optimistic lock has a documented observed example of `successCount = 3`, `failCount = 12`, `finalBalance = 7000`, with `ObjectOptimisticLockingFailureException`; exact success count may vary.

Coupon Overselling:

- Failure-reproduction scenario: transaction-only coupon issuance before `Coupon.@Version`.
- Scenario conditions: coupon stock `100`, `1,000` concurrent requests, `1,000` distinct users.
- Correct invariant: `successCount = 100`, `failCount = 900`, `issuedCouponCountByCoupon = 100`, `finalIssuedQuantity = 100`.
- Observed failure result: `successCount = 1000`, `failCount = 0`, `issuedCouponCountByCoupon = 1000`, `finalIssuedQuantity = 100`.
- Current repository implementation state: `Coupon` now has `@Version`, so the original transaction-only no-version overselling scenario is an earlier recorded experiment configuration.
- Strategy evidence exists for pessimistic lock, optimistic lock without retry, atomic update, Redis Counter, and Redis Lua.
- Pessimistic lock, atomic update, Redis Counter, and Redis Lua have tests asserting stock-sized success and final persisted consistency.
- Optimistic lock has documented observed values of `successCount = 100`, `failCount = 900`, `issuedCouponCountByCoupon = 100`, `finalIssuedQuantity = 100`, but the code and docs should be interpreted conservatively as no-oversell/conflict-detection evidence without a universal no-retry full-exhaustion guarantee.

Coupon Duplicate Issuance:

- Failure-reproduction scenario: transaction-only coupon issuance before applying the database unique constraint on `(user_id, coupon_id)`.
- Scenario conditions: coupon stock `1,000`, `100` concurrent requests, same user and same coupon.
- Correct invariant: `successCount = 1`, `failCount = 99`, `issuedCouponCountByUserAndCoupon = 1`.
- Observed failure result: `successCount = 10`, `failCount = 90`, `issuedCouponCountByUserAndCoupon = 10`.
- Current repository implementation state: `IssuedCoupon` now has the `uk_issued_coupon_user_coupon` unique constraint, so the original duplicate failure scenario is an earlier recorded experiment configuration.
- Confirmed first-release scope: this experiment demonstrates the distinct invariant that one `(user_id, coupon_id)` pair should have at most one issued coupon record.

### First-release Redis front-line gate section

Redis Counter:

- Implemented and verified for coupon stock gating with distinct users.
- Should be framed as a Redis front-line stock gate plus PostgreSQL persistence, not duplicate protection and not durable truth.

Redis Lua Script:

- Implemented and verified for Redis-side stock and duplicate gates.
- Should be framed as Redis-side atomic gating plus PostgreSQL persistence and final database constraints.
- Should be displayed in a separate Redis front-line gate section, not mixed into the first database strategy comparison chart.

### Later expansion after the first release

Earlier scenario configurations and disabled tests:

- Disabled tests and earlier experiment configurations may be included when they have reliable recorded evidence.
- The visualizer should label their scenario conditions clearly instead of warning users primarily about current executability.
- Current test status can be stored as evidence metadata for engineering traceability.

Richer evidence views:

- Later versions may add code snippets, timeline details, Redis key state, or side-by-side strategy comparison panels.
- These should be added only after experiment data is finalized from repository evidence.

### Not ready to claim as MVP without more work

- A complete product/order/payment flow.
- Production coupon usage or payment integration.
- Public live execution of tests.
- Performance benchmarking across environments.
- Redis reconciliation, TTL policy, rebuild process, or production script deployment.

## 9. Out of Scope

The following are out of scope unless separately approved:

- publicly executing real concurrency tests,
- a new Spring backend API for the visualization,
- Vercel serverless functions,
- API routes,
- databases,
- user authentication,
- persistent frontend state,
- editing experiment results from the UI,
- arbitrary request-count configuration,
- production load generation,
- real-time database monitoring,
- cloud infrastructure for backend execution,
- redesigning the original backend domain,
- modifying experiment results,
- adding fictional performance measurements,
- treating animation as a live simulation,
- claiming production payment or commerce readiness.

## 10. Technical Direction

The planned frontend direction is:

- React,
- TypeScript,
- Vite,
- Recharts,
- static JSON or TypeScript data derived from verified backend evidence,
- static deployment on Vercel.

Deployment direction:

- Vercel is the selected deployment platform.
- The application must remain a static frontend with no backend API.
- The build command must be compatible with `npm run build`.
- The build output directory must be `dist`.
- Connecting the GitHub repository to Vercel should be sufficient for deployment.
- Vercel-specific configuration should be added only if Vite's default Vercel behavior is insufficient.
- Environment variables should not be required for the MVP unless a public GitHub repository URL must be configured.
- Do not introduce serverless functions, API routes, databases, authentication, or runtime concurrency execution.

This document is not an implementation guide. It defines the product context, evidence rules, scope, and constraints for later frontend work.

## 11. Success Criteria

The first visualizer version should satisfy these criteria:

- A reviewer can understand the selected problem within about ten seconds.
- Expected and actual values are immediately visible.
- Displayed values match verified backend test evidence or are clearly marked as `TODO`/`Unverified`.
- Test conditions are shown near the result values.
- Scenario-specific conditions such as `before @Version` or `before unique constraint` are shown with the result.
- Strategy trade-offs are understandable without reading all backend documents first.
- The UI does not imply live backend execution.
- Simplified animations do not misrepresent guarantees or failure modes.
- The application works on desktop and mobile.
- The application can be built with `npm run build` and deployed as static `dist` output on Vercel.
- Relevant backend test code and documentation are discoverable from each experiment.
- Redis and PostgreSQL responsibilities are clearly distinguished.
- Current backend implementation state is available as evidence metadata without becoming the primary product explanation.

## 12. Constraints and Risks

Key constraints:

- Backend evidence must remain the source of truth.
- The backend repository must not be modified by this frontend project.
- No application code should be implemented until the documentation and experiment data model are separately approved.
- Current visualizer data should remain static and pre-recorded.
- Deployment must stay compatible with Vercel static hosting.
- The MVP should not depend on private runtime environment variables.

Risks:

- Some concurrency results are environment-dependent, especially no-retry optimistic locking success counts.
- Some recorded scenarios depend on earlier implementation conditions, such as before `@Version` fields or before a unique constraint. These conditions must be shown clearly with their observed results.
- Original test console logs may not exist as standalone artifacts outside documentation and test output statements.
- Animations can mislead viewers if they look like live execution.
- Repeating data in multiple frontend files can drift from backend evidence.
- Overclaiming Redis or optimistic-lock guarantees would make the portfolio less credible.
- Local test duration and measured timing can vary by machine, Docker resources, database state, and scheduling.
- `ddl-auto=update` may not apply schema changes such as unique constraints to an existing database; schema verification matters when using DB constraint evidence.

## 13. Repository Evidence and Remaining Evidence Gaps

### Files inspected in the frontend repository

- `flash-concurrency-visualizer/README.md` - the frontend repository did not have a README during the original project-context inspection.
- `flash-concurrency-visualizer/docs/` - the docs directory was not present during the original project-context inspection; it now contains the planning documents for this frontend project.

### Files inspected in the backend repository

- `flash-coupon-payment/README.md`
- `flash-coupon-payment/build.gradle`
- `flash-coupon-payment/docker-compose.yml`
- `flash-coupon-payment/src/main/resources/application.yml`
- `flash-coupon-payment/docs/architecture.md`
- `flash-coupon-payment/docs/runbook.md`
- `flash-coupon-payment/docs/point-concurrency-strategy-comparison.md`
- `flash-coupon-payment/docs/coupon-concurrency-strategy-comparison.md`
- `flash-coupon-payment/docs/coupon-domain-design.md`
- `flash-coupon-payment/docs/redis-consistency-boundary.md`
- `flash-coupon-payment/docs/history/implementation-roadmap.md`
- `flash-coupon-payment/docs/history/concurrency-experiment-plan.md`
- `flash-coupon-payment/docs/history/coupon-concurrency-experiment-plan.md`
- `flash-coupon-payment/src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
- `flash-coupon-payment/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/point/entity/Point.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/point/repository/PointRepository.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/point/service/PointService.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCouponStatus.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/coupon/repository/IssuedCouponRepository.java`
- `flash-coupon-payment/src/main/java/com/roar/coupon/domain/coupon/service/CouponIssueService.java`

### Verified facts

- The backend uses Java 21 and Spring Boot with JPA, Redis, Security, Web, PostgreSQL driver, JUnit 5, and Gradle.
- Docker Compose defines PostgreSQL 16 and Redis 7.4 Alpine services.
- PostgreSQL is configured as the durable store and Redis is configured on localhost for Redis experiment paths.
- `Point` has a unique `user_id` constraint and a JPA `@Version` field.
- `Coupon` has `totalQuantity`, `issuedQuantity`, and a JPA `@Version` field.
- `IssuedCoupon` has a unique constraint named `uk_issued_coupon_user_coupon` on `(user_id, coupon_id)`.
- `PointRepository.findByUserIdForUpdate()` uses `PESSIMISTIC_WRITE`.
- `PointRepository.deductIfEnoughBalance()` performs a conditional update that also increments version.
- `CouponRepository.findByIdWithPessimisticLock()` uses `PESSIMISTIC_WRITE`.
- `CouponRepository.increaseIssuedQuantityIfStockAvailable()` conditionally increments `issuedQuantity` when `issuedQuantity < totalQuantity`, increments version, and updates `updatedAt`.
- Point concurrency tests use `15` concurrent requests, initial balance `10,000`, and deduction amount `1,000`.
- Coupon stock tests use stock `100` and `1,000` concurrent distinct-user requests.
- Coupon duplicate tests use stock `1,000` and `100` concurrent requests from the same user.
- Redis Counter uses `coupon:issue:count:{couponId}`.
- Redis Lua uses `coupon:issue:count:{couponId}` and `coupon:issue:users:{couponId}`.
- Redis Lua returns `1` for accepted, `-1` for sold out, and `-2` for duplicate in the test fixture.
- Redis strategies persist accepted requests through PostgreSQL after Redis acceptance and include best-effort compensation in the tested failure path.
- Redis/PostgreSQL atomic transaction, reconciliation, TTL policy, Redis rebuild, idempotency token design, and production monitoring are not implemented according to the docs.

### Unresolved facts and missing data

- No standalone machine-readable experiment data file exists yet for the frontend.
- No preserved raw test console log artifact was found during inspection; observed values are documented in Markdown and printed/asserted by tests.
- The frontend repository had no `README.md` during the original project-context inspection.
- The frontend repository had no existing docs content before the initial planning documents were created.
- Exact runtime measurements are mostly not formalized. The coupon pessimistic-lock docs mention about 10 seconds for one scenario, but this should not be generalized.
- Optimistic lock success counts can vary; frontend data should distinguish documented observed examples from invariant assertions.

### Resolved planning decisions reflected in later documents

- Point Lost Update, Coupon Overselling, and Duplicate Coupon Issuance are all included in the first public release.
- Optimistic-lock numeric results should be stored and displayed as documented observed examples, not deterministic values.
- Redis Counter and Redis Lua should be shown in a separate Redis front-line gate section.
- Evidence metadata should store both backend-root-relative `repositoryPath` values and public `githubUrl` values.
- Only public GitHub URLs should be rendered in the UI; local repository paths are development metadata.
- The public backend repository URL is static MVP metadata and does not require an environment variable.
- Korean-first names and English supporting names should both be represented.
- Current test executability is evidence metadata rather than primary result logic.
