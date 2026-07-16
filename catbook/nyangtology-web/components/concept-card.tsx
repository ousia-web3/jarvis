import { Badge } from './badge';
import { InstantTransitionLink } from './instant-transition-link';
import type { OntologyNode } from '@/lib/types';

export function ConceptCard({ node }: { node: OntologyNode }) {
  return (
    <InstantTransitionLink
      className="card"
      href={node.href}
      aria-label={`${node.label} 상세 페이지로 이동`}
    >
      <div className="badgeRow">
        <Badge className={node.className} />
      </div>
      <h2>{node.label}</h2>
      <p className="clamp2">{node.summary || node.beginner}</p>
    </InstantTransitionLink>
  );
}
