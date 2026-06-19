import { evidenceItems } from '../../data/evidence.ts'
import type { EvidenceItem } from '../../types/experiment.ts'

type GroupedEvidenceDisclosureProps = {
  readonly headingId: string
  readonly experimentItems: readonly EvidenceItem[]
  readonly mode: 'coupon' | 'duplicate'
}

const experimentEvidenceGroups = {
  coupon: [
    [
      'coupon-concurrency-test',
      'coupon-service',
      'coupon-repository',
      'coupon-entity',
    ],
    [
      'coupon-strategy-document',
      'coupon-experiment-plan',
      'coupon-domain-document',
    ],
    ['backend-readme', 'historical-implementation-roadmap'],
  ],
  duplicate: [
    [
      'coupon-concurrency-test',
      'coupon-service',
      'issued-coupon-repository',
      'issued-coupon-entity',
    ],
    [
      'coupon-strategy-document',
      'coupon-experiment-plan',
      'coupon-domain-document',
    ],
    ['runbook', 'historical-implementation-roadmap'],
  ],
} as const

const redisEvidenceIds = [
  'coupon-lua-fixture',
  'redis-consistency-document',
] as const

const redisItems: EvidenceItem[] = redisEvidenceIds.flatMap((id) => {
  const item = evidenceItems.find((candidate) => candidate.id === id)
  return item ? [item] : []
})

const orderEvidenceItems = (
  items: readonly EvidenceItem[],
  groups: readonly (readonly string[])[],
) => {
  const itemsById = new Map<string, EvidenceItem>(
    items.map((item) => [item.id, item]),
  )
  const orderedIds = new Set<string>(groups.flat())
  const groupedItems = groups.flatMap((group, groupIndex) =>
    group.flatMap((id, itemIndex) => {
      const item = itemsById.get(id)
      return item
        ? [{ item, startsGroup: groupIndex > 0 && itemIndex === 0 }]
        : []
    }),
  )
  const remainingItems = items
    .filter((item) => !orderedIds.has(item.id))
    .map((item) => ({ item, startsGroup: false }))

  return [...groupedItems, ...remainingItems]
}

const EvidenceList = ({
  entries,
}: {
  readonly entries: readonly {
    readonly item: EvidenceItem
    readonly startsGroup: boolean
  }[]
}) => (
  <ul className="evidence-list">
    {entries.map(({ item, startsGroup }) => (
      <li
        className={startsGroup ? 'evidence-list__group-start' : undefined}
        key={item.id}
      >
        <a href={item.githubUrl} target="_blank" rel="noreferrer">
          {item.labelKo}
          <span aria-hidden="true"> ↗</span>
        </a>
        {item.notes && item.id !== 'coupon-lua-fixture' && <p>{item.notes}</p>}
      </li>
    ))}
  </ul>
)

export const GroupedEvidenceDisclosure = ({
  headingId,
  experimentItems,
  mode,
}: GroupedEvidenceDisclosureProps) => {
  const experimentIds = new Set(experimentItems.map((item) => item.id))
  const uniqueRedisItems = redisItems.filter((item) => !experimentIds.has(item.id))
  const orderedExperimentItems = orderEvidenceItems(
    experimentItems,
    experimentEvidenceGroups[mode],
  )
  const orderedRedisItems = uniqueRedisItems.map((item) => ({
    item,
    startsGroup: false,
  }))
  const itemCount = experimentItems.length + uniqueRedisItems.length

  return (
    <section
      className="point-section evidence-section"
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="visually-hidden">
        근거 자료
      </h3>

      <details>
        <summary>근거 자료 보기 ({itemCount})</summary>
        <div className="evidence-content evidence-groups">
          <section className="evidence-group">
            <h4>실험 근거</h4>
            <EvidenceList entries={orderedExperimentItems} />
          </section>

          <section className="evidence-group">
            <h4>Redis 근거</h4>
            <EvidenceList entries={orderedRedisItems} />
          </section>
        </div>
      </details>
    </section>
  )
}
