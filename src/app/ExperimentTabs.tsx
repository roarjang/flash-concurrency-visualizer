import { useRef, type KeyboardEvent } from 'react'
import type {
  ExperimentDefinition,
  ExperimentId,
} from '../types/experiment.ts'

type ExperimentTabsProps = {
  readonly experiments: readonly ExperimentDefinition[]
  readonly selectedExperimentId: ExperimentId
  readonly onSelect: (experimentId: ExperimentId) => void
}

export const ExperimentTabs = ({
  experiments,
  selectedExperimentId,
  onSelect,
}: ExperimentTabsProps) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectAndFocus = (index: number) => {
    const experiment = experiments[index]

    if (!experiment) {
      return
    }

    onSelect(experiment.id)
    tabRefs.current[index]?.focus()
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex: number | undefined

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex =
          currentIndex === 0 ? experiments.length - 1 : currentIndex - 1
        break
      case 'ArrowRight':
        nextIndex =
          currentIndex === experiments.length - 1 ? 0 : currentIndex + 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = experiments.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    selectAndFocus(nextIndex)
  }

  return (
    <div className="experiment-tabs" role="tablist" aria-label="동시성 실험 선택">
      {experiments.map((experiment, index) => {
        const isSelected = experiment.id === selectedExperimentId

        return (
          <button
            key={experiment.id}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            id={`experiment-tab-${experiment.id}`}
            className="experiment-tab"
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls="experiment-panel"
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(experiment.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className="experiment-tab__label">{experiment.name.ko}</span>
            <span className="experiment-tab__supporting">
              {experiment.name.en}
            </span>
          </button>
        )
      })}
    </div>
  )
}
