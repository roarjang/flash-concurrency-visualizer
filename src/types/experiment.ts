export type ExperimentId =
  | 'point-lost-update'
  | 'coupon-overselling'
  | 'duplicate-coupon-issuance'

export type StrategyId =
  | 'transaction-only'
  | 'pessimistic-lock'
  | 'optimistic-lock'
  | 'atomic-update'
  | 'db-unique-constraint'
  | 'redis-counter'
  | 'redis-lua'

export type StrategyGroup = 'baseline' | 'database' | 'redis-front-line-gate'

export type ExperimentRecordId =
  | 'point-transaction-only-without-version'
  | 'point-pessimistic-lock'
  | 'point-optimistic-lock-without-retry'
  | 'point-atomic-update'
  | 'coupon-transaction-only-overselling-before-version'
  | 'coupon-pessimistic-lock-stock-control'
  | 'coupon-optimistic-lock-stock-control-without-retry'
  | 'coupon-atomic-update-stock-control'
  | 'coupon-redis-counter-stock-gate'
  | 'coupon-redis-lua-stock-gate'
  | 'coupon-transaction-only-duplicate-before-unique-constraint'
  | 'coupon-db-unique-constraint-duplicate-control'
  | 'coupon-redis-lua-duplicate-gate'

export type EvidenceId =
  | 'backend-readme'
  | 'point-concurrency-test'
  | 'point-service'
  | 'point-entity'
  | 'point-repository'
  | 'point-strategy-document'
  | 'point-experiment-plan'
  | 'coupon-concurrency-test'
  | 'coupon-lua-fixture'
  | 'coupon-service'
  | 'coupon-entity'
  | 'coupon-repository'
  | 'issued-coupon-entity'
  | 'issued-coupon-repository'
  | 'coupon-strategy-document'
  | 'coupon-domain-document'
  | 'coupon-experiment-plan'
  | 'historical-implementation-roadmap'
  | 'redis-consistency-document'
  | 'runbook'

export type LocalizedName = {
  readonly ko: string
  readonly en: string
}

export type StrategyDefinition = {
  readonly id: StrategyId
  readonly name: LocalizedName
  readonly group: StrategyGroup
}

export type TestStatus = 'active' | 'disabled' | 'documented'

export type ExecutionMetadata = {
  readonly testStatus: TestStatus
  readonly currentlyExecutable: boolean
  readonly note?: string
}

export type EvidenceType =
  | 'test-code'
  | 'implementation-code'
  | 'repository-query'
  | 'entity-definition'
  | 'experiment-document'
  | 'readme'
  | 'redis-boundary'
  | 'lua-script'
  | 'runbook'

export type EvidenceItem = {
  readonly id: EvidenceId
  readonly type: EvidenceType
  readonly labelKo: string
  readonly repositoryPath: string
  readonly githubUrl: string
  readonly execution?: ExecutionMetadata
  readonly notes?: string
}

export type KnownNumericValue =
  | {
      readonly kind: 'exact'
      readonly value: number
    }
  | {
      readonly kind: 'observed-example'
      readonly value: number
      readonly caveatKo: string
    }

export type NumericValue =
  | KnownNumericValue
  | {
      readonly kind: 'undocumented'
      readonly reasonKo: string
    }

export type MetricId =
  | 'success-count'
  | 'failure-count'
  | 'final-balance'
  | 'expected-balance-by-success-count'
  | 'issued-coupon-count'
  | 'final-issued-quantity'
  | 'issued-user-coupon-count'
  | 'redis-counter-value'
  | 'redis-issued-user-count'

export type MetricUnit = 'requests' | 'currency' | 'records' | 'count'

export type ResultMetric = {
  readonly id: MetricId
  readonly labelKo: string
  readonly unit: MetricUnit
  readonly value: NumericValue
}

export type ExpectedResult = {
  readonly scope: 'recorded-scenario'
  readonly metrics: readonly ResultMetric[]
  readonly conclusionKo: string
}

export type ObservedResult = {
  readonly metrics: readonly ResultMetric[]
  readonly conclusionKo: string
}

export type PointConditions = {
  readonly kind: 'point-deduction'
  readonly initialBalance: number
  readonly deductionAmount: number
  readonly concurrentRequests: number
  readonly maximumValidSuccesses: number
  readonly target: 'same-user-point-row'
  readonly retry: 'none'
  readonly versionField: 'absent' | 'present'
}

