import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/badge';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ConsultWhenCta } from '@/components/consult-when-cta';
import { ConceptCard } from '@/components/concept-card';
import { FitTitle } from '@/components/fit-title';
import { GojipsaNote } from '@/components/gojipsa-note';
import { SafetyBanner } from '@/components/safety-banner';
import { TossBannerAd } from '@/components/toss-banner-ad';
import { getScenario, getScenarios } from '@/lib/ontology';
import { getScenarioIllustration } from '@/lib/scenario-assets';

export const revalidate = 300;

export async function generateStaticParams() {
  const scenarios = await getScenarios();
  return scenarios.data.scenarios.map((scenario) => ({
    slug: scenario.slug,
  }));
}

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let detail;
  try {
    detail = await getScenario(slug);
  } catch {
    notFound();
  }
  const { root, related } = detail.data;
  const hasMedicalRelated = related.some((node) => node.medical);
  const hasConsultWhen =
    detail.data.edges.some((edge) => edge.relationId === 'CONSULT_WHEN') ||
    related.some((node) => node.className === 'SafetyRisk');
  const illustration = getScenarioIllustration(slug);

  return (
    <div className="shell">
      <section className="detailHero">
        <Breadcrumbs
          items={[
            { href: '/', label: '홈' },
            { href: '/explore', label: '상황별 보기' },
            { label: root.label },
          ]}
        />
        <div className="detailMeta">
          <Badge className={root.className} />
        </div>
        <FitTitle className="scenarioPageTitle">{root.label}</FitTitle>
        <p className="lead">{root.summary}</p>
      </section>

      {hasMedicalRelated ? (
        <SafetyBanner message="연결된 항목에 건강 관찰 내용이 있습니다. 아래 내용은 기록과 상담 준비를 돕는 안내입니다." />
      ) : null}

      {hasConsultWhen ? (
        <ConsultWhenCta memoItems={[...root.checks, root.summary]} />
      ) : null}

      <section className="section detailLayout">
        <div className="stack">
          <article className="scenarioVisualCard">
            <div className="scenarioVisualImage">
              <Image
                src={illustration.src}
                alt={illustration.alt}
                fill
                priority
                sizes="(max-width: 860px) calc(100vw - 32px), 640px"
              />
              <span className="aiGeneratedBadge">AI 생성</span>
            </div>
          </article>

          <article className="card">
            <h2>먼저 확인할 것</h2>
            <p>행동 하나만 보지 말고, 직전과 직후의 맥락을 함께 봅니다.</p>
            <ol className="checkList">
              {root.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ol>
          </article>

          <article className="card">
            <h2>고집사 메모</h2>
            <GojipsaNote>
              바로 결론을 내리기보다 반복 빈도, 시간대, 환경 변화를 먼저
              하루치만 적어보세요.
            </GojipsaNote>
          </article>
        </div>

        <aside className="stack">
          <article className="card">
            <h2>함께 보면 좋은 항목</h2>
            <p>관련 행동 신호, 환경, 집에서 확인할 일을 함께 봅니다.</p>
          </article>
          {related.map((node) => (
            <ConceptCard node={node} key={node.id} />
          ))}
        </aside>
      </section>

      <section className="section tossBannerSection">
        <TossBannerAd placement="scenario-detail" />
      </section>
    </div>
  );
}
