import { useState } from 'react'
import { ExperimentTabs } from './app/ExperimentTabs.tsx'
import { PointWorkspace } from './components/point/PointWorkspace.tsx'
import { experiments } from './data/experiments.ts'
import type { ExperimentId } from './types/experiment.ts'

function App() {
  const [selectedExperimentId, setSelectedExperimentId] =
    useState<ExperimentId>(experiments[0].id)

  const selectedExperiment =
    experiments.find(
      (experiment) => experiment.id === selectedExperimentId,
    ) ?? experiments[0]

  const handleExperimentSelect = (experimentId: ExperimentId) => {
    const nextExperiment = experiments.find(
      (experiment) => experiment.id === experimentId,
    )

    if (!nextExperiment) {
      return
    }

    setSelectedExperimentId(nextExperiment.id)
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <h1>Flash Concurrency Visualizer</h1>
        <p className="project-summary">
          같은 요청도 적용한 전략에 따라 결과가 달라집니다.
        </p>
      </header>

      <main>
        <section className="experiment-navigation" aria-labelledby="experiment-heading">
          <h2 id="experiment-heading" className="visually-hidden">
            동시성 실험
          </h2>

          <ExperimentTabs
            experiments={experiments}
            selectedExperimentId={selectedExperimentId}
            onSelect={handleExperimentSelect}
          />

          <div
            id="experiment-panel"
            className="experiment-panel"
            role="tabpanel"
            aria-labelledby={`experiment-tab-${selectedExperiment.id}`}
            tabIndex={0}
          >
            {selectedExperiment.id === 'point-lost-update' ? (
              <PointWorkspace experiment={selectedExperiment} />
            ) : (
              <div className="selection-placeholder" aria-live="polite">
                <p className="selection-placeholder__label">현재 선택</p>
                <h3>{selectedExperiment.name.ko}</h3>
                <p className="selection-placeholder__supporting">
                  {selectedExperiment.name.en}
                </p>
                <p className="selection-placeholder__message">
                  이 실험의 상세 조건과 결과 시각화는 이후 구현 단계에서
                  추가됩니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
