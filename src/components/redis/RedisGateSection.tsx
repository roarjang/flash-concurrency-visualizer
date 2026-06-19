import { Fragment } from 'react'

type RedisGateSectionMode = 'coupon' | 'duplicate'

type RedisGateSectionProps = {
  readonly mode: RedisGateSectionMode
}

const contentByMode: Record<
  RedisGateSectionMode,
  {
    readonly flowNodes: readonly {
      readonly label: string
      readonly detail: string
      readonly badge?: string
      readonly focus?: boolean
    }[]
    readonly bridges: readonly string[]
  }
> = {
  coupon: {
    flowNodes: [
      {
        label: '요청',
        detail: '1,000건 요청',
      },
      {
        label: 'Redis',
        badge: 'Counter',
        detail: '재고 수량 선행 확인',
        focus: true,
      },
      {
        label: 'PostgreSQL',
        detail: '최종 저장',
      },
    ],
    bridges: ['승인 100건', '최종 저장'],
  },
  duplicate: {
    flowNodes: [
      {
        label: '요청',
        detail: '100건 요청',
      },
      {
        label: 'Redis',
        badge: 'Lua Script',
        detail: '재고 수량 + 사용자 중복 확인',
        focus: true,
      },
      {
        label: 'PostgreSQL',
        detail: '최종 저장',
      },
    ],
    bridges: ['승인 1건', '최종 저장'],
  },
} as const

const RedisFlowDiagram = ({
  nodes,
  bridges,
}: {
  readonly nodes: readonly {
    readonly label: string
    readonly detail: string
    readonly badge?: string
    readonly focus?: boolean
  }[]
  readonly bridges: readonly string[]
}) => (
  <div className="redis-flow" aria-label="Redis 선행 제어 흐름">
    {nodes.map((node, index) => (
      <Fragment key={node.label}>
        <article
          className={`redis-flow__node${
            node.focus ? ' redis-flow__node--focus' : ''
          }`}
        >
          <header className="redis-flow__node-header">
            <h4>{node.label}</h4>
            {node.badge && <span className="redis-flow__badge">{node.badge}</span>}
          </header>

          <p className="redis-flow__detail">{node.detail}</p>
        </article>

        {index < nodes.length - 1 && (
          <div className="redis-flow__bridge" aria-label={bridges[index]}>
            <span className="redis-flow__bridge-label">{bridges[index]}</span>
          </div>
        )}
      </Fragment>
    ))}
  </div>
)

export const RedisGateSection = ({ mode }: RedisGateSectionProps) => {
  const content = contentByMode[mode]

  return (
    <section className="redis-section" aria-labelledby="redis-section-heading">
      <div className="redis-section__header">
        <h2 id="redis-section-heading">Redis 기반 선행 제어</h2>
        <p className="redis-section__description">
          Redis가 PostgreSQL 저장 전에 요청을 선별합니다.
        </p>
      </div>

      <RedisFlowDiagram nodes={content.flowNodes} bridges={content.bridges} />

      <section
        className="point-section redis-responsibility-section"
        aria-labelledby="redis-responsibility-heading"
      >
        <h3 id="redis-responsibility-heading" className="visually-hidden">
          Redis 책임 설명
        </h3>

        <details className="content-disclosure">
          <summary>책임 설명 자세히 보기</summary>
          <div className="disclosure-content">
            <p>
              Redis 승인은 발급 완료가 아닙니다. PostgreSQL 저장이 완료되어야
              최종 기록이 됩니다.
            </p>
          </div>
        </details>
      </section>

    </section>
  )
}
