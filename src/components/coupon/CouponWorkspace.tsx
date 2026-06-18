import { evidenceItems } from '../../data/evidence.ts'
import { strategies } from '../../data/strategies.ts'
import type {
  EvidenceItem,
  ExperimentDefinition,
  ExperimentConditions,
  StrategyId,
  StrategyRecord,
} from '../../types/experiment.ts'

type CouponWorkspaceProps = {
  readonly experiment: ExperimentDefinition
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('ko-KR').format(value)

const getDatabaseRecords = (experiment: ExperimentDefinition) =>
  experiment.records.filter(
    (record) => record.category === 'database-strategy-comparison',
  )

const getStrategy = (strategyId: StrategyId) =>
  strategies.find((strategy) => strategy.id === strategyId)

const getRecordMetricValue = (
  record: StrategyRecord,
  metricId: string,
) => {
  const metric = record.observed.metrics.find((candidate) => candidate.id === metricId)

  if (!metric || metric.value.kind === 'undocumented') {
    return undefined
  }

  return metric.value.value
}

const getEvidenceItems = (records: readonly StrategyRecord[]) => {
  const evidenceIds = [...new Set(records.flatMap((record) => record.evidence.items))]

  return evidenceIds.flatMap((id) => {
    const item = evidenceItems.find((candidate) => candidate.id === id)
    return item ? [item] : []
  })
}

const CouponSummary = ({ record }: { readonly record: StrategyRecord }) => {
  const stock = record.conditions.kind === 'coupon-stock' ? record.conditions.stock : 0
  const issuedRecords = getRecordMetricValue(record, 'issued-coupon-count') ?? 0

  return (
    <section className="point-section" aria-labelledby="coupon-summary-heading">
      <h3 id="coupon-summary-heading" className="visually-hidden">
        문제 요약
      </h3>

      <article className="comparison-card" data-tone="problem">
        <div className="point-playback__result-metrics">
          <div>
            <span>재고</span>
            <strong>{formatNumber(stock)}장</strong>
          </div>
          <div>
            <span>발급 기록</span>
            <strong>{formatNumber(issuedRecords)}건</strong>
          </div>
        </div>

        <p className="comparison-card__status" data-tone="problem">
          재고 초과 발급
        </p>
      </article>
    </section>
  )
}

const CouponComparisonCards = ({
  records,
}: {
  readonly records: readonly StrategyRecord[]
}) => {
  const cardMeta: Partial<
    Record<
      StrategyId,
      {
        readonly status: string
        readonly explanation: string
        readonly tone: 'problem' | 'success' | 'conflict'
      }
    >
  > = {
    'transaction-only': {
      status: '재고 초과 발급',
      explanation: '같은 재고를 동시에 확인했습니다.',
      tone: 'problem',
    },
    'pessimistic-lock': {
      status: '재고 한도 유지',
      explanation: '쿠폰 행을 잠가 요청을 한 번에 하나씩 처리했습니다.',
      tone: 'success',
    },
    'optimistic-lock': {
      status: '충돌 감지',
      explanation: '충돌한 요청은 재시도 없이 실패했습니다.',
      tone: 'conflict',
    },
    'atomic-update': {
      status: '재고 한도 유지',
      explanation: '조건 확인과 발급 수량 갱신을 하나의 UPDATE로 처리했습니다.',
      tone: 'success',
    },
  }

  return (
    <section className="point-section comparison-section" aria-label="전략 비교">
      <div className="comparison-card-grid">
        {records.map((record) => {
          const strategy = getStrategy(record.strategyId)
          const meta = cardMeta[record.strategyId]
          const issuedRecords = getRecordMetricValue(record, 'issued-coupon-count')

          if (!strategy || !meta || issuedRecords === undefined) {
            return null
          }

          return (
            <article
              className="comparison-card"
              data-tone={meta.tone}
              key={record.id}
            >
              <header className="comparison-card__header">
                <h4>{strategy.name.ko}</h4>
              </header>

              <p className="comparison-card__status" data-tone={meta.tone}>
                {meta.status}
              </p>

              <p className="comparison-card__outcome">
                발급 기록 {formatNumber(issuedRecords)}건
              </p>

              <p className="comparison-card__explanation">{meta.explanation}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

const CouponConditions = ({
  conditions,
}: {
  readonly conditions: ExperimentConditions
}) => {
  if (conditions.kind !== 'coupon-stock') {
    return null
  }

  return (
    <section className="point-section condition-section" aria-labelledby="coupon-conditions-heading">
      <h3 id="coupon-conditions-heading" className="visually-hidden">
        실험 조건
      </h3>

      <details className="content-disclosure">
        <summary>실험 조건 자세히 보기</summary>
        <div className="disclosure-content">
          <dl className="condition-list">
            <div>
              <dt>쿠폰 재고</dt>
              <dd>{formatNumber(conditions.stock)}장</dd>
            </div>
            <div>
              <dt>동시 요청</dt>
              <dd>{formatNumber(conditions.concurrentRequests)}건</dd>
            </div>
            <div>
              <dt>서로 다른 사용자</dt>
              <dd>{formatNumber(conditions.users.count)}명</dd>
            </div>
          </dl>

          <p className="scenario-condition">
            <strong>실패 재현 조건</strong>
            <span>@Version 적용 전 · 트랜잭션 기반 발급</span>
          </p>
        </div>
      </details>
    </section>
  )
}

const strategySummaries: Partial<
  Record<
    StrategyId,
    {
      readonly lead: string
      readonly support: string
    }
  >
> = {
  'transaction-only': {
    lead: '각 요청은 트랜잭션으로 묶이지만 재고 확인과 증가를 직렬화하지 않습니다.',
    support: '같은 재고를 여러 요청이 동시에 통과할 수 있습니다.',
  },
  'pessimistic-lock': {
    lead: '쿠폰 행을 PESSIMISTIC_WRITE로 잠가 재고 갱신을 직렬화합니다.',
    support: '높은 충돌에서는 대기 시간이 늘어날 수 있습니다.',
  },
  'optimistic-lock': {
    lead: '@Version 비교로 오래된 재고 갱신을 거부합니다.',
    support: '재시도가 없으면 일부 요청은 실패할 수 있습니다.',
  },
  'atomic-update': {
    lead: '재고 조건과 발급 수량 갱신을 하나의 SQL UPDATE로 처리합니다.',
    support: '단순한 수량 제어에 효과적입니다.',
  },
}

const CouponExplanation = ({
  records,
}: {
  readonly records: readonly StrategyRecord[]
}) => (
  <section className="point-section technical-section" aria-labelledby="coupon-technical-heading">
    <h3 id="coupon-technical-heading" className="visually-hidden">
      전략 설명
    </h3>

    <details className="content-disclosure">
      <summary>전략 설명 자세히 보기</summary>
      <div className="disclosure-content technical-records">
        {records.map((record) => {
          const strategy = getStrategy(record.strategyId)
          const summary = strategySummaries[record.strategyId]

          if (!strategy || !summary) {
            return null
          }

          return (
            <section className="technical-record" key={record.id}>
              <h4>{strategy.name.ko}</h4>
              <p className="strategy-summary__lead">{summary.lead}</p>
              <p className="strategy-summary__support">{summary.support}</p>
            </section>
          )
        })}
      </div>
    </details>
  </section>
)

const CouponEvidenceDisclosure = ({
  records,
}: {
  readonly records: readonly StrategyRecord[]
}) => {
  const items: EvidenceItem[] = getEvidenceItems(records)

  return (
    <section className="point-section evidence-section" aria-labelledby="coupon-evidence-heading">
      <h3 id="coupon-evidence-heading" className="visually-hidden">
        근거 자료
      </h3>

      <details>
        <summary>근거 자료 보기 ({items.length})</summary>
        <div className="evidence-content">
          <p className="recorded-data-note">
            이 화면은 기록된 백엔드 JUnit 동시성 테스트 결과를 시각화하며,
            브라우저에서 실시간 동시성 요청을 실행하지 않습니다.
          </p>
          <ul className="evidence-list">
            {items.map((item) => (
              <li key={item.id}>
                <a href={item.githubUrl} target="_blank" rel="noreferrer">
                  {item.labelKo}
                  <span aria-hidden="true"> ↗</span>
                </a>
                {item.notes && <p>{item.notes}</p>}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  )
}

export const CouponWorkspace = ({ experiment }: CouponWorkspaceProps) => {
  const databaseRecords = getDatabaseRecords(experiment)
  const baselineRecord = databaseRecords.find(
    (record) => record.strategyId === 'transaction-only',
  )

  if (!baselineRecord || baselineRecord.conditions.kind !== 'coupon-stock') {
    return null
  }

  return (
    <div className="point-workspace">
      <header className="point-workspace__header">
        <h3>{experiment.name.ko}</h3>
        <p>{experiment.descriptionKo}</p>
      </header>

      <CouponSummary record={baselineRecord} />
      <CouponComparisonCards records={databaseRecords} />
      <CouponConditions conditions={baselineRecord.conditions} />
      <CouponExplanation records={databaseRecords} />
      <CouponEvidenceDisclosure records={databaseRecords} />
    </div>
  )
}
