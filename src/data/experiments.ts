import type {
  ExperimentDefinition,
  NumericValue,
  ResultMetric,
  TestEnvironment,
} from '../types/experiment.ts'

const exact = (value: number): NumericValue => ({ kind: 'exact', value })

const observedExample = (value: number, caveatKo: string): NumericValue => ({
  kind: 'observed-example',
  value,
  caveatKo,
})

const optimisticExampleCaveat =
  '재시도 없는 낙관적 락의 한 번의 기록된 실행 결과이며, 스케줄링에 따라 값이 달라질 수 있다.'

const pointExpectedMetrics = [
  {
    id: 'success-count',
    labelKo: '최대 유효 성공 요청 수',
    unit: 'requests',
    value: exact(10),
  },
  {
    id: 'failure-count',
    labelKo: '잔액 소진 후 실패 요청 수',
    unit: 'requests',
    value: exact(5),
  },
  {
    id: 'final-balance',
    labelKo: '이 실험 조건의 기대 최종 잔액',
    unit: 'currency',
    value: exact(0),
  },
] as const satisfies readonly ResultMetric[]

const couponStockExpectedMetrics = [
  {
    id: 'success-count',
    labelKo: '최대 유효 발급 수',
    unit: 'requests',
    value: exact(100),
  },
  {
    id: 'failure-count',
    labelKo: '재고 소진 후 실패 요청 수',
    unit: 'requests',
    value: exact(900),
  },
  {
    id: 'issued-coupon-count',
    labelKo: '기대 발급 기록 수',
    unit: 'records',
    value: exact(100),
  },
  {
    id: 'final-issued-quantity',
    labelKo: '기대 최종 발급 수량 필드',
    unit: 'count',
    value: exact(100),
  },
] as const satisfies readonly ResultMetric[]

const duplicateExpectedMetrics = [
  {
    id: 'success-count',
    labelKo: '같은 사용자와 쿠폰의 기대 성공 수',
    unit: 'requests',
    value: exact(1),
  },
  {
    id: 'failure-count',
    labelKo: '중복 요청 실패 수',
    unit: 'requests',
    value: exact(99),
  },
  {
    id: 'issued-user-coupon-count',
    labelKo: '같은 사용자와 쿠폰의 기대 발급 기록 수',
    unit: 'records',
    value: exact(1),
  },
] as const satisfies readonly ResultMetric[]

export const testEnvironment = {
  javaVersion: 21,
  springBootVersion: '3.5.15-SNAPSHOT',
  postgresVersion: 16,
  redisVersion: '7.4-alpine',
  schemaGeneration: 'spring.jpa.hibernate.ddl-auto=update',
  sqlInitialization: 'spring.sql.init.mode=never',
  testProfileNoteKo:
    '별도 테스트 프로필 파일은 확인되지 않았으며 로컬 PostgreSQL과 Redis 설정을 사용한다.',
} as const satisfies TestEnvironment