export type CouponStockConditions = {
  readonly kind: 'coupon-stock'
  readonly stock: number
  readonly concurrentRequests: number
  readonly users: {
    readonly pattern: 'distinct'
    readonly count: number
  }
  readonly retry: 'none'
  readonly versionField: 'absent' | 'present'
  readonly artificialDelayMs?: number
  readonly lockHoldMs?: number
}

export type CouponDuplicateConditions = {
  readonly kind: 'coupon-duplicate'
  readonly stock: number
  readonly concurrentRequests: number
  readonly users: {
    readonly pattern: 'same-user'
    readonly count: 1
  }
  readonly coupon: 'same-coupon'
  readonly retry: 'none'
  readonly uniqueConstraint: 'absent' | 'present'
  readonly artificialDelayMs?: number
}

export type RedisStockConditions = {
  readonly kind: 'redis-stock-gate'
  readonly stock: number
  readonly concurrentRequests: number
  readonly users: {
    readonly pattern: 'distinct'
    readonly count: number
  }
  readonly countKey: 'coupon:issue:count:{couponId}'
  readonly userSetKey?: 'coupon:issue:users:{couponId}'
  readonly luaReturnValues?: {
    readonly accepted: 1
    readonly soldOut: -1
    readonly duplicate: -2
  }
  readonly postgresPersistence:
    'conditional-stock-update-and-issued-coupon-insert'
}

export type RedisDuplicateConditions = {
  readonly kind: 'redis-duplicate-gate'
  readonly stock: number
  readonly concurrentRequests: number
  readonly users: {
    readonly pattern: 'same-user'
    readonly count: 1
  }
  readonly coupon: 'same-coupon'
  readonly countKey: 'coupon:issue:count:{couponId}'
  readonly userSetKey: 'coupon:issue:users:{couponId}'
  readonly luaReturnValues: {
    readonly accepted: 1
    readonly soldOut: -1
    readonly duplicate: -2
  }
  readonly databaseUniqueConstraint: 'present'
  readonly postgresPersistence:
    'conditional-stock-update-and-issued-coupon-insert'
}

export type ExperimentConditions =
  | PointConditions
  | CouponStockConditions
  | CouponDuplicateConditions
  | RedisStockConditions
  | RedisDuplicateConditions

export type StrategyExplanation = {
  readonly causeKo: string
  readonly mechanismKo: string
  readonly guaranteeKo: string
  readonly limitationKo: string
  readonly appropriateUseCaseKo: string
}

export type EvidenceMetadata = {
  readonly items: readonly EvidenceId[]
  readonly execution: ExecutionMetadata
}

export type StrategyRecord = {
  readonly id: ExperimentRecordId
  readonly name: LocalizedName
  readonly strategyId: StrategyId
  readonly category:
    | 'database-strategy-comparison'
    | 'redis-front-line-gate'
  readonly scenarioConditionKo: string
  readonly conditions: ExperimentConditions
  readonly expected: ExpectedResult
  readonly observed: ObservedResult
  readonly invariantStatementsKo: readonly string[]
  readonly explanation: StrategyExplanation
  readonly evidence: EvidenceMetadata
}

export type ComparisonValue = {
  readonly recordId: ExperimentRecordId
  readonly strategyId: StrategyId
  readonly value: NumericValue
}

export type StrategyComparison = {
  readonly id: string
  readonly group: 'database' | 'redis-front-line-gate'
  readonly metricId: MetricId
  readonly labelKo: string
  readonly unit: MetricUnit
  readonly values: readonly ComparisonValue[]
  readonly caveatKo?: string
}

export type ExperimentDefinition = {
  readonly id: ExperimentId
  readonly name: LocalizedName
  readonly descriptionKo: string
  readonly category: 'point-correctness' | 'coupon-stock' | 'coupon-uniqueness'
  readonly invariantKo: string
  readonly records: readonly StrategyRecord[]
  readonly comparisons: readonly StrategyComparison[]
}

export type TestEnvironment = {
  readonly javaVersion: 21
  readonly springBootVersion: '3.5.15-SNAPSHOT'
  readonly postgresVersion: 16
  readonly redisVersion: '7.4-alpine'
  readonly schemaGeneration: 'spring.jpa.hibernate.ddl-auto=update'
  readonly sqlInitialization: 'spring.sql.init.mode=never'
  readonly testProfileNoteKo: string
}
