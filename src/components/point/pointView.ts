import type {
  NumericValue,
  ResultMetric,
  StrategyRecord,
} from '../../types/experiment.ts'

export const getMetric = (
  record: StrategyRecord,
  source: 'expected' | 'observed',
  metricId: ResultMetric['id'],
) => record[source].metrics.find((metric) => metric.id === metricId)

export const getKnownValue = (value: NumericValue) =>
  value.kind === 'undocumented' ? undefined : value.value

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('ko-KR').format(value)

export const formatMetricValue = (metric: ResultMetric) => {
  const value = getKnownValue(metric.value)

  if (value === undefined) {
    return '검증되지 않은 데이터'
  }

  return metric.unit === 'currency'
    ? `${formatNumber(value)}원`
    : `${formatNumber(value)}건`
}

export const isObservedExample = (metric: ResultMetric) =>
  metric.value.kind === 'observed-example'
