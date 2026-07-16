import { Badge } from './badge';
import { AdGatedScenarioLink } from './ad-gated-scenario-link';
import type { OntologyNode } from '@/lib/types';

export function ScenarioCard({ scenario }: { scenario: OntologyNode }) {
  const href = scenario.href || `/scenarios/${scenario.slug}`;

  return (
    <AdGatedScenarioLink
      className="card scenarioLinkCard"
      href={href}
      ariaLabel={`${scenario.label} 상세 페이지로 이동`}
    >
      <div className="badgeRow">
        <Badge className={scenario.className} />
      </div>
      <h2>{scenario.label}</h2>
      <p className="clamp2">{scenario.summary}</p>
      <span className="cardCta">바로 보기</span>
    </AdGatedScenarioLink>
  );
}
