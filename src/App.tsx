import { useState } from 'react'
import { ExperimentTabs } from './app/ExperimentTabs.tsx'
import {
  getAvailableStrategies,
  getDefaultStrategyId,
} from './app/experimentSelection.ts'
import { experiments } from './data/experiments.ts'
import type { ExperimentId, StrategyId } from './types/experiment.ts'

function App() {
  const [selectedExperimentId, setSelectedExperimentId] =
    useState<ExperimentId>(experiments[0].id)
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyId>(
    getDefaultStrategyId(experiments[0]),
  )

  const selectedExperiment =
    experiments.find(
      (experiment) => experiment.id === selectedExperimentId,
    ) ?? experiments[0]
  const availableStrategies = getAvailableStrategies(selectedExperiment)
  const selectedStrategy =
    availableStrategies.find(
      (strategy) => strategy.id === selectedStrategyId,
    ) ?? availableStrategies[0]

  const handleExperimentSelect = (experimentId: ExperimentId) => {
    const nextExperiment = experiments.find(
      (experiment) => experiment.id === experimentId,
    )

    if (!nextExperiment) {
      return
    }

    setSelectedExperimentId(nextExperiment.id)
    setSelectedStrategyId(getDefaultStrategyId(nextExperiment))
  }

  const handleStrategyChange = (value: string) => {
    const nextStrategy = availableStrategies.find(
      (strategy) => strategy.id === value,
    )

    if (nextStrategy) {
      setSelectedStrategyId(nextStrategy.id)
    }
  }

  return (
    <div className="page-shell">
      <header className="site-header">
        <p className="eyebrow">Recorded concurrency experiments</p>
        <h1>Flash Concurrency Visualizer</h1>
        <p className="project-summary">
          Java와 Spring 기반 백엔드 동시성 실험에서 기록된 결과를 선택하고
          살펴보는 정적 시각화 프로젝트입니다.
        </p>
        <p className="recorded-result-notice">
          브라우저에서 실시간 부하 테스트를 실행하지 않습니다.
        </p>
      </header>

      <main>
        <section className="experiment-navigation" aria-labelledby="experiment-heading">
          <div className="section-heading">
            <p className="section-label">Experiment</p>
            <h2 id="experiment-heading">확인할 동시성 실험을 선택하세요</h2>
          </div>

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
            <div className="strategy-field">
              <label htmlFor="strategy-select">전략 선택</label>
              <select
                id="strategy-select"
                value={selectedStrategy?.id}
                onChange={(event) => handleStrategyChange(event.target.value)}
              >
                {availableStrategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name.ko}
                  </option>
                ))}
              </select>
            </div>

            <div className="selection-placeholder" aria-live="polite">
              <p className="selection-placeholder__label">현재 선택</p>
              <h3>{selectedExperiment.name.ko}</h3>
              <p className="selection-placeholder__supporting">
                {selectedExperiment.name.en}
              </p>
              <dl>
                <div>
                  <dt>전략</dt>
                  <dd>
                    {selectedStrategy?.name.ko}
                    <span>{selectedStrategy?.name.en}</span>
                  </dd>
                </div>
              </dl>
              <p className="selection-placeholder__message">
                상세 조건, 결과 비교, 원인과 근거 자료는 다음 구현 단계에서
                추가됩니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
