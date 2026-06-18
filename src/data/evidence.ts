import type { EvidenceItem } from '../types/experiment.ts'

export const backendRepositoryUrl =
  'https://github.com/roarjang/coupon-concurrency-lab'

const githubFileUrl = (repositoryPath: string) =>
  `${backendRepositoryUrl}/blob/main/${repositoryPath}`

export const evidenceItems = [
  {
    id: 'backend-readme',
    type: 'readme',
    labelKo: '백엔드 README',
    repositoryPath: 'README.md',
    githubUrl: githubFileUrl('README.md'),
  },
  {
    id: 'point-concurrency-test',
    type: 'test-code',
    labelKo: '포인트 동시성 테스트',
    repositoryPath:
      'src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java',
    githubUrl: githubFileUrl(
      'src/test/java/com/roar/coupon/domain/point/service/PointServiceConcurrencyTest.java',
    ),
  },
  {
    id: 'point-service',
    type: 'implementation-code',
    labelKo: '포인트 서비스 구현',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/point/service/PointService.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/point/service/PointService.java',
    ),
  },
  {
    id: 'point-entity',
    type: 'entity-definition',
    labelKo: '포인트 엔티티와 버전 필드',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/point/entity/Point.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/point/entity/Point.java',
    ),
  },
  {
    id: 'point-repository',
    type: 'repository-query',
    labelKo: '포인트 저장소 쿼리',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/point/repository/PointRepository.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/point/repository/PointRepository.java',
    ),
  },
  {
    id: 'point-strategy-document',
    type: 'experiment-document',
    labelKo: '포인트 동시성 전략 비교 문서',
    repositoryPath: 'docs/point-concurrency-strategy-comparison.md',
    githubUrl: githubFileUrl('docs/point-concurrency-strategy-comparison.md'),
  },
  {
    id: 'point-experiment-plan',
    type: 'experiment-document',
    labelKo: '포인트 동시성 실험 계획',
    repositoryPath: 'docs/history/concurrency-experiment-plan.md',
    githubUrl: githubFileUrl('docs/history/concurrency-experiment-plan.md'),
  },
  {
    id: 'coupon-concurrency-test',
    type: 'test-code',
    labelKo: '쿠폰 동시성 테스트',
    repositoryPath:
      'src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java',
    githubUrl: githubFileUrl(
      'src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java',
    ),
  },
  {
    id: 'coupon-lua-fixture',
    type: 'lua-script',
    labelKo: 'Redis Lua 테스트 픽스처',
    repositoryPath:
      'src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java',
    githubUrl: githubFileUrl(
      'src/test/java/com/roar/coupon/domain/coupon/service/CouponIssueConcurrencyTest.java',
    ),
    notes: 'Lua 스크립트는 동시성 테스트 픽스처 안에 정의되어 있다.',
  },
  {
    id: 'coupon-service',
    type: 'implementation-code',
    labelKo: '쿠폰 발급 서비스 구현',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/coupon/service/CouponIssueService.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/coupon/service/CouponIssueService.java',
    ),
  },
  {
    id: 'coupon-entity',
    type: 'entity-definition',
    labelKo: '쿠폰 엔티티와 버전 필드',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/coupon/entity/Coupon.java',
    ),
  },
  {
    id: 'coupon-repository',
    type: 'repository-query',
    labelKo: '쿠폰 저장소 쿼리',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/coupon/repository/CouponRepository.java',
    ),
  },
  {
    id: 'issued-coupon-entity',
    type: 'entity-definition',
    labelKo: '발급 쿠폰 엔티티와 유니크 제약조건',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/coupon/entity/IssuedCoupon.java',
    ),
  },
  {
    id: 'issued-coupon-repository',
    type: 'repository-query',
    labelKo: '발급 쿠폰 저장소 쿼리',
    repositoryPath:
      'src/main/java/com/roar/coupon/domain/coupon/repository/IssuedCouponRepository.java',
    githubUrl: githubFileUrl(
      'src/main/java/com/roar/coupon/domain/coupon/repository/IssuedCouponRepository.java',
    ),
  },
  {
    id: 'coupon-strategy-document',
    type: 'experiment-document',
    labelKo: '쿠폰 동시성 전략 비교 문서',
    repositoryPath: 'docs/coupon-concurrency-strategy-comparison.md',
    githubUrl: githubFileUrl('docs/coupon-concurrency-strategy-comparison.md'),
  },
  {
    id: 'coupon-domain-document',
    type: 'experiment-document',
    labelKo: '쿠폰 도메인 설계 문서',
    repositoryPath: 'docs/coupon-domain-design.md',
    githubUrl: githubFileUrl('docs/coupon-domain-design.md'),
  },
  {
    id: 'coupon-experiment-plan',
    type: 'experiment-document',
    labelKo: '쿠폰 동시성 실험 계획',
    repositoryPath: 'docs/history/coupon-concurrency-experiment-plan.md',
    githubUrl: githubFileUrl(
      'docs/history/coupon-concurrency-experiment-plan.md',
    ),
  },
  {
    id: 'historical-implementation-roadmap',
    type: 'experiment-document',
    labelKo: '백엔드 구현 로드맵 기록',
    repositoryPath: 'docs/history/implementation-roadmap.md',
    githubUrl: githubFileUrl('docs/history/implementation-roadmap.md'),
  },
  {
    id: 'redis-consistency-document',
    type: 'redis-boundary',
    labelKo: 'Redis와 PostgreSQL 일관성 경계 문서',
    repositoryPath: 'docs/redis-consistency-boundary.md',
    githubUrl: githubFileUrl('docs/redis-consistency-boundary.md'),
  },
  {
    id: 'runbook',
    type: 'runbook',
    labelKo: '로컬 실행 및 스키마 확인 문서',
    repositoryPath: 'docs/runbook.md',
    githubUrl: githubFileUrl('docs/runbook.md'),
  },
] as const satisfies readonly EvidenceItem[]
