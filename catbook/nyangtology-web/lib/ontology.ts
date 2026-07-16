import graphData from '@/ontology_runtime/content/research/cat_ontology_graph.json';
import type {
  AskData,
  DetailData,
  Envelope,
  EvidenceData,
  EvidenceItem,
  OntologyNode,
  RelatedEdge,
  ScenarioListData,
  SearchData,
  StatsData,
} from './types';

type RawEvidence = {
  id?: string;
  content_id?: string;
  title?: string;
  default_title?: string;
  url?: string;
  watch_url?: string;
  media_family?: string;
  duration_min?: number | null;
  view_count?: number | null;
  topics?: string[];
};

type RawNode = {
  id: string;
  label?: string;
  class?: string;
  summary?: string;
  checks?: string[];
  beginner?: string;
  observe?: string[];
  keywords?: string[];
  medical?: boolean;
  evidence_count?: number | null;
  top_evidence?: RawEvidence[];
};

type RawEdge = {
  id?: string;
  source?: string;
  target?: string;
  relation?: string;
  label?: string;
};

type RawScenario = {
  id: string;
  label?: string;
  question?: string;
  start?: string[];
  first_checks?: string[];
};

type RawGraph = {
  meta: {
    title?: string;
    description?: string;
    schema_version?: string;
    content_total?: number;
  };
  stats: {
    node_count?: number;
    edge_count?: number;
    class_counts?: Record<string, number>;
  };
  nodes: RawNode[];
  edges: RawEdge[];
  scenarios: RawScenario[];
};

const graph = graphData as RawGraph;
const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
const scenarioEntries = new Map(graph.scenarios.map((item) => [item.id, item]));

const SCENARIO_EXCLUDE_IDS = new Set(['ontology:catbook']);
const DISPLAY_CLASSES = new Set([
  'Scenario',
  'CatSignal',
  'HealthObservation',
  'CareAction',
  'Need',
  'EnvironmentElement',
  'SafetyRisk',
  'Chapter',
]);
const RELATED_CLASSES = new Set([
  'CatSignal',
  'HealthObservation',
  'CareAction',
  'Need',
  'EnvironmentElement',
  'SafetyRisk',
]);
const CONCEPT_PREFIXES = [
  'signal',
  'health',
  'action',
  'need',
  'environment',
  'risk',
  'chapter',
  'knowledge',
  'context',
  'topic',
  'part',
];
const SEARCH_CLASS_SCORE: Record<string, number> = {
  Scenario: 45,
  HealthObservation: 36,
  CatSignal: 34,
  CareAction: 24,
  Need: 20,
  EnvironmentElement: 18,
  SafetyRisk: 16,
  Chapter: 8,
};
const SEARCH_SUFFIXES = [
  '했습니다',
  '했어요',
  '합니다',
  '해요',
  '어요',
  '아요',
  '에서',
  '마다',
  '으로',
  '부터',
  '까지',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '요',
];
const SEARCH_STOP_WORDS = new Set([
  '고양이',
  '냥이',
  '우리',
  '애',
  '아기',
  '아이',
  '자꾸',
  '계속',
  '너무',
  '좀',
  '왜',
]);
const ASK_FALLBACK_OBSERVE = [
  '언제부터 시작됐는지와 하루 중 반복되는 시간대를 적어보세요.',
  '식욕, 활력, 숨는 장소, 구토 여부가 평소와 다른지 함께 확인하세요.',
  '화장실 횟수, 배변·배뇨 모양, 모래나 위치 변화가 있었는지 살펴보세요.',
];
const ASK_FALLBACK_CARE_ACTIONS = [
  '억지로 만지거나 혼내기보다 거리를 두고 변화를 관찰하세요.',
  '물, 화장실, 숨을 곳, 조용한 동선처럼 기본 환경을 먼저 정돈하세요.',
  '변화가 빠르게 커지거나 통증이 의심되면 병원 상담 메모를 준비하세요.',
];
const ASK_GENERAL_SAFETY_NOTE =
  '이 안내는 진단이 아니라 관찰 보조입니다. 식욕 저하, 무기력, 반복 구토, 배변·배뇨 변화처럼 건강 신호가 함께 보이면 병원 상담을 준비하세요.';

export class OntologyNodeNotFoundError extends Error {
  constructor(readonly nodeId: string) {
    super(`Unknown node_id: ${nodeId}`);
    this.name = 'OntologyNodeNotFoundError';
  }
}

