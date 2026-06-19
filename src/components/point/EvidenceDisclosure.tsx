import { evidenceItems } from '../../data/evidence.ts'
import type {
  EvidenceItem,
  ExperimentDefinition,
} from '../../types/experiment.ts'

type EvidenceDisclosureProps = {
  readonly experiment: ExperimentDefinition
}

const pointEvidenceGroups = [
  [
    'point-concurrency-test',
    'point-service',
    'point-repository',
    'point-entity',
  ],
  ['point-strategy-document', 'point-experiment-plan'],
  ['backend-readme', 'historical-implementation-roadmap'],
] as const

export const EvidenceDisclosure = ({
  experiment,
}: EvidenceDisclosureProps) => {
  const evidenceIds = [
    ...new Set(experiment.records.flatMap((record) => record.evidence.items)),
  ]
  const itemsById = new Map<string, EvidenceItem>()

  evidenceIds.forEach((id) => {
    const item = evidenceItems.find((candidate) => candidate.id === id)
    if (item) {
      itemsById.set(id, item)
    }
  })
  const orderedIds = new Set<string>(pointEvidenceGroups.flat())
  const groupedItems = pointEvidenceGroups.flatMap((group, groupIndex) =>
    group.flatMap((id, itemIndex) => {
      const item = itemsById.get(id)
      return item
        ? [{ item, startsGroup: groupIndex > 0 && itemIndex === 0 }]
        : []
    }),
  )
  const remainingItems = [...itemsById.values()]
    .filter((item) => !orderedIds.has(item.id))
    .map((item) => ({ item, startsGroup: false }))
  const orderedItems = [...groupedItems, ...remainingItems]

  return (
    <section
      className="point-section evidence-section"
      aria-labelledby="evidence-heading"
    >
      <h3 id="evidence-heading" className="visually-hidden">
        근거 자료
      </h3>

      <details>
        <summary>근거 자료 보기 ({orderedItems.length})</summary>
        <div className="evidence-content">
          <ul className="evidence-list">
            {orderedItems.map(({ item, startsGroup }) => (
              <li
                className={startsGroup ? 'evidence-list__group-start' : undefined}
                key={item.id}
              >
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
