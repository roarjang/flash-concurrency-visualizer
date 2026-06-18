import { backendRepositoryUrl, evidenceItems } from './evidence.ts'
import { experiments } from './experiments.ts'
import { strategies } from './strategies.ts'
import type {
  NumericValue,
  ResultMetric,
  StrategyComparison,
  StrategyRecord,
} from '../types/experiment.ts'

const reportDuplicateIds = (
  errors: string[],
  label: string,
  items: readonly { readonly id: string }[],
) => {
  const seen = new Set<string>()

  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push(`${label} ID is duplicated: ${item.id}`)
    }
    seen.add(item.id)
  }
}

const requireText = (errors: string[], label: string, value: string) => {
  if (value.trim().length === 0) {
    errors.push(`${label} is missing`)
  }
}

const numericValuesMatch = (left: NumericValue, right: NumericValue) => {
  if (left.kind !== right.kind) {
    return false
  }

  if (left.kind === 'undocumented' && right.kind === 'undocumented') {
    return left.reasonKo === right.reasonKo
  }

  if (left.kind === 'observed-example' && right.kind === 'observed-example') {
    return left.value === right.value && left.caveatKo === right.caveatKo
  }

  return (
    left.kind === 'exact' &&
    right.kind === 'exact' &&
    left.value === right.value
  )
}

const findObservedMetric = (
  record: StrategyRecord,
  metricId: string,
): ResultMetric | undefined =>
  record.observed.metrics.find((metric) => metric.id === metricId)

