import { strategies } from '../../data/strategies.ts'
import type { ExperimentDefinition, StrategyId } from '../../types/experiment.ts'

type PointExplanationProps = {
  readonly experiment: ExperimentDefinition
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
    lead: '같은 잔액을 동시에 읽고 쓰면 덮어쓰기 문제가 생긴다.',
    support: '@Transactional만으로는 같은 row의 동시 갱신을 막지 못한다.',
  },
  'pessimistic-lock': {
    lead: 'PESSIMISTIC_WRITE로 같은 포인트 row 갱신을 보호한다.',
    support: '잔액 일관성은 유지되지만 충돌이 많으면 lock 대기가 늘 수 있다.',
  },
  'optimistic-lock': {
    lead: '버전 충돌을 감지해 오래된 갱신을 거부한다.',
    support: '재시도가 없으면 일부 요청은 실패할 수 있다.',
  },
  'atomic-update': {
    lead: '조건 확인과 차감을 하나의 UPDATE로 처리한다.',
    support: '단순 조건에는 적합하지만 규칙이 쿼리 중심으로 이동한다.',
  },
} as const

export const PointExplanation = ({ experiment }: PointExplanationProps) => (
  <section
    className="point-section technical-section"
    aria-labelledby="technical-heading"
  >
    <h3 id="technical-heading" className="visually-hidden">
      기술 설명
    </h3>

    <details className="content-disclosure">
      <summary>전략 설명 자세히 보기</summary>
      <div className="disclosure-content technical-records">
        {experiment.records
          .filter(
            (record) => record.category === 'database-strategy-comparison',
          )
          .map((record) => {
            const strategy = strategies.find(
              (candidate) => candidate.id === record.strategyId,
            )

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
