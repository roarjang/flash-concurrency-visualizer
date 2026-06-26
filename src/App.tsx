import { useState } from 'react'
import { ExperimentTabs } from './app/ExperimentTabs.tsx'
import { CouponWorkspace } from './components/coupon/CouponWorkspace.tsx'
import { DuplicateWorkspace } from './components/duplicate/DuplicateWorkspace.tsx'
import { PointWorkspace } from './components/point/PointWorkspace.tsx'
import { experiments } from './data/experiments.ts'
import type { ExperimentDefinition, ExperimentId } from './types/experiment.ts'
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [selectedExperimentId, setSelectedExperimentId] =
    useState<ExperimentId>(experiments[0].id)

  const selectedExperiment =
    experiments.find(
      (experiment) => experiment.id === selectedExperimentId,
    ) ?? experiments[0]
  const fallbackExperiment = selectedExperiment as ExperimentDefinition

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
          Flash Coupon Payment 백엔드 동시성 실험 결과를 요약한 보조 시각화입니다.
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
            ) : selectedExperiment.id === 'coupon-overselling' ? (
              <CouponWorkspace experiment={selectedExperiment} />
            ) : selectedExperiment.id === 'duplicate-coupon-issuance' ? (
              <DuplicateWorkspace experiment={selectedExperiment} />
            ) : (
              <div className="selection-placeholder" aria-live="polite">
                <p className="selection-placeholder__label">현재 선택</p>
                <h3>{fallbackExperiment.name.ko}</h3>
                <p className="selection-placeholder__supporting">
                  {fallbackExperiment.name.en}
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

      <footer className="site-footer">
        {/* <p>정적 화면입니다.</p> */}
      </footer>

      <Analytics />
    </div>
  )
}

export default App
