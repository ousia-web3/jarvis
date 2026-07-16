export type OntologyClass =
  | 'Scenario'
  | 'CatSignal'
  | 'HealthObservation'
  | 'CareAction'
  | 'Need'
  | 'EnvironmentElement'
  | 'SafetyRisk'
  | 'Chapter'
  | 'Topic'
  | 'BookPart'
  | 'Source'
  | string;

export interface EvidenceItem {
  id: string;
  title: string;
  url: string;
  mediaFamily: string;
  durationMin: number | null;
  viewCount: number | null;
  topics: string[];
}

export interface OntologyNode {
  id: string;
  slug: string;
  href: string;
  label: string;
  className: OntologyClass;
  summary: string;
  checks: string[];
  beginner: string;
  observe: string[];
  keywords: string[];
  medical: boolean;
  evidenceCount: number | null;
  topEvidence: EvidenceItem[];
}

export interface RelatedEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationId: string;
  label: string;
}

export interface ApiMeta {
  ontologyVersion: string | null;
  snapshotDate: string | null;
  safety: string[];
}

export interface Envelope<T> {
  data: T;
  meta: ApiMeta;
}

export interface StatsData {
  title: string;
  description: string;
  nodes: number;
  edges: number;
  scenarios: number;
  sources: number;
  classCounts: Record<string, number>;
  topEvidenceConcepts: OntologyNode[];
}

export interface ScenarioListData {
  count: number;
  scenarios: OntologyNode[];
}

export interface DetailData {
  root: OntologyNode;
  related: OntologyNode[];
  edges: RelatedEdge[];
  evidence: EvidenceItem[];
}

export interface SearchData {
  query: string;
  count: number;
  results: OntologyNode[];
}

export interface AskAnswer {
  summary: string;
  observe: string[];
  careActions: string[];
  recordGuide: string[];
  safetyNote: string;
}

export interface AskData {
  question: string;
  scenario: OntologyNode | null;
  matchedNodes: OntologyNode[];
  answer: AskAnswer;
}

export interface EvidenceData {
  concept: OntologyNode | null;
  items: EvidenceItem[];
}