export function isOntologyNodeNotFoundError(
  error: unknown
): error is OntologyNodeNotFoundError {
  return error instanceof OntologyNodeNotFoundError;
}

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u{10000}-\u{10ffff}\u200d\ufe0f]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function addUnique(items: string[], values: string[]): void {
  for (const value of values) {
    const normalized = cleanText(value).toLowerCase();
    if (normalized && !items.includes(normalized)) {
      items.push(normalized);
    }
  }
}

function baseSearchTerms(query: string): string[] {
  const terms: string[] = [];
  const tokens = query.toLowerCase().match(/[0-9A-Za-z가-힣·]+/gu) ?? [];
  for (const token of tokens) {
    if (SEARCH_STOP_WORDS.has(token)) {
      continue;
    }
    addUnique(terms, [token]);
    for (const suffix of SEARCH_SUFFIXES) {
      if (token.endsWith(suffix) && token.length > suffix.length + 1) {
        addUnique(terms, [token.slice(0, -suffix.length)]);
      }
    }
  }
  return terms;
}

function expandedSearchTerms(query: string): string[] {
  const raw = query.toLowerCase();
  const terms = baseSearchTerms(raw);
  if (['화장실', '모래', '배변', '배뇨', '오줌', '소변', '똥'].some((value) => raw.includes(value))) {
    addUnique(terms, ['화장실', '배변', '배뇨', '오줌', '소변', '모래', '망설임']);
  }
  if (['울', '야옹', '소리', '운다', '울어요', '울어'].some((value) => raw.includes(value))) {
    addUnique(terms, ['울음', '야옹', '소리', '시간대', '통증']);
  }
  if (['숨어', '숨', '숨기'].some((value) => raw.includes(value))) {
    addUnique(terms, ['숨', '숨기', '숨어', '숨을 곳', '안전감']);
  }
  if (raw.includes('하악')) {
    addUnique(terms, ['하악', '하악질', '손 멈추기', '거리']);
  }
  if (['밤', '야간', '새벽'].some((value) => raw.includes(value))) {
    addUnique(terms, ['밤', '시간대', '루틴', '에너지', '불안']);
  }
  return terms.slice(0, 18);
}

function intentBoostIds(query: string): string[] {
  const raw = query.toLowerCase();
  const ids: string[] = [];
  const add = (values: string[]) => {
    for (const value of values) {
      if (!ids.includes(value)) {
        ids.push(value);
      }
    }
  };
  const hasLitter = ['화장실', '모래', '배변', '배뇨', '오줌', '소변', '똥'].some((value) => raw.includes(value));
  const hasVoice = ['울', '야옹', '소리', '운다', '울어요', '울어'].some((value) => raw.includes(value));
  const hasNight = ['밤', '야간', '새벽'].some((value) => raw.includes(value));

  if (hasLitter) add(['scenario:litter', 'health:litter_change', 'environment:litter_box']);
  if (hasVoice) add(['signal:vocalization']);
  if (hasLitter && hasVoice) add(['action:vet_notes']);
  if (hasNight && hasVoice) add(['need:predictable_routine', 'action:daily_check']);
  if (['숨어', '숨', '숨기'].some((value) => raw.includes(value))) {
    add(['scenario:hiding', 'signal:hiding', 'environment:hideout', 'need:safety']);
  }
  if (raw.includes('하악')) {
    add(['signal:hissing', 'scenario:hissing', 'action:pause_contact']);
  }
  return ids;
}

function buildSearchableNodeText(node: RawNode): string {
  const parts = [
    node.id,
    node.label,
    node.summary,
    node.beginner,
    ...(node.checks ?? []),
    ...(node.observe ?? []),
    ...(node.keywords ?? []),
  ];
  return parts.map(cleanText).join(' ').toLowerCase();
}

const searchableTextByNodeId = new Map(
  graph.nodes.map((node) => [node.id, buildSearchableNodeText(node)])
);

function searchableNodeText(node: RawNode): string {
  return searchableTextByNodeId.get(node.id) ?? buildSearchableNodeText(node);
}

