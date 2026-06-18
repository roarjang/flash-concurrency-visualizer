# Experiment Data

This document defines the verified recorded experiment scenarios that the frontend visualizer may present.

The frontend must treat this document as static recorded evidence, not as instructions to run backend tests. It visualizes previously executed and recorded scenarios. It does not reproduce the current backend repository state, execute concurrency tests in real time, call a backend API, or simulate database/Redis behavior in the browser.

Backend repository homepage: `https://github.com/roarjang/coupon-concurrency-lab`

GitHub URLs use the public backend repository on the `main` branch. The public GitHub repository URL should be treated as static public metadata for the MVP, not as a required build-time environment variable.

## Data Rules

- Include recorded results only when the scenario, initial conditions, request count, expected result, observed result, interpretation, and related implementation or test path are supported by repository evidence.
- Disabled tests and earlier implementation configurations may be included when they preserve actually executed scenarios with reliable recorded results.
- Do not label failure-reproduction scenarios primarily as obsolete. Label their scenario-specific conditions, such as `without @Version` or `before applying the database unique constraint`.
- Current executability is evidence metadata, not the primary user-facing label.
- Do not invent numeric values. Use `TODO` or `Unverified` when evidence is insufficient.
- Store both invariant-level behavior and documented observed examples for optimistic locking.
- Store both local repository paths and GitHub URLs. GitHub file URLs should use the public repository, the `main` branch, and the backend-root-relative `repositoryPath`.
- Store Korean and English display names using `name.ko` and `name.en`.

## Test Environment Metadata

Verified environment metadata:

| Field | Value | Evidence |
| --- | --- | --- |
| Java version | 21 | `build.gradle` |
| Spring Boot version | `3.5.15-SNAPSHOT` | `build.gradle` |
| PostgreSQL version | 16 | `docker-compose.yml` |
| Redis version | `7.4-alpine` | `docker-compose.yml` |
| Docker Compose usage | PostgreSQL and Redis services are defined in Docker Compose | `docker-compose.yml` |
| Test profile | No separate test profile file verified; tests use local PostgreSQL and Redis configuration | `docs/runbook.md`, `src/main/resources/application.yml` |
| Schema generation | `spring.jpa.hibernate.ddl-auto=update` | `src/main/resources/application.yml` |
| SQL initialization | `spring.sql.init.mode=never` | `src/main/resources/application.yml` |

Environment notes:

- `ddl-auto=update` may not apply a newly added unique constraint to an existing database. The backend docs state that the `issued_coupons` schema should be verified when relying on the `(user_id, coupon_id)` unique constraint.
- Infrastructure metadata should support interpretation and evidence review. It should not dominate the main visualization.

## Experiment Group 1: Point Lost Update

### Group Summary

| Field | Value |
| --- | --- |
| id | `point-lost-update` |
| name.ko | `포인트 차감 Lost Update` |
| name.en | `Point Lost Update` |
| correctness failure | Lost updates during concurrent point deduction |
| primary invariant | Final balance must match the number of successful deductions |
| frontend priority | 1 |

Common scenario conditions:

- Initial balance: `10,000`
- Concurrent requests: `15`
- Deduction amount per request: `1,000`
- Correct result under proper consistency control: `successCount = 10`, `failCount = 5`, `finalBalance = 0`
- Requests target the same user's point balance.

### Record: Transaction-Only Failure Reproduction

| Field | Value |
| --- | --- |
| id | `point-transaction-only-without-version` |
| name.ko | `트랜잭션만 적용한 포인트 차감 실패 재현` |
| name.en | `Transaction-Only Point Deduction Failure Reproduction` |
| group | `point-lost-update` |
| category | `database-strategy-comparison` |
| strategy | `transaction-only` |
| scenario condition | Transaction-only point deduction without `Point.@Version` |
| testStatus | `documented` |
| currentlyExecutable | `false` for the exact no-version scenario |

Scenario:

- Initial balance: `10,000`
- Concurrent requests: `15`
- Deduction amount per request: `1,000`
- Same target row: one user's point balance
- Retry policy: none
- Expected invariant: only `10` deductions can succeed and final balance should be `0`.

Observed result:

- `successCount = 15`
- `failCount = 0`
- `finalBalance = 8000`
- `expectedBalanceBySuccessCount = -5000`

Interpretation:

- The application accepted all 15 deductions, but the persisted balance reflected only part of the updates.
- Multiple transactions read the same old balance and later writes overwrote earlier writes.
- `@Transactional` defined a unit of work for each request, but did not serialize concurrent updates to the same row.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/point/service/PointService.java`
  - `src/main/java/com/roar/coupon/domain/point/entity/Point.java`
- documentPath:
  - `README.md`
  - `docs/point-concurrency-strategy-comparison.md`
  - `docs/history/concurrency-experiment-plan.md`
  - `docs/history/implementation-roadmap.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/service/PointService.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/entity/Point.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/README.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/point-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/concurrency-experiment-plan.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/implementation-roadmap.md`
- evidenceType:
  - `project-document`
  - `readme-record`
  - `source-code`
- evidenceNotes:
  - The exact observed failure was recorded before adding `Point.@Version`.
  - The current `Point` entity includes `@Version`, so current repository state should be shown only as evidence metadata.

### Record: Pessimistic Lock

| Field | Value |
| --- | --- |
| id | `point-pessimistic-lock` |
| name.ko | `비관적 락 포인트 차감` |
| name.en | `Point Deduction with Pessimistic Lock` |
| group | `point-lost-update` |
| category | `database-strategy-comparison` |
| strategy | `pessimistic-lock` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Initial balance: `10,000`
- Concurrent requests: `15`
- Deduction amount per request: `1,000`
- Same target row: one user's point balance
- Retry policy: none
- Mechanism: `PESSIMISTIC_WRITE` row lock through `PointRepository.findByUserIdForUpdate(...)`

Observed result:

- `successCount = 10`
- `failCount = 5`
- `finalBalance = 0`

Interpretation:

- Requests for the same point row are serialized.
- Later requests see the updated balance and fail after the balance is exhausted.
- Trade-off: lock waiting and lower throughput under high contention.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/point/repository/PointRepository.java`
  - `src/main/java/com/roar/coupon/domain/point/service/PointService.java`
- documentPath:
  - `docs/point-concurrency-strategy-comparison.md`
  - `docs/history/concurrency-experiment-plan.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/repository/PointRepository.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/service/PointService.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/point-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/concurrency-experiment-plan.md`
- evidenceType:
  - `executable-test`
  - `source-code`
  - `project-document`
- evidenceNotes:
  - Active test asserts `10` successes, `5` failures, and final balance `0`.

### Record: Optimistic Lock Without Retry

| Field | Value |
| --- | --- |
| id | `point-optimistic-lock-without-retry` |
| name.ko | `낙관적 락 포인트 차감` |
| name.en | `Point Deduction with Optimistic Lock` |
| group | `point-lost-update` |
| category | `database-strategy-comparison` |
| strategy | `optimistic-lock` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Initial balance: `10,000`
- Concurrent requests: `15`
- Deduction amount per request: `1,000`
- Same target row: one user's point balance
- Retry policy: none
- Mechanism: JPA `@Version` on `Point`

Invariant-level behavior:

- Version conflicts are detected.
- Conflicting requests may fail with `ObjectOptimisticLockingFailureException`.
- Successful updates preserve the balance invariant.
- Without retry, the exact success/failure count can vary depending on scheduling.

Documented observed example:

- `successCount = 3`
- `failCount = 12`
- `finalBalance = 7000`
- `expectedBalanceBySuccessCount = 7000`
- Failure type: `ObjectOptimisticLockingFailureException`

Interpretation:

- Optimistic locking detects stale updates rather than making requests wait.
- It prevents silent lost updates, but no-retry behavior may reject many requests under high contention.
- Do not present the documented numeric example as deterministic for every execution.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/point/entity/Point.java`
  - `src/main/java/com/roar/coupon/domain/point/service/PointService.java`
- documentPath:
  - `docs/point-concurrency-strategy-comparison.md`
  - `docs/history/concurrency-experiment-plan.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/entity/Point.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/service/PointService.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/point-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/concurrency-experiment-plan.md`
- evidenceType:
  - `executable-test`
  - `source-code`
  - `project-document`
- evidenceNotes:
  - Active test asserts conflict detection and final balance consistency with successful deductions.

### Record: Atomic Update

| Field | Value |
| --- | --- |
| id | `point-atomic-update` |
| name.ko | `조건부 UPDATE 포인트 차감` |
| name.en | `Point Deduction with Atomic Update` |
| group | `point-lost-update` |
| category | `database-strategy-comparison` |
| strategy | `atomic-update` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Initial balance: `10,000`
- Concurrent requests: `15`
- Deduction amount per request: `1,000`
- Same target row: one user's point balance
- Retry policy: none
- Mechanism: conditional update where `balance >= amount`

Observed result:

- `successCount = 10`
- `failCount = 5`
- `finalBalance = 0`
- `expectedBalanceBySuccessCount = 0`

Interpretation:

- PostgreSQL evaluates the balance condition and applies the update as one statement.
- Later requests update zero rows after the balance is exhausted.
- Trade-off: business logic moves into a query-centered path.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/point/repository/PointRepository.java`
  - `src/main/java/com/roar/coupon/domain/point/service/PointService.java`
- documentPath:
  - `docs/point-concurrency-strategy-comparison.md`
  - `docs/history/concurrency-experiment-plan.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/repository/PointRepository.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/point/service/PointService.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/point-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/concurrency-experiment-plan.md`
- evidenceType:
  - `executable-test`
  - `source-code`
  - `project-document`
- evidenceNotes:
  - Active test asserts `10` successes, `5` insufficient-balance failures, and final balance `0`.

## Experiment Group 2: Coupon Overselling

### Group Summary

| Field | Value |
| --- | --- |
| id | `coupon-overselling` |
| name.ko | `쿠폰 재고 초과 발급` |
| name.en | `Coupon Overselling` |
| correctness failure | Stock overselling during concurrent coupon issuance |
| primary invariant | Issued coupon records and `Coupon.issuedQuantity` must not exceed `Coupon.totalQuantity` |
| frontend priority | 2 |

Common stock-control scenario:

- Coupon stock: `100`
- Concurrent requests: `1,000`
- Users: `1,000` distinct users
- Correct result under proper stock control: `successCount = 100`, `failCount = 900`, `issuedCouponCountByCoupon = 100`, `finalIssuedQuantity = 100`

### Record: Transaction-Only Overselling Failure Reproduction

| Field | Value |
| --- | --- |
| id | `coupon-transaction-only-overselling-before-version` |
| name.ko | `트랜잭션만 적용한 쿠폰 재고 초과 발급 실패 재현` |
| name.en | `Transaction-Only Coupon Overselling Failure Reproduction` |
| group | `coupon-overselling` |
| category | `database-strategy-comparison` |
| strategy | `transaction-only` |
| scenario condition | Transaction-only coupon issuance before `Coupon.@Version` |
| testStatus | `disabled` |
| currentlyExecutable | `false` for the exact no-version scenario |

Scenario:

- Coupon stock: `100`
- Concurrent requests: `1,000`
- Users: `1,000` distinct users
- Artificial delay: `BASELINE_DELAY_MILLIS = 100L`
- Retry policy: none
- Expected invariant: only `100` issuances should succeed.

Observed result:

- `successCount = 1000`
- `failCount = 0`
- `issuedCouponCountByCoupon = 1000`
- `finalIssuedQuantity = 100`

Interpretation:

- All requests were accepted and durable issued-coupon records exceeded stock.
- `Coupon.issuedQuantity` and the number of `IssuedCoupon` records diverged.
- `@Transactional` did not serialize the stock check and increment across concurrent requests.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/service/CouponIssueService.java`
  - `src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java`
- documentPath:
  - `README.md`
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/coupon-domain-design.md`
  - `docs/history/coupon-concurrency-experiment-plan.md`
  - `docs/history/implementation-roadmap.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/service/CouponIssueService.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/README.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/coupon-concurrency-experiment-plan.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/implementation-roadmap.md`
- evidenceType:
  - `project-document`
  - `readme-record`
  - `source-code`
- evidenceNotes:
  - The preserving test method is disabled because current `Coupon.@Version` changes the transaction-only stock path.
  - The scenario remains valid for visualization because the executed conditions and observed result are documented.

### Record: Pessimistic Lock Stock Control

| Field | Value |
| --- | --- |
| id | `coupon-pessimistic-lock-stock-control` |
| name.ko | `비관적 락 쿠폰 재고 제어` |
| name.en | `Coupon Stock Control with Pessimistic Lock` |
| group | `coupon-overselling` |
| category | `database-strategy-comparison` |
| strategy | `pessimistic-lock` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Coupon stock: `100`
- Concurrent requests: `1,000`
- Users: `1,000` distinct users
- Lock hold delay: `LOCK_HOLD_MILLIS = 5L`
- Mechanism: `PESSIMISTIC_WRITE` lock on the `Coupon` row

Observed result:

- `successCount = 100`
- `failCount = 900`
- `issuedCouponCountByCoupon = 100`
- `finalIssuedQuantity = 100`
- Documented test duration: about `10` seconds

Interpretation:

- Requests for the same coupon row are serialized.
- After stock reaches `100`, later requests see exhausted stock and fail without creating extra records.
- Trade-off: lock waiting under high contention.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java`
  - `src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/coupon-domain-design.md`
  - `docs/history/coupon-concurrency-experiment-plan.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/coupon-concurrency-experiment-plan.md`
- evidenceType:
  - `executable-test`
  - `source-code`
  - `project-document`
- evidenceNotes:
  - Do not generalize the about-10-second duration beyond the documented local scenario.

### Record: Optimistic Lock Stock Control Without Retry

| Field | Value |
| --- | --- |
| id | `coupon-optimistic-lock-stock-control-without-retry` |
| name.ko | `낙관적 락 쿠폰 재고 제어` |
| name.en | `Coupon Stock Control with Optimistic Lock` |
| group | `coupon-overselling` |
| category | `database-strategy-comparison` |
| strategy | `optimistic-lock` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Coupon stock: `100`
- Concurrent requests: `1,000`
- Users: `1,000` distinct users
- Delay for contention observation: `LOCK_HOLD_MILLIS = 5L`
- Retry policy: none
- Mechanism: JPA `@Version` on `Coupon`

Invariant-level behavior:

- Version conflicts are detected.
- Stale updates are rejected instead of silently overwriting `issuedQuantity`.
- Successful updates preserve stock-record consistency.
- Without retry, full stock exhaustion is an observed run result, not a universal guarantee under every scheduling condition.

Documented observed example:

- `successCount = 100`
- `failCount = 900`
- `issuedCouponCountByCoupon = 100`
- `finalIssuedQuantity = 100`

Interpretation:

- Optimistic locking prevented overselling in the documented run.
- It does not replace duplicate issuance control.
- A product requirement to maximize issuance until stock is fully exhausted would need retry or another strategy.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/coupon-domain-design.md`
  - `docs/history/coupon-concurrency-experiment-plan.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/coupon-concurrency-experiment-plan.md`
- evidenceType:
  - `executable-test`
  - `source-code`
  - `project-document`
- evidenceNotes:
  - Store the documented numeric result as an observed example.
  - The visualization must not present `100/900` as deterministic for all no-retry optimistic-lock executions.

### Record: Atomic Update Stock Control

