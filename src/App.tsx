function App() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <p className="eyebrow">Recorded concurrency experiments</p>
        <h1>Flash Concurrency Visualizer</h1>
        <p className="project-summary">
          Java와 Spring 기반 백엔드에서 수행한 동시성 실험의 기록된 결과를
          이해하기 쉽게 보여 주는 정적 시각화 프로젝트입니다.
        </p>
      </header>

      <main>
        <section className="foundation-notice" aria-labelledby="foundation-title">
          <h2 id="foundation-title">시각화 기반 준비 중</h2>
          <p>
            실험별 결과와 전략 비교 화면은 검증된 기록 데이터를 바탕으로 이후
            단계에서 추가됩니다. 이 화면에서는 실시간 부하 테스트를 실행하지
            않습니다.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