function searchScore(
  node: RawNode,
  query: string,
  terms: string[],
  boostIds: string[]
): number {
  const nodeId = cleanText(node.id);
  const className = cleanText(node.class);
  const label = cleanText(node.label).toLowerCase();
  const keywords = (node.keywords ?? []).map(cleanText).join(' ').toLowerCase();
  const checks = (node.checks ?? []).map(cleanText).join(' ').toLowerCase();
  const text = searchableNodeText(node);

  let score = SEARCH_CLASS_SCORE[className] ?? 0;
  const boostIndex = boostIds.indexOf(nodeId);
  if (boostIndex >= 0) {
    score += Math.max(30, 500 - boostIndex * 110);
  }
  if (query && text.includes(query.toLowerCase())) {
    score += 80;
  }
  for (const term of terms) {
    if (term.length < 2) continue;
    if (label.includes(term)) score += 32;
    else if (keywords.includes(term)) score += 24;
    else if (checks.includes(term)) score += 22;
    else if (text.includes(term)) score += 12;
  }
  if (typeof node.evidence_count === 'number') {
    score += Math.min(node.evidence_count, 12);
  }
  return score;
}

function searchCandidateNodes(query: string): RawNode[] {
  const candidates = new Map<string, RawNode>();
  const addNode = (node?: RawNode) => {
    if (
      node?.id &&
      !SCENARIO_EXCLUDE_IDS.has(node.id) &&
      DISPLAY_CLASSES.has(node.class ?? '') &&
      !candidates.has(node.id)
    ) {
      candidates.set(node.id, node);
    }
  };
  const normalizedQuery = cleanText(query);
  const terms = expandedSearchTerms(normalizedQuery);
  const boostIds = intentBoostIds(normalizedQuery);

  for (const node of graph.nodes) {
    if (!normalizedQuery || searchableNodeText(node).includes(normalizedQuery.toLowerCase())) {
      addNode(node);
    }
  }
  for (const nodeId of boostIds) {
    addNode(nodesById.get(nodeId));
  }
  for (const term of terms) {
    for (const node of graph.nodes) {
      if (term.length >= 2 && searchableNodeText(node).includes(term)) {
        addNode(node);
      }
    }
  }

  return [...candidates.values()]
    .sort((a, b) => {
      const scoreDelta =
        searchScore(b, normalizedQuery, terms, boostIds) -
        searchScore(a, normalizedQuery, terms, boostIds);
      if (scoreDelta) return scoreDelta;
      return `${cleanText(a.class)}:${cleanText(a.label)}`.localeCompare(
        `${cleanText(b.class)}:${cleanText(b.label)}`,
        'ko'
      );
    })
    .slice(0, 24);
}

function suffixSlug(nodeId: string): string {
  return nodeId.split(':').at(-1)?.replaceAll('_', '-') ?? nodeId;
}

function conceptSlug(nodeId: string): string {
  if (!nodeId.includes(':')) return nodeId.replaceAll('_', '-');
  const [prefix, suffix] = nodeId.split(':', 2);
  return `${prefix}-${suffix.replaceAll('_', '-')}`;
}

function scenarioIdFromSlug(slug: string): string {
  return `scenario:${slug.replaceAll('-', '_')}`;
}

function conceptIdFromSlug(slug: string): string {
  if (slug.includes(':')) return slug;
  for (const prefix of CONCEPT_PREFIXES) {
    const marker = `${prefix}-`;
    if (slug.startsWith(marker)) {
      return `${prefix}:${slug.slice(marker.length).replaceAll('-', '_')}`;
    }
  }
  return slug.replaceAll('-', '_');
}

function hrefForNode(node: RawNode): string {
  return node.class === 'Scenario'
    ? `/scenarios/${suffixSlug(node.id)}`
    : `/concepts/${conceptSlug(node.id)}`;
}

function normalizeEvidence(item: RawEvidence): EvidenceItem {
  const url = cleanText(item.url ?? item.watch_url);
  return {
    id: cleanText(item.id ?? item.content_id ?? url),
    title: cleanText(item.title ?? item.default_title ?? '근거 영상'),
    url,
    mediaFamily: cleanText(item.media_family ?? 'video'),
    durationMin: item.duration_min ?? null,
    viewCount: item.view_count ?? null,
    topics: (item.topics ?? []).map(cleanText).filter(Boolean),
  };
}

function normalizeNode(node: RawNode): OntologyNode {
  const className = cleanText(node.class);
  return {
    id: cleanText(node.id),
    slug: className === 'Scenario' ? suffixSlug(node.id) : conceptSlug(node.id),
    href: hrefForNode(node),
    label: cleanText(node.label ?? node.id),
    className,
    summary: cleanText(node.summary),
    checks: (node.checks ?? []).map(cleanText).filter(Boolean),
    beginner: cleanText(node.beginner),
    observe: (node.observe ?? []).map(cleanText).filter(Boolean),
    keywords: (node.keywords ?? []).map(cleanText).filter(Boolean),
    medical:
      Boolean(node.medical) ||
      className === 'HealthObservation' ||
      className === 'SafetyRisk',
    evidenceCount: node.evidence_count ?? null,
    topEvidence: (node.top_evidence ?? []).slice(0, 8).map(normalizeEvidence),
  };
}