| Field | Value |
| --- | --- |
| id | `coupon-atomic-update-stock-control` |
| name.ko | `조건부 UPDATE 쿠폰 재고 제어` |
| name.en | `Coupon Stock Control with Atomic Update` |
| group | `coupon-overselling` |
| category | `database-strategy-comparison` |
| strategy | `atomic-update` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Coupon stock: `100`
- Concurrent requests: `1,000`
- Users: `1,000` distinct users
- Delay for contention observation: `LOCK_HOLD_MILLIS = 5L`
- Mechanism: conditional update where `issuedQuantity < totalQuantity`

Observed result:

- `successCount = 100`
- `failCount = 900`
- `issuedCouponCountByCoupon = 100`
- `finalIssuedQuantity = 100`

Interpretation:

- PostgreSQL checks stock and increments `issuedQuantity` in one conditional update.
- `IssuedCoupon` is created only after the stock update succeeds.
- Trade-off: stock logic moves into a query-centered path.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/coupon-domain-design.md`
  - `docs/history/coupon-concurrency-experiment-plan.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/coupon-concurrency-experiment-plan.md`
- evidenceType:
  - `executable-test`
  - `source-code`
  - `project-document`
- evidenceNotes:
  - Active test asserts successful issued records and `Coupon.issuedQuantity` both equal stock.

## Experiment Group 3: Duplicate Coupon Issuance

### Group Summary

| Field | Value |
| --- | --- |
| id | `duplicate-coupon-issuance` |
| name.ko | `동일 사용자 쿠폰 중복 발급` |
| name.en | `Duplicate Coupon Issuance` |
| correctness failure | Same user receives the same coupon more than once |
| primary invariant | `(user_id, coupon_id)` must have at most one issued coupon record |
| frontend priority | 3 |

Common duplicate-control scenario:

- Coupon stock: `1,000`
- Concurrent requests: `100`
- Users: same user repeated `100` times
- Correct result under proper duplicate control: `successCount = 1`, `failCount = 99`, `issuedCouponCountByUserAndCoupon = 1`

### Record: Transaction-Only Duplicate Failure Reproduction

| Field | Value |
| --- | --- |
| id | `coupon-transaction-only-duplicate-before-unique-constraint` |
| name.ko | `트랜잭션만 적용한 중복 발급 실패 재현` |
| name.en | `Transaction-Only Duplicate Issuance Failure Reproduction` |
| group | `duplicate-coupon-issuance` |
| category | `database-strategy-comparison` |
| strategy | `transaction-only` |
| scenario condition | Duplicate issuance before applying the database unique constraint |
| testStatus | `disabled` |
| currentlyExecutable | `false` for the exact pre-constraint scenario |

Scenario:

- Coupon stock: `1,000`
- Concurrent requests: `100`
- Users: same user repeated `100` times
- Artificial delay: `BASELINE_DELAY_MILLIS = 100L`
- Retry policy: none
- Expected invariant: only one issued coupon row should exist for the same `(user_id, coupon_id)`.

Observed result:

- `successCount = 10`
- `failCount = 90`
- `issuedCouponCountByUserAndCoupon = 10`

Interpretation:

- Several requests passed the application-level duplicate check before the first committed insert became visible.
- Application-level duplicate checks are not a final uniqueness guarantee under concurrency.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/service/CouponIssueService.java`
  - `src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/coupon-domain-design.md`
  - `docs/history/coupon-concurrency-experiment-plan.md`
  - `docs/history/implementation-roadmap.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/service/CouponIssueService.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/coupon-concurrency-experiment-plan.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/history/implementation-roadmap.md`
- evidenceType:
  - `project-document`
  - `source-code`
- evidenceNotes:
  - The preserving test method is disabled because the current schema intentionally includes the unique constraint.

### Record: Database Unique Constraint

