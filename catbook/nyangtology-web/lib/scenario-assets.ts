import { getContentImage } from './content-image-manifest';
import type { RelatedEdge } from './types';

type Illustration = { src: string; alt: string };

const fallbackIllustration: Illustration = {
  src: '/images/brand/nyangtology-grid-logo-128.webp',
  alt: '냥톨로지 2D 일러스트 로고',
};

const conceptIllustrationScenarioSlugs: Record<string, string> = {
  'chapter-01': 'sudden-run',
  'chapter-02': 'sudden-run',
  'chapter-03': 'hiding',
  'chapter-04': 'hiding',
  'chapter-05': 'hiding',
  'chapter-06': 'grooming',
  'chapter-07': 'hiding',
  'chapter-08': 'food-type',
  'chapter-09': 'food-type',
  'chapter-10': 'litter',
  'chapter-11': 'danger',
  'chapter-12': 'danger',
  'chapter-13': 'hiding',
  'chapter-14': 'hissing',
  'chapter-15': 'sudden-run',
  'chapter-16': 'hissing',
  'chapter-17': 'hiding',
  'chapter-18': 'grooming',
  'chapter-19': 'litter',
  'chapter-20': 'grooming',
  'chapter-21': 'vomiting',
  'chapter-22': 'food-type',
  'chapter-23': 'vomiting',
  'chapter-24': 'not-eating',
  'chapter-25': 'second-cat',
  'chapter-26': 'second-cat',
  'chapter-27': 'second-cat',
  'chapter-28': 'second-cat',
  'chapter-29': 'second-cat',
  'chapter-30': 'second-cat',
  'chapter-31': 'danger',
  'chapter-32': 'danger',
  'chapter-33': 'danger',
  'chapter-34': 'not-eating',
  'chapter-35': 'not-eating',
  'chapter-36': 'danger',
  'chapter-37': 'grooming',
  'chapter-38': 'grooming',
  'chapter-39': 'grooming',
  'chapter-40': 'danger',
  'chapter-41': 'grooming',
  'chapter-42': 'hungry',
  'signal-slow-blink': 'hiding',
  'signal-tail-ear-tension': 'hissing',
  'signal-biting': 'hissing',
  'signal-purring-kneading': 'grooming',
  'signal-vocalization': 'hungry',
  'signal-relaxed-presence': 'hiding',
  'signal-fight-or-play': 'second-cat',
  'signal-box-seeking': 'hiding',
  'health-weight-change': 'not-eating',
  'health-senior-change': 'not-eating',
  'environment-water-station': 'food-type',
  'environment-carrier-room': 'danger',
  'need-predictable-routine': 'hungry',
  'need-scent-familiarity': 'second-cat',
  'need-rest-recovery': 'hiding',
  'action-play-enrichment': 'sudden-run',
  'action-separate-and-reset': 'second-cat',
  'action-daily-check': 'danger',
  'action-consult-expert': 'vomiting',
  'risk-unsafe-rescue': 'danger',
  'risk-unsafe-touch': 'hissing',
  'knowledge-breed-context': 'grooming',
  'knowledge-genetics': 'grooming',
  'context-baby-family': 'second-cat',
  'context-guardian-absence': 'danger',
  'context-family-change': 'second-cat',
  'context-kitten': 'danger',
};

function toIllustration(asset: ReturnType<typeof getContentImage>): Illustration | null {
  return asset ? { src: asset.src, alt: asset.alt } : null;
}

export function getScenarioIllustration(slug: string): Illustration {
  return toIllustration(getContentImage(slug, 'scenario')) ?? fallbackIllustration;
}

export function scenarioSlugFromId(nodeId: string) {
  if (!nodeId.startsWith('scenario:')) {
    return null;
  }

  return nodeId.slice('scenario:'.length).replaceAll('_', '-');
}

export function getLinkedScenarioIllustration(edges: RelatedEdge[]) {
  const scenarioEdge = edges.find(
    (edge) =>
      edge.sourceId.startsWith('scenario:') ||
      edge.targetId.startsWith('scenario:')
  );

  if (!scenarioEdge) {
    return null;
  }

  const slug =
    scenarioSlugFromId(scenarioEdge.sourceId) ??
    scenarioSlugFromId(scenarioEdge.targetId);

  return slug ? getScenarioIllustration(slug) : null;
}

export function getConceptIllustration({
  edges,
  label,
  relatedSlugs = [],
  slug,
}: {
  edges: RelatedEdge[];
  label: string;
  relatedSlugs?: string[];
  slug: string;
}) {
  const directIllustration =
    toIllustration(getContentImage(slug, slug.startsWith('chapter-') ? 'chapter' : 'concept')) ??
    toIllustration(getContentImage(slug));

  if (directIllustration) {
    return directIllustration;
  }

  const linkedIllustration = getLinkedScenarioIllustration(edges);
  if (linkedIllustration) {
    return linkedIllustration;
  }

  const relatedIllustration = relatedSlugs
    .map((relatedSlug) => toIllustration(getContentImage(relatedSlug)))
    .find(Boolean);

  if (relatedIllustration) {
    return relatedIllustration;
  }

  const scenarioSlug =
    conceptIllustrationScenarioSlugs[slug] ??
    relatedSlugs
      .map((relatedSlug) => conceptIllustrationScenarioSlugs[relatedSlug])
      .find(Boolean);

  if (!scenarioSlug) {
    return null;
  }

  const illustration = getScenarioIllustration(scenarioSlug);
  return { ...illustration, alt: `${label} 관련 고양이 행동 관찰 일러스트` };
}