function normalizeEdge(edge: RawEdge): RelatedEdge {
  const relationId = cleanText(edge.relation);
  return {
    id: cleanText(edge.id ?? `${edge.source}->${edge.target}`),
    sourceId: cleanText(edge.source),
    targetId: cleanText(edge.target),
    relationId,
    label:
      cleanText(edge.label) ||
      relationId
        .toLowerCase()
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (value) => value.toUpperCase()),
  };
}

function safetyNotesForNodes(nodes: RawNode[]): string[] {
  const sensitive = nodes.filter(
    (node) =>
      node.class === 'HealthObservation' ||
      node.class === 'SafetyRisk' ||
      node.medical
  );
  if (!sensitive.length) return [];
  const preview = sensitive
    .slice(0, 5)
    .map((node) => cleanText(node.label ?? node.id))
    .join(', ');
  const suffix =
    sensitive.length <= 5 ? '' : ` and ${sensitive.length - 5} more`;
  return [
    'Safety filter: health and safety concepts are observation/record/consultation guidance only, not diagnosis or treatment.',
    `Sensitive concepts included: ${preview}${suffix}.`,
  ];
}

function meta(safety: string[] = []) {
  return {
    ontologyVersion: graph.meta.schema_version ?? null,
    snapshotDate: '2026-07-06',
    safety,
  };
}

function scenarioNodes(): RawNode[] {
  return graph.scenarios.flatMap((scenario) => {
    const node = nodesById.get(scenario.id);
    return node && !SCENARIO_EXCLUDE_IDS.has(node.id) ? [node] : [];
  });
}

function connectedNeighborhood(rootId: string): {
  root: RawNode;
  nodes: RawNode[];
  edges: RawEdge[];
  evidence: RawEvidence[];
  safety: string[];
} {
  const root = nodesById.get(rootId);
  if (!root) {
    throw new OntologyNodeNotFoundError(rootId);
  }
  const includedNodes = new Map<string, RawNode>([[root.id, root]]);
  const includedEdges: RawEdge[] = [];

  for (const edge of graph.edges) {
    if (includedEdges.length >= 80) break;
    const sourceId = cleanText(edge.source);
    const targetId = cleanText(edge.target);
    if (sourceId !== rootId && targetId !== rootId) continue;
    const neighborId = sourceId === rootId ? targetId : sourceId;
    const neighbor = nodesById.get(neighborId);
    if (!neighbor || neighbor.class === 'Source') continue;
    includedEdges.push(edge);
    includedNodes.set(neighbor.id, neighbor);
  }

  const nodes = [...includedNodes.values()];
  return {
    root,
    nodes,
    edges: includedEdges,
    evidence: (root.top_evidence ?? []).slice(0, 8),
    safety: safetyNotesForNodes(nodes),
  };
}

function compactRelated(nodes: RawNode[], rootId: string): OntologyNode[] {
  return nodes
    .filter((node) => node.id !== rootId && RELATED_CLASSES.has(node.class ?? ''))
    .map(normalizeNode);
}

function dedupeDisplayStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];
  for (const value of values) {
    const cleaned = cleanText(value);
    const key = cleaned.toLowerCase();
    if (cleaned && !seen.has(key)) {
      seen.add(key);
      results.push(cleaned);
    }
  }
  return results;
}

function firstNodeByClass(rawNodes: RawNode[], className: string): RawNode | null {
  return rawNodes.find((node) => node.class === className) ?? null;
}

function askSummary(question: string, rawNodes: RawNode[]): string {
  if (!rawNodes.length) {
    return '아직 바로 연결된 신호를 찾지 못했습니다. 행동, 장소, 시간대를 조금 더 짧게 나눠 적으면 관련 관찰 항목을 찾기 쉽습니다.';
  }
  const leadNode = firstNodeByClass(rawNodes, 'Scenario') ?? rawNodes[0];
  const label = cleanText(leadNode.label ?? '관련 행동');
  const detail = cleanText(leadNode.summary ?? leadNode.beginner);
  return detail
    ? `"${question}"은(는) ${label}와 연결해 살펴볼 수 있습니다. ${detail}`
    : `"${question}"은(는) ${label}와 연결해 살펴볼 수 있습니다. 단정하기보다 함께 나타나는 변화를 차분히 확인해보세요.`;
}