| Field | Value |
| --- | --- |
| id | `coupon-db-unique-constraint-duplicate-control` |
| name.ko | `DB UNIQUE 제약 중복 발급 방지` |
| name.en | `Duplicate Control with Database Unique Constraint` |
| group | `duplicate-coupon-issuance` |
| category | `database-strategy-comparison` |
| strategy | `db-unique-constraint` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Coupon stock: `1,000`
- Concurrent requests: `100`
- Users: same user repeated `100` times
- Artificial delay: `BASELINE_DELAY_MILLIS = 100L`
- Mechanism: unique constraint on `(user_id, coupon_id)` named `uk_issued_coupon_user_coupon`

Observed result:

- `successCount = 1`
- `failCount = 99`
- `issuedCouponCountByUserAndCoupon = 1`

Interpretation:

- The application-level duplicate check may still race.
- The database unique constraint rejects all duplicate rows after the first successful insert.
- This protects duplicate issuance, not total coupon stock.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java`
  - `src/main/java/com/roar/coupon/domain/coupon/repository/IssuedCouponRepository.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/coupon-domain-design.md`
  - `docs/runbook.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/repository/IssuedCouponRepository.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/runbook.md`
- evidenceType:
  - `executable-test`
  - `source-code`
  - `project-document`
- evidenceNotes:
  - Because `ddl-auto=update` may not add the unique constraint to an existing table, schema verification is part of the evidence context.

## Redis-Based Front-Line Gate Experiments

The Redis records below should be displayed as a separate concept after the database strategy comparison. Do not mix them directly into the first database-strategy chart.

Shared Redis/PostgreSQL boundaries:

- Redis paths were used for controlled experiments.
- They are not production-facing service APIs in the runtime `CouponIssueService`.
- PostgreSQL remains the durable source of truth.
- Redis does not create a distributed transaction with PostgreSQL.
- Redis acceptance is preliminary; successful issuance still depends on PostgreSQL persistence.
- Compensation is best-effort behavior in the tested failure path, not a distributed commit protocol.

### Record: Redis Counter Stock Gate

| Field | Value |
| --- | --- |
| id | `coupon-redis-counter-stock-gate` |
| name.ko | `Redis Counter 재고 게이트` |
| name.en | `Redis Counter Stock Gate` |
| group | `coupon-overselling` |
| category | `redis-based-front-line-gate` |
| strategy | `redis-counter` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Coupon stock: `100`
- Concurrent requests: `1,000`
- Users: `1,000` distinct users
- Redis key: `coupon:issue:count:{couponId}`
- PostgreSQL persistence: conditional stock update plus issued coupon insert

Observed result:

- `successCount = 100`
- `failCount = 900`
- `issuedCouponCountByCoupon = 100`
- `finalIssuedQuantity = 100`
- `redisCounterValue = 100`

Interpretation:

- Redis Counter acts as a front-line stock-slot gate.
- It does not track users and does not prevent duplicate issuance by itself.
- PostgreSQL remains responsible for durable coupon inventory and issued records.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/redis-consistency-boundary.md`
  - `docs/coupon-domain-design.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/redis-consistency-boundary.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
- evidenceType:
  - `executable-test`
  - `project-document`
  - `source-code`
- evidenceNotes:
  - Implemented inside `CouponIssueConcurrencyTest.TestCouponIssueService`, not runtime `CouponIssueService`.

### Record: Redis Lua Stock and Duplicate Gate - Stock Scenario

| Field | Value |
| --- | --- |
| id | `coupon-redis-lua-stock-gate` |
| name.ko | `Redis Lua 재고 게이트` |
| name.en | `Redis Lua Stock Gate` |
| group | `coupon-overselling` |
| category | `redis-side-atomic-admission-control` |
| strategy | `redis-lua` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Coupon stock: `100`
- Concurrent requests: `1,000`
- Users: `1,000` distinct users
- Redis count key: `coupon:issue:count:{couponId}`
- Redis user-set key: `coupon:issue:users:{couponId}`
- Lua return values: `1` accepted, `-1` sold out, `-2` duplicate

Observed result:

- `successCount = 100`
- `failCount = 900`
- `issuedCouponCountByCoupon = 100`
- `finalIssuedQuantity = 100`
- `redisCounterValue = 100`
- `redisIssuedUserCount = 100`

Interpretation:

- Redis Lua atomically checks and updates Redis-side stock and user admission state.
- PostgreSQL still persists durable inventory and issued coupon records.
- Redis Lua does not remove the need for database constraints or reconciliation thinking.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/redis-consistency-boundary.md`
  - `docs/coupon-domain-design.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/redis-consistency-boundary.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
- evidenceType:
  - `executable-test`
  - `project-document`
  - `source-code`
- evidenceNotes:
  - Implemented inside the concurrency test fixture.

### Record: Redis Lua Duplicate Gate

| Field | Value |
| --- | --- |
| id | `coupon-redis-lua-duplicate-gate` |
| name.ko | `Redis Lua 중복 발급 게이트` |
| name.en | `Redis Lua Duplicate Gate` |
| group | `duplicate-coupon-issuance` |
| category | `redis-side-atomic-admission-control` |
| strategy | `redis-lua` |
| testStatus | `active` |
| currentlyExecutable | `true` |

Scenario:

- Coupon stock: `1,000`
- Concurrent requests: `100`
- Users: same user repeated `100` times
- Redis count key: `coupon:issue:count:{couponId}`
- Redis user-set key: `coupon:issue:users:{couponId}`
- Lua return values: `1` accepted, `-1` sold out, `-2` duplicate

Observed result:

- `successCount = 1`
- `failCount = 99`
- `issuedCouponCountByCoupon = 1`
- `issuedCouponCountByUserAndCoupon = 1`
- `finalIssuedQuantity = 1`
- `redisCountValue = 1`
- `redisIssuedUserCount = 1`

Interpretation:

- Redis Lua rejects duplicate user requests before the database write path in the tested scenario.
- PostgreSQL remains the durable source of truth and the database unique constraint remains the final duplicate guard.
- Redis and PostgreSQL still do not share one atomic commit boundary.

Evidence metadata:

- repositoryPath:
  - `src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java`
- documentPath:
  - `docs/coupon-concurrency-strategy-comparison.md`
  - `docs/redis-consistency-boundary.md`
  - `docs/coupon-domain-design.md`
- githubUrl:
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-concurrency-strategy-comparison.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/redis-consistency-boundary.md`
  - `https://github.com/roarjang/coupon-concurrency-lab/blob/main/docs/coupon-domain-design.md`
