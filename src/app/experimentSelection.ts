import { strategies } from '../data/strategies.ts'
import type {
  ExperimentDefinition,
  StrategyDefinition,
  StrategyId,
} from '../types/experiment.ts'

export const getAvailableStrategies = (
  experiment: ExperimentDefinition,
): readonly StrategyDefinition[] => {
  const strategyIds = new Set<StrategyId>()

  for (const record of experiment.records) {
    strategyIds.add(record.strategyId)
  }

  return strategies.filter((strategy) => strategyIds.has(strategy.id))
}

export const getDefaultStrategyId = (
  experiment: ExperimentDefinition,
): StrategyId => {
  const baselineRecord = experiment.records.find((record) => {
    const strategy = strategies.find(
      (candidate) => candidate.id === record.strategyId,
    )

    return strategy?.group === 'baseline'
  })

  if (!baselineRecord) {
    throw new Error(`Experiment ${experiment.id} has no baseline strategy`)
  }

  return baselineRecord.strategyId
}
