import type { OntologyClass } from './types';

export function classLabel(className: OntologyClass): string {
  const labels: Record<string, string> = {
    Scenario: '상황',
    CatSignal: '행동 신호',
    HealthObservation: '건강 관찰',
    CareAction: '집에서 할 일',
    Need: '마음·욕구',
    EnvironmentElement: '환경',
    SafetyRisk: '주의',
    Chapter: '읽을거리',
    Topic: '주제',
  };

  return labels[className] ?? className;
}

export function badgeClassName(className: OntologyClass): string {
  const classes: Record<string, string> = {
    Scenario: 'badgeScenario',
    CatSignal: 'badgeSignal',
    HealthObservation: 'badgeHealth',
    SafetyRisk: 'badgeHealth',
    CareAction: 'badgeAction',
    Need: 'badgeNeed',
  };

  return `badge ${classes[className] ?? 'badgeNeutral'}`;
}
