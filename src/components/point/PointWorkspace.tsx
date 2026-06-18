import type { ExperimentDefinition } from '../../types/experiment.ts'
import { EvidenceDisclosure } from './EvidenceDisclosure.tsx'
import { PointComparisonCards } from './PointComparisonCards.tsx'
import { PointConditions } from './PointConditions.tsx'
import { PointExplanation } from './PointExplanation.tsx'

type PointWorkspaceProps = {
  readonly experiment: ExperimentDefinition
}

export const PointWorkspace = ({ experiment }: PointWorkspaceProps) => {
  const baselineRecord = experiment.records.find(
    (record) => record.strategyId === 'transaction-only',
  )

  if (!baselineRecord || baselineRecord.conditions.kind !== 'point-deduction') {
    return null
  }

  return (
    <div className="point-workspace">
      <header className="point-workspace__header">
        <h3>{experiment.name.ko}</h3>
        <p>{experiment.descriptionKo}</p>
      </header>

      <PointComparisonCards experiment={experiment} />
      <PointConditions
        conditions={baselineRecord.conditions}
      />
      <PointExplanation experiment={experiment} />
      <EvidenceDisclosure experiment={experiment} />
    </div>
  )
}