export const experiments = [
  {
    id: 'point-lost-update',
    name: { ko: '포인트 차감 Lost Update', en: 'Point Lost Update' },
    descriptionKo: '동시 차감 요청이 같은 잔액을 읽고 저장하며 갱신을 덮어쓰는 문제',
    category: 'point-correctness',
    invariantKo: '최종 잔액은 성공한 차감 횟수와 일치하고 음수가 되지 않아야 한다.',
    records: [
      {
        id: 'point-transaction-only-without-version',
        name: {
          ko: '트랜잭션만 적용한 포인트 차감 실패 재현',
          en: 'Transaction-Only Point Deduction Failure Reproduction',
        },
        strategyId: 'transaction-only',
        category: 'database-strategy-comparison',
        scenarioConditionKo: 'Point.@Version 적용 전 트랜잭션 기반 차감',
        conditions: {
          kind: 'point-deduction',
          initialBalance: 10000,
          deductionAmount: 1000,
          concurrentRequests: 15,
          maximumValidSuccesses: 10,
          target: 'same-user-point-row',
          retry: 'none',
          versionField: 'absent',
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: pointExpectedMetrics,
          conclusionKo:
            '초기 잔액 10,000에서 1,000씩 차감하면 최대 10건만 성공하고 최종 잔액은 0이어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(15),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(0),
            },
            {
              id: 'final-balance',
              labelKo: '관찰된 최종 잔액',
              unit: 'currency',
              value: exact(8000),
            },
            {
              id: 'expected-balance-by-success-count',
              labelKo: '성공 수 기준 계산 잔액',
              unit: 'currency',
              value: exact(-5000),
            },
          ],
          conclusionKo: 'Lost Update가 발생했다.',
        },
        invariantStatementsKo: [
          '최종 잔액은 성공한 차감 요청 수와 일치해야 한다.',
          '트랜잭션만으로 같은 행의 동시 갱신이 직렬화되지는 않는다.',
        ],
        explanation: {
          causeKo:
            '여러 트랜잭션이 같은 이전 잔액을 읽고 나중 저장이 앞선 저장을 덮어썼다.',
          mechanismKo:
            '각 요청은 독립 트랜잭션으로 처리되지만 공유 행의 read-modify-write는 직렬화되지 않는다.',
          guaranteeKo: '각 요청 단위의 커밋과 롤백 경계를 제공한다.',
          limitationKo: '공유 행의 Lost Update를 방지하지 않는다.',
          appropriateUseCaseKo: '동시성 실패 재현과 단순한 저충돌 흐름',
        },
        evidence: {
          items: [
            'point-concurrency-test',
            'point-service',
            'point-entity',
            'backend-readme',
            'point-strategy-document',
            'point-experiment-plan',
            'historical-implementation-roadmap',
          ],
          execution: {
            testStatus: 'documented',
            currentlyExecutable: false,
            note: '현재 Point 엔티티에는 @Version이 있어 정확한 no-version 조건은 직접 실행되지 않는다.',
          },
        },
      },
      {
        id: 'point-pessimistic-lock',
        name: {
          ko: '비관적 락 포인트 차감',
          en: 'Point Deduction with Pessimistic Lock',
        },
        strategyId: 'pessimistic-lock',
        category: 'database-strategy-comparison',
        scenarioConditionKo: '같은 포인트 행에 PESSIMISTIC_WRITE 락 적용',
        conditions: {
          kind: 'point-deduction',
          initialBalance: 10000,
          deductionAmount: 1000,
          concurrentRequests: 15,
          maximumValidSuccesses: 10,
          target: 'same-user-point-row',
          retry: 'none',
          versionField: 'present',
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: pointExpectedMetrics,
          conclusionKo: '잔액 소진 시점 이후의 요청은 실패해야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(10),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(5),
            },
            {
              id: 'final-balance',
              labelKo: '관찰된 최종 잔액',
              unit: 'currency',
              value: exact(0),
            },
          ],
          conclusionKo: '잔액 불변식이 유지되었다.',
        },
        invariantStatementsKo: [
          '같은 행의 갱신은 락 획득 순서대로 직렬화된다.',
          '잔액이 소진된 뒤에는 추가 차감이 성공하지 않는다.',
        ],
        explanation: {
          causeKo: '같은 포인트 행에 요청이 집중된다.',
          mechanismKo: 'PESSIMISTIC_WRITE 락으로 한 번에 하나의 트랜잭션만 행을 수정한다.',
          guaranteeKo: '락이 유지되는 동안 같은 행의 갱신을 직렬화한다.',
          limitationKo: '충돌이 많으면 락 대기와 처리량 저하가 발생할 수 있다.',
          appropriateUseCaseKo: '충돌이 높고 결정적인 정확성이 중요한 경우',
        },
        evidence: {
          items: [
            'point-concurrency-test',
            'point-repository',
            'point-service',
            'point-strategy-document',
            'point-experiment-plan',
          ],
          execution: { testStatus: 'active', currentlyExecutable: true },
        },
      },
      {
        id: 'point-optimistic-lock-without-retry',
        name: {
          ko: '낙관적 락 포인트 차감',
          en: 'Point Deduction with Optimistic Lock',
        },
        strategyId: 'optimistic-lock',
        category: 'database-strategy-comparison',
        scenarioConditionKo: 'Point.@Version 적용, 충돌 재시도 없음',
        conditions: {
          kind: 'point-deduction',
          initialBalance: 10000,
          deductionAmount: 1000,
          concurrentRequests: 15,
          maximumValidSuccesses: 10,
          target: 'same-user-point-row',
          retry: 'none',
          versionField: 'present',
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: pointExpectedMetrics,
          conclusionKo:
            '성공한 갱신은 잔액 불변식을 지켜야 하며 stale update는 충돌로 거부되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '한 실행의 성공 요청 수',
              unit: 'requests',
              value: observedExample(3, optimisticExampleCaveat),
            },
            {
              id: 'failure-count',
              labelKo: '한 실행의 실패 요청 수',
              unit: 'requests',
              value: observedExample(12, optimisticExampleCaveat),
            },
            {
              id: 'final-balance',
              labelKo: '한 실행의 최종 잔액',
              unit: 'currency',
              value: observedExample(7000, optimisticExampleCaveat),
            },
            {
              id: 'expected-balance-by-success-count',
              labelKo: '한 실행의 성공 수 기준 계산 잔액',
              unit: 'currency',
              value: observedExample(7000, optimisticExampleCaveat),
            },
          ],
          conclusionKo: '버전 충돌이 감지되고 성공한 갱신의 잔액 일관성이 유지되었다.',
        },
        invariantStatementsKo: [
          '버전이 오래된 갱신은 ObjectOptimisticLockingFailureException으로 거부될 수 있다.',
          '재시도가 없으므로 정확한 성공과 실패 수는 스케줄링에 따라 달라질 수 있다.',
        ],
        explanation: {
          causeKo: '동시에 읽은 요청들이 같은 버전을 기준으로 갱신을 시도한다.',
          mechanismKo: '@Version 비교로 오래된 갱신을 감지해 거부한다.',
          guaranteeKo: 'stale update를 조용히 덮어쓰지 않고 버전 충돌로 감지한다.',
          limitationKo: '재시도가 없으면 충돌 요청이 실패하며 성공 수가 실행마다 달라질 수 있다.',
          appropriateUseCaseKo: '충돌이 낮거나 충돌 응답 또는 재시도 정책을 수용할 수 있는 경우',
        },
        evidence: {
          items: [
            'point-concurrency-test',
            'point-entity',
            'point-service',
            'point-strategy-document',
            'point-experiment-plan',
          ],
          execution: { testStatus: 'active', currentlyExecutable: true },
        },
      },
      {
        id: 'point-atomic-update',
        name: {
          ko: '조건부 UPDATE 포인트 차감',
          en: 'Point Deduction with Atomic Update',
        },
        strategyId: 'atomic-update',
        category: 'database-strategy-comparison',
        scenarioConditionKo: 'balance >= amount 조건과 차감을 하나의 UPDATE로 처리',
        conditions: {
          kind: 'point-deduction',
          initialBalance: 10000,
          deductionAmount: 1000,
          concurrentRequests: 15,
          maximumValidSuccesses: 10,
          target: 'same-user-point-row',
          retry: 'none',
          versionField: 'present',
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: pointExpectedMetrics,
          conclusionKo: '조건을 만족하는 10건만 차감되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(10),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(5),
            },
            {
              id: 'final-balance',
              labelKo: '관찰된 최종 잔액',
              unit: 'currency',
              value: exact(0),
            },
            {
              id: 'expected-balance-by-success-count',
              labelKo: '성공 수 기준 계산 잔액',
              unit: 'currency',
              value: exact(0),
            },
          ],
          conclusionKo: '잔액 불변식이 유지되었다.',
        },
        invariantStatementsKo: [
          '잔액 확인과 갱신이 하나의 조건부 SQL 문에서 수행된다.',
          '잔액이 부족하면 갱신 행 수가 0이 된다.',
        ],
        explanation: {
          causeKo: '분리된 조회와 저장 사이에 다른 요청이 같은 잔액을 바꿀 수 있다.',
          mechanismKo: '잔액 조건 확인과 차감을 하나의 조건부 UPDATE로 수행한다.',
          guaranteeKo: '조건과 갱신을 데이터베이스의 한 문장으로 원자적으로 처리한다.',
          limitationKo: '비즈니스 규칙이 쿼리 중심 구현으로 이동한다.',
          appropriateUseCaseKo: '잔액 차감처럼 단순한 조건부 카운터 갱신',
        },
        evidence: {
          items: [
            'point-concurrency-test',
            'point-repository',
            'point-service',
            'point-strategy-document',
            'point-experiment-plan',
          ],
          execution: { testStatus: 'active', currentlyExecutable: true },
        },
      },
    ],
    comparisons: [
      {
        id: 'point-final-balance-by-database-strategy',
        group: 'database',
        metricId: 'final-balance',
        labelKo: '전략별 최종 잔액',
        unit: 'currency',
        values: [
          {
            recordId: 'point-transaction-only-without-version',
            strategyId: 'transaction-only',
            value: exact(8000),
          },
          {
            recordId: 'point-pessimistic-lock',
            strategyId: 'pessimistic-lock',
            value: exact(0),
          },
          {
            recordId: 'point-optimistic-lock-without-retry',
            strategyId: 'optimistic-lock',
            value: observedExample(7000, optimisticExampleCaveat),
          },
          {
            recordId: 'point-atomic-update',
            strategyId: 'atomic-update',
            value: exact(0),
          },
        ],
        caveatKo:
          '기대 최종 잔액 0은 초기 잔액 10,000, 차감액 1,000, 동시 요청 15, 최대 성공 10인 이 기록된 조건에만 해당한다.',
      },
    ],
  },
  {
    id: 'coupon-overselling',
    name: { ko: '쿠폰 재고 초과 발급', en: 'Coupon Overselling' },
    descriptionKo: '동시 발급 요청으로 실제 발급 기록이 쿠폰 재고를 초과하는 문제',
    category: 'coupon-stock',
    invariantKo:
      '발급 쿠폰 기록 수와 Coupon.issuedQuantity는 Coupon.totalQuantity를 초과하지 않아야 한다.',
    records: [
      {
        id: 'coupon-transaction-only-overselling-before-version',
        name: {
          ko: '트랜잭션만 적용한 쿠폰 재고 초과 발급 실패 재현',
          en: 'Transaction-Only Coupon Overselling Failure Reproduction',
        },
        strategyId: 'transaction-only',
        category: 'database-strategy-comparison',
        scenarioConditionKo: 'Coupon.@Version 적용 전 트랜잭션 기반 발급',
        conditions: {
          kind: 'coupon-stock',
          stock: 100,
          concurrentRequests: 1000,
          users: { pattern: 'distinct', count: 1000 },
          retry: 'none',
          versionField: 'absent',
          artificialDelayMs: 100,
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: couponStockExpectedMetrics,
          conclusionKo: '재고 100개를 넘는 발급 기록이 생성되면 안 된다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(1000),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(0),
            },
            {
              id: 'issued-coupon-count',
              labelKo: '관찰된 발급 기록 수',
              unit: 'records',
              value: exact(1000),
            },
            {
              id: 'final-issued-quantity',
              labelKo: '관찰된 최종 발급 수량 필드',
              unit: 'count',
              value: exact(100),
            },
          ],
          conclusionKo: '발급 기록이 재고를 초과했고 집계 필드와 기록 수가 불일치했다.',
        },
        invariantStatementsKo: [
          '발급 기록 수는 재고 100개를 초과하지 않아야 한다.',
          'Coupon.issuedQuantity와 발급 기록 수가 일치해야 한다.',
        ],
        explanation: {
          causeKo: '여러 요청이 같은 재고 상태를 확인하고 각각 발급 기록을 저장했다.',
          mechanismKo:
            '각 요청은 트랜잭션이지만 재고 확인과 증가가 요청 간에 직렬화되지 않는다.',
          guaranteeKo: '각 발급 요청의 로컬 커밋과 롤백 경계를 제공한다.',
          limitationKo: '동시 재고 확인과 증가를 원자적으로 보호하지 않는다.',
          appropriateUseCaseKo: '동시 재고 실패 재현과 충돌이 없는 단순 흐름',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-service',
            'coupon-entity',
            'backend-readme',
            'coupon-strategy-document',
            'coupon-domain-document',
            'coupon-experiment-plan',
            'historical-implementation-roadmap',
          ],
          execution: {
            testStatus: 'disabled',
            currentlyExecutable: false,
            note: '현재 Coupon 엔티티의 @Version이 정확한 no-version 조건을 변경한다.',
          },
        },
      },
      {
        id: 'coupon-pessimistic-lock-stock-control',
        name: {
          ko: '비관적 락 쿠폰 재고 제어',
          en: 'Coupon Stock Control with Pessimistic Lock',
        },
        strategyId: 'pessimistic-lock',
        category: 'database-strategy-comparison',
        scenarioConditionKo: '쿠폰 행에 PESSIMISTIC_WRITE 락 적용',
        conditions: {
          kind: 'coupon-stock',
          stock: 100,
          concurrentRequests: 1000,
          users: { pattern: 'distinct', count: 1000 },
          retry: 'none',
          versionField: 'present',
          lockHoldMs: 5,
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: couponStockExpectedMetrics,
          conclusionKo: '재고 100개까지만 발급되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(100),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(900),
            },
            {
              id: 'issued-coupon-count',
              labelKo: '관찰된 발급 기록 수',
              unit: 'records',
              value: exact(100),
            },
            {
              id: 'final-issued-quantity',
              labelKo: '관찰된 최종 발급 수량 필드',
              unit: 'count',
              value: exact(100),
            },
          ],
          conclusionKo: '재고 한도와 데이터베이스 기록 일관성이 유지되었다.',
        },
        invariantStatementsKo: [
          '같은 쿠폰 행의 재고 갱신은 직렬화된다.',
          '재고 소진 이후에는 추가 발급 기록이 생성되지 않는다.',
        ],
        explanation: {
          causeKo: '1,000개 요청이 같은 쿠폰 재고 행에 집중된다.',
          mechanismKo: '쿠폰 행을 PESSIMISTIC_WRITE로 잠가 재고 갱신을 직렬화한다.',
          guaranteeKo: '락을 획득한 요청이 최신 재고를 확인한다.',
          limitationKo: '높은 충돌에서 락 대기가 발생한다.',
          appropriateUseCaseKo: '재고 정확성이 중요하고 높은 충돌을 감수할 수 있는 경우',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-repository',
            'coupon-entity',
            'coupon-strategy-document',
            'coupon-domain-document',
            'coupon-experiment-plan',
          ],
          execution: { testStatus: 'active', currentlyExecutable: true },
        },
      },
      {
        id: 'coupon-optimistic-lock-stock-control-without-retry',
        name: {
          ko: '낙관적 락 쿠폰 재고 제어',
          en: 'Coupon Stock Control with Optimistic Lock',
        },
        strategyId: 'optimistic-lock',
        category: 'database-strategy-comparison',
        scenarioConditionKo: 'Coupon.@Version 적용, 충돌 재시도 없음',
        conditions: {
          kind: 'coupon-stock',
          stock: 100,
          concurrentRequests: 1000,
          users: { pattern: 'distinct', count: 1000 },
          retry: 'none',
          versionField: 'present',
          lockHoldMs: 5,
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: couponStockExpectedMetrics,
          conclusionKo:
            'stale update는 충돌로 거부되고 성공한 갱신은 재고-기록 일관성을 지켜야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '한 실행의 성공 요청 수',
              unit: 'requests',
              value: observedExample(100, optimisticExampleCaveat),
            },
            {
              id: 'failure-count',
              labelKo: '한 실행의 실패 요청 수',
              unit: 'requests',
              value: observedExample(900, optimisticExampleCaveat),
            },
            {
              id: 'issued-coupon-count',
              labelKo: '한 실행의 발급 기록 수',
              unit: 'records',
              value: observedExample(100, optimisticExampleCaveat),
            },
            {
              id: 'final-issued-quantity',
              labelKo: '한 실행의 최종 발급 수량 필드',
              unit: 'count',
              value: observedExample(100, optimisticExampleCaveat),
            },
          ],
          conclusionKo: '기록된 실행에서 초과 발급 없이 재고가 소진되었다.',
        },
        invariantStatementsKo: [
          '버전 충돌은 stale update를 감지한다.',
          '재시도가 없으므로 모든 실행에서 재고가 정확히 소진된다고 보장하지 않는다.',
        ],
        explanation: {
          causeKo: '동시에 읽은 발급 요청들이 같은 쿠폰 버전으로 갱신을 시도한다.',
          mechanismKo: '@Version 비교로 오래된 재고 갱신을 거부한다.',
          guaranteeKo: 'stale update를 버전 충돌로 감지해 조용한 덮어쓰기를 방지한다.',
          limitationKo: '재시도가 없으면 성공 수와 재고 소진 여부가 실행마다 달라질 수 있다.',
          appropriateUseCaseKo: '충돌이 낮고 충돌 실패 또는 재시도 정책을 수용할 수 있는 경우',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-entity',
            'coupon-strategy-document',
            'coupon-domain-document',
            'coupon-experiment-plan',
          ],
          execution: { testStatus: 'active', currentlyExecutable: true },
        },
      },
      {
        id: 'coupon-atomic-update-stock-control',
        name: {
          ko: '조건부 UPDATE 쿠폰 재고 제어',
          en: 'Coupon Stock Control with Atomic Update',
        },
        strategyId: 'atomic-update',
        category: 'database-strategy-comparison',
        scenarioConditionKo:
          'issuedQuantity < totalQuantity 조건과 증가를 하나의 UPDATE로 처리',
        conditions: {
          kind: 'coupon-stock',
          stock: 100,
          concurrentRequests: 1000,
          users: { pattern: 'distinct', count: 1000 },
          retry: 'none',
          versionField: 'present',
          lockHoldMs: 5,
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: couponStockExpectedMetrics,
          conclusionKo: '조건부 갱신에 성공한 100건만 발급 기록을 만들어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(100),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(900),
            },
            {
              id: 'issued-coupon-count',
              labelKo: '관찰된 발급 기록 수',
              unit: 'records',
              value: exact(100),
            },
            {
              id: 'final-issued-quantity',
              labelKo: '관찰된 최종 발급 수량 필드',
              unit: 'count',
              value: exact(100),
            },
          ],
          conclusionKo: '재고 한도와 발급 기록 일관성이 유지되었다.',
        },
        invariantStatementsKo: [
          '재고 확인과 issuedQuantity 증가는 한 조건부 UPDATE에서 수행된다.',
          '조건부 갱신 성공 후에만 발급 기록을 생성한다.',
        ],
        explanation: {
          causeKo: '분리된 재고 조회와 증가 사이에 다른 요청이 재고를 바꿀 수 있다.',
          mechanismKo: '재고 조건과 issuedQuantity 증가를 하나의 SQL UPDATE로 처리한다.',
          guaranteeKo: '재고 조건과 증가를 데이터베이스 한 문장으로 원자적으로 처리한다.',
          limitationKo: '재고 규칙이 쿼리 중심 구현으로 이동한다.',
          appropriateUseCaseKo: '쿠폰 재고처럼 단순한 조건부 카운터 증가',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-repository',
            'coupon-strategy-document',
            'coupon-domain-document',
            'coupon-experiment-plan',
          ],
          execution: { testStatus: 'active', currentlyExecutable: true },
        },
      },
      {
        id: 'coupon-redis-counter-stock-gate',
        name: {
          ko: 'Redis Counter 재고 게이트',
          en: 'Redis Counter Stock Gate',
        },
        strategyId: 'redis-counter',
        category: 'redis-front-line-gate',
        scenarioConditionKo: 'Redis 카운터 승인 후 PostgreSQL 영속화',
        conditions: {
          kind: 'redis-stock-gate',
          stock: 100,
          concurrentRequests: 1000,
          users: { pattern: 'distinct', count: 1000 },
          countKey: 'coupon:issue:count:{couponId}',
          postgresPersistence:
            'conditional-stock-update-and-issued-coupon-insert',
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: couponStockExpectedMetrics,
          conclusionKo: 'Redis는 재고 수만큼만 선행 승인하고 PostgreSQL 저장이 완료되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(100),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(900),
            },
            {
              id: 'issued-coupon-count',
              labelKo: '관찰된 DB 발급 기록 수',
              unit: 'records',
              value: exact(100),
            },
            {
              id: 'final-issued-quantity',
              labelKo: '관찰된 DB 최종 발급 수량 필드',
              unit: 'count',
              value: exact(100),
            },
            {
              id: 'redis-counter-value',
              labelKo: '관찰된 Redis 카운터',
              unit: 'count',
              value: exact(100),
            },
          ],
          conclusionKo: 'Redis 재고 게이트와 PostgreSQL 기록이 각각 100으로 확인되었다.',
        },
        invariantStatementsKo: [
          'Redis 카운터는 선행 재고 슬롯을 제한한다.',
          'PostgreSQL이 내구성 있는 재고와 발급 기록의 기준이다.',
        ],
        explanation: {
          causeKo: '대량 요청이 데이터베이스 재고 행에 직접 집중될 수 있다.',
          mechanismKo: 'Redis 카운터로 재고 수만큼 먼저 승인한 뒤 PostgreSQL에 저장한다.',
          guaranteeKo: 'Redis 측 선행 재고 슬롯 승인을 제공한다.',
          limitationKo:
            '사용자 중복을 추적하지 않고 내구성 있는 진실이 아니며 PostgreSQL과 분산 트랜잭션이 아니다.',
          appropriateUseCaseKo: 'DB 영속화 전에 빠른 재고 선행 게이트가 필요한 경우',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-repository',
            'coupon-strategy-document',
            'redis-consistency-document',
            'coupon-domain-document',
          ],
          execution: {
            testStatus: 'active',
            currentlyExecutable: true,
            note: '런타임 공개 API가 아니라 동시성 테스트 픽스처에 구현되어 있다.',
          },
        },
      },
      {
        id: 'coupon-redis-lua-stock-gate',
        name: {
          ko: 'Redis Lua 재고 게이트',
          en: 'Redis Lua Stock Gate',
        },
        strategyId: 'redis-lua',
        category: 'redis-front-line-gate',
        scenarioConditionKo: 'Redis Lua 재고·사용자 확인 후 PostgreSQL 영속화',
        conditions: {
          kind: 'redis-stock-gate',
          stock: 100,
          concurrentRequests: 1000,
          users: { pattern: 'distinct', count: 1000 },
          countKey: 'coupon:issue:count:{couponId}',
          userSetKey: 'coupon:issue:users:{couponId}',
          luaReturnValues: { accepted: 1, soldOut: -1, duplicate: -2 },
          postgresPersistence:
            'conditional-stock-update-and-issued-coupon-insert',
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: couponStockExpectedMetrics,
          conclusionKo:
            'Redis 측 재고와 사용자 승인을 원자적으로 처리한 뒤 PostgreSQL 저장이 완료되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(100),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(900),
            },
            {
              id: 'issued-coupon-count',
              labelKo: '관찰된 DB 발급 기록 수',
              unit: 'records',
              value: exact(100),
            },
            {
              id: 'final-issued-quantity',
              labelKo: '관찰된 DB 최종 발급 수량 필드',
              unit: 'count',
              value: exact(100),
            },
            {
              id: 'redis-counter-value',
              labelKo: '관찰된 Redis 카운터',
              unit: 'count',
              value: exact(100),
            },
            {
              id: 'redis-issued-user-count',
              labelKo: '관찰된 Redis 승인 사용자 수',
              unit: 'count',
              value: exact(100),
            },
          ],
          conclusionKo: 'Redis 승인 상태와 PostgreSQL 발급 기록이 각각 100으로 확인되었다.',
        },
        invariantStatementsKo: [
          'Lua는 Redis 안의 재고와 사용자 확인 및 갱신을 원자적으로 수행한다.',
          'Redis 승인과 PostgreSQL 저장은 하나의 분산 트랜잭션이 아니다.',
        ],
        explanation: {
          causeKo: '재고와 사용자 중복 확인을 여러 Redis 명령으로 나누면 경쟁 조건이 생길 수 있다.',
          mechanismKo: '한 Lua 스크립트가 Redis 측 재고와 사용자 상태를 원자적으로 확인하고 갱신한다.',
          guaranteeKo: 'Redis 내부의 재고·중복 선행 검사를 원자적으로 처리한다.',
          limitationKo:
            'PostgreSQL 내구성을 대체하지 않으며 두 저장소 사이의 분산 트랜잭션을 제공하지 않는다.',
          appropriateUseCaseKo: '재고와 사용자 중복을 함께 선행 제어해야 하는 경우',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-lua-fixture',
            'coupon-strategy-document',
            'redis-consistency-document',
            'coupon-domain-document',
          ],
          execution: {
            testStatus: 'active',
            currentlyExecutable: true,
            note: 'Lua 경로는 동시성 테스트 픽스처에 구현되어 있다.',
          },
        },
      },
    ],
    comparisons: [
      {
        id: 'coupon-issued-records-by-database-strategy',
        group: 'database',
        metricId: 'issued-coupon-count',
        labelKo: '데이터베이스 전략별 발급 기록 수',
        unit: 'records',
        values: [
          {
            recordId: 'coupon-transaction-only-overselling-before-version',
            strategyId: 'transaction-only',
            value: exact(1000),
          },
          {
            recordId: 'coupon-pessimistic-lock-stock-control',
            strategyId: 'pessimistic-lock',
            value: exact(100),
          },
          {
            recordId: 'coupon-optimistic-lock-stock-control-without-retry',
            strategyId: 'optimistic-lock',
            value: observedExample(100, optimisticExampleCaveat),
          },
          {
            recordId: 'coupon-atomic-update-stock-control',
            strategyId: 'atomic-update',
            value: exact(100),
          },
        ],
        caveatKo:
          '허용 재고는 100개다. 낙관적 락의 100개 발급은 한 번의 관찰 결과이며 재시도 없는 모든 실행을 보장하지 않는다.',
      },
      {
        id: 'coupon-issued-records-by-redis-gate',
        group: 'redis-front-line-gate',
        metricId: 'issued-coupon-count',
        labelKo: 'Redis 선행 게이트별 DB 발급 기록 수',
        unit: 'records',
        values: [
          {
            recordId: 'coupon-redis-counter-stock-gate',
            strategyId: 'redis-counter',
            value: exact(100),
          },
          {
            recordId: 'coupon-redis-lua-stock-gate',
            strategyId: 'redis-lua',
            value: exact(100),
          },
        ],
        caveatKo:
          'Redis 승인 수가 아니라 PostgreSQL에 저장된 발급 기록 수를 비교하며, Redis와 PostgreSQL은 하나의 분산 트랜잭션이 아니다.',
      },
    ],
  },
  {
    id: 'duplicate-coupon-issuance',
    name: {
      ko: '쿠폰 중복 발급',
      en: 'Duplicate Coupon Issuance',
    },
    descriptionKo: '한 사용자가 같은 쿠폰을 여러 번 발급받을 수 있는 문제',
    category: 'coupon-uniqueness',
    invariantKo: '같은 (user_id, coupon_id) 조합에는 발급 기록이 최대 하나만 존재해야 한다.',
    records: [
      {
        id: 'coupon-transaction-only-duplicate-before-unique-constraint',
        name: {
          ko: '트랜잭션만 적용한 중복 발급 실패 재현',
          en: 'Transaction-Only Duplicate Issuance Failure Reproduction',
        },
        strategyId: 'transaction-only',
        category: 'database-strategy-comparison',
        scenarioConditionKo: 'DB 유니크 제약조건 적용 전 중복 확인과 발급',
        conditions: {
          kind: 'coupon-duplicate',
          stock: 1000,
          concurrentRequests: 100,
          users: { pattern: 'same-user', count: 1 },
          coupon: 'same-coupon',
          retry: 'none',
          uniqueConstraint: 'absent',
          artificialDelayMs: 100,
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: duplicateExpectedMetrics,
          conclusionKo: '같은 사용자와 쿠폰 조합에는 한 건만 발급되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(10),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(90),
            },
            {
              id: 'issued-user-coupon-count',
              labelKo: '같은 사용자와 쿠폰의 관찰된 발급 기록 수',
              unit: 'records',
              value: exact(10),
            },
          ],
          conclusionKo: '같은 사용자와 쿠폰 조합에 중복 발급 기록이 생성되었다.',
        },
        invariantStatementsKo: [
          '같은 사용자와 쿠폰 조합에는 발급 기록이 하나만 존재해야 한다.',
          '애플리케이션의 선행 중복 조회만으로 최종 유일성을 보장할 수 없다.',
        ],
        explanation: {
          causeKo: '여러 요청이 첫 커밋이 보이기 전에 애플리케이션 중복 확인을 통과했다.',
          mechanismKo: '트랜잭션만 적용된 선행 조회와 insert가 요청 간에 원자적이지 않다.',
          guaranteeKo: '각 요청의 로컬 커밋과 롤백 경계를 제공한다.',
          limitationKo: '동시 insert에 대한 최종 사용자-쿠폰 유일성을 보장하지 않는다.',
          appropriateUseCaseKo: '중복 발급 실패 재현과 충돌이 없는 단순 흐름',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-service',
            'issued-coupon-entity',
            'coupon-strategy-document',
            'coupon-domain-document',
            'coupon-experiment-plan',
            'historical-implementation-roadmap',
          ],
          execution: {
            testStatus: 'disabled',
            currentlyExecutable: false,
            note: '현재 스키마에는 의도적으로 사용자-쿠폰 유니크 제약조건이 존재한다.',
          },
        },
      },
      {
        id: 'coupon-db-unique-constraint-duplicate-control',
        name: {
          ko: 'DB UNIQUE 제약 중복 발급 방지',
          en: 'Duplicate Control with Database Unique Constraint',
        },
        strategyId: 'db-unique-constraint',
        category: 'database-strategy-comparison',
        scenarioConditionKo: '(user_id, coupon_id) 유니크 제약조건 적용',
        conditions: {
          kind: 'coupon-duplicate',
          stock: 1000,
          concurrentRequests: 100,
          users: { pattern: 'same-user', count: 1 },
          coupon: 'same-coupon',
          retry: 'none',
          uniqueConstraint: 'present',
          artificialDelayMs: 100,
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: duplicateExpectedMetrics,
          conclusionKo: '첫 insert 이후의 같은 사용자-쿠폰 insert는 거부되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(1),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(99),
            },
            {
              id: 'issued-user-coupon-count',
              labelKo: '같은 사용자와 쿠폰의 관찰된 발급 기록 수',
              unit: 'records',
              value: exact(1),
            },
          ],
          conclusionKo: '데이터베이스가 중복 발급 기록을 최종적으로 거부했다.',
        },
        invariantStatementsKo: [
          'uk_issued_coupon_user_coupon 제약조건이 사용자-쿠폰 유일성을 보호한다.',
          '이 제약조건은 전체 쿠폰 재고 초과 발급을 해결하지 않는다.',
        ],
        explanation: {
          causeKo: '애플리케이션 중복 조회는 동시 요청 사이에서 경쟁할 수 있다.',
          mechanismKo: '데이터베이스가 같은 user_id와 coupon_id의 두 번째 insert를 거부한다.',
          guaranteeKo: '사용자-쿠폰 조합의 최종 데이터베이스 유일성을 강제한다.',
          limitationKo:
            '전체 쿠폰 재고를 제어하지 않으며 기존 스키마에서는 제약조건 적용 여부를 확인해야 한다.',
          appropriateUseCaseKo: '중복 발급의 최종 데이터베이스 방어선',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'issued-coupon-entity',
            'issued-coupon-repository',
            'coupon-strategy-document',
            'coupon-domain-document',
            'runbook',
          ],
          execution: {
            testStatus: 'active',
            currentlyExecutable: true,
            note: 'ddl-auto=update가 기존 테이블에 제약조건을 추가했는지 스키마 확인이 필요하다.',
          },
        },
      },
      {
        id: 'coupon-redis-lua-duplicate-gate',
        name: {
          ko: 'Redis Lua 중복 발급 게이트',
          en: 'Redis Lua Duplicate Gate',
        },
        strategyId: 'redis-lua',
        category: 'redis-front-line-gate',
        scenarioConditionKo: 'Redis Lua 중복 승인 제어 후 PostgreSQL 영속화',
        conditions: {
          kind: 'redis-duplicate-gate',
          stock: 1000,
          concurrentRequests: 100,
          users: { pattern: 'same-user', count: 1 },
          coupon: 'same-coupon',
          countKey: 'coupon:issue:count:{couponId}',
          userSetKey: 'coupon:issue:users:{couponId}',
          luaReturnValues: { accepted: 1, soldOut: -1, duplicate: -2 },
          databaseUniqueConstraint: 'present',
          postgresPersistence:
            'conditional-stock-update-and-issued-coupon-insert',
        },
        expected: {
          scope: 'recorded-scenario',
          metrics: duplicateExpectedMetrics,
          conclusionKo:
            'Redis는 같은 사용자를 한 번만 선행 승인하고 PostgreSQL에는 한 건만 저장되어야 한다.',
        },
        observed: {
          metrics: [
            {
              id: 'success-count',
              labelKo: '관찰된 성공 요청 수',
              unit: 'requests',
              value: exact(1),
            },
            {
              id: 'failure-count',
              labelKo: '관찰된 실패 요청 수',
              unit: 'requests',
              value: exact(99),
            },
            {
              id: 'issued-coupon-count',
              labelKo: '관찰된 DB 전체 발급 기록 수',
              unit: 'records',
              value: exact(1),
            },
            {
              id: 'issued-user-coupon-count',
              labelKo: '같은 사용자와 쿠폰의 관찰된 DB 발급 기록 수',
              unit: 'records',
              value: exact(1),
            },
            {
              id: 'final-issued-quantity',
              labelKo: '관찰된 DB 최종 발급 수량 필드',
              unit: 'count',
              value: exact(1),
            },
            {
              id: 'redis-counter-value',
              labelKo: '관찰된 Redis 카운터',
              unit: 'count',
              value: exact(1),
            },
            {
              id: 'redis-issued-user-count',
              labelKo: '관찰된 Redis 승인 사용자 수',
              unit: 'count',
              value: exact(1),
            },
          ],
          conclusionKo: 'Redis 선행 중복 게이트와 PostgreSQL 발급 기록이 각각 1로 확인되었다.',
        },
        invariantStatementsKo: [
          'Lua는 Redis 내부의 사용자 중복 확인과 승인을 원자적으로 처리한다.',
          'PostgreSQL 유니크 제약조건이 내구성 있는 최종 중복 방어선이다.',
          'Redis와 PostgreSQL은 하나의 원자적 커밋 경계를 공유하지 않는다.',
        ],
        explanation: {
          causeKo: '같은 사용자의 동시 요청이 데이터베이스 insert 경로에 함께 도달할 수 있다.',
          mechanismKo: 'Lua가 Redis 사용자 집합에서 중복을 확인하고 한 요청만 선행 승인한다.',
          guaranteeKo: 'Redis 내부 중복 선행 검사를 원자적으로 처리한다.',
          limitationKo:
            'PostgreSQL 내구성과 유니크 제약조건을 대체하지 않으며 분산 트랜잭션이 아니다.',
          appropriateUseCaseKo: 'DB 저장 전에 같은 사용자의 중복 요청을 빠르게 차단해야 하는 경우',
        },
        evidence: {
          items: [
            'coupon-concurrency-test',
            'coupon-lua-fixture',
            'issued-coupon-entity',
            'coupon-strategy-document',
            'redis-consistency-document',
            'coupon-domain-document',
          ],
          execution: {
            testStatus: 'active',
            currentlyExecutable: true,
            note: 'Lua 경로는 동시성 테스트 픽스처에 구현되어 있다.',
          },
        },
      },
    ],
    comparisons: [
      {
        id: 'duplicate-records-by-database-strategy',
        group: 'database',
        metricId: 'issued-user-coupon-count',
        labelKo: '데이터베이스 전략별 동일 사용자-쿠폰 발급 기록 수',
        unit: 'records',
        values: [
          {
            recordId:
              'coupon-transaction-only-duplicate-before-unique-constraint',
            strategyId: 'transaction-only',
            value: exact(10),
          },
          {
            recordId: 'coupon-db-unique-constraint-duplicate-control',
            strategyId: 'db-unique-constraint',
            value: exact(1),
          },
        ],
        caveatKo:
          '기대 최대값은 1이다. 유니크 제약조건은 사용자-쿠폰 유일성을 보호하지만 전체 재고를 제어하지 않는다.',
      },
    ],
  },
] as const satisfies readonly ExperimentDefinition[]
