import type { PointConditions as PointConditionsData } from '../../types/experiment.ts'
import { formatNumber } from './pointView.ts'

type PointConditionsProps = {
  readonly conditions: PointConditionsData
}

const getFailureReproductionSummary = (conditions: PointConditionsData) => {
  const versionText =
    conditions.versionField === 'present' ? '@Version 적용' : '@Version 적용 전'

  return `${versionText} · Retry 없음 · 트랜잭션 기반 차감`
}

export const PointConditions = ({
  conditions,
}: PointConditionsProps) => (
  <section className="point-section condition-section" aria-labelledby="conditions-heading">
    <h3 id="conditions-heading" className="visually-hidden">
      실험 조건
    </h3>
    <details className="content-disclosure">
      <summary>실험 조건 자세히 보기</summary>
      <div className="disclosure-content">
        <dl className="condition-list">
          <div>
            <dt>초기 잔액</dt>
            <dd>{formatNumber(conditions.initialBalance)}원</dd>
          </div>
          <div>
            <dt>동시 요청</dt>
            <dd>{formatNumber(conditions.concurrentRequests)}건</dd>
          </div>
          <div>
            <dt>요청당 차감</dt>
            <dd>{formatNumber(conditions.deductionAmount)}원</dd>
          </div>
          <div>
            <dt>최대 유효 성공</dt>
            <dd>{formatNumber(conditions.maximumValidSuccesses)}건</dd>
          </div>
        </dl>

        <p className="scenario-condition">
          <strong>실패 재현 조건</strong>
          <span>{getFailureReproductionSummary(conditions)}</span>
        </p>
      </div>
    </details>
  </section>
)
