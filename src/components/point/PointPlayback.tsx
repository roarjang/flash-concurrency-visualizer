import { useCallback, useEffect, useRef, useState } from 'react'

import { formatNumber } from './pointView.ts'

type PlaybackTone = 'neutral' | 'warning' | 'success' | 'problem'

type RequestCardTone = 'neutral' | 'warning' | 'success' | 'problem'

type RequestCard = {
  readonly actor: 'A' | 'B'
  readonly value: string
  readonly caption: string
  readonly tone: RequestCardTone
  readonly emphasis?: 'strong' | 'soft'
}

type PlaybackStage = {
  readonly step: number
  readonly label: string
  readonly tone: PlaybackTone
  readonly note: string
  readonly requestCards: readonly RequestCard[]
  readonly result?: {
    readonly attempted: string
    readonly finalBalance: string
    readonly status: string
    readonly support: string
  }
}

const totalStages = 5

const playbackStages: readonly PlaybackStage[] = [
  {
    step: 1,
    label: '동시 읽기',
    tone: 'neutral',
    note: 'A와 B가 같은 잔액 10,000원을 읽습니다.',
    requestCards: [
      { actor: 'A', value: '10,000원', caption: '읽음', tone: 'neutral', emphasis: 'strong' },
      { actor: 'B', value: '10,000원', caption: '읽음', tone: 'neutral', emphasis: 'strong' },
    ],
  },
  {
    step: 2,
    label: '각자 계산',
    tone: 'warning',
    note: '각자 9,000원으로 계산합니다.',
    requestCards: [
      { actor: 'A', value: '9,000원', caption: '계산', tone: 'warning', emphasis: 'strong' },
      { actor: 'B', value: '9,000원', caption: '계산', tone: 'warning', emphasis: 'strong' },
    ],
  },
  {
    step: 3,
    label: 'A 저장',
    tone: 'success',
    note: 'A가 먼저 9,000원을 저장합니다.',
    requestCards: [
      { actor: 'A', value: '9,000원', caption: '먼저 저장됨', tone: 'success', emphasis: 'strong' },
      { actor: 'B', value: '9,000원', caption: '아직 저장 전', tone: 'neutral', emphasis: 'soft' },
    ],
  },
  {
    step: 4,
    label: '덮어쓰기',
    tone: 'problem',
    note: 'B가 A의 변경을 모른 채 9,000원을 저장합니다.',
    requestCards: [
      { actor: 'A', value: '9,000원', caption: '먼저 반영됨', tone: 'success', emphasis: 'soft' },
      { actor: 'B', value: '9,000원', caption: 'A 이후 상태를 덮음', tone: 'problem', emphasis: 'strong' },
    ],
  },
  {
    step: 5,
    label: '결과',
    tone: 'problem',
    note: 'Lost Update 발생을 확인합니다.',
    requestCards: [
      { actor: 'A', value: '9,000원', caption: '대표 요청 A', tone: 'neutral', emphasis: 'soft' },
      { actor: 'B', value: '9,000원', caption: '대표 요청 B', tone: 'neutral', emphasis: 'soft' },
    ],
    result: {
      attempted: '2건 차감 시도',
      finalBalance: '9,000원',
      status: 'Lost Update 발생',
      support: 'A와 B가 같은 계산값을 저장했습니다.',
    },
  },
] as const

const stageTimings = [2000, 4000, 6000, 8000] as const
const conclusionTiming = 8000

const getInitialPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getInitialPrefersReducedMotion,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

