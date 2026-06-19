import { evidenceItems } from '../../data/evidence.ts'
import type {
  EvidenceItem,
  ExperimentDefinition,
} from '../../types/experiment.ts'

type EvidenceDisclosureProps = {
  readonly experiment: ExperimentDefinition
}

export const EvidenceDisclosure = ({
  experiment,
}: EvidenceDisclosureProps) => {
  const evidenceIds = [
    ...new Set(experiment.records.flatMap((record) => record.evidence.items)),
  ]
  const items: EvidenceItem[] = evidenceIds.flatMap((id) => {
    const item = evidenceItems.find((candidate) => candidate.id === id)
    return item ? [item] : []
  })

  return (
    <section
      className="point-section evidence-section"
      aria-labelledby="evidence-heading"
    >
      <h3 id="evidence-heading" className="visually-hidden">
        근거 자료
      </h3>

      <details>
        <summary>근거 자료 보기 ({items.length})</summary>
        <div className="evidence-content">
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
