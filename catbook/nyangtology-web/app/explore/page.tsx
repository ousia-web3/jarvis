import { FitTitle } from '@/components/fit-title';
import { ConceptCard } from '@/components/concept-card';
import { ScenarioCard } from '@/components/scenario-card';
import { getScenarios, getStats } from '@/lib/ontology';

export const metadata = {
  title: '궁금증',
};

export default async function ExplorePage() {
  const [scenarios, stats] = await Promise.all([getScenarios(), getStats()]);

  return (
    <div className="shell">
      <section className="detailHero">
        <p className="eyebrow">Explore</p>
        <FitTitle>상황과 행동 신호를 함께 살펴봅니다</FitTitle>
        <p className="lead">
          “무슨 뜻이지?”에서 멈추지 않고, 지금 확인할 수 있는 변화와 기록하면
          좋은 내용을 이어서 봅니다.
        </p>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2>상황별 궁금증</h2>
            <p>보호자가 자주 마주치는 장면에서 바로 시작합니다.</p>
          </div>
        </div>
        <div className="scenarioGrid">
          {scenarios.data.scenarios.map((scenario) => (
            <ScenarioCard scenario={scenario} key={scenario.id} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <div>
            <h2>함께 보면 좋은 행동 신호</h2>
            <p>
              상황 카드에서 자주 이어지는 행동 신호와 건강 관찰 항목입니다.
            </p>
          </div>
        </div>
        <div className="conceptGrid">
          {stats.data.topEvidenceConcepts.map((node) => (
            <ConceptCard node={node} key={node.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