export const PointPlayback = () => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedStageIndex, setSelectedStageIndex] = useState(0)
  const [hasCompletedPlayback, setHasCompletedPlayback] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    timeoutsRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const startPlayback = () => {
    clearTimers()
    setHasPlayed(true)
    setHasCompletedPlayback(false)

    if (prefersReducedMotion) {
      setSelectedStageIndex(playbackStages.length - 1)
      setIsRunning(false)
      setHasCompletedPlayback(true)
      return
    }

    setSelectedStageIndex(0)
    setIsRunning(true)

    stageTimings.forEach((delay, index) => {
      const timeoutId = window.setTimeout(() => {
        setSelectedStageIndex(index + 1)
      }, delay)

      timeoutsRef.current.push(timeoutId)
    })

    const conclusionTimeoutId = window.setTimeout(() => {
      setHasCompletedPlayback(true)
      setIsRunning(false)
    }, conclusionTiming)

    timeoutsRef.current.push(conclusionTimeoutId)
  }

  const selectedStage = playbackStages[selectedStageIndex]
  const buttonIcon = !hasPlayed || isRunning ? '▶' : '↻'
  const buttonLabel = !hasPlayed ? '재생' : isRunning ? '재생 중' : '다시 보기'
  const stageButtonsEnabled = hasPlayed && !isRunning
  const isArchiveMode = prefersReducedMotion && hasPlayed
  const shouldShowConclusion =
    hasCompletedPlayback && selectedStageIndex === playbackStages.length - 1

  const renderRequestCard = (requestCard: RequestCard, archive = false) => (
    <article
      className="point-playback__request-card"
      data-tone={requestCard.tone}
      data-emphasis={requestCard.emphasis}
      data-archive={archive ? 'true' : 'false'}
      key={requestCard.actor}
    >
      <span className="point-playback__request-actor">{requestCard.actor}</span>
      <strong className="point-playback__request-value">{requestCard.value}</strong>
      <span className="point-playback__request-caption">{requestCard.caption}</span>
    </article>
  )

  const renderStageCard = (
    stage: PlaybackStage,
    options: {
      readonly archive?: boolean
      readonly selected?: boolean
    } = {},
  ) => (
    <article
      className="point-playback__stage-card"
      data-tone={stage.tone}
      data-archive={options.archive ? 'true' : 'false'}
      data-selected={options.selected ? 'true' : 'false'}
      key={stage.step}
    >
      <div className="point-playback__stage-head">
        <p className="point-playback__stage-count">
          {stage.step} / {totalStages}
        </p>
        <h4>{stage.label}</h4>
      </div>

      <p className="point-playback__stage-note">{stage.note}</p>

      <div className="point-playback__request-grid">
        {stage.requestCards.map((requestCard) =>
          renderRequestCard(requestCard, options.archive),
        )}
      </div>

      {stage.result && (
        <div className="point-playback__result-block">
          <div className="point-playback__result-metrics">
            <div>
              <span>차감 시도</span>
              <strong>{stage.result.attempted}</strong>
            </div>
            <div>
              <span>최종 잔액</span>
              <strong>{stage.result.finalBalance}</strong>
            </div>
          </div>

          <p className="point-playback__status-pill" data-tone="problem">
            {stage.result.status}
          </p>

          <p className="point-playback__result-support">{stage.result.support}</p>
        </div>
      )}
    </article>
  )

  return (
    <section
      className="point-section point-playback"
      aria-labelledby="playback-heading"
    >
      <header className="point-playback__header">
        <div className="point-playback__header-row">
          <h3 id="playback-heading">Lost Update 발생 과정</h3>

          <button
            className="point-playback__button"
            type="button"
            onClick={startPlayback}
            disabled={isRunning}
          >
            <span className="point-playback__button-icon" aria-hidden="true">
              {buttonIcon}
            </span>
            <span className="point-playback__button-label">{buttonLabel}</span>
          </button>
        </div>
      </header>

      <div className="point-playback__panel" data-stage={hasPlayed ? selectedStage.step : 'idle'}>
        {!hasPlayed ? (
          <article className="point-playback__idle-balance" aria-label="현재 잔액 10,000원">
            <span>현재 잔액</span>
            <strong>{formatNumber(10000)}원</strong>
          </article>
        ) : (
          <>
            <div className="point-playback__stage-rail-wrap">
              <div className="point-playback__stage-rail" aria-label="재생 단계">
                {playbackStages.map((stage, index) => {
                  const isActive = index === selectedStageIndex
                  const isComplete = index < selectedStageIndex

                  return (
                    <button
                      className="point-playback__stage-chip"
                      data-active={isActive}
                      data-complete={isComplete}
                      key={stage.step}
                      type="button"
                      aria-pressed={isActive}
                      disabled={!stageButtonsEnabled}
                      onClick={() => {
                        if (!stageButtonsEnabled) {
                          return
                        }

                        setSelectedStageIndex(index)
                      }}
                    >
                      <span className="point-playback__stage-chip-step">
                        {stage.step}
                      </span>
                      <span className="point-playback__stage-chip-label">
                        {stage.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {stageButtonsEnabled && (
                <p className="point-playback__rail-note">
                  단계를 클릭하면 다시 볼 수 있습니다.
                </p>
              )}
            </div>

            {isArchiveMode ? (
              <div className="point-playback__stage-archive">
                {playbackStages.map((stage, index) =>
                  renderStageCard(stage, {
                    archive: true,
                    selected: index === selectedStageIndex,
                  }),
                )}
              </div>
            ) : (
              renderStageCard(selectedStage, {
                selected: true,
              })
            )}

            {shouldShowConclusion && (
              <div className="point-playback__conclusion">
                <p>여러 요청이 같은 잔액을 읽어 이전 갱신을 덮어썼습니다.</p>
                <span>
                  기록된 15건의 실제 결과는 아래 전략 카드에서 확인할 수 있습니다.
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