function askObserve(rawNodes: RawNode[]): string[] {
  const values: string[] = [];
  for (const node of rawNodes.slice(0, 8)) {
    values.push(...(node.observe ?? []), ...(node.checks ?? []));
  }
  values.push(...ASK_FALLBACK_OBSERVE);
  return dedupeDisplayStrings(values).slice(0, 6);
}

function askCareActions(rawNodes: RawNode[]): string[] {
  const values: string[] = [];
  for (const node of rawNodes) {
    if (node.class !== 'CareAction') continue;
    const label = cleanText(node.label);
    const detail = cleanText(node.summary ?? node.beginner);
    if (label && detail) values.push(`${label}: ${detail}`);
    else if (label) values.push(label);
  }
  values.push(...ASK_FALLBACK_CARE_ACTIONS);
  return dedupeDisplayStrings(values).slice(0, 5);
}

function askRecordGuide(question: string): string[] {
  const subject = question || '궁금한 행동';
  return [
    `언제부터: ${subject} 행동이 처음 보인 날짜와 시간대를 적어보세요.`,
    '무엇이 함께: 식욕, 활력, 구토, 숨는 장소, 배변·배뇨 변화를 같이 적어보세요.',
    '얼마나 자주: 하루 횟수, 지속 시간, 직전 상황을 짧게 남겨보세요.',
  ];
}

function withoutPublicEvidence(node: OntologyNode): OntologyNode {
  return {
    ...node,
    evidenceCount: null,
    topEvidence: [],
  };
}

function withoutPublicEvidenceStats(
  response: Envelope<StatsData>
): Envelope<StatsData> {
  const classCounts = { ...response.data.classCounts };
  delete classCounts.Source;

  return {
    ...response,
    data: {
      ...response.data,
      description: response.data.description
        .replace('유튜브 콘텐츠 근거', '내부 참고 메타')
        .replace('유튜브 콘텐츠', '내부 참고 메타'),
      sources: 0,
      classCounts,
      topEvidenceConcepts:
        response.data.topEvidenceConcepts.map(withoutPublicEvidence),
    },
  };
}

function withoutPublicEvidenceScenarioList(
  response: Envelope<ScenarioListData>
): Envelope<ScenarioListData> {
  return {
    ...response,
    data: {
      ...response.data,
      scenarios: response.data.scenarios.map(withoutPublicEvidence),
    },
  };
}

function withoutPublicEvidenceDetail(
  response: Envelope<DetailData>
): Envelope<DetailData> {
  return {
    ...response,
    data: {
      ...response.data,
      root: withoutPublicEvidence(response.data.root),
      related: response.data.related.map(withoutPublicEvidence),
      evidence: [],
    },
  };
}

function withoutPublicEvidenceSearch(
  response: Envelope<SearchData>
): Envelope<SearchData> {
  return {
    ...response,
    data: {
      ...response.data,
      results: response.data.results.map(withoutPublicEvidence),
    },
  };
}

function withoutPublicEvidenceAsk(response: Envelope<AskData>): Envelope<AskData> {
  return {
    ...response,
    data: {
      ...response.data,
      scenario: response.data.scenario
        ? withoutPublicEvidence(response.data.scenario)
        : null,
      matchedNodes: response.data.matchedNodes.map(withoutPublicEvidence),
    },
  };
}

function withoutPublicEvidenceList(
  response: Envelope<EvidenceData>
): Envelope<EvidenceData> {
  return {
    ...response,
    data: {
      concept: response.data.concept
        ? withoutPublicEvidence(response.data.concept)
        : null,
      items: [],
    },
  };
}

export async function getStats(): Promise<Envelope<StatsData>> {
  const classCounts = graph.stats.class_counts ?? {};
  const topNodes = graph.nodes
    .filter(
      (node) =>
        typeof node.evidence_count === 'number' &&
        !['Source', 'Topic', 'BookPart', 'Chapter', 'Scenario'].includes(
          node.class ?? ''
        )
    )
    .sort((a, b) => {
      const evidenceDelta = (b.evidence_count ?? 0) - (a.evidence_count ?? 0);
      if (evidenceDelta) return evidenceDelta;
      return cleanText(a.label).localeCompare(cleanText(b.label), 'ko');
    })
    .slice(0, 8)
    .map(normalizeNode);

  return withoutPublicEvidenceStats({
    data: {
      title: cleanText(graph.meta.title ?? '냥톨로지'),
      description: cleanText(graph.meta.description),
      nodes: graph.stats.node_count ?? graph.nodes.length,
      edges: graph.stats.edge_count ?? graph.edges.length,
      scenarios: graph.scenarios.length,
      sources: graph.meta.content_total ?? 0,
      classCounts,
      topEvidenceConcepts: topNodes,
    },
    meta: meta(),
  });
}

