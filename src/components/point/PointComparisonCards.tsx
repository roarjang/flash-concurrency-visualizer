import { strategies } from '../../data/strategies.ts'
import type { ExperimentDefinition, StrategyId } from '../../types/experiment.ts'

type PointComparisonCardsProps = {
  readonly experiment: ExperimentDefinition
}

const cardContent: Partial<
  Record<
    StrategyId,
    {
      readonly outcome: string
      readonly status: string
      readonly explanation: string
      readonly tone: 'problem' | 'success' | 'conflict'
    }
  >
> = {
  'transaction-only': {
    outcome: '잔액 8,000원',
    status: '문제 발생',
    explanation: '같은 잔액을 덮어써 일부 차감이 사라졌습니다.',
    tone: 'problem',
  },
  'pessimistic-lock': {
    outcome: '잔액 0원',
    status: '정상 차감',
    explanation: '요청을 한 번에 하나씩 처리했습니다.',
    tone: 'success',
  },
  'optimistic-lock': {
    outcome: '잔액 7,000원',
    status: '충돌 감지',
    explanation: '충돌한 요청은 재시도 없이 실패했습니다.',
    tone: 'conflict',
  },
  'atomic-update': {
    outcome: '잔액 0원',
    status: '정상 차감',
    explanation: '조건 확인과 차감을 하나의 UPDATE로 처리했습니다.',
    tone: 'success',
  },
}

export const PointComparisonCards = ({
  experiment,
}: PointComparisonCardsProps) => (
  <section
    className="point-section comparison-section"
    aria-label="전략 비교"
  >
    <div className="comparison-card-grid">
      {experiment.records
        .filter((record) => record.category === 'database-strategy-comparison')
        .map((record) => {
          const strategy = strategies.find(
            (candidate) => candidate.id === record.strategyId,
          )
          const content = cardContent[record.strategyId]

          if (!strategy || !content) {
            return null
          }

          return (
            <article className="comparison-card" data-tone={content.tone} key={record.id}>
              <header className="comparison-card__header">
                <h4>{strategy.name.ko}</h4>
              </header>

              <p
                className="comparison-card__status"
                data-tone={content.tone}
              >
                {content.status}
              </p>

              <p className="comparison-card__outcome">{content.outcome}</p>

              <p className="comparison-card__explanation">
                {content.explanation}
              </p>
            </article>
          )
        })}
    </div>
  </section>
)
