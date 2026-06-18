import type { StrategyDefinition } from '../types/experiment.ts'

export const strategies = [
  {
    id: 'transaction-only',
    name: { ko: '트랜잭션만 적용', en: 'Transaction Only' },
    group: 'baseline',
  },
  {
    id: 'pessimistic-lock',
    name: { ko: '비관적 락', en: 'Pessimistic Lock' },
    group: 'database',
  },
  {
    id: 'optimistic-lock',
    name: { ko: '낙관적 락', en: 'Optimistic Lock' },
    group: 'database',
  },
  {
    id: 'atomic-update',
    name: { ko: '조건부 원자적 업데이트', en: 'Atomic Update' },
    group: 'database',
  },
  {
    id: 'db-unique-constraint',
    name: { ko: 'DB 유니크 제약조건', en: 'Database Unique Constraint' },
    group: 'database',
  },
  {
    id: 'redis-counter',
    name: { ko: 'Redis 카운터', en: 'Redis Counter' },
    group: 'redis-front-line-gate',
  },
  {
    id: 'redis-lua',
    name: { ko: 'Redis Lua 스크립트', en: 'Redis Lua Script' },
    group: 'redis-front-line-gate',
  },
] as const satisfies readonly StrategyDefinition[]
