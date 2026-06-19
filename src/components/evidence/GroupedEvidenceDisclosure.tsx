import { evidenceItems } from '../../data/evidence.ts'
import type { EvidenceItem } from '../../types/experiment.ts'

type GroupedEvidenceDisclosureProps = {
  readonly headingId: string
  readonly experimentItems: readonly EvidenceItem[]
}

const redisEvidenceIds = [
  'coupon-lua-fixture',
  'redis-consistency-document',
] as const

const redisItems: EvidenceItem[] = redisEvidenceIds.flatMap((id) => {
  const item = evidenceItems.find((candidate) => candidate.id === id)
  return item ? [item] : []
})

const EvidenceList = ({ items }: { readonly items: readonly EvidenceItem[] }) => (
  <ul className="evidence-list">
    {items.map((item) => (
      <li key={item.id}>
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
}: GroupedEvidenceDisclosureProps) => {
  const experimentIds = new Set(experimentItems.map((item) => item.id))
  const uniqueRedisItems = redisItems.filter((item) => !experimentIds.has(item.id))
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
            <EvidenceList items={experimentItems} />
          </section>

          <section className="evidence-group">
            <h4>Redis 근거</h4>
            <EvidenceList items={uniqueRedisItems} />
          </section>
        </div>
      </details>
    </section>
  )
}
