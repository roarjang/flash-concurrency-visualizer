import { evidenceItems } from '../../data/evidence.ts'
import { strategies } from '../../data/strategies.ts'
import type {
  EvidenceItem,
  ExperimentConditions,
  ExperimentDefinition,
  StrategyId,
  StrategyRecord,
} from '../../types/experiment.ts'
import { formatNumber } from '../point/pointView.ts'

type DuplicateWorkspaceProps = {
  readonly experiment: ExperimentDefinition
}

const getDatabaseRecords = (experiment: ExperimentDefinition) =>
  experiment.records.filter(
    (record) => record.category === 'database-strategy-comparison',
  )

const getStrategy = (strategyId: StrategyId) =>
  strategies.find((strategy) => strategy.id === strategyId)

const getRecordMetricValue = (record: StrategyRecord, metricId: string) => {
  const metric = record.observed.metrics.find(
    (candidate) => candidate.id === metricId,
  )

  if (!metric || metric.value.kind === 'undocumented') {
    return undefined
  }

  return metric.value.value
}

const getExpectedMetricValue = (record: StrategyRecord, metricId: string) => {
  const metric = record.expected.metrics.find(
    (candidate) => candidate.id === metricId,
  )

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

const DuplicateSummary = ({ record }: { readonly record: StrategyRecord }) => {
  const allowedIssuance = getExpectedMetricValue(record, 'success-count') ?? 0
  const issuedRecords = getRecordMetricValue(record, 'issued-user-coupon-count') ?? 0

  return (
    <section className="point-section" aria-labelledby="duplicate-summary-heading">
      <h3 id="duplicate-summary-heading" className="visually-hidden">
        문제 요약
      </h3>

      <article className="comparison-card" data-tone="problem">
        <div className="point-playback__result-metrics">
          <div>
            <span>허용 발급</span>
            <strong>{formatNumber(allowedIssuance)}건</strong>
          </div>
          <div>
            <span>발급 기록</span>
            <strong>{formatNumber(issuedRecords)}건</strong>
          </div>
        </div>

        <p className="comparison-card__status" data-tone="problem">
          중복 발급 발생
        </p>
      </article>
    </section>
  )
}

const DuplicateComparisonCards = ({
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
        readonly tone: 'problem' | 'success'
      }
    >
  > = {
    'transaction-only': {
      status: '중복 발급 발생',
      explanation: '여러 요청이 중복 확인을 통과했습니다.',
      tone: 'problem',
    },
    'db-unique-constraint': {
      status: '중복 발급 방지',
      explanation: '두 번째부터 같은 사용자-쿠폰 저장을 DB가 거부했습니다.',
      tone: 'success',
    },
  }

  return (
    <section className="point-section comparison-section" aria-label="전략 비교">
      <div className="comparison-card-grid">
        {records.map((record) => {
          const strategy = getStrategy(record.strategyId)
          const meta = cardMeta[record.strategyId]
          const issuedRecords = getRecordMetricValue(record, 'issued-user-coupon-count')

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

const DuplicateConditions = ({
  conditions,
}: {
  readonly conditions: ExperimentConditions
}) => {
  if (conditions.kind !== 'coupon-duplicate') {
    return null
  }

  return (
    <section className="point-section condition-section" aria-labelledby="duplicate-conditions-heading">
      <h3 id="duplicate-conditions-heading" className="visually-hidden">
        실험 조건
      </h3>

      <details className="content-disclosure">
        <summary>실험 조건 자세히 보기</summary>
        <div className="disclosure-content">
          <dl className="condition-list">
            <div>
              <dt>동시 요청</dt>
              <dd>{formatNumber(conditions.concurrentRequests)}건</dd>
            </div>
            <div>
              <dt>같은 사용자</dt>
              <dd>{formatNumber(conditions.users.count)}명</dd>
            </div>
            <div>
              <dt>같은 쿠폰</dt>
              <dd>1종</dd>
            </div>
            <div>
              <dt>허용 발급</dt>
              <dd>1건</dd>
            </div>
          </dl>

          <p className="scenario-condition">
            <strong>실패 재현 조건</strong>
            <span>DB UNIQUE 적용 전 · 애플리케이션 중복 확인만 적용</span>
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
    lead: '여러 요청이 첫 저장 전에 중복 확인을 통과했습니다.',
    support: '같은 사용자-쿠폰 조합이 중복으로 기록됩니다.',
  },
  'db-unique-constraint': {
    lead: '두 번째부터 같은 사용자-쿠폰 저장을 DB가 거부했습니다.',
    support: '유일성은 지키지만 재고 수량 제어는 아닙니다.',
  },
}

const DuplicateExplanation = ({
  records,
}: {
  readonly records: readonly StrategyRecord[]
}) => (
  <section className="point-section technical-section" aria-labelledby="duplicate-technical-heading">
    <h3 id="duplicate-technical-heading" className="visually-hidden">
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

const DuplicateEvidenceDisclosure = ({
  records,
}: {
  readonly records: readonly StrategyRecord[]
}) => {
  const items: EvidenceItem[] = getEvidenceItems(records)

  return (
    <section className="point-section evidence-section" aria-labelledby="duplicate-evidence-heading">
      <h3 id="duplicate-evidence-heading" className="visually-hidden">
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

export const DuplicateWorkspace = ({ experiment }: DuplicateWorkspaceProps) => {
  const databaseRecords = getDatabaseRecords(experiment)
  const baselineRecord = databaseRecords.find(
    (record) => record.strategyId === 'transaction-only',
  )

  if (!baselineRecord || baselineRecord.conditions.kind !== 'coupon-duplicate') {
    return null
  }

  return (
    <div className="point-workspace">
      <header className="point-workspace__header">
        <h3>{experiment.name.ko}</h3>
        <p>{experiment.descriptionKo}</p>
      </header>

      <DuplicateSummary record={baselineRecord} />
      <DuplicateComparisonCards records={databaseRecords} />
      <DuplicateConditions conditions={baselineRecord.conditions} />
      <DuplicateExplanation records={databaseRecords} />
      <DuplicateEvidenceDisclosure records={databaseRecords} />
    </div>
  )
}