- evidenceType:
  - `executable-test`
  - `project-document`
  - `source-code`
- evidenceNotes:
  - This record belongs to the Redis-side admission-control section, not the first database-strategy chart.

## Suggested Frontend Grouping

Recommended incremental display order:

1. `point-lost-update`
2. `coupon-overselling`
3. `duplicate-coupon-issuance`

Recommended presentation grouping:

- Point Lost Update comparison cards:
  - transaction-only failure reproduction,
  - pessimistic lock,
  - optimistic lock without retry,
  - atomic update,
- Database strategy comparison:
  - transaction-only failure reproduction,
  - pessimistic lock,
  - optimistic lock without retry,
  - atomic update,
  - database unique constraint for duplicate control.
- Redis-based front-line gate:
  - Redis Counter,
  - Redis Lua stock gate,
  - Redis Lua duplicate gate.

The first Point comparison section should not mix Redis Counter and Redis Lua directly with database strategies. Redis can be displayed as a follow-up section that explains front-line admission control and the Redis/PostgreSQL boundary.

## Unresolved Evidence Gaps

- No standalone raw test log artifact was verified. Recorded numeric results come from backend docs, README, preserved test methods, and test print/assertion code.
- Exact current executability of earlier no-version or pre-unique-constraint scenarios is intentionally not required for visualization, but should remain metadata.
- Optimistic-lock examples should remain clearly labeled as documented observed examples rather than deterministic values.
- Pessimistic-lock duration of about 10 seconds is documented for one local scenario only and should not be shown as a general performance benchmark.
- No machine-readable JSON or TypeScript data file has been created yet; this document is the source for later data modeling.