export const validateExperimentData = () => {
  const errors: string[] = []
  const allRecords: StrategyRecord[] = []
  const allComparisons: StrategyComparison[] = []

  for (const experiment of experiments) {
    for (const record of experiment.records) {
      allRecords.push(record)
    }

    for (const comparison of experiment.comparisons) {
      allComparisons.push(comparison)
    }
  }

  reportDuplicateIds(errors, 'Experiment', experiments)
  reportDuplicateIds(errors, 'Strategy', strategies)
  reportDuplicateIds(errors, 'Evidence', evidenceItems)
  reportDuplicateIds(errors, 'Experiment record', allRecords)
  reportDuplicateIds(errors, 'Comparison', allComparisons)

  const strategyIds = new Set(strategies.map((strategy) => strategy.id))
  const evidenceIds = new Set(evidenceItems.map((evidence) => evidence.id))

  for (const strategy of strategies) {
    requireText(
      errors,
      `Strategy ${strategy.id} Korean name`,
      strategy.name.ko,
    )
    requireText(
      errors,
      `Strategy ${strategy.id} English name`,
      strategy.name.en,
    )
  }

  for (const evidence of evidenceItems) {
    requireText(
      errors,
      `Evidence ${evidence.id} Korean label`,
      evidence.labelKo,
    )

    const expectedUrl = `${backendRepositoryUrl}/blob/main/${evidence.repositoryPath}`
    const forbiddenLocalPath =
      /(^\/)|(^|\/)\.\.?\/|\/Users\/|flash-concurrency\/|flash-coupon-payment\/|file:\/\//

    if (forbiddenLocalPath.test(evidence.repositoryPath)) {
      errors.push(
        `Evidence ${evidence.id} leaks a local or non-relative path: ${evidence.repositoryPath}`,
      )
    }

    if (evidence.githubUrl !== expectedUrl) {
      errors.push(
        `Evidence ${evidence.id} GitHub URL does not match repositoryPath`,
      )
    }
  }

  for (const experiment of experiments) {
    requireText(
      errors,
      `Experiment ${experiment.id} Korean name`,
      experiment.name.ko,
    )
    requireText(
      errors,
      `Experiment ${experiment.id} English name`,
      experiment.name.en,
    )
    requireText(
      errors,
      `Experiment ${experiment.id} description`,
      experiment.descriptionKo,
    )
    requireText(
      errors,
      `Experiment ${experiment.id} invariant`,
      experiment.invariantKo,
    )

    const recordById = new Map(
      experiment.records.map((record) => [record.id, record]),
    )

    for (const record of experiment.records) {
      requireText(errors, `Record ${record.id} Korean name`, record.name.ko)
      requireText(errors, `Record ${record.id} English name`, record.name.en)
      requireText(
        errors,
        `Record ${record.id} scenario condition`,
        record.scenarioConditionKo,
      )

      if (!strategyIds.has(record.strategyId)) {
        errors.push(
          `Record ${record.id} references undefined strategy ${record.strategyId}`,
        )
      }

      const strategy = strategies.find(
        (candidate) => candidate.id === record.strategyId,
      )

      if (
        strategy?.group === 'redis-front-line-gate' &&
        record.category !== 'redis-front-line-gate'
      ) {
        errors.push(
          `Redis strategy record ${record.id} is not in the Redis front-line gate category`,
        )
      }

      if (
        strategy?.group !== 'redis-front-line-gate' &&
        record.category === 'redis-front-line-gate'
      ) {
        errors.push(
          `Database strategy record ${record.id} is incorrectly in the Redis category`,
        )
      }

      for (const evidenceId of record.evidence.items) {
        if (!evidenceIds.has(evidenceId)) {
          errors.push(
            `Record ${record.id} references undefined evidence ${evidenceId}`,
          )
        }
      }

      if (record.strategyId === 'optimistic-lock') {
        for (const metric of record.observed.metrics) {
          if (metric.value.kind !== 'observed-example') {
            errors.push(
              `Optimistic-lock metric ${record.id}/${metric.id} is not marked as an observed example`,
            )
          }
        }
      }

      for (const metric of [
        ...record.expected.metrics,
        ...record.observed.metrics,
      ]) {
        requireText(
          errors,
          `Metric ${record.id}/${metric.id} label`,
          metric.labelKo,
        )

        if (
          metric.value.kind === 'observed-example' &&
          metric.value.caveatKo.trim().length === 0
        ) {
          errors.push(
            `Observed example ${record.id}/${metric.id} has no caveat`,
          )
        }

        if (
          metric.value.kind === 'undocumented' &&
          metric.value.reasonKo.trim().length === 0
        ) {
          errors.push(
            `Undocumented metric ${record.id}/${metric.id} has no reason`,
          )
        }
      }
    }

    for (const comparison of experiment.comparisons) {
      for (const comparisonValue of comparison.values) {
        const sourceRecord = recordById.get(comparisonValue.recordId)

        if (!sourceRecord) {
          errors.push(
            `Comparison ${comparison.id} references missing record ${comparisonValue.recordId}`,
          )
          continue
        }

        if (sourceRecord.strategyId !== comparisonValue.strategyId) {
          errors.push(
            `Comparison ${comparison.id} strategy does not match source record ${sourceRecord.id}`,
          )
        }

        const sourceMetric = findObservedMetric(
          sourceRecord,
          comparison.metricId,
        )

        if (!sourceMetric) {
          errors.push(
            `Comparison ${comparison.id} metric ${comparison.metricId} is absent from ${sourceRecord.id}`,
          )
          continue
        }

        if (!numericValuesMatch(sourceMetric.value, comparisonValue.value)) {
          errors.push(
            `Comparison ${comparison.id} value does not match ${sourceRecord.id}/${sourceMetric.id}`,
          )
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Experiment data validation failed:\n- ${errors.join('\n- ')}`)
  }

  return {
    experimentCount: experiments.length,
    recordCount: experiments.reduce(
      (count, experiment) => count + experiment.records.length,
      0,
    ),
    strategyCount: strategies.length,
    evidenceCount: evidenceItems.length,
  }
}

const validationResult = validateExperimentData()

console.log(
  `Validated ${validationResult.experimentCount} experiments, ` +
    `${validationResult.recordCount} records, ` +
    `${validationResult.strategyCount} strategies, and ` +
    `${validationResult.evidenceCount} evidence items.`,
)