export async function getScenarios(): Promise<Envelope<ScenarioListData>> {
  const scenarios = scenarioNodes().map((node) => {
    const scenario = scenarioEntries.get(node.id);
    return normalizeNode({
      ...node,
      checks: node.checks ?? scenario?.first_checks,
      summary: node.summary ?? scenario?.question,
    });
  });
  return withoutPublicEvidenceScenarioList({
    data: { count: scenarios.length, scenarios },
    meta: meta(),
  });
}

export async function getStaticConceptSlugs(): Promise<string[]> {
  return graph.nodes
    .filter(
      (node) =>
        node.class !== 'Scenario' &&
        DISPLAY_CLASSES.has(cleanText(node.class)) &&
        node.id !== 'ontology:catbook'
    )
    .map((node) => normalizeNode(node).slug);
}

export async function getScenario(
  slug: string
): Promise<Envelope<DetailData>> {
  const nodeId = scenarioIdFromSlug(cleanText(slug));
  const result = connectedNeighborhood(nodeId);
  const scenario = scenarioEntries.get(nodeId);
  const root = normalizeNode({
    ...result.root,
    checks: result.root.checks ?? scenario?.first_checks,
    summary: result.root.summary ?? scenario?.question,
  });
  return withoutPublicEvidenceDetail({
    data: {
      root,
      related: compactRelated(result.nodes, nodeId),
      edges: result.edges.map(normalizeEdge),
      evidence: result.evidence.map(normalizeEvidence),
    },
    meta: meta(result.safety),
  });
}

export async function searchNodes(
  query: string
): Promise<Envelope<SearchData>> {
  const cleanedQuery = cleanText(query);
  const rawNodes = searchCandidateNodes(cleanedQuery);
  return withoutPublicEvidenceSearch({
    data: {
      query: cleanedQuery,
      count: rawNodes.length,
      results: rawNodes.map(normalizeNode),
    },
    meta: meta(safetyNotesForNodes(rawNodes)),
  });
}

export async function askQuestion(
  question: string,
  catId?: string | null
): Promise<Envelope<AskData>> {
  void catId;
  const cleanedQuestion = cleanText(question);
  const rawNodes = cleanedQuestion ? searchCandidateNodes(cleanedQuestion) : [];
  const scenario = firstNodeByClass(rawNodes, 'Scenario');
  return withoutPublicEvidenceAsk({
    data: {
      question: cleanedQuestion,
      scenario: scenario ? normalizeNode(scenario) : null,
      matchedNodes: rawNodes.slice(0, 8).map(normalizeNode),
      answer: {
        summary: askSummary(cleanedQuestion, rawNodes),
        observe: askObserve(rawNodes),
        careActions: askCareActions(rawNodes),
        recordGuide: askRecordGuide(cleanedQuestion),
        safetyNote: ASK_GENERAL_SAFETY_NOTE,
      },
    },
    meta: meta(safetyNotesForNodes(rawNodes)),
  });
}

export async function getConcept(slug: string): Promise<Envelope<DetailData>> {
  const nodeId = conceptIdFromSlug(cleanText(slug));
  const result = connectedNeighborhood(nodeId);
  return withoutPublicEvidenceDetail({
    data: {
      root: normalizeNode(result.root),
      related: compactRelated(result.nodes, nodeId),
      edges: result.edges.map(normalizeEdge),
      evidence: result.evidence.map(normalizeEvidence),
    },
    meta: meta(result.safety),
  });
}

export async function getEvidence(
  slug: string
): Promise<Envelope<EvidenceData>> {
  const nodeId = conceptIdFromSlug(cleanText(slug));
  const node = nodesById.get(nodeId) ?? null;
  return withoutPublicEvidenceList({
    data: {
      concept: node ? normalizeNode(node) : null,
      items: (node?.top_evidence ?? []).slice(0, 20).map(normalizeEvidence),
    },
    meta: meta(node ? safetyNotesForNodes([node]) : []),
  });
}

export function cacheHeaders(ontologyVersion: string | null): HeadersInit {
  return {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'X-Ontology-Version': ontologyVersion ?? 'unknown',
  };
}
